export interface ExploreTrader {
  id: string;
  name: string;
  handle: string;
  badge: string;
  strategy: string;
  instruments: string[];
  score: number;
  color: string;
  verified: boolean;
  metrics: {
    profitFactor: number;
    winRate: number;
    maxDrawdown: number;
    sharpe: number;
    avgRR: number;
    consistency: number;
    monthsVerified: number;
    totalTrades: number;
    monthlyReturn: number;
  };
}

export interface ExploreCommunity {
  id: number | string;
  name: string;
  handle: string;
  badge: string;
  platform: string;
  focus: string;
  score: number;
  verified: boolean;
  color: string;
  pricing: string;
  metrics: {
    avgPF: number;
    memberWinRate: number;
    verifiedTraders: number;
    retention: number;
    activeMembers: number;
    totalMembers: number;
    avgConsistency: number;
    avgMemberGrowth: number;
  };
}

