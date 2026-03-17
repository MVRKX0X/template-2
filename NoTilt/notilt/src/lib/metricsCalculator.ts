import type { NormalizedTrade } from "./csvParser";
import type { TraderMetrics } from "./scoring";

export interface ComputedMetrics extends TraderMetrics {
  totalTrades: number;
  monthlyReturn: number;
  avgRR: number;
  monthsOfData: number;
}

export function computeMetricsFromTrades(
  trades: NormalizedTrade[],
): ComputedMetrics {
  if (trades.length === 0) {
    return {
      profitFactor: 0,
      winRate: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      consistencyScore: 0,
      totalTrades: 0,
      monthlyReturn: 0,
      avgRR: 0,
      monthsOfData: 0,
    };
  }

  const winners = trades.filter((t) => t.netPnL > 0);
  const losers = trades.filter((t) => t.netPnL < 0);

  const grossProfit = winners.reduce((s, t) => s + t.netPnL, 0);
  const grossLoss = Math.abs(losers.reduce((s, t) => s + t.netPnL, 0));
  const profitFactor =
    grossLoss === 0 ? (grossProfit > 0 ? 99 : 0) : grossProfit / grossLoss;

  const winRate = (winners.length / trades.length) * 100;

  const avgWin = winners.length > 0 ? grossProfit / winners.length : 0;
  const avgLoss = losers.length > 0 ? grossLoss / losers.length : 0;
  const avgRR = avgLoss === 0 ? 0 : avgWin / avgLoss;

  let peak = 0;
  let maxDD = 0;
  let runningPnL = 0;
  for (const trade of trades) {
    runningPnL += trade.netPnL;
    if (runningPnL > peak) peak = runningPnL;
    const dd = peak > 0 ? ((peak - runningPnL) / peak) * 100 : 0;
    if (dd > maxDD) maxDD = dd;
  }

  const dailyPnLMap = new Map<string, number>();
  for (const trade of trades) {
    const key = `${trade.tradeDate.year}-${trade.tradeDate.month}-${trade.tradeDate.day}`;
    dailyPnLMap.set(key, (dailyPnLMap.get(key) ?? 0) + trade.netPnL);
  }
  const dailyPnLs = Array.from(dailyPnLMap.values());
  const meanDaily =
    dailyPnLs.reduce((s, v) => s + v, 0) / dailyPnLs.length;
  const variance =
    dailyPnLs.reduce((s, v) => s + Math.pow(v - meanDaily, 2), 0) /
    dailyPnLs.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio =
    stdDev === 0 ? 0 : (meanDaily / stdDev) * Math.sqrt(252);

  const profitableDays = dailyPnLs.filter((p) => p > 0).length;
  const consistencyScore =
    (profitableDays / dailyPnLs.length) * 100;

  const totalNetPnL = trades.reduce((s, t) => s + t.netPnL, 0);
  const firstDate = new Date(trades[0].timestamp);
  const lastDate = new Date(trades[trades.length - 1].timestamp);
  const monthsOfData = Math.max(
    (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
      (lastDate.getMonth() - firstDate.getMonth()),
    1,
  );
  const monthlyReturn = totalNetPnL / monthsOfData;

  return {
    profitFactor: Math.round(profitFactor * 100) / 100,
    winRate: Math.round(winRate * 10) / 10,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDD * 10) / 10,
    consistencyScore: Math.round(consistencyScore * 10) / 10,
    avgRR: Math.round(avgRR * 100) / 100,
    totalTrades: trades.length,
    monthlyReturn: Math.round(monthlyReturn * 100) / 100,
    monthsOfData,
  };
}

