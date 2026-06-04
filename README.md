# IssueBench

**Benchmark coding agents on your own GitHub issues.**

Public leaderboards tell you which agent wins on someone else's repo. IssueBench tells you which agent wins on yours.

```bash
npx issuebench init .
npx issuebench run --config issuebench.config.json --out .issuebench/results.json
npx issuebench report --input .issuebench/results.json --format html --out .issuebench/report.html
```

IssueBench is a zero-dependency CLI for running repeatable coding-agent tasks. You define tasks with prompts and verifier commands, define agents as shell commands, and get a leaderboard with pass rate, duration, logs, and optional extracted metrics like cost or tokens.

## Why This Exists

The agent ecosystem is full of claims:

- "Claude Code is better."
- "Codex is faster."
- "Cursor fixes frontend bugs better."
- "Our in-house agent is cheaper."

Those claims rarely survive contact with your repository. IssueBench gives you a small, repo-local benchmark harness so you can compare agents on the exact tasks and tests that matter to you.

## Features

- Bring any agent as a shell command.
- Run agents against isolated copies of your repo.
- Pass prompts through `ISSUEBENCH_PROMPT_FILE` and `ISSUEBENCH_PROMPT`.
- Verify with your own commands: `npm test`, `pytest`, `go test`, `cargo test`, custom scripts, anything.
- Extract metrics from agent output with regex patterns.
- Output terminal, JSON, Markdown, and HTML reports.
- Use in CI or for one-off vendor/tool comparisons.
- Ships with a tiny demo repo and two demo agents.

## Demo

```bash
npm test
npm run demo
npm run report:html
```

Expected leaderboard:

```text
good-agent      100%  1/1
bad-agent         0%  0/1
```

## Config

```json
{
  "workspace": ".",
  "timeoutMs": 120000,
  "agents": [
    {
      "id": "codex",
      "name": "Codex",
      "command": "codex exec --full-auto < \"$ISSUEBENCH_PROMPT_FILE\"",
      "patterns": {
        "tokens": "tokens: (\\d+)",
        "cost": "cost: \\$(\\d+\\.\\d+)"
      }
    }
  ],
  "tasks": [
    {
      "id": "fix-auth-timeout",
      "title": "Fix auth timeout regression",
      "prompt": "Fix the auth timeout bug described in this issue.",
      "criteria": [
        "The auth timeout test passes",
        "No unrelated files are changed"
      ],
      "verify": ["npm test -- auth-timeout"]
    }
  ]
}
```

## Commands

Initialize:

```bash
issuebench init .
```

Run a benchmark:

```bash
issuebench run --config issuebench.config.json --out .issuebench/results.json
```

Run one agent or one task:

```bash
issuebench run --agent codex
issuebench run --task fix-auth-timeout
```

Render reports:

```bash
issuebench report --input .issuebench/results.json --format terminal
issuebench report --input .issuebench/results.json --format markdown
issuebench report --input .issuebench/results.json --format html --out .issuebench/report.html
```

## Agent Contract

Agent commands run inside an isolated workspace and receive:

| Environment variable | Meaning |
| --- | --- |
| `ISSUEBENCH_WORKDIR` | Workspace path the agent should edit |
| `ISSUEBENCH_PROMPT_FILE` | Markdown prompt file |
| `ISSUEBENCH_PROMPT` | Prompt text |
| `ISSUEBENCH_TASK_ID` | Current task id |
| `ISSUEBENCH_AGENT_ID` | Current agent id |

## GitHub Action

```yaml
name: IssueBench

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
```

## Why It Can Be Useful

IssueBench is not trying to replace SWE-bench or research leaderboards. It is the local POC harness you run before spending money or reorganizing a team around a coding agent.

## License

MIT
