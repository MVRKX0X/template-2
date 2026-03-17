import { Header } from "@/components/layout/Header";
import ExploreTabs from "@/components/explore/ExploreTabs";
import { getTopTraders } from "@/lib/queries";
import { TRADERS, COMMUNITIES } from "@/lib/mockData";
import type {
  ExploreTrader,
  ExploreCommunity,
} from "@/types/explore";

const badgeColor: Record<string, string> = {
  Elite: "#00E5A0",
  Pro: "#a78bfa",
  Rising: "#fbbf24",
  Featured: "#00E5A0",
  "Top Rated": "#ff8c5a",
  default: "#6b7280",
};

export default async function ExplorePage() {
  const rawTraders: any[] = await getTopTraders(50);

  const liveTraders: ExploreTrader[] = rawTraders
    .filter((t) => t.performance_snapshots?.length > 0)
    .map((t) => {
      const snap = t.performance_snapshots[0];
      const badge = t.badge ?? "Pro";
      const score = Math.round(t.performance_score ?? 0);

      const totalTrades = snap?.total_trades ?? 0;
      const monthsVerified =
        totalTrades > 0
          ? Math.max(Math.floor(totalTrades / 20), 1)
          : 1;

      return {
        id: t.id,
        name: t.display_name ?? t.handle,
        handle: t.handle,
        badge,
        strategy: t.strategy ?? "",
        instruments: t.instruments ?? [],
        score,
        color: badgeColor[badge] ?? badgeColor.default,
        verified: t.verified ?? false,
        metrics: {
          profitFactor: snap?.profit_factor ?? 0,
          winRate: snap?.win_rate ?? 0,
          maxDrawdown: snap?.max_drawdown ?? 0,
          sharpe: snap?.sharpe_ratio ?? 0,
          avgRR: snap?.avg_rr ?? 0,
          consistency: snap?.consistency_score ?? 0,
          monthsVerified,
          totalTrades,
          monthlyReturn: snap?.monthly_return ?? 0,
        },
      };
    });

  const isDemo = liveTraders.length === 0;
  const traders: ExploreTrader[] = isDemo
    ? (TRADERS as unknown as ExploreTrader[])
    : liveTraders;

  const communities: ExploreCommunity[] =
    COMMUNITIES as unknown as ExploreCommunity[];

  return (
    <div className="min-h-screen bg-[#060812] text-[color:var(--color-text-primary)]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-12">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-block rounded-full border border-[#00E5A030] bg-[#00E5A015] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00E5A0]">
            Explore Feed
          </div>
          <h1
            className="mb-3 text-4xl font-extrabold tracking-tight text-[#f1f5f9]"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Find mentors with verified results.
          </h1>
          <p className="mx-auto max-w-md text-base leading-relaxed text-[#6b7280]">
            If your mentor isn&apos;t on No Tilt, they have something to
            hide. Every stat here comes from real uploaded trade history.
          </p>
        </div>

        <div className="mb-8 flex items-start gap-3 rounded-xl border border-[#1e2035] bg-[#0d0f22] px-5 py-4 text-xs text-[#6b7280]">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#00E5A015]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00E5A0"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-[#e2e8f0]">
              Performance Score — not just PnL
            </p>
            <p>
              Score = Profit Factor (30%) + Consistency (25%) + Win Rate
              (20%) + Sharpe Ratio (15%) + Drawdown Control (10%). A $500
              account with a 3× PF outscores a $100k account with a 1.2×
              PF.
            </p>
          </div>
        </div>

        <ExploreTabs
          traders={traders}
          communities={communities}
          isDemo={isDemo}
        />
      </main>
    </div>
  );
}

