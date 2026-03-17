"use client";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface-base)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <a href="/explore" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-accent-green)] text-xs font-semibold text-black">
            NT
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>
            No Tilt
          </span>
        </a>
        <nav className="flex items-center gap-6">
          <a href="/explore" className="text-sm text-[#6b7280] hover:text-[#f1f5f9] transition-colors">
            Explore
          </a>
          <a href="/journal" className="text-sm text-[#6b7280] hover:text-[#f1f5f9] transition-colors">
            Journal
          </a>
          <a href="/dashboard" className="text-sm text-[#6b7280] hover:text-[#f1f5f9] transition-colors">
            Dashboard
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-[color:var(--color-border-subtle)] bg-transparent px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-active)] hover:text-[color:var(--color-text-primary)]">
            List Your Community
          </button>
          <a
            href="/connect/tradovate"
            className="rounded-lg bg-[color:var(--color-accent-green)] px-3.5 py-1.5 text-xs font-semibold text-black shadow-sm hover:bg-[#00c988]"
          >
            Connect Account
          </a>
        </div>
      </div>
    </header>
  );
}

