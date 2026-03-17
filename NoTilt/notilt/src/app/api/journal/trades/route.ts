import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/journal/trades
// Returns paginated list of trades for the current trader
// Query params: page, limit, symbol, side, startDate, endDate, tag, winner

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

  let query = supabase
    .from("trades")
    .select("*", { count: "exact" })
    .eq("trader_id", trader.id)
    .order(sortBy, { ascending: sortDir })
    .range((page - 1) * limit, page * limit - 1);

  if (symbol) query = query.eq("symbol", symbol);
  if (side) query = query.eq("side", side);
  if (startDate) query = query.gte("trade_date", startDate);
  if (endDate) query = query.lte("trade_date", endDate);
  if (tag) query = query.eq("setup_tag", tag);
  if (winner === "true") query = query.eq("is_winner", true);
  if (winner === "false") query = query.eq("is_winner", false);

  const {
    data: trades,
    count,
    error,
  } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  const total = count ?? 0;

  return NextResponse.json({
    trades,
    total,
    page,
    limit,
    pages: total > 0 ? Math.ceil(total / limit) : 0,
  });
}

