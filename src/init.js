import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function initProject(root, options = {}) {
  const created = [];
  const skipped = [];
  await writeIfMissing(join(root, "issuebench.config.json"), `{
  "workspace": ".",
  "timeoutMs": 120000,
  "agents": [
    {
      "id": "codex",
      "name": "Codex",
      "command": "codex exec --full-auto < \\"$ISSUEBENCH_PROMPT_FILE\\""
    }
  ],
  "tasks": [
    {
      "id": "example-fix",
      "title": "Example bug fix",
      "prompt": "Fix the failing test.",
      "verify": ["npm test"]
    }
  ]
}
`, options, created, skipped);
  await mkdir(join(root, ".github", "workflows"), { recursive: true });
  await writeIfMissing(join(root, ".github", "workflows", "issuebench.yml"), `name: IssueBench

on:
  workflow_dispatch:
  pull_request:

permissions:
  contents: read

jobs:
  bench:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npx issuebench run --config issuebench.config.json --out .issuebench/results.json --fail-on-fail
      - run: npx issuebench report --input .issuebench/results.json --format markdown >> "$GITHUB_STEP_SUMMARY"
`, options, created, skipped);
  return { created, skipped };
}

async function writeIfMissing(path, body, options, created, skipped) {
  if (!options.force) {
    try {
      await access(path);
      skipped.push(path);
      return;
    } catch {
      // Create below.
    }
  }
  await mkdir(path.split("/").slice(0, -1).join("/") || ".", { recursive: true });
  await writeFile(path, body);
  created.push(path);
}
