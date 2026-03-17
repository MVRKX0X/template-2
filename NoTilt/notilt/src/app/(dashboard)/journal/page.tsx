"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";

type Trade = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  entry_price: number | null;
  exit_price: number | null;
  gross_pnl: number | null;
  fees: number | null;
  net_pnl: number;
  trade_date: string;
  opened_at: string | null;
  closed_at: string;
  duration_minutes: number | null;
  setup_tag: string | null;
  notes: string | null;
  rating: number | null;
  mistake: string | null;
};

type TradesResponse = {
  trades: Trade[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

const SETUP_TAGS = [
  "ORB",
  "Momentum",
  "Mean Reversion",
  "VWAP Reclaim",
  "Supply/Demand",
  "Other",
] as const;

type SetupTag = (typeof SETUP_TAGS)[number];

function JournalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    symbol: "",
    side: "all",
    winner: "all",
    startDate: "",
    endDate: "",
    tag: "all",
    sortBy: "closed_at",
    sortDir: "desc",
  });

  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) {
      setPage(parseInt(pageParam, 10) || 1);
    }
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      params.set("sortBy", filters.sortBy);
      params.set("sortDir", filters.sortDir);
      if (filters.symbol) params.set("symbol", filters.symbol);
      if (filters.side !== "all") {
        params.set("side", filters.side === "long" ? "buy" : "sell");
      }
      if (filters.winner === "winners") params.set("winner", "true");
      if (filters.winner === "losers") params.set("winner", "false");
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.tag !== "all") params.set("tag", filters.tag);

      try {
        const res = await fetch(`/api/journal/trades?${params.toString()}`);
        const json: TradesResponse | { error: string } = await res.json();
        if (!res.ok || "error" in json) {
          setError(
            "error" in json
              ? json.error
              : "Failed to load trades",
          );
          setTrades([]);
          setTotal(0);
          setPages(0);
        } else {
          setTrades(json.trades);
          setTotal(json.total);
          setPages(json.pages);
        }
      } catch {
        setError("Failed to load trades");
        setTrades([]);
        setTotal(0);
        setPages(0);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page, filters]);

  const symbolOptions = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t) => set.add(t.symbol));
    return Array.from(set).sort();
  }, [trades]);

  const stats = useMemo(() => {
    if (!trades.length) {
      return {
        totalTrades: total,
        winRate: 0,
        netPnl: 0,
        profitFactor: 0,
      };
    }
    let wins = 0;
    let losses = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let net = 0;
    trades.forEach((t) => {
      net += t.net_pnl;
      if (t.net_pnl > 0) {
        wins += 1;
        grossProfit += t.net_pnl;
      } else if (t.net_pnl < 0) {
        losses += 1;
        grossLoss += Math.abs(t.net_pnl);
      }
    });
    const totalCount = total || trades.length;
    const winRate =
      totalCount > 0 ? (wins / totalCount) * 100 : 0;
    const profitFactor =
      grossLoss === 0
        ? grossProfit > 0
          ? 99
          : 0
        : grossProfit / grossLoss;

    return {
      totalTrades: totalCount,
      winRate,
      netPnl: net,
      profitFactor,
    };
  }, [trades, total]);

  const handleClearFilters = () => {
    setFilters({
      symbol: "",
      side: "all",
      winner: "all",
      startDate: "",
      endDate: "",
      tag: "all",
      sortBy: "closed_at",
      sortDir: "desc",
    });
    setPage(1);
  };

  const handleSaveTrade = async (trade: Trade) => {
    setSavingId(trade.id);
    try {
      const res = await fetch(`/api/journal/trades/${trade.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setup_tag: trade.setup_tag,
          notes: trade.notes,
          rating: trade.rating,
          mistake: trade.mistake,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(
          (json as { error?: string }).error ??
            "Failed to save trade",
        );
      } else {
        setError(null);
      }
    } catch {
      setError("Failed to save trade");
    } finally {
      setSavingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString();

  const hasTrades = total > 0 || trades.length > 0;

  return (
    <div className="min-h-screen bg-[#060812] text-[color:var(--color-text-primary)]">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-extrabold text-[#f1f5f9]"
              style={{
                fontFamily: "Syne, system-ui, sans-serif",
              }}
            >
              Trade Journal
            </h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              Review, annotate, and learn from every trade you
              take.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/connect/tradovate")}
            className="rounded-lg border border-[#00E5A040] bg-[#00E5A015] px-4 py-2 text-sm font-semibold text-[#00E5A0] hover:bg-[#00E5A025]"
          >
            Upload New Data →
          </button>
        </div>

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Total Trades"
            value={stats.totalTrades.toLocaleString()}
          />
          <StatCard
            label="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
          />
          <StatCard
            label="Total Net PnL"
            value={formatCurrency(stats.netPnl)}
            valueClassName={
              stats.netPnl > 0
                ? "text-[#00E5A0]"
                : stats.netPnl < 0
                ? "text-[#ef4444]"
                : "text-[#f1f5f9]"
            }
          />
          <StatCard
            label="Profit Factor"
            value={stats.profitFactor.toFixed(2)}
          />
        </section>

        <section className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6b7280]">
              Symbol
            </label>
            <select
              className="min-w-[120px] rounded-md border border-[#1e2035] bg-[#020617] px-2 py-1 text-xs text-[#e5e7eb]"
              value={filters.symbol}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  symbol: e.target.value,
                }));
                setPage(1);
              }}
            >
              <option value="">All</option>
              {symbolOptions.map((sym) => (
                <option key={sym} value={sym}>
                  {sym}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6b7280]">
              Side
            </label>
            <select
              className="rounded-md border border-[#1e2035] bg-[#020617] px-2 py-1 text-xs text-[#e5e7eb]"
              value={filters.side}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  side: e.target.value,
                }));
                setPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6b7280]">
              Result
            </label>
            <select
              className="rounded-md border border-[#1e2035] bg-[#020617] px-2 py-1 text-xs text-[#e5e7eb]"
              value={filters.winner}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  winner: e.target.value,
                }));
                setPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="winners">Winners</option>
              <option value="losers">Losers</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6b7280]">
              From
            </label>
            <input
              type="date"
              className="rounded-md border border-[#1e2035] bg-[#020617] px-2 py-1 text-xs text-[#e5e7eb]"
              value={filters.startDate}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }));
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6b7280]">
              To
            </label>
            <input
              type="date"
              className="rounded-md border border-[#1e2035] bg-[#020617] px-2 py-1 text-xs text-[#e5e7eb]"
              value={filters.endDate}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }));
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6b7280]">
              Setup
            </label>
            <select
              className="rounded-md border border-[#1e2035] bg-[#020617] px-2 py-1 text-xs text-[#e5e7eb]"
              value={filters.tag}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  tag: e.target.value,
                }));
                setPage(1);
              }}
            >
              <option value="all">All</option>
              {SETUP_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="ml-auto text-xs text-[#6b7280] hover:text-[#e5e7eb]"
          >
            Clear filters
          </button>
        </section>

        <section className="mb-3 flex flex-wrap items-center gap-3 text-xs text-[#6b7280]">
          <span className="mr-2 text-[10px] uppercase tracking-[0.2em] text-[#4b5563]">
            Sort by
          </span>
          {[
            { key: "closed_at", label: "Date" },
            { key: "net_pnl", label: "PnL" },
            { key: "symbol", label: "Symbol" },
            { key: "duration_minutes", label: "Duration" },
          ].map((opt) => {
            const active = filters.sortBy === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: opt.key,
                    sortDir:
                      active && prev.sortDir === "desc"
                        ? "asc"
                        : "desc",
                  }))
                }
                className={`rounded-full border px-3 py-1 ${
                  active
                    ? "border-[#00E5A040] bg-[#00E5A015] text-[#e5e7eb]"
                    : "border-[#1e2035] bg-[#020617] text-[#6b7280]"
                }`}
              >
                {opt.label}
                {active &&
                  (filters.sortDir === "desc" ? " ↓" : " ↑")}
              </button>
            );
          })}
        </section>

        {loading && (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00E5A0] border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="mb-4 rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/10 px-5 py-4 text-sm text-[#fecaca]">
            ⚠️ {error}
          </div>
        )}

        {!loading && !hasTrades && !error && (
          <section className="mt-4 rounded-2xl border border-dashed border-[#1e2035] bg-[#0a0c1a] p-10 text-center">
            <div className="mb-4 text-4xl">📓</div>
            <p
              className="mb-2 text-lg font-semibold text-[#f1f5f9]"
              style={{
                fontFamily: "Syne, system-ui, sans-serif",
              }}
            >
              No trades yet
            </p>
            <p className="mx-auto mb-6 max-w-sm text-sm text-[#6b7280]">
              Upload your trade history to start building your
              journal and tracking your edge over time.
            </p>
            <button
              type="button"
              onClick={() => router.push("/connect/tradovate")}
              className="rounded-lg bg-[#00E5A0] px-6 py-3 text-sm font-bold text-black hover:bg-[#00c988]"
            >
              Upload Trade History →
            </button>
          </section>
        )}

        {hasTrades && (
          <section className="mt-4 space-y-2">
            {trades.map((trade) => {
              const isWinner = trade.net_pnl > 0;
              const isLoser = trade.net_pnl < 0;
              const isExpanded = expandedId === trade.id;
              return (
                <div
                  key={trade.id}
                  className={`rounded-xl border border-[#1e2035] bg-[#0a0c1a] ${
                    isWinner
                      ? "border-l-2 border-l-[#00E5A0]"
                      : isLoser
                      ? "border-l-2 border-l-[#ef4444]"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-[#0d0f22]"
                    onClick={() =>
                      setExpandedId(
                        isExpanded ? null : trade.id,
                      )
                    }
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div className="min-w-[80px] text-xs text-[#6b7280]">
                        {formatDate(trade.closed_at)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#020617] px-2 py-1 text-xs font-semibold text-[#e5e7eb]">
                          {trade.symbol}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            trade.side === "buy"
                              ? "bg-[#022c22] text-[#00E5A0]"
                              : "bg-[#3b0a0a] text-[#f87171]"
                          }`}
                        >
                          {trade.side === "buy"
                            ? "LONG"
                            : "SHORT"}
                        </span>
                      </div>
                      <div className="hidden flex-1 items-center gap-4 text-xs text-[#9ca3af] md:flex">
                        <span className="font-mono">
                          {trade.entry_price != null
                            ? `Entry ${trade.entry_price.toFixed(
                                2,
                              )}`
                            : "Entry —"}
                        </span>
                        <span className="font-mono">
                          {trade.exit_price != null
                            ? `Exit ${trade.exit_price.toFixed(
                                2,
                              )}`
                            : "Exit —"}
                        </span>
                        <span className="font-mono">
                          Qty {trade.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {trade.setup_tag && (
                        <span className="hidden rounded-full bg-[#111827] px-2 py-0.5 text-[10px] text-[#e5e7eb] md:inline">
                          {trade.setup_tag}
                        </span>
                      )}
                      {trade.rating != null && (
                        <span className="text-xs text-[#facc15]">
                          {"★".repeat(trade.rating).padEnd(
                            5,
                            "☆",
                          )}
                        </span>
                      )}
                      {trade.notes && (
                        <span className="text-xs text-[#6b7280]">
                          📝
                        </span>
                      )}
                      <span
                        className={`min-w-[80px] text-right font-mono text-sm ${
                          isWinner
                            ? "text-[#00E5A0]"
                            : isLoser
                            ? "text-[#ef4444]"
                            : "text-[#e5e7eb]"
                        }`}
                      >
                        {formatCurrency(trade.net_pnl)}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="space-y-4 border-t border-[#1e2035] bg-[#0d0f22] px-4 py-4">
                      <div className="grid gap-3 text-xs text-[#9ca3af] md:grid-cols-4">
                        <div>
                          <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">
                            Opened
                          </div>
                          <div>
                            {trade.opened_at
                              ? new Date(
                                  trade.opened_at,
                                ).toLocaleString()
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">
                            Closed
                          </div>
                          <div>
                            {new Date(
                              trade.closed_at,
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">
                            Duration
                          </div>
                          <div>
                            {trade.duration_minutes != null
                              ? `${trade.duration_minutes} min`
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">
                            Gross / Fees
                          </div>
                          <div className="font-mono">
                            {formatCurrency(
                              trade.gross_pnl ?? trade.net_pnl,
                            )}{" "}
                            /{" "}
                            {formatCurrency(
                              trade.fees ?? 0,
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">
                          Setup
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {SETUP_TAGS.map((tag) => {
                            const active =
                              trade.setup_tag === tag;
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  const next: SetupTag | null =
                                    active ? null : tag;
                                  setTrades((prev) =>
                                    prev.map((t) =>
                                      t.id === trade.id
                                        ? {
                                            ...t,
                                            setup_tag: next,
                                          }
                                        : t,
                                    ),
                                  );
                                }}
                                className={`rounded-full px-2 py-0.5 text-[10px] ${
                                  active
                                    ? "bg-[#00E5A0] text-black"
                                    : "bg-[#111827] text-[#e5e7eb]"
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[220px]">
                          <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">
                            Notes
                          </div>
                          <textarea
                            rows={3}
                            className="w-full rounded-md border border-[#1e2035] bg-[#020617] px-2 py-1 text-xs text-[#e5e7eb] outline-none focus:border-[#00E5A0]"
                            value={trade.notes ?? ""}
                            onChange={(e) => {
                              const next = e.target.value;
                              setTrades((prev) =>
                                prev.map((t) =>
                                  t.id === trade.id
                                    ? {
                                        ...t,
                                        notes: next,
                                      }
                                    : t,
                                ),
                              );
                            }}
                            onBlur={() => handleSaveTrade(trade)}
                          />
                        </div>
                        <div className="flex-1 min-w-[220px] space-y-3">
                          <div>
                            <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">
                              Rating
                            </div>
                            <div className="flex gap-1 text-lg">
                              {Array.from({ length: 5 }).map(
                                (_, i) => {
                                  const filled =
                                    (trade.rating ?? 0) >
                                    i;
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => {
                                        const next =
                                          trade.rating ===
                                            i + 1
                                            ? null
                                            : i + 1;
                                        setTrades((prev) =>
                                          prev.map((t) =>
                                            t.id === trade.id
                                              ? {
                                                  ...t,
                                                  rating: next,
                                                }
                                              : t,
                                          ),
                                        );
                                        handleSaveTrade({
                                          ...trade,
                                          rating: next,
                                        });
                                      }}
                                      className="text-[#facc15]"
                                    >
                                      {filled ? "★" : "☆"}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">
                              Mistake
                            </div>
                            <input
                              type="text"
                              className="w-full rounded-md border border-[#1e2035] bg-[#020617] px-2 py-1 text-xs text-[#e5e7eb] outline-none focus:border-[#00E5A0]"
                              placeholder="What went wrong?"
                              value={trade.mistake ?? ""}
                              onChange={(e) => {
                                const next = e.target.value;
                                setTrades((prev) =>
                                  prev.map((t) =>
                                    t.id === trade.id
                                      ? {
                                          ...t,
                                          mistake: next,
                                        }
                                      : t,
                                  ),
                                );
                              }}
                              onBlur={() => handleSaveTrade(trade)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#6b7280]">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(null)
                          }
                          className="text-[11px] text-[#9ca3af] hover:text-[#e5e7eb]"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveTrade(trade)}
                          disabled={savingId === trade.id}
                          className="rounded-md bg-[#00E5A0] px-3 py-1 text-[11px] font-semibold text-black hover:bg-[#00c988] disabled:opacity-60"
                        >
                          {savingId === trade.id
                            ? "Saving..."
                            : "Save changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {hasTrades && (
          <div className="mt-6 flex items-center justify-between text-xs text-[#6b7280]">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-[#1e2035] bg-[#020617] px-3 py-1 text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {pages || 1}
            </span>
            <button
              type="button"
              disabled={pages === 0 || page >= pages}
              onClick={() =>
                setPage((p) =>
                  pages ? Math.min(pages, p + 1) : p,
                )
              }
              className="rounded-md border border-[#1e2035] bg-[#020617] px-3 py-1 text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard(props: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  const { label, value, valueClassName } = props;
  return (
    <div className="rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-4">
      <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#6b7280]">
        {label}
      </div>
      <div
        className={`text-lg font-bold text-[#f1f5f9] ${
          valueClassName ?? ""
        }`}
        style={{
          fontFamily:
            '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function JournalFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060812]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00E5A0] border-t-transparent" />
    </div>
  );
}

export default function JournalPage() {
  return (
    <Suspense fallback={<JournalFallback />}>
      <JournalContent />
    </Suspense>
  );
}

