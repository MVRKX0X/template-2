import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getTopTraders(limit = 50) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("traders")
    .select(
      `
      id,
      handle,
      display_name,
      verified,
      badge,
      strategy,
      instruments,
      performance_score,
      score_updated_at,
      upload_count,
      last_upload_at,
      performance_snapshots (
        profit_factor,
        win_rate,
        sharpe_ratio,
        max_drawdown,
        avg_rr,
        consistency_score,
        total_trades,
        monthly_return,
        performance_score,
        snapshot_date
      )
    `,
    )
    .eq("verified", true)
    .not("performance_score", "is", null)
    .order("performance_score", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getTraderByHandle(handle: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("traders")
    .select(
      `
      *,
      performance_snapshots (
        profit_factor,
        win_rate,
        sharpe_ratio,
        max_drawdown,
        avg_rr,
        consistency_score,
        total_trades,
        monthly_return,
        performance_score,
        snapshot_date
      ),
      csv_uploads (
        broker_format,
        filename,
        trades_processed,
        date_range_from,
        date_range_to,
        uploaded_at,
        performance_score
      )
    `,
    )
    .eq("handle", handle)
    .order("snapshot_date", {
      foreignTable: "performance_snapshots",
      ascending: false,
    })
    .order("uploaded_at", {
      foreignTable: "csv_uploads",
      ascending: false,
    })
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getMyTraderData(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("traders")
    .select(
      `
      *,
      performance_snapshots (
        profit_factor,
        win_rate,
        sharpe_ratio,
        max_drawdown,
        avg_rr,
        consistency_score,
        total_trades,
        monthly_return,
        performance_score,
        snapshot_date
      ),
      csv_uploads (
        id,
        broker_format,
        filename,
        trades_processed,
        date_range_from,
        date_range_to,
        performance_score,
        uploaded_at
      )
    `,
    )
    .eq("user_id", userId)
    .order("snapshot_date", {
      foreignTable: "performance_snapshots",
      ascending: false,
    })
    .order("uploaded_at", {
      foreignTable: "csv_uploads",
      ascending: false,
    })
    .single();

  if (error) {
    return null;
  }

  return data;
}

