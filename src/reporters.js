export function renderJson(result) {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function renderTerminal(result) {
  const lines = [
    "IssueBench",
    "",
    `runs ${result.summary.total}  passed ${result.summary.passed}  failed ${result.summary.failed}`,
    "",
    "Leaderboard"
  ];
  for (const row of result.summary.leaderboard) {
    lines.push(`${row.agentId.padEnd(16)} ${(row.passRate * 100).toFixed(0).padStart(3)}%  ${row.passed}/${row.total}  avg ${row.avgDurationMs}ms`);
  }
  lines.push("", "Results");
  for (const item of result.results) {
    lines.push(`${item.passed ? "PASS" : "FAIL"} ${item.agentId}/${item.taskId} ${item.durationMs}ms`);
  }
  return lines.join("\n");
}

export function renderMarkdown(result) {
  const lines = [
    "# IssueBench Report",
    "",
    `Total runs: **${result.summary.total}**`,
    `Passed: **${result.summary.passed}**`,
    `Failed: **${result.summary.failed}**`,
    "",
    "## Leaderboard",
    "",
    "| Agent | Pass rate | Passed | Avg duration |",
    "| --- | ---: | ---: | ---: |"
  ];
  for (const row of result.summary.leaderboard) {
    lines.push(`| ${row.agentId} | ${(row.passRate * 100).toFixed(0)}% | ${row.passed}/${row.total} | ${row.avgDurationMs}ms |`);
  }
  lines.push("", "## Results", "", "| Status | Agent | Task | Duration |", "| --- | --- | --- | ---: |");
  for (const item of result.results) {
    lines.push(`| ${item.passed ? "PASS" : "FAIL"} | ${item.agentId} | ${item.taskId} | ${item.durationMs}ms |`);
  }
  return `${lines.join("\n")}\n`;
}

export function renderHtml(result) {
  const leaderboard = result.summary.leaderboard.map((row, index) => `<tr><td>${index + 1}</td><td>${escape(row.agentId)}</td><td>${(row.passRate * 100).toFixed(0)}%</td><td>${row.passed}/${row.total}</td><td>${row.avgDurationMs}ms</td></tr>`).join("");
  const runs = result.results.map((item) => `<tr><td><span class="${item.passed ? "pass" : "fail"}">${item.passed ? "PASS" : "FAIL"}</span></td><td>${escape(item.agentId)}</td><td>${escape(item.taskId)}</td><td>${item.durationMs}ms</td></tr>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>IssueBench Report</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f7f8fb; color: #171a20; }
    main { max-width: 1080px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 42px; margin: 0 0 8px; letter-spacing: 0; }
    .summary { color: #5e6675; margin: 0 0 28px; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #dde2ea; border-radius: 8px; overflow: hidden; margin: 18px 0 34px; }
    th, td { padding: 12px 14px; border-bottom: 1px solid #e8ebf1; text-align: left; }
    th { font-size: 12px; text-transform: uppercase; color: #667084; letter-spacing: .06em; }
    .pass, .fail { display: inline-block; min-width: 58px; text-align: center; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .pass { background: #daf8e6; color: #0f7a3a; }
    .fail { background: #ffe0dc; color: #a51c10; }
  </style>
</head>
<body>
  <main>
    <h1>IssueBench</h1>
    <p class="summary">${result.summary.passed}/${result.summary.total} runs passed · generated ${escape(result.startedAt || "")}</p>
    <h2>Leaderboard</h2>
    <table><thead><tr><th>#</th><th>Agent</th><th>Pass rate</th><th>Passed</th><th>Avg duration</th></tr></thead><tbody>${leaderboard}</tbody></table>
    <h2>Runs</h2>
    <table><thead><tr><th>Status</th><th>Agent</th><th>Task</th><th>Duration</th></tr></thead><tbody>${runs}</tbody></table>
  </main>
</body>
</html>
`;
}

function escape(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
