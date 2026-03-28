"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If session is returned immediately (email confirmation disabled), go to onboarding
    if (data.session) {
      router.push("/onboarding");
      return;
    }

    // Otherwise email confirmation is required — show the check-email state
    setCheckEmail(true);
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (oauthError) {
      setError(oauthError.message);
    }
  }

  if (checkEmail) {
    return (
      <div className="rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-8 shadow-xl text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00E5A015] text-2xl">
            ✉️
          </div>
        </div>
        <h1
          className="mb-2 text-2xl font-extrabold text-[#f1f5f9]"
          style={{ fontFamily: "Syne, system-ui, sans-serif" }}
        >
          Check your email
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[#6b7280]">
          We&apos;ve sent a confirmation link to{" "}
          <span className="font-semibold text-[#94a3b8]">{email}</span>.
          Click it to activate your account, then you&apos;ll be taken
          straight to profile setup.
        </p>
        <p className="text-xs text-[#4b5563]">
          Didn&apos;t get it? Check your spam folder.
        </p>
        <div className="mt-6 border-t border-[#1e2035] pt-6">
          <Link
            href="/login"
            className="text-sm text-[#00E5A0] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-8 shadow-xl">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E5A0] text-xs font-black text-black">
          NT
        </div>
        <div
          className="text-[20px] font-bold text-[#f1f5f9]"
          style={{ fontFamily: "Syne, system-ui, sans-serif" }}
        >
          No Tilt
        </div>
        <div
          className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#6b7280]"
          style={{ fontFamily: '"DM Mono", ui-monospace, monospace' }}
        >
          Verified Performance
        </div>
      </div>

      <div className="mb-6 space-y-1">
        <h1
          className="text-[28px] font-extrabold text-[#f1f5f9]"
          style={{ fontFamily: "Syne, system-ui, sans-serif" }}
        >
          Start your verified profile
        </h1>
        <p className="text-sm text-[#6b7280]">
          Free during beta. Upload your CSV, get your score, rank publicly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-[#94a3b8]">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#1e2035] bg-[#0d0f22] px-4 py-3 text-sm text-[#f1f5f9] outline-none transition-colors placeholder:text-[#4b5563] focus:border-[#00E5A0]"
            style={{ fontFamily: '"DM Mono", ui-monospace, monospace' }}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#94a3b8]">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#1e2035] bg-[#0d0f22] px-4 py-3 text-sm text-[#f1f5f9] outline-none transition-colors placeholder:text-[#4b5563] focus:border-[#00E5A0]"
            placeholder="Min. 8 characters"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#94a3b8]">Confirm password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-[#1e2035] bg-[#0d0f22] px-4 py-3 text-sm text-[#f1f5f9] outline-none transition-colors placeholder:text-[#4b5563] focus:border-[#00E5A0]"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-[#ef4444]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-[#00E5A0] py-3 text-sm font-bold text-black transition-colors hover:bg-[#00c988] disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account →"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-[#6b7280]">
        <div className="h-px flex-1 bg-[#1e2035]" />
        <span>or</span>
        <div className="h-px flex-1 bg-[#1e2035]" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#1e2035] bg-[#0d0f22] py-3 text-sm text-[#f1f5f9] transition-colors hover:border-[#2a2d4a] disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="mt-6 text-center text-sm text-[#6b7280]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#00E5A0] hover:underline">
          Sign in →
        </Link>
      </div>
    </div>
  );
}
