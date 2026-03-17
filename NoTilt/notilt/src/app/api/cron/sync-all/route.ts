import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getTradovateTrades,
  refreshAccessToken,
} from "@/lib/tradovate";
import { encrypt, decrypt } from "@/lib/encryption";
import { computeMetricsFromTrades } from "@/lib/metricsCalculator";
import { calculatePerformanceScore } from "@/lib/scoring";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const supabase = await createServerSupabaseClient(true);

  const { data: accounts, error } = await supabase
    .from("trade_accounts")
    .select("*")
    .eq("broker", "tradovate");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  if (!accounts?.length) {
    return NextResponse.json({ synced: 0 });
  }

  let synced = 0;
  let failed = 0;

  for (const account of accounts as any[]) {
    try {
      let accessToken = decrypt(account.access_token as string);
      let trades;

      try {
        trades = await getTradovateTrades(
          accessToken,
          parseInt(account.account_id as string, 10),
        );
      } catch {
        const newTokens = await refreshAccessToken(
          decrypt(account.refresh_token as string),
        );
        accessToken = newTokens.access_token;

        await supabase
          .from("trade_accounts")
          .update({
            access_token: encrypt(newTokens.access_token),
            refresh_token: encrypt(newTokens.refresh_token),
          })
          .eq("id", account.id);

        trades = await getTradovateTrades(
          accessToken,
          parseInt(account.account_id as string, 10),
        );
      }

      const metrics = computeMetricsFromTrades(trades);
      const performanceScore = calculatePerformanceScore(metrics);
      const shouldVerify =
        metrics.totalTrades >= 90 || metrics.monthsOfData >= 3;

      await supabase.from("performance_snapshots").insert({
        trader_id: account.trader_id,
        snapshot_date: new Date().toISOString().split("T")[0],
        profit_factor: metrics.profitFactor,
        win_rate: metrics.winRate,
        sharpe_ratio: metrics.sharpeRatio,
        max_drawdown: metrics.maxDrawdown,
        avg_rr: metrics.avgRR,
        consistency_score: metrics.consistencyScore,
        total_trades: metrics.totalTrades,
        monthly_return: metrics.monthlyReturn,
        performance_score: performanceScore,
      });

      await supabase
        .from("traders")
        .update({
          performance_score: performanceScore,
          verified: shouldVerify,
          score_updated_at: new Date().toISOString(),
        })
        .eq("id", account.trader_id);

      synced++;
    } catch (err) {
      console.error(
        `Sync failed for account ${account.id}:`,
        err,
      );
      failed++;
    }
  }

  return NextResponse.json({ synced, failed });
}

