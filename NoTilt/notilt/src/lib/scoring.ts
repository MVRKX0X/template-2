export interface TraderMetrics {
  profitFactor: number; // e.g. 2.4
  winRate: number; // 0–100
  sharpeRatio: number; // e.g. 1.8
  maxDrawdown: number; // % e.g. 6.5
  consistencyScore: number; // 0–100
}

export function normalise(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.min(Math.max((value - min) / (max - min), 0), 1);
}

export function calculatePerformanceScore(metrics: TraderMetrics): number {
  const pf = normalise(metrics.profitFactor, 1, 5) * 30;
  const consistency = metrics.consistencyScore * 0.25;
  const winRate = normalise(metrics.winRate, 30, 80) * 20;
  const sharpe = normalise(metrics.sharpeRatio, 0, 4) * 15;
  const ddControl = (1 - normalise(metrics.maxDrawdown, 0, 30)) * 10;
  return Math.round(pf + consistency + winRate + sharpe + ddControl);
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function calculateCommunityScore(
  memberMetrics: TraderMetrics[],
  retentionRate: number,
  verifiedRatio: number,
): number {
  if (memberMetrics.length === 0) return 0;

  const avgMetrics: TraderMetrics = {
    profitFactor: avg(memberMetrics.map((m) => m.profitFactor)),
    winRate: avg(memberMetrics.map((m) => m.winRate)),
    sharpeRatio: avg(memberMetrics.map((m) => m.sharpeRatio)),
    maxDrawdown: avg(memberMetrics.map((m) => m.maxDrawdown)),
    consistencyScore: avg(memberMetrics.map((m) => m.consistencyScore)),
  };

  const baseScore = calculatePerformanceScore(avgMetrics);
  const retentionBonus = normalise(retentionRate, 50, 100) * 5;
  const verifiedBonus = normalise(verifiedRatio, 0, 1) * 5;

  return Math.min(Math.round(baseScore + retentionBonus + verifiedBonus), 100);
}

