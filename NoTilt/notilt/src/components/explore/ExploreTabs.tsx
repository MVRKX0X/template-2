"use client";

import { useState } from "react";
import { TraderFeed } from "@/components/explore/TraderFeed";
import { CommunityFeed } from "@/components/explore/CommunityFeed";
import type {
  ExploreTrader,
  ExploreCommunity,
} from "@/types/explore";

interface Props {
  traders: ExploreTrader[];
  communities: ExploreCommunity[];
  isDemo: boolean;
}

export default function ExploreTabs({
  traders,
  communities,
  isDemo,
}: Props) {
  const [tab, setTab] = useState<"traders" | "communities">(
    "traders",
  );

  return (
    <>
      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-[#1e2035] bg-[#0d0f22] p-1">
        {(["traders", "communities"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-lg px-6 py-2 text-sm font-semibold transition-all"
            style={{
              backgroundColor:
                tab === t ? "#00E5A0" : "transparent",
              color: tab === t ? "#000000" : "#6b7280",
            }}
          >
            {t === "traders" ? "🏆 Top Traders" : "🏘️ Communities"}
          </button>
        ))}
      </div>

      {tab === "traders" && (
        <TraderFeed traders={traders} isDemo={isDemo} />
      )}
      {tab === "communities" && (
        <CommunityFeed communities={communities} />
      )}
    </>
  );
}

