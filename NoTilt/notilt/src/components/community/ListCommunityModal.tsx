"use client";

import { useEffect, useRef, useState } from "react";

const PLATFORMS = ["Discord", "Telegram", "Skool", "Whop", "Circle", "Other"];
const FOCUS_OPTIONS = [
  "Futures",
  "Forex",
  "Crypto",
  "Stocks",
  "Options",
  "Prop Firms",
  "Multi-Asset",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

export function ListCommunityModal({ isOpen, onClose, isLoggedIn }: Props) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("");
  const [focus, setFocus] = useState("");
  const [pricing, setPricing] = useState("");
  const [description, setDescription] = useState("");
  const [joinUrl, setJoinUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/community/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, handle, platform, focus, pricing, description, joinUrl }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="text-xl font-bold text-[#f1f5f9]"
            style={{ fontFamily: "Syne, system-ui, sans-serif" }}
          >
            List your community
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#f1f5f9]"
          >
            ✕
          </button>
        </div>

        {!isLoggedIn ? (
          <div className="py-6 text-center">
            <p className="mb-4 text-sm text-[#6b7280]">
              You need to be signed in and have a verified trading profile to
              list your community.
            </p>
            <a
              href="/signup"
              className="inline-block rounded-lg bg-[#00E5A0] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#00c988]"
            >
              Get Verified →
            </a>
          </div>
        ) : success ? (
          <div className="py-6 text-center">
            <div className="mb-3 text-4xl">✅</div>
            <p
              className="mb-2 text-lg font-semibold text-[#f1f5f9]"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              Request submitted!
            </p>
            <p className="text-sm text-[#6b7280]">
              Your community listing is under review. You&apos;ll appear on the
              leaderboard once approved.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-lg bg-[#00E5A0] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#00c988]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-[#94a3b8]">Community name *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Apex Traders Club"
                  className="w-full rounded-lg border border-[#1e2035] bg-[#0d0f22] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none placeholder:text-[#4b5563] focus:border-[#00E5A0]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[#94a3b8]">Handle *</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                    @
                  </span>
                  <input
                    required
                    value={handle}
                    onChange={(e) =>
                      setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                    }
                    placeholder="apextradersclub"
                    className="w-full rounded-lg border border-[#1e2035] bg-[#0d0f22] px-3 py-2.5 pl-7 text-sm text-[#f1f5f9] outline-none placeholder:text-[#4b5563] focus:border-[#00E5A0]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#94a3b8]">Platform *</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                      platform === p
                        ? "bg-[#00E5A0] font-semibold text-black"
                        : "border border-[#1e2035] bg-[#0d0f22] text-[#94a3b8] hover:border-[#2a2d4a]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#94a3b8]">Focus</label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFocus(focus === f ? "" : f)}
                    className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                      focus === f
                        ? "bg-[#00E5A0] font-semibold text-black"
                        : "border border-[#1e2035] bg-[#0d0f22] text-[#94a3b8] hover:border-[#2a2d4a]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-[#94a3b8]">Pricing</label>
                <input
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  placeholder="e.g. $99/mo"
                  className="w-full rounded-lg border border-[#1e2035] bg-[#0d0f22] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none placeholder:text-[#4b5563] focus:border-[#00E5A0]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[#94a3b8]">Join link</label>
                <input
                  value={joinUrl}
                  onChange={(e) => setJoinUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                  className="w-full rounded-lg border border-[#1e2035] bg-[#0d0f22] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none placeholder:text-[#4b5563] focus:border-[#00E5A0]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#94a3b8]">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes your community different?"
                className="w-full rounded-lg border border-[#1e2035] bg-[#0d0f22] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none placeholder:text-[#4b5563] focus:border-[#00E5A0]"
              />
            </div>

            {error && (
              <p className="text-sm text-[#ef4444]">{error}</p>
            )}

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-[#4b5563]">
                Listings are reviewed before going live.
              </p>
              <button
                type="submit"
                disabled={loading || !name || !handle || !platform}
                className="rounded-lg bg-[#00E5A0] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#00c988] disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit listing"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
