# Launch Plan

## Positioning

Title:

> IssueBench: benchmark coding agents on your own GitHub issues

Short pitch:

> Public leaderboards tell you which agent wins on someone else's repo. IssueBench tells you which agent wins on yours.

## Post Copy

I built IssueBench, a zero-dependency CLI for benchmarking coding agents on your own repo tasks.

Define tasks with prompts and verifier commands, add agents as shell commands, and get a leaderboard plus JSON/Markdown/HTML reports.

```bash
npx issuebench init .
npx issuebench run --config issuebench.config.json --out .issuebench/results.json
npx issuebench report --input .issuebench/results.json --format html --out .issuebench/report.html
```

Works with Codex, Claude Code, Cursor CLI, Copilot CLI, OpenHands, or any custom agent command.

## Share Targets

- Hacker News Show HN
- r/codex, r/ClaudeCode, r/Cursor, r/AI_Agents
- GitHub topics: `coding-agent`, `agent-evaluation`, `benchmark`, `github-issues`, `codex`, `claude-code`

## Roadmap

- GitHub issue importer.
- Matrix runs across prompts and agent commands.
- Cost/tokens/time extraction presets.
- HTML diff viewer per run.
- Docker isolation mode.
- Public static leaderboard export for GitHub Pages.
