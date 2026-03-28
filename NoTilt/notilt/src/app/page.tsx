import Link from "next/link";
import { getTopTraders } from "@/lib/queries";

const SCORE_BREAKDOWN = [
  { label: "Profit Factor", weight: "30%" },
  { label: "Consistency", weight: "25%" },
  { label: "Win Rate", weight: "20%" },
  { label: "Sharpe Ratio", weight: "15%" },
  { label: "Drawdown Control", weight: "10%" },
];

const BROKERS = ["Tradovate", "Rithmic", "MT5", "Generic CSV"];

export default async function HomePage() {
  const topTraders = await getTopTraders(3);
  const hasLiveData = topTraders.length > 0;

  return (
    <div className="min-h-screen bg-[#060812] text-[#f1f5f9]">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-[#1e2035] bg-[#060812]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00E5A0] text-xs font-bold text-black">
              NT
            </div>
            <span
              className="text-sm font-semibold tracking-wide"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              No Tilt
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="text-sm text-[#6b7280] hover:text-[#f1f5f9]"
            >
              Leaderboard
            </Link>
            <Link
              href="/login"
              className="text-sm text-[#6b7280] hover:text-[#f1f5f9]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#00E5A0] px-4 py-2 text-sm font-semibold text-black hover:bg-[#00c988]"
            >
              Get Verified →
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-6 pb-20 pt-24 text-center">
          <div className="mb-5 inline-block rounded-full border border-[#00E5A030] bg-[#00E5A015] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00E5A0]">
            Verified Trading Performance
          </div>
          <h1
            className="mb-5 text-5xl font-extrabold leading-tight tracking-tight text-[#f1f5f9]"
            style={{ fontFamily: "Syne, system-ui, sans-serif" }}
          >
            If your mentor isn&apos;t on No Tilt,{" "}
            <span className="text-[#00E5A0]">they have something to hide.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-[#6b7280]">
            Upload your trade history CSV. Get a verified composite performance
            score. Appear on the public leaderboard. No screenshots. No
            cherry-picked trades. Just your real numbers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-[#00E5A0] px-8 py-3.5 text-base font-bold text-black hover:bg-[#00c988]"
            >
              Get Verified Free →
            </Link>
            <Link
              href="/explore"
              className="rounded-xl border border-[#1e2035] px-8 py-3.5 text-base text-[#94a3b8] hover:border-[#2a2d4a] hover:text-[#f1f5f9]"
            >
              Browse Leaderboard
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-y border-[#1e2035] bg-[#0a0c1a] py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2
              className="mb-12 text-center text-3xl font-extrabold text-[#f1f5f9]"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              How it works
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Export your CSV",
                  desc: "Download your trade history from Tradovate, Rithmic, MT5, or any platform that exports CSV. Prop firm accounts are fully supported.",
                },
                {
                  step: "02",
                  title: "We crunch the numbers",
                  desc: "Our engine parses every fill, matches round-trip trades, and calculates a composite Performance Score weighted across 5 real metrics.",
                },
                {
                  step: "03",
                  title: "Go live on the leaderboard",
                  desc: "Upload 90+ trades or 3+ months of data to get Verified status. Your profile goes public and you rank against every other verified trader.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-[#1e2035] bg-[#0d0f22] p-6"
                >
                  <div
                    className="mb-3 text-3xl font-black text-[#00E5A015]"
                    style={{ fontFamily: "Syne, system-ui, sans-serif" }}
                  >
                    {item.step}
                  </div>
                  <h3
                    className="mb-2 text-lg font-bold text-[#f1f5f9]"
                    style={{ fontFamily: "Syne, system-ui, sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Score Formula */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2
                className="mb-4 text-3xl font-extrabold text-[#f1f5f9]"
                style={{ fontFamily: "Syne, system-ui, sans-serif" }}
              >
                A score that actually means something
              </h2>
              <p className="mb-6 text-base leading-relaxed text-[#6b7280]">
                PnL in dollars means nothing without context. A $500 account
                with a 3× profit factor outscores a $100k account with a 1.2×
                PF. We level the playing field with a 0–100 composite score
                built from what actually matters.
              </p>
              <Link
                href="/signup"
                className="inline-block rounded-lg bg-[#00E5A0] px-6 py-3 text-sm font-bold text-black hover:bg-[#00c988]"
              >
                Calculate my score →
              </Link>
            </div>
            <div className="rounded-2xl border border-[#1e2035] bg-[#0a0c1a] p-6">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
                Performance Score Breakdown
              </div>
              <div className="space-y-3">
                {SCORE_BREAKDOWN.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-[#94a3b8]">
                      {item.label}
                    </span>
                    <span
                      className="text-sm font-bold text-[#00E5A0]"
                      style={{
                        fontFamily:
                          '"DM Mono", ui-monospace, monospace',
                      }}
                    >
                      {item.weight}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-[#00E5A020] bg-[#00E5A008] px-4 py-3 text-xs text-[#6b7280]">
                Verified = 90+ trades or 3+ months of history uploaded
              </div>
            </div>
          </div>
        </section>

        {/* Supported Brokers */}
        <section className="border-t border-[#1e2035] bg-[#0a0c1a] py-14">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-[#4b5563]">
              Supported platforms
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {BROKERS.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-[#1e2035] bg-[#0d0f22] px-5 py-2 text-sm text-[#6b7280]"
                >
                  {b}
                </span>
              ))}
              <span className="rounded-full border border-[#1e2035] bg-[#0d0f22] px-5 py-2 text-sm text-[#4b5563]">
                + prop firm accounts
              </span>
            </div>
          </div>
        </section>

        {/* Live leaderboard preview */}
        {hasLiveData && (
          <section className="mx-auto max-w-3xl px-6 py-20">
            <div className="mb-8 text-center">
              <h2
                className="mb-2 text-3xl font-extrabold text-[#f1f5f9]"
                style={{ fontFamily: "Syne, system-ui, sans-serif" }}
              >
                Top verified traders right now
              </h2>
              <p className="text-sm text-[#6b7280]">
                Real data. No screenshots.
              </p>
            </div>
            <div className="space-y-3">
              {topTraders.map((t: any, i: number) => {
                const snap = t.performance_snapshots?.[0];
                return (
                  <Link
                    key={t.id}
                    href={`/${t.handle}`}
                    className="flex items-center justify-between rounded-xl border border-[#1e2035] bg-[#0a0c1a] px-5 py-4 hover:border-[#2a2d4a]"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="w-6 text-sm font-bold text-[#4b5563]"
                        style={{ fontFamily: '"DM Mono", monospace' }}
                      >
                        #{i + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-[#f1f5f9]">
                          {t.display_name ?? t.handle}
                        </div>
                        <div className="text-xs text-[#6b7280]">
                          @{t.handle} · {t.strategy ?? ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-[#6b7280]">
                      {snap && (
                        <>
                          <span>
                            PF{" "}
                            <span className="font-bold text-[#94a3b8]">
                              {Number(snap.profit_factor).toFixed(2)}x
                            </span>
                          </span>
                          <span>
                            WR{" "}
                            <span className="font-bold text-[#94a3b8]">
                              {Number(snap.win_rate).toFixed(0)}%
                            </span>
                          </span>
                        </>
                      )}
                      <span
                        className="text-xl font-black text-[#00E5A0]"
                        style={{ fontFamily: '"DM Mono", monospace' }}
                      >
                        {Math.round(t.performance_score ?? 0)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/explore"
                className="text-sm text-[#00E5A0] hover:underline"
              >
                View full leaderboard →
              </Link>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t border-[#1e2035] bg-[#0a0c1a] py-20">
          <div className="mx-auto max-w-xl px-6 text-center">
            <h2
              className="mb-4 text-3xl font-extrabold text-[#f1f5f9]"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              Ready to prove it?
            </h2>
            <p className="mb-8 text-base text-[#6b7280]">
              Upload your trade history and let your real results do the talking.
              Free to join.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-xl bg-[#00E5A0] px-10 py-4 text-base font-bold text-black hover:bg-[#00c988]"
            >
              Get Verified Free →
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1e2035] py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 text-xs text-[#4b5563]">
          <span>© {new Date().getFullYear()} No Tilt</span>
          <Link href="/explore" className="hover:text-[#6b7280]">
            Leaderboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
