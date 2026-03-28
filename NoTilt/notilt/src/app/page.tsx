import Link from "next/link";
import { getTopTraders } from "@/lib/queries";

const SCORE_BREAKDOWN = [
  { label: "Profit Factor", weight: "30%", desc: "Gross profit ÷ gross loss" },
  { label: "Consistency", weight: "25%", desc: "% of days in profit" },
  { label: "Win Rate", weight: "20%", desc: "Winners ÷ total trades" },
  { label: "Sharpe Ratio", weight: "15%", desc: "Risk-adjusted return" },
  { label: "Drawdown Control", weight: "10%", desc: "Inverse of max drawdown" },
];

const BROKERS = [
  { name: "Tradovate", note: "Fills CSV" },
  { name: "Rithmic", note: "Trade report" },
  { name: "MT5", note: "Account history" },
  { name: "Generic CSV", note: "Any broker" },
];

const PROP_FIRMS = [
  "Apex Trader Funding",
  "TopStep",
  "MyFundedFutures",
  "Bulenox",
  "Earn2Trade",
  "TradeDay",
  "Funded Trading Plus",
];

const PAIN_POINTS = [
  {
    bad: "Screenshots of winning trades.",
    good: "Full trade history. Every loss included.",
  },
  {
    bad: "\"$50k in one week\" without context.",
    good: "Profit factor, consistency score, max drawdown — all visible.",
  },
  {
    bad: "No accountability. No verification.",
    good: "Composite score calculated from raw fills.",
  },
];

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
          <div className="flex items-center gap-4">
            <Link
              href="/explore"
              className="hidden text-sm text-[#6b7280] hover:text-[#f1f5f9] sm:block"
            >
              Leaderboard
            </Link>
            <Link
              href="/pricing"
              className="hidden text-sm text-[#6b7280] hover:text-[#f1f5f9] sm:block"
            >
              Pricing
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
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
          <div className="mb-5 inline-block rounded-full border border-[#00E5A030] bg-[#00E5A015] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00E5A0]">
            Beta — Free to join
          </div>
          <h1
            className="mb-5 text-5xl font-extrabold leading-[1.1] tracking-tight text-[#f1f5f9] sm:text-6xl"
            style={{ fontFamily: "Syne, system-ui, sans-serif" }}
          >
            The leaderboard{" "}
            <span className="text-[#00E5A0]">fake gurus</span>{" "}
            can&apos;t survive.
          </h1>
          <p className="mx-auto mb-4 max-w-xl text-lg leading-relaxed text-[#6b7280]">
            No Tilt ranks traders by a verified composite score — calculated
            from real uploaded trade history, not screenshots or curated highlights.
            Upload your CSV. Get your score. Appear on the public leaderboard.
          </p>
          <p className="mx-auto mb-10 max-w-sm text-sm text-[#4b5563]">
            Prop firm accounts fully supported. Apex, TopStep, Rithmic, Tradovate, MT5.
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

        {/* Problem → Solution contrast */}
        <section className="border-y border-[#1e2035] bg-[#0a0c1a] py-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2
              className="mb-10 text-center text-2xl font-extrabold text-[#f1f5f9]"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              The trading educator space is broken.
              <span className="text-[#00E5A0]"> We&apos;re fixing it.</span>
            </h2>
            <div className="space-y-3">
              {PAIN_POINTS.map((p, i) => (
                <div
                  key={i}
                  className="grid gap-3 rounded-xl border border-[#1e2035] bg-[#0d0f22] p-4 sm:grid-cols-2"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ef4444]/20 text-[10px] text-[#f87171]">
                      ✕
                    </span>
                    <p className="text-sm text-[#6b7280]">{p.bad}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00E5A020] text-[10px] text-[#00E5A0]">
                      ✓
                    </span>
                    <p className="text-sm text-[#e2e8f0]">{p.good}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2
            className="mb-12 text-center text-3xl font-extrabold text-[#f1f5f9]"
            style={{ fontFamily: "Syne, system-ui, sans-serif" }}
          >
            Three steps to verified.
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Export your CSV",
                desc: "Download your trade fills from Tradovate, Rithmic, MT5, or any CSV-exporting platform. We support live, sim, and prop firm accounts.",
                cta: null,
              },
              {
                step: "02",
                title: "We calculate your score",
                desc: "Our engine parses every fill, matches round-trip trades, and computes a composite 0–100 Performance Score across 5 weighted metrics. No cherry-picking.",
                cta: null,
              },
              {
                step: "03",
                title: "Rank on the leaderboard",
                desc: "Upload 90+ trades or 3+ months of history to earn Verified status. Your public profile goes live, sortable against every other verified trader.",
                cta: null,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-[#1e2035] bg-[#0d0f22] p-6"
              >
                <div
                  className="mb-4 text-5xl font-black"
                  style={{
                    fontFamily: "Syne, system-ui, sans-serif",
                    color: "#00E5A010",
                    WebkitTextStroke: "1px #00E5A030",
                  }}
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
          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-block rounded-xl bg-[#00E5A0] px-8 py-3.5 text-base font-bold text-black hover:bg-[#00c988]"
            >
              Start for free →
            </Link>
          </div>
        </section>

        {/* Score formula */}
        <section className="border-y border-[#1e2035] bg-[#0a0c1a] py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#00E5A0]">
                  The score
                </div>
                <h2
                  className="mb-4 text-3xl font-extrabold text-[#f1f5f9]"
                  style={{ fontFamily: "Syne, system-ui, sans-serif" }}
                >
                  Size of account doesn&apos;t matter here.
                </h2>
                <p className="mb-6 text-base leading-relaxed text-[#6b7280]">
                  A $500 account with a 3× profit factor outscores a $100k
                  account with a 1.2× PF. We strip out dollar amounts entirely
                  and rank on what actually predicts long-term edge: consistency,
                  risk-adjusted return, and drawdown discipline.
                </p>
                <Link
                  href="/signup"
                  className="inline-block rounded-lg bg-[#00E5A0] px-6 py-3 text-sm font-bold text-black hover:bg-[#00c988]"
                >
                  Calculate my score →
                </Link>
              </div>
              <div className="rounded-2xl border border-[#1e2035] bg-[#060812] p-6">
                <div className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
                  Performance Score Breakdown
                </div>
                <div className="mb-5 text-[11px] text-[#4b5563]">
                  Composite 0–100 · higher = more consistent edge
                </div>
                <div className="space-y-3">
                  {SCORE_BREAKDOWN.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-[#94a3b8]">
                            {item.label}
                          </span>
                          <span
                            className="text-sm font-bold text-[#00E5A0]"
                            style={{ fontFamily: '"DM Mono", monospace' }}
                          >
                            {item.weight}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-[#4b5563]">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-lg border border-[#00E5A020] bg-[#00E5A008] px-4 py-3 text-xs text-[#6b7280]">
                  Verified badge = 90+ trades or 3+ months of history
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prop firm callout */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-2xl border border-[#1e2035] bg-[#0d0f22] p-8">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#00E5A0]">
              Prop firm traders
            </div>
            <h2
              className="mb-3 text-2xl font-extrabold text-[#f1f5f9]"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              Funded accounts count.
            </h2>
            <p className="mb-6 max-w-lg text-sm leading-relaxed text-[#6b7280]">
              Your Apex, TopStep, or MyFundedFutures fills are just as valid as
              a live account. Upload the CSV from your prop firm dashboard — we
              handle the rest.
            </p>
            <div className="flex flex-wrap gap-2">
              {PROP_FIRMS.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-[#1e2035] bg-[#060812] px-3 py-1.5 text-xs text-[#6b7280]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Supported brokers */}
        <section className="border-t border-[#1e2035] bg-[#0a0c1a] py-12">
          <div className="mx-auto max-w-4xl px-6">
            <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#4b5563]">
              Supported export formats
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BROKERS.map((b) => (
                <div
                  key={b.name}
                  className="rounded-xl border border-[#1e2035] bg-[#0d0f22] px-4 py-3 text-center"
                >
                  <div className="text-sm font-semibold text-[#e2e8f0]">
                    {b.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#4b5563]">
                    {b.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live leaderboard preview */}
        {hasLiveData && (
          <section className="mx-auto max-w-3xl px-6 py-20">
            <div className="mb-8 text-center">
              <div className="mb-3 inline-block rounded-full border border-[#00E5A030] bg-[#00E5A015] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00E5A0]">
                Live data
              </div>
              <h2
                className="mb-2 text-3xl font-extrabold text-[#f1f5f9]"
                style={{ fontFamily: "Syne, system-ui, sans-serif" }}
              >
                Top verified traders right now
              </h2>
              <p className="text-sm text-[#6b7280]">
                Real trade history. Calculated scores. No screenshots.
              </p>
            </div>
            <div className="space-y-3">
              {topTraders.map((t: any, i: number) => {
                const snap = t.performance_snapshots?.[0];
                const badgeColor =
                  t.badge === "Elite"
                    ? "#00E5A0"
                    : t.badge === "Pro"
                    ? "#a78bfa"
                    : "#fbbf24";
                return (
                  <Link
                    key={t.id}
                    href={`/${t.handle}`}
                    className="flex items-center justify-between rounded-xl border border-[#1e2035] bg-[#0a0c1a] px-5 py-4 transition-colors hover:border-[#2a2d4a]"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="w-6 text-center text-sm font-bold text-[#4b5563]"
                        style={{ fontFamily: '"DM Mono", monospace' }}
                      >
                        #{i + 1}
                      </span>
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: `${badgeColor}20`,
                          color: badgeColor,
                        }}
                      >
                        {(t.display_name ?? t.handle)
                          .split(" ")
                          .map((p: string) => p[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#f1f5f9]">
                          {t.display_name ?? t.handle}
                        </div>
                        <div className="text-xs text-[#6b7280]">
                          @{t.handle}
                          {t.strategy && ` · ${t.strategy}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                      {snap && (
                        <>
                          <div className="hidden flex-col items-end sm:flex">
                            <span>
                              PF{" "}
                              <span
                                className="font-bold text-[#94a3b8]"
                                style={{ fontFamily: '"DM Mono", monospace' }}
                              >
                                {Number(snap.profit_factor).toFixed(2)}×
                              </span>
                            </span>
                            <span>
                              WR{" "}
                              <span
                                className="font-bold text-[#94a3b8]"
                                style={{ fontFamily: '"DM Mono", monospace' }}
                              >
                                {Number(snap.win_rate).toFixed(0)}%
                              </span>
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex flex-col items-center">
                        <span
                          className="text-2xl font-black text-[#00E5A0]"
                          style={{ fontFamily: '"DM Mono", monospace' }}
                        >
                          {Math.round(t.performance_score ?? 0)}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-[#4b5563]">
                          score
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/explore"
                className="text-sm font-medium text-[#00E5A0] hover:underline"
              >
                View full leaderboard →
              </Link>
            </div>
          </section>
        )}

        {/* Pricing teaser */}
        <section className="border-y border-[#1e2035] bg-[#0a0c1a] py-16">
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  tier: "Beta",
                  price: "Free",
                  note: "while we're in beta",
                  features: [
                    "Verified leaderboard profile",
                    "Composite performance score",
                    "CSV upload (Tradovate, Rithmic, MT5)",
                    "Trade journal with annotations",
                  ],
                  cta: "Get started free",
                  href: "/signup",
                  highlight: false,
                },
                {
                  tier: "Standard",
                  price: "€19",
                  note: "/ month",
                  features: [
                    "Everything in Beta",
                    "Profile badge & premium rank display",
                    "Monthly performance email digest",
                    "Community listing (1 community)",
                  ],
                  cta: "See full pricing",
                  href: "/pricing",
                  highlight: true,
                },
                {
                  tier: "Pro",
                  price: "€49",
                  note: "/ month",
                  features: [
                    "Everything in Standard",
                    "Unlimited community listings",
                    "API access to your score data",
                    "Priority support",
                  ],
                  cta: "See full pricing",
                  href: "/pricing",
                  highlight: false,
                },
              ].map((tier) => (
                <div
                  key={tier.tier}
                  className={`rounded-2xl border p-5 ${
                    tier.highlight
                      ? "border-[#00E5A040] bg-[#00E5A008]"
                      : "border-[#1e2035] bg-[#0d0f22]"
                  }`}
                >
                  {tier.highlight && (
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00E5A0]">
                      Most popular
                    </div>
                  )}
                  <div
                    className="mb-0.5 text-base font-bold text-[#f1f5f9]"
                    style={{ fontFamily: "Syne, system-ui, sans-serif" }}
                  >
                    {tier.tier}
                  </div>
                  <div className="mb-4 flex items-baseline gap-1">
                    <span
                      className="text-3xl font-black text-[#f1f5f9]"
                      style={{ fontFamily: '"DM Mono", monospace' }}
                    >
                      {tier.price}
                    </span>
                    <span className="text-xs text-[#4b5563]">{tier.note}</span>
                  </div>
                  <ul className="mb-5 space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-[#6b7280]">
                        <span className="mt-0.5 text-[#00E5A0]">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={tier.href}
                    className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                      tier.highlight
                        ? "bg-[#00E5A0] text-black hover:bg-[#00c988]"
                        : "border border-[#1e2035] text-[#94a3b8] hover:border-[#2a2d4a] hover:text-[#f1f5f9]"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-xl px-6 text-center">
            <h2
              className="mb-4 text-4xl font-extrabold text-[#f1f5f9]"
              style={{ fontFamily: "Syne, system-ui, sans-serif" }}
            >
              Your results are already real.
            </h2>
            <p className="mb-8 text-base leading-relaxed text-[#6b7280]">
              All you need to do is upload them. Get your score, earn your
              verified badge, and let the leaderboard speak for you.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-xl bg-[#00E5A0] px-10 py-4 text-base font-bold text-black hover:bg-[#00c988]"
            >
              Get Verified — It&apos;s Free →
            </Link>
            <p className="mt-4 text-xs text-[#4b5563]">
              No credit card required during beta.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1e2035] py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-[#4b5563]">
          <span>© {new Date().getFullYear()} No Tilt</span>
          <div className="flex gap-6">
            <Link href="/explore" className="hover:text-[#6b7280]">
              Leaderboard
            </Link>
            <Link href="/pricing" className="hover:text-[#6b7280]">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-[#6b7280]">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
