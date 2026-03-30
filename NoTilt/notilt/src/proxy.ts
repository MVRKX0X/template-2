import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // Official Supabase SSR v0.9 middleware pattern.
  // supabaseResponse must be recreated inside setAll so that refreshed
  // session tokens are always forwarded to the browser.
  let supabaseResponse = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Apply to the incoming request so server components see the new tokens
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          // Recreate the response with updated request headers
          supabaseResponse = NextResponse.next({
            request: { headers: req.headers },
          });
          // Apply to the outgoing response so the browser stores the new tokens
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add any code between createServerClient and getUser().
  // getUser() refreshes expired tokens and calls setAll() above if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // Routes that require a logged-in session
  const protectedRoutes = [
    "/dashboard",
    "/journal",
    "/connect/tradovate",
    "/onboarding",
  ];
  const isProtectedRoute = protectedRoutes.some((r) => path.startsWith(r));

  // Routes that should redirect logged-in users away
  const guestOnlyRoutes = ["/login", "/signup"];
  const isGuestOnlyRoute = guestOnlyRoutes.some((r) => path.startsWith(r));

  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isGuestOnlyRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - /auth/*       (Supabase OAuth callback must run without middleware interference)
     * - /api/*        (API routes handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth|api).*)",
  ],
};
