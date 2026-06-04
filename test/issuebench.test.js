import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runBench } from "../src/runner.js";
import { renderHtml, renderMarkdown } from "../src/reporters.js";

const root = fileURLToPath(new URL("..", import.meta.url));

test("runBench ranks passing agents above failing agents", async () => {
  const result = await runBench(join(root, "examples", "issuebench.config.json"));
  assert.equal(result.summary.total, 2);
  assert.equal(result.summary.passed, 1);
  assert.equal(result.summary.failed, 1);
  assert.equal(result.summary.leaderboard[0].agentId, "good-agent");
});

test("reports render leaderboard content", async () => {
  const result = await runBench(join(root, "examples", "issuebench.config.json"));
  const md = renderMarkdown(result);
  const html = renderHtml(result);
  assert.match(md, /good-agent/);
  assert.match(html, /IssueBench/);
});

test("agent filtering runs one candidate", async () => {
  const result = await runBench(join(root, "examples", "issuebench.config.json"), { agent: "good-agent" });
  assert.equal(result.summary.total, 1);
  assert.equal(result.summary.passed, 1);
});
