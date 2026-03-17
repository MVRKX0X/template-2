import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getTradovateTrades,
  refreshAccessToken,
} from "@/lib/tradovate";
import { encrypt, decrypt } from "@/lib/encryption";
import { computeMetricsFromTrades } from "@/lib/metricsCalculator";
import { calculatePerformanceScore } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient(true);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { data: trader } = await supabase
    .from("traders")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!trader) {
    return NextResponse.json(
      { error: "Trader not found" },
      { status: 404 },
    );
  }

  const { data: account } = await supabase
    .from("trade_accounts")
    .select("*")
    .eq("trader_id", trader.id)
    .eq("broker", "tradovate")
    .single();

  if (!account) {
    return NextResponse.json(
      { error: "No connected account" },
      { status: 404 },
    );
  }

  try {
    let accessToken = decrypt(account.access_token as string);
    let trades;

    try {
      trades = await getTradovateTrades(
        accessToken,
        parseInt(account.account_id as string, 10),
      );
    } catch {
      const refreshToken = decrypt(
        account.refresh_token as string,
      );
      const newTokens = await refreshAccessToken(refreshToken);
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

    await supabase.from("performance_snapshots").insert({
      trader_id: trader.id,
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

    const shouldVerify =
      metrics.totalTrades >= 90 || metrics.monthsOfData >= 3;

    await supabase
      .from("traders")
      .update({
        performance_score: performanceScore,
        verified: shouldVerify,
        score_updated_at: new Date().toISOString(),
      })
      .eq("id", trader.id);

    return NextResponse.json({
      success: true,
      metrics,
      performanceScore,
      verified: shouldVerify,
    });
  } catch (err: any) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  }
}

