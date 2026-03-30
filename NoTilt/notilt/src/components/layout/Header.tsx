"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ListCommunityModal } from "@/components/community/ListCommunityModal";

interface AuthState {
  user: { email?: string } | null;
  handle: string | null;
  loaded: boolean;
}

export function Header() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ user: null, handle: null, loaded: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const [communityModalOpen, setCommunityModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    // Use the server-side API endpoint for reliable initial auth detection.
    // This always works because the server can read session cookies regardless
    // of how they were set (OAuth callback, email login, etc.).
    async function loadFromServer() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const json = await res.json();
        console.log("[Header] loadFromServer result:", { user: json.user?.email ?? null, handle: json.handle });
        if (!mounted) return;
        setAuth({
          user: json.user ? { email: json.user.email } : null,
          handle: json.handle ?? null,
          loaded: true,
        });
      } catch (err) {
        console.error("[Header] loadFromServer error:", err);
        if (mounted) setAuth((prev) => ({ ...prev, loaded: true }));
      }
    }

    loadFromServer();

    // Also subscribe to real-time auth state changes (handles sign-in/sign-out
    // without page reload, e.g. from the login page or logout button).
    const supabase = createBrowserSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[Header] onAuthStateChange:", _event, "session:", session?.user?.email ?? null);
      if (!mounted) return;

      if (!session?.user) {
        setAuth({ user: null, handle: null, loaded: true });
        return;
      }

      // User signed in via client-side auth — fetch their handle from the server
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const json = await res.json();
        console.log("[Header] onAuthStateChange /api/auth/me result:", { user: json.user?.email ?? null });
        if (!mounted) return;
        setAuth({
          user: json.user ? { email: json.user.email } : { email: session.user.email },
          handle: json.handle ?? null,
          loaded: true,
        });
      } catch {
        if (mounted) {
          setAuth({
            user: { email: session.user.email },
            handle: null,
            loaded: true,
          });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setAuth({ user: null, handle: null, loaded: true });
    router.push("/");
    router.refresh();
  }

  const { user, handle } = auth;

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : null;

  return (
    <>
    <header className="sticky top-0 z-20 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface-base)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 min-w-0 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-accent-green)] text-xs font-semibold text-black">
            NT
          </div>
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ fontFamily: "Syne, system-ui, sans-serif" }}
          >
            No Tilt
          </span>
        </Link>

        <nav
          className="flex min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto whitespace-nowrap sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Main"
        >
          <Link
            href="/explore"
            className="shrink-0 text-sm text-[#6b7280] transition-colors hover:text-[#f1f5f9]"
          >
            Explore
          </Link>
          <Link
            href="/pricing"
            className="hidden shrink-0 text-sm text-[#6b7280] transition-colors hover:text-[#f1f5f9] sm:block"
          >
            Pricing
          </Link>
          {user && (
            <>
              <Link
                href="/journal"
                className="shrink-0 text-sm text-[#6b7280] transition-colors hover:text-[#f1f5f9]"
              >
                Journal
              </Link>
              <Link
                href="/dashboard"
                className="shrink-0 text-sm text-[#6b7280] transition-colors hover:text-[#f1f5f9]"
              >
                Dashboard
              </Link>
            </>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setCommunityModalOpen(true)}
            className="rounded-lg border border-[color:var(--color-border-subtle)] bg-transparent px-2 py-1.5 text-[10px] font-medium text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-active)] hover:text-[color:var(--color-text-primary)] sm:px-3 sm:text-xs"
          >
            <span className="sm:hidden">List community</span>
            <span className="hidden sm:inline">List Your Community</span>
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e2035] text-xs font-bold text-[#f1f5f9] hover:bg-[#2a2d4a]"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-[#1e2035] bg-[#0a0c1a] py-1 shadow-xl">
                  {handle && (
                    <Link
                      href={`/${handle}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#94a3b8] hover:bg-[#0d0f22] hover:text-[#f1f5f9]"
                    >
                      Public Profile
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-[#94a3b8] hover:bg-[#0d0f22] hover:text-[#f1f5f9]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/connect/tradovate"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-[#94a3b8] hover:bg-[#0d0f22] hover:text-[#f1f5f9]"
                  >
                    Upload Data
                  </Link>
                  <div className="my-1 border-t border-[#1e2035]" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-[#ef4444] hover:bg-[#0d0f22]"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-[color:var(--color-border-subtle)] bg-transparent px-2 py-1.5 text-[10px] font-medium text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-active)] hover:text-[color:var(--color-text-primary)] sm:px-3 sm:text-xs"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[color:var(--color-accent-green)] px-3.5 py-1.5 text-xs font-semibold text-black shadow-sm hover:bg-[#00c988]"
              >
                Get Verified
              </Link>
            </>
          )}
        </div>
      </div>
    </header>

    <ListCommunityModal
      isOpen={communityModalOpen}
      onClose={() => setCommunityModalOpen(false)}
      isLoggedIn={!!user}
    />
  </>
  );
}
