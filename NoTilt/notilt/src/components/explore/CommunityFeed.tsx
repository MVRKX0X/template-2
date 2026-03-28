"use client";

import { useEffect, useMemo, useState } from "react";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { MetricBar } from "@/components/ui/MetricBar";
import { BadgePill } from "@/components/ui/BadgePill";
import type { ExploreCommunity } from "@/types/explore";

type CommunitySortKey =
  | "score"
  | "avgPF"
  | "retention"
  | "verifiedTraders";

interface CommunityFeedProps {
  communities: ExploreCommunity[];
}

export function CommunityFeed({ communities }: CommunityFeedProps) {
  const [communitySort, setCommunitySort] =
    useState<CommunitySortKey>("score");
  const [expandedCommunityId, setExpandedCommunityId] =
    useState<string | number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sortedCommunities = useMemo(() => {
    const verified = communities.filter((c) => c.verified);
    const unverified = communities.filter((c) => !c.verified);

    verified.sort((a, b) => {
      if (communitySort === "score") return b.score - a.score;
      if (communitySort === "avgPF")
        return b.metrics.avgPF - a.metrics.avgPF;
      if (communitySort === "retention")
        return b.metrics.retention - a.metrics.retention;
      if (communitySort === "verifiedTraders")
        return (
          b.metrics.verifiedTraders -
          a.metrics.verifiedTraders
        );
      return 0;
    });

    return [...verified, ...unverified];
  }, [communities, communitySort]);

  return (
    <section className="space-y-4">
      {/* Communities are demo-only for now */}
      <div className="rounded-xl border border-[#fbbf2430] bg-[#fbbf2408] px-5 py-4 text-xs">
        <p className="font-semibold text-[#fbbf24]">Community listings coming soon</p>
        <p className="mt-0.5 text-[#6b7280]">
          These are example communities. Own a trading community?{" "}
          <span className="text-[#00E5A0]">Use &quot;List Your Community&quot; in the nav to get listed.</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
          Trading communities ranked by verified results
        </h2>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {[
            { key: "score", label: "Community Score" },
            { key: "avgPF", label: "Avg Member PF" },
            { key: "retention", label: "Retention" },
            {
              key: "verifiedTraders",
              label: "Verified Traders",
            },
          ].map((opt) => {
            const active = communitySort === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() =>
                  setCommunitySort(opt.key as CommunitySortKey)
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
        {sortedCommunities.map((community, index) => {
          const expanded =
            expandedCommunityId === community.id;
          const isUnverified = !community.verified;
          const delay = mounted ? index * 0.05 : 0;

          const activeMemberPct =
            (community.metrics.activeMembers /
              community.metrics.totalMembers) *
            100;

          return (
            <div
              key={community.id}
              className={`cursor-pointer rounded-xl border bg-[color:var(--color-bg-surface-card)] p-4 shadow-sm transition-all hover:border-[color:var(--color-border-active)] ${
                isUnverified
                  ? "border-[#ef4444]/30"
                  : "border-[color:var(--color-border-subtle)]"
              } ${
                mounted ? "opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{
                transition:
                  "opacity 0.4s ease-out, transform 0.4s ease-out, border-color 0.2s ease-out",
                transitionDelay: `${delay}s`,
              }}
              onClick={() =>
                setExpandedCommunityId(
                  expanded ? null : community.id,
                )
              }
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--color-bg-surface-raised)] text-xs font-semibold">
                  {community.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div className="flex flex-1 items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="text-sm font-semibold"
                        style={{
                          fontFamily:
                            "Syne, system-ui, sans-serif",
                        }}
                      >
                        {community.name}
                      </div>
                      {community.verified ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-3 w-3 text-[color:var(--color-accent-green)]"
                          fill="currentColor"
                        >
                          <path d="M9 12.75 11.25 15 15 9.75l1.5 1.5L11.25 18 7.5 14.25l1.5-1.5z" />
                        </svg>
                      ) : (
                        <span className="text-[11px] text-[#f87171]">
                          Unverified
                        </span>
                      )}
                      <BadgePill badge={community.badge} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-[color:var(--color-text-secondary)]">
                      <span>@{community.handle}</span>
                      <span className="mx-1 h-1 w-1 rounded-full bg-[color:var(--color-border-subtle)]" />
                      <span>{community.platform}</span>
                      <span className="mx-1 h-1 w-1 rounded-full bg-[color:var(--color-border-subtle)]" />
                      <span>{community.focus}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end text-[11px]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[color:var(--color-text-muted)]">
                          Verified Traders
                        </span>
                        <span
                          className="font-medium"
                          style={{
                            fontFamily:
                              '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          }}
                        >
                          {
                            community.metrics
                              .verifiedTraders
                          }
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[color:var(--color-text-muted)]">
                          Avg Win Rate
                        </span>
                        <span
                          className="font-medium"
                          style={{
                            fontFamily:
                              '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          }}
                        >
                          {community.metrics.memberWinRate.toFixed(
                            0,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <ScoreRing
                      score={community.score}
                      color={
                        isUnverified
                          ? "#ef4444"
                          : community.color
                      }
                    />
                  </div>
                </div>
              </div>
              {expanded && (
                <div className="mt-4 border-t border-[color:var(--color-border-subtle)] pt-4">
                  {isUnverified && (
                    <div className="mb-4 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/5 px-3 py-2 text-[11px] text-[#fecaca]">
                      ⚠️ This community has not connected
                      verified trading accounts. Member
                      performance data is unaudited.
                    </div>
                  )}
                  <div className="grid gap-4 text-xs sm:grid-cols-2">
                    <div className="space-y-2">
                      <MetricBar
                        label="Avg Profit Factor"
                        value={community.metrics.avgPF}
                        max={3}
                        color={community.color}
                      />
                      <MetricBar
                        label="Member Win Rate"
                        value={community.metrics.memberWinRate}
                        max={100}
                        unit="%"
                        color={community.color}
                      />
                      <MetricBar
                        label="Avg Member Growth"
                        value={
                          community.metrics
                            .avgMemberGrowth
                        }
                        max={15}
                        unit="%"
                        color={community.color}
                      />
                    </div>
                    <div className="space-y-2">
                      <MetricBar
                        label="Retention"
                        value={community.metrics.retention}
                        max={100}
                        unit="%"
                        color={community.color}
                      />
                      <MetricBar
                        label="Avg Consistency"
                        value={
                          community.metrics
                            .avgConsistency
                        }
                        max={100}
                        unit="%"
                        color={community.color}
                      />
                      <MetricBar
                        label="Active Member %"
                        value={activeMemberPct}
                        max={100}
                        unit="%"
                        color={community.color}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                    <StatPill
                      label="Total Members"
                      value={community.metrics.totalMembers}
                    />
                    <StatPill
                      label="Active Members"
                      value={community.metrics.activeMembers}
                    />
                    <StatPill
                      label="Pricing"
                      value={community.pricing}
                    />
                    <StatPill
                      label="Avg PF"
                      value={community.metrics.avgPF.toFixed(
                        2,
                      )}
                    />
                    <StatPill
                      label="Verified Traders"
                      value={
                        community.metrics
                          .verifiedTraders
                      }
                    />
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

