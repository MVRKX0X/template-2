import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/journal/trades/[id]
// Updates setup_tag, notes, rating, mistake for a trade
// Only the trader who owns the trade can update it

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

  const body = await req.json();
  const { setup_tag, notes, rating, mistake } = body as {
    setup_tag?: string | null;
    notes?: string | null;
    rating?: number | null;
    mistake?: string | null;
  };

  const { error } = await supabase
    .from("trades")
    .update({
      setup_tag,
      notes,
      rating,
      mistake,
      updated_at: new Date().toISOString(),
    })
    .eq("id", (await context.params).id)
    .eq("trader_id", trader.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

