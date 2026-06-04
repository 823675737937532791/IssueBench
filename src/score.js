export function summarize(results) {
  const byAgent = new Map();
  for (const result of results) {
    const item = byAgent.get(result.agentId) || {
      agentId: result.agentId,
      total: 0,
      passed: 0,
      failed: 0,
      durationMs: 0
    };
    item.total += 1;
    item.passed += result.passed ? 1 : 0;
    item.failed += result.passed ? 0 : 1;
    item.durationMs += result.durationMs;
    byAgent.set(result.agentId, item);
  }
  const leaderboard = [...byAgent.values()]
    .map((item) => ({
      ...item,
      passRate: item.total ? item.passed / item.total : 0,
      avgDurationMs: item.total ? Math.round(item.durationMs / item.total) : 0
    }))
    .sort((a, b) => b.passRate - a.passRate || a.avgDurationMs - b.avgDurationMs);
  return {
    total: results.length,
    passed: results.filter((result) => result.passed).length,
    failed: results.filter((result) => !result.passed).length,
    leaderboard
  };
}
