import Link from "next/link";

const TIERS = [
  {
    id: "beta",
    name: "Beta",
    price: "Free",
    period: "",
    note: "While we're in beta",
    badge: null,
    cta: "Get started free",
    href: "/signup",
    highlight: false,
    features: {
      leaderboard: true,
      performanceScore: true,
      verifiedBadge: true,
      csvUploads: "Unlimited",
      brokers: "Tradovate, Rithmic, MT5, Generic",
      tradeJournal: true,
      journalAnnotations: true,
      profilePage: true,
      profileBadge: "Standard",
      communityListings: "0",
      monthlyDigest: false,
      apiAccess: false,
      prioritySupport: false,
      customHandle: false,
    },
  },
  {
    id: "standard",
    name: "Standard",
    price: "€19",
    period: "/month",
    note: "Billed monthly",
    badge: "Most popular",
    cta: "Coming soon",
    href: "/signup",
    highlight: true,
    features: {
      leaderboard: true,
      performanceScore: true,
      verifiedBadge: true,
      csvUploads: "Unlimited",
      brokers: "Tradovate, Rithmic, MT5, Generic",
      tradeJournal: true,
      journalAnnotations: true,
      profilePage: true,
      profileBadge: "Premium badge",
      communityListings: "1 community",
      monthlyDigest: true,
      apiAccess: false,
      prioritySupport: false,
      customHandle: false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: "€49",
    period: "/month",
    note: "Billed monthly",
    badge: null,
    cta: "Coming soon",
    href: "/signup",
    highlight: false,
    features: {
      leaderboard: true,
      performanceScore: true,
      verifiedBadge: true,
      csvUploads: "Unlimited",
      brokers: "Tradovate, Rithmic, MT5, Generic",
      tradeJournal: true,
      journalAnnotations: true,
      profilePage: true,
      profileBadge: "Pro badge",
      communityListings: "Unlimited",
      monthlyDigest: true,
      apiAccess: true,
      prioritySupport: true,
      customHandle: true,
    },
  },
] as const;

const FEATURE_ROWS: {
  key: keyof (typeof TIERS)[0]["features"];
  label: string;
  group?: string;
}[] = [
  { key: "leaderboard", label: "Public leaderboard profile", group: "Core" },
  { key: "performanceScore", label: "Composite performance score", group: "Core" },
  { key: "verifiedBadge", label: "Verified badge (90+ trades or 3+ months)", group: "Core" },
  { key: "csvUploads", label: "CSV uploads", group: "Core" },
  { key: "brokers", label: "Supported platforms", group: "Core" },
  { key: "tradeJournal", label: "Trade journal", group: "Journal" },
  { key: "journalAnnotations", label: "Trade annotations (notes, setup tags, ratings)", group: "Journal" },
  { key: "profilePage", label: "Public profile page", group: "Profile" },
  { key: "profileBadge", label: "Profile badge tier", group: "Profile" },
  { key: "communityListings", label: "Community listings", group: "Communities" },
  { key: "monthlyDigest", label: "Monthly performance email digest", group: "Extras" },
  { key: "apiAccess", label: "API access to score data", group: "Extras" },
  { key: "prioritySupport", label: "Priority support", group: "Extras" },
  { key: "customHandle", label: "Custom vanity handle", group: "Extras" },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <span className="text-base text-[#00E5A0]">✓</span>;
  }
  if (value === false) {
    return <span className="text-[#2a2d4a]">—</span>;
  }
  return (
    <span className="text-xs text-[#94a3b8]" style={{ fontFamily: '"DM Mono", monospace' }}>
      {value}
    </span>
  );
}

const FAQ = [
  {
    q: "Do I need a credit card to sign up?",
    a: "No. During beta, everything is free and no payment details are required.",
  },
  {
    q: "What counts as a verified trader?",
    a: "You need to upload 90+ closed trades or at least 3 months of trade history. We calculate this automatically from your CSV.",
  },
  {
    q: "Are prop firm accounts supported?",
    a: "Yes. Apex, TopStep, MyFundedFutures, Bulenox, Earn2Trade, TradeDay — all supported via Tradovate or Rithmic CSV exports.",
  },
  {
    q: "Can I upload multiple CSVs?",
    a: "Yes. You can upload multiple CSVs covering different date ranges. Each adds to your history and your score is recalculated from the latest snapshot.",
  },
  {
    q: "How is the performance score calculated?",
    a: "It's a composite 0–100 score: Profit Factor (30%) + Consistency (25%) + Win Rate (20%) + Sharpe Ratio (15%) + Drawdown Control (10%). Dollar PnL is not part of the score.",
  },
  {
    q: "When will Standard and Pro launch?",
    a: "We're in beta and focused on getting the core product right first. Paid tiers are coming soon — early beta users will get a discount.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#060812] text-[#f1f5f9]">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-[#1e2035] bg-[#060812]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00E5A0] text-xs font-bold text-black">
              NT
            </div>
            <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>
              No Tilt
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="hidden text-sm text-[#6b7280] hover:text-[#f1f5f9] sm:block">
              Leaderboard
            </Link>
            <Link href="/login" className="text-sm text-[#6b7280] hover:text-[#f1f5f9]">
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

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-16">
        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-block rounded-full border border-[#00E5A030] bg-[#00E5A015] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00E5A0]">
            Pricing
          </div>
          <h1
            className="mb-4 text-4xl font-extrabold tracking-tight text-[#f1f5f9] sm:text-5xl"
            style={{ fontFamily: "Syne, system-ui, sans-serif" }}
          >
            Simple pricing.{" "}
            <span className="text-[#00E5A0]">Free while we&apos;re in beta.</span>
          </h1>
          <p className="mx-auto max-w-lg text-base text-[#6b7280]">
            Get your verified leaderboard profile at no cost. Paid tiers add
            community tools, API access, and premium badging — coming soon.
          </p>
        </div>

        {/* Tier cards */}
        <div className="mb-16 grid gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                tier.highlight
                  ? "border-[#00E5A040] bg-[#00E5A008]"
                  : "border-[#1e2035] bg-[#0a0c1a]"
              }`}
            >
              {tier.badge && (
                <div className="mb-3 self-start rounded-full border border-[#00E5A030] bg-[#00E5A015] px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00E5A0]">
                  {tier.badge}
                </div>
              )}
              <div
                className="mb-1 text-lg font-extrabold text-[#f1f5f9]"
                style={{ fontFamily: "Syne, system-ui, sans-serif" }}
              >
                {tier.name}
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span
                  className="text-4xl font-black text-[#f1f5f9]"
                  style={{ fontFamily: '"DM Mono", monospace' }}
                >
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm text-[#6b7280]">{tier.period}</span>
                )}
              </div>
              <p className="mb-6 text-xs text-[#4b5563]">{tier.note}</p>

              <ul className="mb-8 flex-1 space-y-2.5">
                {FEATURE_ROWS.filter((r) => r.group === "Core" || r.group === "Journal" || r.group === "Profile").map((row) => {
                  const val = tier.features[row.key];
                  if (val === false) return null;
                  return (
                    <li key={row.key} className="flex items-start gap-2 text-xs text-[#94a3b8]">
                      <span className="mt-0.5 shrink-0 text-[#00E5A0]">✓</span>
                      <span>
                        {typeof val === "string"
                          ? `${row.label}: ${val}`
                          : row.label}
                      </span>
                    </li>
                  );
                })}
                {tier.id !== "beta" &&
                  FEATURE_ROWS.filter((r) => r.group === "Extras").map((row) => {
                    const val = tier.features[row.key];
                    if (val === false) return null;
                    return (
                      <li key={row.key} className="flex items-start gap-2 text-xs text-[#94a3b8]">
                        <span className="mt-0.5 shrink-0 text-[#00E5A0]">✓</span>
                        <span>
                          {typeof val === "string"
                            ? `${row.label}: ${val}`
                            : row.label}
                        </span>
                      </li>
                    );
                  })}
              </ul>

              <Link
                href={tier.href}
                className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-colors ${
                  tier.highlight
                    ? "bg-[#00E5A0] text-black hover:bg-[#00c988]"
                    : tier.id === "beta"
                    ? "bg-[#00E5A0] text-black hover:bg-[#00c988]"
                    : "border border-[#1e2035] text-[#6b7280] cursor-not-allowed"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2
            className="mb-6 text-2xl font-extrabold text-[#f1f5f9]"
            style={{ fontFamily: "Syne, system-ui, sans-serif" }}
          >
            Full comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#1e2035]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2035] bg-[#0a0c1a]">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[#4b5563]">
                    Feature
                  </th>
                  {TIERS.map((t) => (
                    <th
                      key={t.id}
                      className={`px-5 py-4 text-center text-sm font-bold ${
                        t.highlight ? "text-[#00E5A0]" : "text-[#f1f5f9]"
                      }`}
                      style={{ fontFamily: "Syne, system-ui, sans-serif" }}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let lastGroup = "";
                  return FEATURE_ROWS.map((row) => {
                    const showGroupHeader = row.group && row.group !== lastGroup;
                    lastGroup = row.group ?? lastGroup;
                    return [
                      showGroupHeader ? (
                        <tr key={`group-${row.group}`} className="border-t border-[#1e2035] bg-[#0d0f22]">
                          <td colSpan={4} className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4b5563]">
                            {row.group}
                          </td>
                        </tr>
                      ) : null,
                      <tr
                        key={row.key}
                        className="border-t border-[#1e2035] bg-[#060812] hover:bg-[#0a0c1a]"
                      >
                        <td className="px-5 py-3.5 text-xs text-[#94a3b8]">{row.label}</td>
                        {TIERS.map((t) => (
                          <td key={t.id} className="px-5 py-3.5 text-center">
                            <FeatureValue value={t.features[row.key]} />
                          </td>
                        ))}
                      </tr>,
                    ];
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Beta notice */}
        <div className="mb-16 rounded-2xl border border-[#00E5A030] bg-[#00E5A008] px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3
                className="mb-1 text-xl font-extrabold text-[#f1f5f9]"
                style={{ fontFamily: "Syne, system-ui, sans-serif" }}
              >
                Join free during beta
              </h3>
              <p className="max-w-md text-sm text-[#6b7280]">
                We&apos;re still building. Early users who join during beta will get
                a discount when paid tiers launch — and first access to new features.
              </p>
            </div>
            <Link
              href="/signup"
              className="shrink-0 rounded-xl bg-[#00E5A0] px-8 py-3 text-sm font-bold text-black hover:bg-[#00c988]"
            >
              Get Verified Free →
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2
            className="mb-8 text-2xl font-extrabold text-[#f1f5f9]"
            style={{ fontFamily: "Syne, system-ui, sans-serif" }}
          >
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-[#1e2035] bg-[#0a0c1a] px-6 py-5"
              >
                <p
                  className="mb-2 font-semibold text-[#f1f5f9]"
                  style={{ fontFamily: "Syne, system-ui, sans-serif" }}
                >
                  {item.q}
                </p>
                <p className="text-sm leading-relaxed text-[#6b7280]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1e2035] py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-[#4b5563]">
          <span>© {new Date().getFullYear()} No Tilt</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-[#6b7280]">Home</Link>
            <Link href="/explore" className="hover:text-[#6b7280]">Leaderboard</Link>
            <Link href="/login" className="hover:text-[#6b7280]">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
