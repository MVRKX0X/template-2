import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/journal/trades
// Returns paginated list of trades for the current trader plus aggregate stats
// Query params: page, limit, symbol, side, startDate, endDate, tag, winner, sortBy, sortDir

export async function GET(req: NextRequest) {
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
      { error: "No profile" },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const symbol = searchParams.get("symbol");
  const side = searchParams.get("side");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const tag = searchParams.get("tag");
  const winner = searchParams.get("winner");
  const sortBy = searchParams.get("sortBy") ?? "closed_at";
  const sortDir = searchParams.get("sortDir") === "asc";

  // Build paginated query
  let query = supabase
    .from("trades")
    .select("*", { count: "exact" })
    .eq("trader_id", trader.id)
    .order(sortBy, { ascending: sortDir })
    .range((page - 1) * limit, page * limit - 1);

  // Build stats query (same filters, no pagination, only aggregate columns)
  let statsQuery = supabase
    .from("trades")
    .select("net_pnl, is_winner")
    .eq("trader_id", trader.id);

  // Apply filters to both queries
  function applyFilters<T>(q: T): T {
    let r = q as any;
    if (symbol) r = r.eq("symbol", symbol);
    if (side) r = r.eq("side", side);
    if (startDate) r = r.gte("trade_date", startDate);
    if (endDate) r = r.lte("trade_date", endDate);
    if (tag) r = r.eq("setup_tag", tag);
    if (winner === "true") r = r.eq("is_winner", true);
    if (winner === "false") r = r.eq("is_winner", false);
    return r as T;
  }

  query = applyFilters(query);
  statsQuery = applyFilters(statsQuery);

  const [pageResult, statsResult] = await Promise.all([
    query,
    statsQuery,
  ]);

  if (pageResult.error) {
    return NextResponse.json(
      { error: pageResult.error.message },
      { status: 500 },
    );
  }

  const total = pageResult.count ?? 0;

  // Compute aggregate stats from the full filtered set
  const allTrades = statsResult.data ?? [];
  let wins = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let netPnl = 0;
  for (const t of allTrades) {
    const pnl = Number(t.net_pnl ?? 0);
    netPnl += pnl;
    if (t.is_winner) {
      wins++;
      grossProfit += pnl;
    } else if (pnl < 0) {
      grossLoss += Math.abs(pnl);
    }
  }
  const winRate = allTrades.length > 0 ? (wins / allTrades.length) * 100 : 0;
  const profitFactor =
    grossLoss === 0 ? (grossProfit > 0 ? 99 : 0) : grossProfit / grossLoss;

  return NextResponse.json({
    trades: pageResult.data,
    total,
    page,
    limit,
    pages: total > 0 ? Math.ceil(total / limit) : 0,
    stats: {
      totalTrades: allTrades.length,
      winRate,
      netPnl,
      profitFactor,
    },
  });
}
