"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { MetricBar } from "@/components/ui/MetricBar";
import { BadgePill } from "@/components/ui/BadgePill";
import type { ExploreTrader } from "@/types/explore";

type TraderSortKey = "score" | "profitFactor" | "winRate" | "consistency";

interface TraderFeedProps {
  traders: ExploreTrader[];
  isDemo?: boolean;
}

export function TraderFeed({ traders, isDemo = false }: TraderFeedProps) {
  const [traderSort, setTraderSort] =
    useState<TraderSortKey>("score");
  const [expandedTraderId, setExpandedTraderId] = useState<
    string | null
  >(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sortedTraders = useMemo(() => {
    const copy = [...traders];
    copy.sort((a, b) => {
      if (traderSort === "score") return b.score - a.score;
      if (traderSort === "profitFactor")
        return (
          b.metrics.profitFactor - a.metrics.profitFactor
        );
      if (traderSort === "winRate")
        return b.metrics.winRate - a.metrics.winRate;
      if (traderSort === "consistency")
        return (
          b.metrics.consistency - a.metrics.consistency
        );
      return 0;
    });
    return copy;
  }, [traders, traderSort]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
            Verified traders leaderboard
          </h2>
          {isDemo && (
            <p className="text-[11px] text-[color:var(--color-text-secondary)]">
              Verified trade history — prop firm accounts are valid.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {[
            { key: "score", label: "Performance Score" },
            { key: "profitFactor", label: "Profit Factor" },
            { key: "winRate", label: "Win Rate" },
            { key: "consistency", label: "Consistency" },
          ].map((opt) => {
            const active = traderSort === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() =>
                  setTraderSort(opt.key as TraderSortKey)
                }
                className={`rounded-full border px-3 py-1 transition-colors ${
                  active
                    ? "border-[#00E5A040] bg-[#00E5A015] text-[color:var(--color-accent-green)]"
                    : "border-[color:var(--color-border-subtle)] text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-active)]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-3">
        {sortedTraders.map((trader, index) => {
          const expanded = expandedTraderId === trader.id;
          const rank = index + 1;
          const delay = mounted ? index * 0.05 : 0;

          const drawdownControl = Math.max(
            0,
            100 - trader.metrics.maxDrawdown,
          );

          return (
            <div
              key={trader.id}
              className={`cursor-pointer rounded-xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface-card)] p-4 shadow-sm transition-all hover:border-[color:var(--color-border-active)] ${
                mounted ? "opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{
                transition:
                  "opacity 0.4s ease-out, transform 0.4s ease-out, border-color 0.2s ease-out",
                transitionDelay: `${delay}s`,
              }}
              onClick={() =>
                setExpandedTraderId(
                  expanded ? null : trader.id,
                )
              }
            >
              <div className="flex items-center gap-4">
                <div
                  className="text-sm font-semibold"
                  style={{
                    color:
                      rank <= 3
                        ? trader.color
                        : "var(--color-text-muted)",
                    fontFamily:
                      '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                >
                  #{rank}
                </div>
                <div className="flex flex-1 items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: `${trader.color}26`,
                        color: trader.color,
                        fontFamily:
                          "Syne, system-ui, sans-serif",
                      }}
                    >
                      {trader.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="text-sm font-semibold"
                          style={{
                            fontFamily:
                              "Syne, system-ui, sans-serif",
                          }}
                        >
                          {trader.name}
                        </div>
                        {trader.verified && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-3 w-3 text-[color:var(--color-accent-green)]"
                            fill="currentColor"
                          >
                            <path d="M9 12.75 11.25 15 15 9.75l1.5 1.5L11.25 18 7.5 14.25l1.5-1.5z" />
                          </svg>
                        )}
                        <BadgePill badge={trader.badge} />
                      </div>
                      <div className="flex flex-wrap items-center gap-1 text-[11px] text-[color:var(--color-text-secondary)]">
                        <span>@{trader.handle}</span>
                        <span className="mx-1 h-1 w-1 rounded-full bg-[color:var(--color-border-subtle)]" />
                        <span>{trader.strategy}</span>
                        <span className="mx-1 h-1 w-1 rounded-full bg-[color:var(--color-border-subtle)]" />
                        <span>
                          {trader.instruments.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end text-[11px]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[color:var(--color-text-muted)]">
                          Win Rate
                        </span>
                        <span
                          className="font-medium"
                          style={{
                            fontFamily:
                              '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          }}
                        >
                          {trader.metrics.winRate.toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[color:var(--color-text-muted)]">
                          PF
                        </span>
                        <span
                          className="font-medium"
                          style={{
                            color: trader.color,
                            fontFamily:
                              '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          }}
                        >
                          {trader.metrics.profitFactor.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    </div>
                    <ScoreRing
                      score={trader.score}
                      color={trader.color}
                    />
                  </div>
                </div>
              </div>
              {expanded && (
                <div className="mt-4 border-t border-[color:var(--color-border-subtle)] pt-4">
                  <div className="grid gap-4 text-xs sm:grid-cols-2">
                    <div className="space-y-2">
                      <MetricBar
                        label="Profit Factor"
                        value={trader.metrics.profitFactor}
                        max={4}
                        color={trader.color}
                      />
                      <MetricBar
                        label="Win Rate"
                        value={trader.metrics.winRate}
                        max={100}
                        unit="%"
                        color={trader.color}
                      />
                      <MetricBar
                        label="Avg R:R"
                        value={trader.metrics.avgRR}
                        max={4}
                        color={trader.color}
                      />
                    </div>
                    <div className="space-y-2">
                      <MetricBar
                        label="Consistency"
                        value={trader.metrics.consistency}
                        max={100}
                        unit="%"
                        color={trader.color}
                      />
                      <MetricBar
                        label="Sharpe Ratio"
                        value={trader.metrics.sharpe}
                        max={4}
                        color={trader.color}
                      />
                      <MetricBar
                        label="Drawdown Control"
                        value={drawdownControl}
                        max={100}
                        unit="%"
                        color={trader.color}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                    <StatPill
                      label="Total Trades"
                      value={trader.metrics.totalTrades}
                    />
                    <StatPill
                      label="Months Verified"
                      value={trader.metrics.monthsVerified}
                    />
                    <StatPill
                      label="Max Drawdown"
                      value={`${trader.metrics.maxDrawdown.toFixed(
                        1,
                      )}%`}
                    />
                    <StatPill
                      label="Avg Monthly Return"
                      value={`${trader.metrics.monthlyReturn.toFixed(
                        1,
                      )}`}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
                    <Link
                      href={`/` + trader.handle}
                      className="rounded-lg border border-[color:var(--color-border-subtle)] px-3 py-1.5 text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-active)] hover:text-[color:var(--color-text-primary)]"
                    >
                      View Full Stats
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

type StatPillProps = {
  label: string;
  value: string | number;
};

function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="rounded-full border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface-raised)] px-3 py-1 text-[11px] text-[color:var(--color-text-secondary)]">
      <span className="mr-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
        {label}
      </span>
      <span
        style={{
          fontFamily:
            '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        {value}
      </span>
    </div>
  );
}

