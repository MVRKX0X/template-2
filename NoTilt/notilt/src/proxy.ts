import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(req, res);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  // Routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/journal",
    "/connect/tradovate",
    "/onboarding",
  ];
  const isProtectedRoute = protectedRoutes.some((r) => path.startsWith(r));

  // Routes that authenticated users should be redirected away from
  const guestOnlyRoutes = ["/login", "/signup"];
  const isGuestOnlyRoute = guestOnlyRoutes.some((r) => path.startsWith(r));

  if (!session && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isGuestOnlyRoute) {
    return NextResponse.redirect(new URL("/explore", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
