import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { runShell } from "./shell.js";
import { summarize } from "./score.js";

export async function runBench(configPath, options = {}) {
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const root = dirname(configPath);
  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = resolve(root, config.outputDir || ".issuebench");
  const workspaceRoot = join(outputDir, "workspaces", runId);
  await mkdir(workspaceRoot, { recursive: true });

  const agents = filterById(config.agents || [], options.agent);
  const tasks = filterById(config.tasks || [], options.task);
  const results = [];

  for (const task of tasks) {
    for (const agent of agents) {
      const result = await runOne({ root, workspaceRoot, config, task, agent });
      results.push(result);
    }
  }

  const bench = {
    tool: "issuebench",
    version: "0.1.0",
    configPath,
    runId,
    startedAt: new Date().toISOString(),
    agents: agents.map(publicAgent),
    tasks: tasks.map(publicTask),
    results,
    summary: summarize(results)
  };

  if (!options.keepWorkspaces && config.keepWorkspaces !== true) {
    await rm(workspaceRoot, { recursive: true, force: true });
  }
  return bench;
}

async function runOne({ root, workspaceRoot, config, task, agent }) {
  const source = resolve(root, task.workspace || config.workspace || ".");
  const workdir = join(workspaceRoot, safe(task.id), safe(agent.id), basename(source));
  await mkdir(dirname(workdir), { recursive: true });
  await cp(source, workdir, {
    recursive: true,
    filter: (path) => !path.includes(`${String.fromCharCode(47)}.git${String.fromCharCode(47)}`) && !path.endsWith(`${String.fromCharCode(47)}node_modules`)
  });

  const promptText = buildPrompt(task);
  const promptFile = join(dirname(workdir), "PROMPT.md");
  await writeFile(promptFile, promptText);

  const setup = [];
  for (const command of task.setup || []) {
    setup.push(await runShell(command, { cwd: workdir, timeoutMs: task.timeoutMs || config.timeoutMs }));
  }

  const agentRun = await runShell(agent.command, {
    cwd: workdir,
    timeoutMs: agent.timeoutMs || config.timeoutMs || 120000,
    env: {
      ISSUEBENCH_WORKDIR: workdir,
      ISSUEBENCH_PROMPT: promptText,
      ISSUEBENCH_PROMPT_FILE: promptFile,
      ISSUEBENCH_TASK_ID: task.id,
      ISSUEBENCH_AGENT_ID: agent.id,
      ISSUEBENCH_CONFIG_DIR: root
    }
  });

  const verify = [];
  for (const command of task.verify || []) {
    verify.push(await runShell(command, { cwd: workdir, timeoutMs: task.timeoutMs || config.timeoutMs }));
  }

  const diff = await runShell("git diff --no-index -- . . 2>/dev/null || true", { cwd: workdir });
  const passed = setup.every(ok) && agentRun.code === 0 && verify.every(ok);
  return {
    taskId: task.id,
    agentId: agent.id,
    passed,
    durationMs: setup.reduce((sum, item) => sum + item.durationMs, 0) + agentRun.durationMs + verify.reduce((sum, item) => sum + item.durationMs, 0),
    setup: setup.map(compact),
    agent: compact(agentRun),
    verify: verify.map(compact),
    metrics: extractMetrics(agentRun.stdout + "\n" + agentRun.stderr, agent.patterns || {})
  };
}

function buildPrompt(task) {
  return `# ${task.title || task.id}

${task.prompt || ""}

Acceptance criteria:
${(task.criteria || []).map((item) => `- ${item}`).join("\n") || "- Make the verifier pass."}
`;
}

function filterById(items, id) {
  return id ? items.filter((item) => item.id === id) : items;
}

function ok(result) {
  return result.code === 0;
}

function compact(result) {
  return {
    command: result.command,
    code: result.code,
    durationMs: result.durationMs,
    stdout: tail(result.stdout),
    stderr: tail(result.stderr)
  };
}

function tail(value) {
  const limit = 6000;
  return value.length > limit ? value.slice(-limit) : value;
}

function extractMetrics(output, patterns) {
  const metrics = {};
  for (const [name, pattern] of Object.entries(patterns)) {
    const match = output.match(new RegExp(pattern));
    if (match?.[1]) metrics[name] = Number(match[1]) || match[1];
  }
  return metrics;
}

function publicAgent(agent) {
  return { id: agent.id, name: agent.name || agent.id };
}

function publicTask(task) {
  return { id: task.id, title: task.title || task.id };
}

function safe(value) {
  return String(value).replace(/[^a-z0-9_.-]+/gi, "_");
}
