"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Broker = "tradovate" | "rithmic" | "mt5" | "other";

interface UploadResult {
  success: boolean;
  broker?: string;
  tradesProcessed?: number;
  skippedRows?: number;
  performanceScore?: number;
  verified?: boolean;
  monthsOfData?: number;
  dateRange?: { from?: string; to?: string };
  metrics?: {
    profitFactor?: number;
    winRate?: number;
    sharpeRatio?: number;
    maxDrawdown?: number;
    avgRR?: number;
    consistencyScore?: number;
    totalTrades?: number;
    monthlyReturn?: number;
  };
  warnings?: string[];
}

const BROKER_LABELS: { id: Broker; label: string; subtitle?: string }[] = [
  {
    id: "tradovate",
    label: "Tradovate",
    subtitle: "Apex · TopStep · MyFundedFutures · Bulenox",
  },
  {
    id: "rithmic",
    label: "Rithmic",
    subtitle: "TopStep · Earn2Trade · TradeDay",
  },
  { id: "mt5", label: "MT5" },
  { id: "other", label: "Other" },
];

function UploadContent() {
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "1";

  const [broker, setBroker] = useState<Broker>("tradovate");
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [handle, setHandle] = useState<string | null>(null);

  // Load trader handle for post-upload CTA
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("traders")
        .select("handle")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.handle) setHandle(data.handle);
        });
    });
  }, []);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files || !files.length) return;
    const f = files[0];
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("File must be a .csv");
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  }, []);

  async function handleUpload() {
    if (!file) {
      setError("Choose a CSV file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("broker", broker);

      const res = await fetch("/api/upload/csv", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setError(body?.error ?? "Upload failed. Please check your CSV and try again.");
        return;
      }

      setResult(body as UploadResult);
      setFile(null);
    } catch {
      setError("Unexpected error during upload. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function renderInstructions() {
    switch (broker) {
      case "tradovate":
        return (
          <ol className="list-decimal space-y-1 pl-4 text-xs text-[#9ca3af]">
            <li>Open Tradovate (or your prop firm&apos;s Tradovate platform).</li>
            <li>Go to <span className="font-semibold">Account Reports</span> → <span className="font-semibold">Fills</span> tab.</li>
            <li>Set date range as far back as possible.</li>
            <li>Click <span className="font-semibold">Download CSV</span>.</li>
            <li>Upload the CSV here.</li>
          </ol>
        );
      case "rithmic":
        return (
          <ol className="list-decimal space-y-1 pl-4 text-xs text-[#9ca3af]">
            <li>Open your Rithmic reporting tool or broker portal.</li>
            <li>Export your trade history as a <span className="font-semibold">CSV</span> file.</li>
            <li>Make sure the file includes fills, quantity, price, and side.</li>
            <li>Upload the CSV file here.</li>
          </ol>
        );
      case "mt5":
        return (
          <ol className="list-decimal space-y-1 pl-4 text-xs text-[#9ca3af]">
            <li>In MT5, open the <span className="font-semibold">Account History</span> tab.</li>
            <li>Right-click and choose <span className="font-semibold">Save as Report</span>.</li>
            <li>Select <span className="font-semibold">CSV</span> format.</li>
            <li>Upload the CSV file here.</li>
          </ol>
        );
      default:
        return (
          <ol className="list-decimal space-y-1 pl-4 text-xs text-[#9ca3af]">
            <li>Export your closed trade history from your broker platform.</li>
            <li>Include at least: time, symbol, side, quantity, price, and P&amp;L.</li>
            <li>Save as a <span className="font-semibold">CSV</span> file.</li>
            <li>Upload the CSV file here.</li>
          </ol>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-surface-base)] text-[color:var(--color-text-primary)]">
      <Header />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10">
        {!isOnboarding && (
          <Link href="/dashboard" className="text-sm text-[#6b7280] hover:text-[#f1f5f9]">
            ← Back to dashboard
          </Link>
        )}

        {/* Onboarding welcome banner */}
        {isOnboarding && (
          <div className="mb-6 rounded-xl border border-[#00E5A040] bg-[#00E5A010] px-5 py-4">
            <p className="font-semibold text-[#00E5A0]" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>
              🎉 Profile created! One last step.
            </p>
            <p className="mt-1 text-sm text-[#6b7280]">
              Upload your trade history CSV to get your performance score and appear on the leaderboard.
              You need 90+ trades or 3+ months of history to earn Verified status.
            </p>
          </div>
        )}

        <section className="mt-4 rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-6">
          <div className="mb-4">
            <h1
              className="text-[24px] font-extrabold text-[#f1f5f9]"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              Upload your trade history
            </h1>
            <p className="mt-1 text-sm text-[#9ca3af]">
              We support live accounts, prop firm accounts, and funded trader accounts.
            </p>
          </div>

          {/* Broker tabs */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {BROKER_LABELS.map((b) => {
              const selected = broker === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBroker(b.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? "bg-[#00E5A0] text-black"
                      : "border border-[#1e2035] bg-[#0d0f22] text-[#9ca3af] hover:border-[#2a2d4a]"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
          {BROKER_LABELS.find((b) => b.id === broker)?.subtitle && (
            <p className="mb-4 text-[11px] text-[#6b7280]">
              {BROKER_LABELS.find((b) => b.id === broker)?.subtitle}
            </p>
          )}

          {/* Instructions */}
          <div className="mb-6 rounded-lg border border-[#1e293b] bg-[#020617] p-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
              Export instructions
            </h2>
            {renderInstructions()}
          </div>

          {/* Drop zone */}
          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragActive
                ? "border-[#00E5A0] bg-[#020617]"
                : "border-[#1e293b] bg-[#020617]/60"
            }`}
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); handleFile(e.dataTransfer.files); }}
          >
            <p className="text-sm font-medium text-[#e5e7eb]">Drag and drop your CSV here</p>
            <p className="mt-1 text-xs text-[#9ca3af]">or click to browse (max 10MB)</p>
            <div className="mt-4">
              <label className="cursor-pointer rounded-lg bg-[#0f172a] px-4 py-2 text-xs font-semibold text-[#e5e7eb] hover:bg-[#111827]">
                Choose file
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files)}
                />
              </label>
            </div>
            {file && (
              <p className="mt-3 text-xs text-[#9ca3af]">
                Selected: <span className="font-medium text-[#e5e7eb]">{file.name}</span>
              </p>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-[#f97373]">{error}</p>}

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-xs text-[#6b7280]">
              We only read your trade history. No personal identity or funding details are accessed.
            </p>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !file}
              className="rounded-lg bg-[#00E5A0] px-5 py-2 text-sm font-semibold text-black hover:bg-[#00c988] disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload CSV"}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-8 rounded-xl border border-[#1e293b] bg-[#020617] p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#00E5A0]" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>
                    ✅ Upload successful
                  </h2>
                  <p className="mt-0.5 text-xs text-[#9ca3af]">
                    Broker detected: <span className="font-semibold">{result.broker ?? "Unknown"}</span>
                    {result.verified
                      ? " · Verified ✓"
                      : ` · ${result.tradesProcessed ?? 0} trades — need 90+ or 3+ months for Verified`}
                  </p>
                </div>
                {handle && (
                  <Link
                    href={`/${handle}`}
                    className="shrink-0 rounded-lg bg-[#00E5A0] px-4 py-2 text-sm font-bold text-black hover:bg-[#00c988]"
                  >
                    View my profile →
                  </Link>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <MetricTile label="Performance Score" value={result.performanceScore} suffix="" decimals={0} large />
                <MetricTile label="Trades processed" value={result.tradesProcessed} suffix="" decimals={0} />
                <MetricTile label="Data coverage" value={result.monthsOfData} suffix=" mo" decimals={0} />
                <MetricTile label="Skipped rows" value={result.skippedRows} suffix="" decimals={0} />
              </div>

              {result.metrics && (
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <MetricTile label="Profit factor" value={result.metrics.profitFactor} suffix="×" />
                  <MetricTile label="Win rate" value={result.metrics.winRate} suffix="%" />
                  <MetricTile label="Sharpe ratio" value={result.metrics.sharpeRatio} />
                  <MetricTile label="Max drawdown" value={result.metrics.maxDrawdown} suffix="%" />
                </div>
              )}

              {result.warnings && result.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
                  <p className="text-xs font-semibold text-amber-200">Import warnings</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-amber-100">
                    {result.warnings.slice(0, 5).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                    {result.warnings.length > 5 && (
                      <li>+ {result.warnings.length - 5} more rows with minor issues</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {handle && (
                  <Link
                    href={`/${handle}`}
                    className="rounded-lg bg-[#00E5A0] px-5 py-2 text-sm font-bold text-black hover:bg-[#00c988]"
                  >
                    View public profile →
                  </Link>
                )}
                <Link
                  href="/explore"
                  className="rounded-lg border border-[#1e2035] px-5 py-2 text-sm text-[#94a3b8] hover:border-[#2a2d4a] hover:text-[#f1f5f9]"
                >
                  Browse leaderboard
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-[#1e2035] px-5 py-2 text-sm text-[#94a3b8] hover:border-[#2a2d4a] hover:text-[#f1f5f9]"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function MetricTile({
  label,
  value,
  suffix = "",
  decimals = 2,
  large = false,
}: {
  label: string;
  value?: number;
  suffix?: string;
  decimals?: number;
  large?: boolean;
}) {
  return (
    <div className="rounded-lg bg-[#020617]/80 p-3">
      <p className="text-[11px] uppercase tracking-wide text-[#6b7280]">{label}</p>
      <p className={`mt-1 font-semibold text-[#e5e7eb] ${large ? "text-2xl font-black text-[#00E5A0]" : "text-lg"}`}>
        {typeof value === "number" ? `${value.toFixed(decimals)}${suffix}` : "–"}
      </p>
    </div>
  );
}

export default function ConnectTradovatePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#060812]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00E5A0] border-t-transparent" />
      </div>
    }>
      <UploadContent />
    </Suspense>
  );
}
