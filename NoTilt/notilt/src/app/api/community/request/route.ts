import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient(true);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: trader } = await supabase
    .from("traders")
    .select("id, verified")
    .eq("user_id", user.id)
    .single();

  if (!trader) {
    return NextResponse.json(
      { error: "Complete your trader profile first." },
      { status: 400 },
    );
  }

  const body = await req.json();
  const { name, handle, platform, focus, pricing, description, joinUrl } =
    body as Record<string, string>;

  if (!name || !handle || !platform) {
    return NextResponse.json(
      { error: "Name, handle, and platform are required." },
      { status: 400 },
    );
  }

  // Sanitise handle
  const sanitisedHandle = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (sanitisedHandle.length < 3) {
    return NextResponse.json(
      { error: "Handle must be at least 3 characters." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("communities").insert({
    owner_id: trader.id,
    name: name.trim(),
    handle: sanitisedHandle,
    platform: platform.trim(),
    focus: focus?.trim() ?? null,
    pricing: pricing?.trim() ?? null,
    description: description?.trim() ?? null,
    join_url: joinUrl?.trim() ?? null,
    listed: false, // stays unlisted until reviewed/paid
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That community handle is already taken." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
