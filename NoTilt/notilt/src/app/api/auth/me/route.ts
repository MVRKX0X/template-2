import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null, handle: null });
    }

    const { data: trader } = await supabase
      .from("traders")
      .select("handle")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      user: { email: user.email, id: user.id },
      handle: trader?.handle ?? null,
    });
  } catch {
    return NextResponse.json({ user: null, handle: null });
  }
}
