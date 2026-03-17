import type { NormalizedTrade } from "./csvParser";

const TRADOVATE_BASE_URL = "https://live.tradovateapi.com/v1";
const TRADOVATE_DEMO_URL = "https://demo.tradovateapi.com/v1";
const TRADOVATE_AUTH_URL = "https://trader.tradovateapi.com/oauth/auth";
const TRADOVATE_TOKEN_URL = "https://trader.tradovateapi.com/oauth/token";

export function getTradovateAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TRADOVATE_CLIENT_ID!,
    redirect_uri: process.env.TRADOVATE_REDIRECT_URI!,
    scope: "read",
    state,
  });
  return `${TRADOVATE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const res = await fetch(TRADOVATE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.TRADOVATE_CLIENT_ID!,
      client_secret: process.env.TRADOVATE_CLIENT_SECRET!,
      redirect_uri: process.env.TRADOVATE_REDIRECT_URI!,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.statusText}`);
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const res = await fetch(TRADOVATE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.TRADOVATE_CLIENT_ID!,
      client_secret: process.env.TRADOVATE_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.statusText}`);
  return res.json();
}

export async function getTradovateAccounts(accessToken: string): Promise<any[]> {
  const res = await fetch(`${TRADOVATE_BASE_URL}/account/list`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch accounts: ${res.statusText}`);
  return res.json();
}

export async function getTradovateTrades(
  accessToken: string,
  accountId: number,
): Promise<TradovateTrade[]> {
  const res = await fetch(
    `${TRADOVATE_BASE_URL}/trade/list?accountId=${accountId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error(`Failed to fetch trades: ${res.statusText}`);
  return res.json();
}

export interface TradovateTrade {
  id: number;
  accountId: number;
  contractId: number;
  timestamp: string;
  tradeDate: { year: number; month: number; day: number };
  boughtQty: number;
  soldQty: number;
  boughtValue: number;
  soldValue: number;
  grossPnL: number;
  fees: number;
  netPnL: number;
}

/** Convert API trade shape to NormalizedTrade for metrics. */
export function tradovateTradesToNormalized(
  trades: TradovateTrade[],
): NormalizedTrade[] {
  return trades.map((t) => {
    const isBuy = t.boughtQty > 0;
    const qty = isBuy ? t.boughtQty : t.soldQty;
    const entryValue = isBuy ? t.boughtValue : t.soldValue;
    const exitValue = isBuy ? t.soldValue : t.boughtValue;
    const entryPrice = qty > 0 ? entryValue / qty : 0;
    const exitPrice = qty > 0 ? exitValue / qty : 0;
    return {
      timestamp: t.timestamp,
      symbol: String(t.contractId),
      side: isBuy ? "buy" : "sell",
      quantity: qty,
      entryPrice,
      exitPrice,
      grossPnL: t.grossPnL,
      fees: t.fees,
      netPnL: t.netPnL,
      tradeDate: t.tradeDate,
    };
  });
}

export { TRADOVATE_BASE_URL, TRADOVATE_DEMO_URL };

