"use client";

import { useState } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";

const INSTRUMENTS = [
  "NQ",
  "MNQ",
  "ES",
  "GBP/USD",
  "EUR/USD",
  "Gold",
  "BTC",
  "ETH",
  "CL",
] as const;

const STRATEGIES = [
  "ORB Momentum",
  "Supply & Demand",
  "Mean Reversion",
  "Breakout",
  "Order Flow / ICT",
  "Other",
] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [instruments, setInstruments] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegex = /^[a-z0-9_]{3,20}$/;

  function toggleInstrument(symbol: string) {
    setInstruments((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol],
    );
  }

  async function handleSubmit() {
    setError(null);

    if (!handleRegex.test(handle)) {
      setStep(1);
      setError(
        "Handle must be 3–20 characters, lowercase, and can only contain letters, numbers, and underscores.",
      );
      return;
    }
    if (!displayName.trim()) {
      setStep(1);
      setError("Display name is required.");
      return;
    }
    if (!instruments.length) {
      setStep(2);
      setError("Select at least one instrument.");
      return;
    }
    if (!strategy) {
      setStep(3);
      setError("Select your primary strategy.");
      return;
    }

    setLoading(true);
    try {
      await completeOnboarding({ handle, displayName, instruments, strategy });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-8 shadow-xl">
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-[#6b7280]">
          <span>
            Step {step} of 3
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i <= step
                    ? "bg-[#00E5A0]"
                    : "bg-[#1e2035]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h1
              className="text-[22px] font-extrabold text-[#f1f5f9]"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              Choose your identity
            </h1>
            <p className="text-sm text-[#6b7280]">
              This is how the trading world will find you.
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-[#94a3b8]">
                Handle
              </label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                  style={{
                    fontFamily:
                      '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                >
                  @
                </span>
                <input
                  value={handle}
                  onChange={(e) =>
                    setHandle(e.target.value.toLowerCase())
                  }
                  placeholder="yourhandle"
                  className="w-full rounded-lg border border-[#1e2035] bg-[#0d0f22] px-4 py-3 pl-8 text-sm text-[#f1f5f9] outline-none transition-colors placeholder:text-[#4b5563] focus:border-[#00E5A0]"
                  style={{
                    fontFamily:
                      '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#94a3b8]">
                Display name
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                className="w-full rounded-lg border border-[#1e2035] bg-[#0d0f22] px-4 py-3 text-sm text-[#f1f5f9] outline-none transition-colors placeholder:text-[#4b5563] focus:border-[#00E5A0]"
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h1
              className="text-[22px] font-extrabold text-[#f1f5f9]"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              What do you trade?
            </h1>
            <p className="text-sm text-[#6b7280]">
              Select all that apply.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {INSTRUMENTS.map((symbol) => {
              const selected = instruments.includes(symbol);
              return (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => toggleInstrument(symbol)}
                  className={`rounded-full px-4 py-2 text-sm transition-all ${
                    selected
                      ? "border-transparent bg-[#00E5A0] font-semibold text-black"
                      : "border border-[#1e2035] bg-[#0d0f22] text-[#94a3b8] hover:border-[#2a2d4a]"
                  }`}
                >
                  {symbol}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h1
              className="text-[22px] font-extrabold text-[#f1f5f9]"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              What&apos;s your primary strategy?
            </h1>
            <p className="text-sm text-[#6b7280]">
              Be honest — your verified results will confirm it.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STRATEGIES.map((item) => {
              const selected = strategy === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStrategy(item)}
                  className={`rounded-full px-4 py-2 text-sm transition-all ${
                    selected
                      ? "border-transparent bg-[#00E5A0] font-semibold text-black"
                      : "border border-[#1e2035] bg-[#0d0f22] text-[#94a3b8] hover:border-[#2a2d4a]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-[#ef4444]">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s === 2 ? 1 : 2))}
            className="rounded-lg border border-[#1e2035] px-4 py-2 text-sm text-[#6b7280] hover:border-[#2a2d4a] hover:text-[#f1f5f9]"
          >
            Back
          </button>
        ) : (
          <div />
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
            className="rounded-lg bg-[#00E5A0] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#00c988]"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full rounded-lg bg-[#00E5A0] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#00c988] disabled:opacity-60"
          >
            {loading ? "Completing..." : "Complete Profile"}
          </button>
        )}
      </div>
    </div>
  );
}

