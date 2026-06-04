# Market Research Notes

Date: 2026-06-04

## What I Learned

The first two project attempts were technically useful but weak from a distribution perspective:

- They were security/preflight tools, which are valuable but mostly noticed after a scary incident.
- They had no public scoreboard, no competitive loop, and no reason for people to share screenshots.
- They served a narrow buyer persona instead of the larger crowd currently comparing Codex, Claude Code, Cursor, Copilot, OpenHands, and custom agents.

## Current Market Shape

Hot areas with visible GitHub and social energy:

- AI coding agents are mainstream developer infrastructure.
- Benchmarks are everywhere: SWE-bench Live, CCBench, Harness Bench, WildClawBench, ClawBench, and many research suites.
- Teams still cannot answer the practical question: "Which agent works best on our repo?"
- Existing public leaderboards are useful for model research, but they do not reflect a company's codebase, tests, conventions, or issue style.

## Chosen Gap

Build **IssueBench**:

> A local harness that turns your own repo tasks and GitHub issues into a repeatable coding-agent benchmark.

The wedge:

- No API keys required.
- Bring any agent as a shell command.
- Use your own verifier commands.
- Produce a leaderboard, JSON, Markdown, and HTML report.
- Works for POCs, vendor comparisons, agent builders, and teams choosing tooling.

## Why This Can Get Attention

It is immediately demoable:

```bash
npm run demo
```

It has a screenshot-worthy output:

- `good-agent 100%`
- `bad-agent 0%`

It maps to a real budget decision:

- Which coding agent should a team pay for?
- Which prompt or harness change improved pass rate?
- Which vendor works on this repo, not on a public benchmark?

## Sources

- SWE-bench Live: live issue-resolution benchmark for software engineering agents.
- CCBench: small-codebase coding benchmark for coding agents.
- Harness Bench: measures harness effects across realistic agent workflows.
- WildClawBench: compares agent harnesses across OpenClaw, Claude Code, Codex CLI, and Hermes Agent.
- AgentArena PyPI: validates the "benchmark agents on your own codebase" demand, while leaving room for a cleaner zero-dependency Node implementation.
