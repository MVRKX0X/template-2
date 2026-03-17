import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  exchangeCodeForTokens,
  getTradovateAccounts,
} from "@/lib/tradovate";
import { encrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = req.cookies.get("tradovate_oauth_state")?.value;

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(
      new URL("/dashboard?error=oauth_failed", req.url),
    );
  }

  const supabase = await createServerSupabaseClient(true);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const accounts = await getTradovateAccounts(tokens.access_token);
    const liveAccount = accounts.find((a: any) => !a.sim) ?? accounts[0];

    const { data: trader } = await supabase
      .from("traders")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!trader) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    await supabase
      .from("trade_accounts")
      .upsert(
        {
          trader_id: trader.id,
          broker: "tradovate",
          account_id: String(liveAccount.id),
          access_token: encrypt(tokens.access_token),
          refresh_token: encrypt(tokens.refresh_token),
          is_live: !liveAccount.sim,
        },
        { onConflict: "trader_id,broker" },
      );

    const res = NextResponse.redirect(
      new URL("/dashboard?connected=true", req.url),
    );
    res.cookies.delete("tradovate_oauth_state");
    return res;
  } catch (err) {
    console.error("Tradovate callback error:", err);
    return NextResponse.redirect(
      new URL("/dashboard?error=connection_failed", req.url),
    );
  }
}

