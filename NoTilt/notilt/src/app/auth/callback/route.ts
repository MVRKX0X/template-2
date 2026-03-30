import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error("Auth callback error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription ?? error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // Collect every cookie Supabase wants to set during exchangeCodeForSession.
  // We cannot rely on cookies() from next/headers in a GET route handler that
  // returns NextResponse.redirect() — those writes get silently dropped.
  // Instead we collect them here and apply them directly to the redirect response.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingCookies: Array<{ name: string; value: string; options?: any }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet);
        },
      },
    }
  );

  try {
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.session) {
      const msg = exchangeError?.message ?? "session_exchange_failed";
      console.error("Code exchange error:", msg);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(msg)}`
      );
    }

    // Determine where to send the user after login
    let destination: string;

    if (next && next !== "/onboarding") {
      // Explicit ?next= destination (e.g. from a protected-route redirect)
      destination = next;
    } else {
      // Check if the user already has a trader profile
      const { data: trader } = await supabase
        .from("traders")
        .select("id")
        .eq("user_id", data.session.user.id)
        .single();
      destination = trader ? "/dashboard" : "/onboarding";
    }

    // Build the redirect response and attach every session cookie to it
    const response = NextResponse.redirect(`${origin}${destination}`);

    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options ?? {});
    }

    return response;
  } catch (err) {
    console.error("Auth callback exception:", err);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }
}
