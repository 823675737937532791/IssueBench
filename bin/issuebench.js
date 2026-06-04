#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { initProject } from "../src/init.js";
import { runBench } from "../src/runner.js";
import { renderHtml } from "../src/reporters.js";
import { renderJson, renderMarkdown, renderTerminal } from "../src/reporters.js";

const VERSION = "0.1.0";

async function main(argv) {
  const [command = "help", ...rest] = argv;
  if (command === "help" || command === "--help" || command === "-h") {
    console.log(help());
    return 0;
  }
  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    return 0;
  }
  if (command === "init") return initCommand(rest);
  if (command === "run") return runCommand(rest);
  if (command === "report") return reportCommand(rest);
  console.error(`Unknown command: ${command}`);
  return 2;
}

async function initCommand(args) {
  const options = parseArgs(args);
  const target = resolve(options._[0] || ".");
  const result = await initProject(target, { force: Boolean(options.force) });
  for (const file of result.created) console.log(`created ${file}`);
  for (const file of result.skipped) console.log(`skipped ${file}`);
  return 0;
}

async function runCommand(args) {
  const options = parseArgs(args);
  const configPath = resolve(options.config || "issuebench.config.json");
  const result = await runBench(configPath, {
    agent: options.agent,
    task: options.task,
    keepWorkspaces: Boolean(options["keep-workspaces"])
  });
  if (options.out) {
    const out = resolve(options.out);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, renderJson(result));
  } else {
    console.log(renderTerminal(result));
  }
  return result.summary.failed > 0 && options["fail-on-fail"] ? 1 : 0;
}

async function reportCommand(args) {
  const options = parseArgs(args);
  const input = resolve(options.input || ".issuebench/results.json");
  const result = JSON.parse(await readFile(input, "utf8"));
  const format = options.format || "terminal";
  const output = format === "html"
    ? renderHtml(result)
    : format === "markdown" || format === "md"
      ? renderMarkdown(result)
      : format === "json"
        ? renderJson(result)
        : renderTerminal(result);
  if (options.out) {
    const out = resolve(options.out);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, output);
  } else {
    console.log(output);
  }
  return 0;
}

function parseArgs(args) {
  const parsed = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      parsed._.push(arg);
      continue;
    }
    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      parsed[key] = inlineValue;
      continue;
    }
    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

function help() {
  return `IssueBench ${VERSION}

Benchmark coding agents on your own repo tasks.

Usage:
  issuebench init .
  issuebench run --config issuebench.config.json --out .issuebench/results.json
  issuebench report --input .issuebench/results.json --format terminal|markdown|html|json

Agent commands receive:
  ISSUEBENCH_PROMPT_FILE, ISSUEBENCH_WORKDIR, ISSUEBENCH_TASK_ID, ISSUEBENCH_AGENT_ID`;
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
