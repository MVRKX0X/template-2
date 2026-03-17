"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { BadgePill } from "@/components/ui/BadgePill";

const badgeColor: Record<string, string> = {
  Elite: "#00E5A0",
  Pro: "#a78bfa",
  Rising: "#fbbf24",
  Featured: "#00E5A0",
  default: "#6b7280",
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showSuccess =
    searchParams.get("connected") === "true";
  const errorParam = searchParams.get("error");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/me");
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Failed to load dashboard");
        } else {
          setData(json);
        }
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!errorParam) return;
    if (errorParam === "upload_failed") {
      setError("Upload failed. Please try again.");
    } else {
      setError(errorParam);
    }
  }, [errorParam]);

  async function handleDeleteUpload(uploadId: string) {
    const confirmed = window.confirm(
      "Are you sure? This will remove this upload from your history.",
    );
    if (!confirmed) return;
    setDeletingId(uploadId);
    setError(null);
    try {
      const res = await fetch("/api/upload/csv", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ uploadId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to delete upload");
        return;
      }
      setData((prev: any) =>
        prev?.uploads
          ? {
              ...prev,
              uploads: prev.uploads.filter((u: any) => u.id !== uploadId),
              trader: {
                ...prev.trader,
                upload_count: Math.max(0, (prev.trader.upload_count ?? 1) - 1),
              },
            }
          : prev,
      );
    } catch {
      setError("Failed to delete upload");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060812]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00E5A0] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060812] text-[color:var(--color-text-primary)]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-10">
        {showSuccess && (
          <div className="mb-6 rounded-xl border border-[#00E5A040] bg-[#00E5A015] px-5 py-4 text-sm font-medium text-[#00E5A0]">
            ✅ Trade history uploaded successfully! Your profile is
            being updated.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/10 px-5 py-4 text-sm text-[#fecaca]">
            ⚠️ {error}
          </div>
        )}

        <h1
          className="mb-2 text-3xl font-extrabold text-[#f1f5f9]"
          style={{ fontFamily: "Syne, system-ui, sans-serif" }}
        >
          Your Dashboard
        </h1>

        {!data ||
        (data as any).error === "No trader profile" ? (
          <section className="mt-8 rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-10 text-center">
            <div className="mb-4 text-4xl">📋</div>
            <p
              className="mb-2 text-lg font-semibold text-[#f1f5f9]"
              style={{
                fontFamily:
                  "Syne, system-ui, sans-serif",
              }}
            >
              Complete your profile first
            </p>
            <p className="mb-6 text-sm text-[#6b7280]">
              Set up your handle, instruments and strategy before
              uploading.
            </p>
            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="rounded-lg bg-[#00E5A0] px-6 py-3 text-sm font-bold text-black hover:bg-[#00c988]"
            >
              Complete Onboarding →
            </button>
          </section>
        ) : (
          data?.trader && (
            <>
              <section className="mb-6 flex items-center gap-6 rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-6">
                <ScoreRing
                  score={data.trader.performanceScore ?? 0}
                  color={
                    badgeColor[data.trader.badge] ??
                    badgeColor.default
                  }
                  size={80}
                />
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <span
                      className="text-xl font-bold text-[#f1f5f9]"
                      style={{
                        fontFamily:
                          "Syne, system-ui, sans-serif",
                      }}
                    >
                      {data.trader.displayName ??
                        data.trader.handle}
                    </span>
                    {data.trader.badge && (
                      <BadgePill badge={data.trader.badge} />
                    )}
                    {data.trader.verified && (
                      <span className="rounded-full border border-[#00E5A030] bg-[#00E5A015] px-2 py-0.5 text-xs font-semibold text-[#00E5A0]">
                        Verified
                      </span>
                    )}
                  </div>
                  <p
                    className="mb-3 text-sm text-[#6b7280]"
                    style={{
                      fontFamily:
                        '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    }}
                  >
                    @{data.trader.handle} ·{" "}
                    {data.trader.uploadCount ?? 0} uploads
                    {data.trader.lastUploadAt &&
                      ` · Last upload ${new Date(
                        data.trader.lastUploadAt,
                      ).toLocaleDateString()}`}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`/` + data.trader.handle}
                      className="text-sm text-[#00E5A0] hover:underline"
                    >
                      View public profile →
                    </a>
                    <a
                      href="/explore"
                      className="text-sm text-[#6b7280] hover:text-[#f1f5f9]"
                    >
                      Browse leaderboard →
                    </a>
                  </div>
                </div>
                <a
                  href="/connect/tradovate"
                  className="whitespace-nowrap rounded-lg border border-[#00E5A040] bg-[#00E5A015] px-4 py-2 text-sm font-semibold text-[#00E5A0] hover:bg-[#00E5A025]"
                >
                  Upload New Data →
                </a>
              </section>

              {(!data.uploads ||
                data.uploads.length === 0) && (
                <section className="mt-2 rounded-2xl border border-dashed border-[#1e2035] bg-[#0a0c1a] p-10 text-center">
                  <div className="mb-4 text-4xl">📊</div>
                  <p
                    className="mb-2 text-lg font-semibold text-[#f1f5f9]"
                    style={{
                      fontFamily:
                        "Syne, system-ui, sans-serif",
                    }}
                  >
                    No trade history uploaded yet
                  </p>
                  <p className="mx-auto mb-6 max-w-sm text-sm text-[#6b7280]">
                    Export your trade history from Tradovate,
                    Rithmic, or MT5 and upload your CSV to get
                    verified.
                  </p>
                  <a
                    href="/connect/tradovate"
                    className="inline-block rounded-lg bg-[#00E5A0] px-6 py-3 text-sm font-bold text:black hover:bg-[#00c988]"
                  >
                    Upload Trade History →
                  </a>
                </section>
              )}

              {data.latestSnapshot && (
                <section className="mt-6 rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-6">
                  <h2
                    className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#f1f5f9]"
                    style={{
                      fontFamily:
                        "Syne, system-ui, sans-serif",
                    }}
                  >
                    Latest Performance Snapshot
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Performance Score",
                        value:
                          data.trader
                            .performanceScore ?? "—",
                      },
                      {
                        label: "Profit Factor",
                        value: `${
                          data.latestSnapshot
                            .profit_factor ?? "—"
                        }x`,
                      },
                      {
                        label: "Win Rate",
                        value: `${
                          data.latestSnapshot
                            .win_rate ?? "—"
                        }%`,
                      },
                      {
                        label: "Max Drawdown",
                        value: `${
                          data.latestSnapshot
                            .max_drawdown ?? "—"
                        }%`,
                      },
                      {
                        label: "Consistency",
                        value: `${
                          data.latestSnapshot
                            .consistency_score ?? "—"
                        }%`,
                      },
                      {
                        label: "Total Trades",
                        value:
                          data.latestSnapshot.total_trades?.toLocaleString() ??
                          "—",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-[#1e2035] bg-[#0d0f22] p-4"
                      >
                        <div className="mb-1 text-[9px] uppercase tracking-[0.18em] text-[#6b7280]">
                          {stat.label}
                        </div>
                        <div
                          className="text-xl font-bold text-[#f1f5f9]"
                          style={{
                            fontFamily:
                              '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          }}
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.uploads && data.uploads.length > 0 && (
                <section className="mt-6 rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-6">
                  <h2
                    className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#f1f5f9]"
                    style={{
                      fontFamily:
                        "Syne, system-ui, sans-serif",
                    }}
                  >
                    Upload History
                  </h2>
                  <div className="space-y-2">
                    {data.uploads
                      .slice(0, 5)
                      .map((upload: any) => (
                        <div
                          key={upload.id}
                          className="flex items-center justify-between rounded-lg border border-[#1e2035] bg-[#0d0f22] px-4 py-3"
                        >
                          <div>
                            <span className="text-sm font-medium text-[#f1f5f9] capitalize">
                              {upload.broker_format}
                            </span>
                            {upload.date_range_from && (
                              <span className="ml-3 text-xs text-[#6b7280]">
                                {new Date(
                                  upload.date_range_from,
                                ).toLocaleDateString()}{" "}
                                →{" "}
                                {new Date(
                                  upload.date_range_to,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-5">
                            <span
                              className="text-xs text-[#6b7280]"
                              style={{
                                fontFamily:
                                  '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                              }}
                            >
                              {upload.trades_processed} trades
                            </span>
                            <span
                              className="text-sm font-bold text-[#00E5A0]"
                              style={{
                                fontFamily:
                                  '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                              }}
                            >
                              {upload.performance_score}
                            </span>
                            <span className="text-xs text-[#4b5563]">
                              {new Date(
                                upload.uploaded_at,
                              ).toLocaleDateString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteUpload(upload.id)}
                              disabled={deletingId === upload.id}
                              className="text-xs font-medium text-[#ef4444] hover:underline disabled:opacity-50"
                            >
                              {deletingId === upload.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
}

function DashboardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060812]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00E5A0] border-t-transparent" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}

