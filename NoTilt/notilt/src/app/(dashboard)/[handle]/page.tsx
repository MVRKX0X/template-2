import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { MetricBar } from "@/components/ui/MetricBar";
import { BadgePill } from "@/components/ui/BadgePill";
import { MOCK_TRADERS } from "@/lib/mockData";
import { getTraderByHandle } from "@/lib/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const badgeColor: Record<string, string> = {
  Elite: "#00E5A0",
  Pro: "#a78bfa",
  Rising: "#fbbf24",
  Featured: "#00E5A0",
  default: "#6b7280",
};

export default async function TraderProfile({
  params,
}: {
  params: { handle: string };
}) {
  const traderData: any = await getTraderByHandle(params.handle);
  const mockTrader = MOCK_TRADERS.find(
    (t) => t.handle === params.handle,
  );

  if (!traderData && !mockTrader) {
    notFound();
  }

  const supabase = await createServerSupabaseClient(true);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner =
    traderData && user
      ? traderData.user_id === user.id
      : false;

  const snap = traderData?.performance_snapshots?.[0];
  const badge =
    traderData?.badge ?? mockTrader?.badge ?? "Pro";
  const color =
    badgeColor[badge] ?? badgeColor.default;

  const trader = traderData
    ? {
        name:
          traderData.display_name ?? traderData.handle,
        handle: traderData.handle,
        badge,
        color,
        verified: traderData.verified ?? false,
        strategy: traderData.strategy ?? "",
        instruments: traderData.instruments ?? [],
        score: Math.round(
          traderData.performance_score ?? 0,
        ),
        metrics: snap
          ? {
              profitFactor: snap.profit_factor ?? 0,
              winRate: snap.win_rate ?? 0,
              maxDrawdown: snap.max_drawdown ?? 0,
              sharpe: snap.sharpe_ratio ?? 0,
              avgRR: snap.avg_rr ?? 0,
              consistency:
                snap.consistency_score ?? 0,
              monthsVerified:
                traderData.upload_count ?? 1,
              totalTrades: snap.total_trades ?? 0,
              monthlyReturn:
                snap.monthly_return ?? 0,
            }
          : null,
        uploads: traderData.csv_uploads ?? [],
        lastUploadAt: traderData.last_upload_at,
        uploadCount: traderData.upload_count ?? 0,
      }
    : {
        name: mockTrader!.name,
        handle: mockTrader!.handle,
        badge: mockTrader!.badge,
        color: mockTrader!.color,
        verified: true,
        strategy: mockTrader!.strategy,
        instruments: mockTrader!.instruments,
        score: mockTrader!.score,
        metrics: mockTrader!.metrics,
        uploads: [] as any[],
        lastUploadAt: null,
        uploadCount: 0,
      };

  const hasMetrics = trader.metrics != null;

  const drawdownControl =
    trader.metrics != null
      ? Math.max(0, 100 - trader.metrics.maxDrawdown)
      : 0;

  return (
    <div className="min-h-screen bg-[#060812] text-[color:var(--color-text-primary)]">
      <Header />
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-8">
        <Link
          href="/explore"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#6b7280] transition-colors hover:text-[#f1f5f9]"
        >
          ← Explore
        </Link>

        <section className="mb-10 mt-2 flex flex-col gap-6 md:flex-row md:items-start">
          <div>
            <ScoreRing
              score={trader.score}
              color={trader.color}
              size={120}
            />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1
                  className="text-[28px] font-extrabold text-[#f1f5f9]"
                  style={{
                    fontFamily: "Syne, system-ui, sans-serif",
                  }}
                >
                  {trader.name}
                </h1>
                {trader.verified && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-[color:var(--color-accent-green)]"
                    fill="currentColor"
                  >
                    <path d="M9 12.75 11.25 15 15 9.75l1.5 1.5L11.25 18 7.5 14.25l1.5-1.5z" />
                  </svg>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span
                  className="text-[#6b7280]"
                  style={{
                    fontFamily:
                      '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                >
                  @{trader.handle}
                </span>
                <BadgePill badge={trader.badge} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {trader.instruments.map((inst: string) => (
                <span
                  key={inst}
                  className="rounded-full border border-[#1e2035] bg-[#0d0f22] px-3 py-1 text-[#94a3b8]"
                >
                  {inst}
                </span>
              ))}
              {trader.strategy && (
                <span className="rounded-full border border-[#00E5A040] bg-transparent px-3 py-1 text-[#00E5A0]">
                  {trader.strategy}
                </span>
              )}
            </div>

            {hasMetrics && trader.metrics && (
              <p className="text-sm text-[#6b7280]">
                {trader.metrics.monthsVerified} months
                verified ·{" "}
                {trader.metrics.totalTrades.toLocaleString()}{" "}
                total trades
              </p>
            )}
          </div>
        </section>

        {hasMetrics && trader.metrics && (
          <>
            <section className="mt-2 max-w-2xl space-y-4">
              <h2
                className="text-sm font-bold text-[#f1f5f9]"
                style={{
                  fontFamily:
                    "Syne, system-ui, sans-serif",
                }}
              >
                Performance Breakdown
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <MetricBar
                    label="Profit Factor"
                    value={trader.metrics.profitFactor}
                    max={5}
                    unit="x"
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
                    max={5}
                    unit=":1"
                    color={trader.color}
                  />
                </div>
                <div className="space-y-3">
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
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <StatCard
                label="Profit Factor"
                value={`${trader.metrics.profitFactor.toFixed(
                  2,
                )}x`}
              />
              <StatCard
                label="Win Rate"
                value={`${trader.metrics.winRate.toFixed(
                  0,
                )}%`}
              />
              <StatCard
                label="Sharpe Ratio"
                value={trader.metrics.sharpe.toFixed(2)}
              />
              <StatCard
                label="Max Drawdown"
                value={`${trader.metrics.maxDrawdown.toFixed(
                  1,
                )}%`}
              />
              <StatCard
                label="Consistency"
                value={`${trader.metrics.consistency.toFixed(
                  0,
                )}%`}
              />
              <StatCard
                label="Avg Monthly Return"
                value={trader.metrics.monthlyReturn.toFixed(
                  1,
                )}
              />
            </section>
          </>
        )}

        {isOwner && trader.uploads.length > 0 && (
          <section className="mt-10">
            <h2
              className="mb-4 text-base font-bold text-[#f1f5f9]"
              style={{
                fontFamily:
                  "Syne, system-ui, sans-serif",
              }}
            >
              Upload History
            </h2>
            <div className="space-y-2">
              {trader.uploads.map((upload: any) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between rounded-lg border border-[#1e2035] bg-[#0d0f22] px-4 py-3"
                >
                  <div>
                    <span className="text-sm font-medium text-[#f1f5f9] capitalize">
                      {upload.broker_format}
                    </span>
                    <span className="ml-3 text-xs text-[#6b7280]">
                      {upload.date_range_from &&
                        new Date(
                          upload.date_range_from,
                        ).toLocaleDateString()}{" "}
                      →{" "}
                      {upload.date_range_to &&
                        new Date(
                          upload.date_range_to,
                        ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
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
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isOwner && (
          <section className="mt-10 rounded-2xl border border-[#1e2035] bg-[#0d0f22] p-6 text-center">
            <p
              className="mb-2 text-lg font-semibold text-[#f1f5f9]"
              style={{
                fontFamily:
                  "Syne, system-ui, sans-serif",
              }}
            >
              Want to get verified like {trader.name}?
            </p>
            <p className="mb-5 text-sm text-[#9ca3af]">
              Upload your verified trade history and let your results
              rank you on the leaderboard.
            </p>
            <Link
              href="/connect/tradovate"
              className="inline-block rounded-lg bg-[#00E5A0] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00c988]"
            >
              Upload My Trade History →
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#1e2035] bg-[#0d0f22] p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">
        {label}
      </div>
      <div
        className="mt-2 text-[20px] font-bold text-[#f1f5f9]"
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

