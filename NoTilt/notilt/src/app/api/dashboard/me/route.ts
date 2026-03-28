import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyTraderData } from "@/lib/queries";

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

  const traderData = await getMyTraderData(user.id);

  if (!traderData) {
    return NextResponse.json(
      { error: "No trader profile" },
      { status: 404 },
    );
  }

  const snapshots = traderData.performance_snapshots ?? [];
  const latestSnapshot = snapshots[0] ?? null;
  const uploads = traderData.csv_uploads ?? [];

  // Compute leaderboard rank for verified traders
  let leaderboardRank: number | null = null;
  let leaderboardTotal: number | null = null;

  if (traderData.verified && traderData.performance_score != null) {
    // Count how many verified traders score higher
    const { count: higherCount } = await supabase
      .from("traders")
      .select("id", { count: "exact", head: true })
      .eq("verified", true)
      .not("performance_score", "is", null)
      .gt("performance_score", traderData.performance_score);

    const { count: totalCount } = await supabase
      .from("traders")
      .select("id", { count: "exact", head: true })
      .eq("verified", true)
      .not("performance_score", "is", null);

    leaderboardRank = (higherCount ?? 0) + 1;
    leaderboardTotal = totalCount ?? 0;
  }

  return NextResponse.json({
    trader: {
      id: traderData.id,
      handle: traderData.handle,
      displayName: traderData.display_name,
      verified: traderData.verified,
      badge: traderData.badge,
      performanceScore: traderData.performance_score,
      uploadCount: traderData.upload_count,
      lastUploadAt: traderData.last_upload_at,
      leaderboardRank,
      leaderboardTotal,
    },
    latestSnapshot,
    uploads,
  });
}
