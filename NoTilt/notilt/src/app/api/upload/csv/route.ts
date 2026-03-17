import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseCSV } from "@/lib/csvParser";
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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 },
    );
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json(
      { error: "File must be a .csv" },
      { status: 400 },
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 10MB)" },
      { status: 400 },
    );
  }

  const csvText = await file.text();
  const parseResult = parseCSV(csvText);

  if (parseResult.trades.length === 0) {
    return NextResponse.json(
      {
        error: "No valid trades found in CSV",
        details: parseResult.errors,
      },
      { status: 400 },
    );
  }

  const { data: trader } = await supabase
    .from("traders")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!trader) {
    return NextResponse.json(
      { error: "Trader profile not found. Complete onboarding first." },
      { status: 400 },
    );
  }

  const metrics = computeMetricsFromTrades(
    parseResult.trades,
  );
  const performanceScore = calculatePerformanceScore(
    metrics,
  );

  const shouldVerify =
    metrics.totalTrades >= 90 || metrics.monthsOfData >= 3;

  const snapshotDate =
    parseResult.dateRange?.to ??
    new Date().toISOString().split("T")[0];

  await supabase.from("performance_snapshots").insert({
    trader_id: trader.id,
    snapshot_date: snapshotDate,
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

  await supabase.from("csv_uploads").insert({
    trader_id: trader.id,
    broker_format: parseResult.broker,
    filename: file.name,
    trades_processed: metrics.totalTrades,
    skipped_rows: parseResult.skippedRows,
    date_range_from: parseResult.dateRange?.from
      ? parseResult.dateRange.from.split("T")[0]
      : null,
    date_range_to: parseResult.dateRange?.to
      ? parseResult.dateRange.to.split("T")[0]
      : null,
    performance_score: performanceScore,
  });

  await supabase
    .from("traders")
    .update({
      performance_score: performanceScore,
      verified: shouldVerify,
      score_updated_at: new Date().toISOString(),
      last_upload_at: new Date().toISOString(),
      upload_count: (trader.upload_count ?? 0) + 1,
      data_source: "csv",
    })
    .eq("id", trader.id);

  return NextResponse.json({
    success: true,
    broker: parseResult.broker,
    tradesProcessed: metrics.totalTrades,
    skippedRows: parseResult.skippedRows,
    dateRange: parseResult.dateRange,
    metrics,
    performanceScore,
    verified: shouldVerify,
    monthsOfData: metrics.monthsOfData,
    warnings: parseResult.errors,
  });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient(true);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { uploadId } = await req.json();

  const { data: trader } = await supabase
    .from("traders")
    .select("id, upload_count")
    .eq("user_id", user.id)
    .single();

  if (!trader)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: upload } = await supabase
    .from("csv_uploads")
    .select("id, date_range_to")
    .eq("id", uploadId)
    .eq("trader_id", trader.id)
    .single();

  if (!upload)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error: deleteError } = await supabase
    .from("csv_uploads")
    .delete()
    .eq("id", uploadId)
    .eq("trader_id", trader.id);

  if (deleteError)
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 },
    );

  if (upload.date_range_to) {
    await supabase
      .from("performance_snapshots")
      .delete()
      .eq("trader_id", trader.id)
      .eq("snapshot_date", upload.date_range_to);
  }

  const { data: latestSnapshot } = await supabase
    .from("performance_snapshots")
    .select("performance_score, total_trades")
    .eq("trader_id", trader.id)
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single();

  const newUploadCount = Math.max(0, (trader.upload_count ?? 1) - 1);
  await supabase
    .from("traders")
    .update({
      performance_score: latestSnapshot?.performance_score ?? null,
      verified: (latestSnapshot?.total_trades ?? 0) >= 90,
      upload_count: newUploadCount,
      score_updated_at: new Date().toISOString(),
    })
    .eq("id", trader.id);

  return NextResponse.json({ success: true });
}

