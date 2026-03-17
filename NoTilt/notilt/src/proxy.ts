import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(req, res);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  // Routes that require auth
  const protectedRoutes = ["/dashboard", "/explore"];
  const isProtectedRoute = protectedRoutes.some((r) => path.startsWith(r));

  // Routes that logged-in users should not see
  const authOnlyRoutes = ["/login", "/signup"];
  const isAuthOnlyRoute = authOnlyRoutes.some((r) => path.startsWith(r));

  // Redirect unauthenticated users away from protected routes
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from login/signup
  if (session && isAuthOnlyRoute) {
    return NextResponse.redirect(new URL("/explore", req.url));
  }

  // /onboarding is allowed for authenticated users — do not redirect
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
