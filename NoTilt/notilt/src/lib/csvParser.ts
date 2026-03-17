export type BrokerFormat = "tradovate" | "rithmic" | "mt5" | "generic";

export interface NormalizedTrade {
  timestamp: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  grossPnL: number;
  fees: number;
  netPnL: number;
  tradeDate: { year: number; month: number; day: number };
}

export interface ParseResult {
  trades: NormalizedTrade[];
  broker: BrokerFormat;
  totalRows: number;
  skippedRows: number;
  dateRange: { from: string; to: string } | null;
  errors: string[];
}

export interface TradovateFill {
  timestamp: string;
  tradeDate: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  contract: string;
  commission: number;
}

export function detectBrokerFormat(headers: string[]): BrokerFormat {
  const lower = headers.map((h) => h.toLowerCase());
  // Tradovate fills: individual fills with these headers
  if (
    lower.includes("_timestamp") &&
    lower.includes("b/s") &&
    lower.includes("contract")
  ) {
    return "tradovate";
  }
  if (lower.includes("ticker") && lower.includes("exchange") && lower.includes("b/s")) {
    return "rithmic";
  }
  if (lower.includes("position") && lower.includes("swap")) {
    return "mt5";
  }
  return "generic";
}

export function parseCSV(csvText: string): ParseResult {
  const lines = csvText.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return {
      trades: [],
      broker: "generic",
      totalRows: 0,
      skippedRows: 0,
      dateRange: null,
      errors: ["Empty CSV file"],
    };
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.trim());
  const broker = detectBrokerFormat(headers);

  const headerIndex: Record<string, number> = {};
  headers.forEach((h, idx) => {
    headerIndex[h] = idx;
  });

  const trades: NormalizedTrade[] = [];
  const tradovateFills: TradovateFill[] = [];
  const errors: string[] = [];
  let skippedRows = 0;

  const pushError = (msg: string) => {
    if (errors.length < 5) errors.push(msg);
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      continue;
    }
    const cols = parseCSVLine(line);
    if (cols.length !== headers.length) {
      skippedRows++;
      pushError(`Row ${i + 1}: column count mismatch`);
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx];
    });

    if (broker === "tradovate") {
      try {
        const fill = parseTradovateFillRow(row);
        if (!fill) {
          skippedRows++;
          continue;
        }
        tradovateFills.push(fill);
      } catch (e: any) {
        skippedRows++;
        pushError(`Row ${i + 1}: ${e.message ?? "parse error"}`);
        continue;
      }
    } else {
      let trade: NormalizedTrade | null = null;
      try {
        if (broker === "rithmic") trade = parseRithmicTrade(row);
        else if (broker === "mt5") trade = parseMT5Trade(row);
        else trade = parseGenericTrade(row);
      } catch (e: any) {
        skippedRows++;
        pushError(`Row ${i + 1}: ${e.message ?? "parse error"}`);
        continue;
      }

      if (!trade) {
        skippedRows++;
        continue;
      }
      trades.push(trade);
    }
  }

  if (broker === "tradovate") {
    const matched = matchTradovateFills(tradovateFills);
    trades.push(...matched);
  }

  trades.sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  let dateRange: { from: string; to: string } | null = null;
  if (trades.length > 0) {
    dateRange = {
      from: trades[0].timestamp,
      to: trades[trades.length - 1].timestamp,
    };
  }

  return {
    trades,
    broker,
    totalRows: lines.length - 1,
    skippedRows,
    dateRange,
    errors,
  };
}

export function parseTradovateFillRow(
  row: Record<string, string>,
): TradovateFill | null {
  const sideRaw = row["B/S"] ?? row["b/s"] ?? row["Buy/Sell"];
  const sideStr = sideRaw?.trim().toLowerCase();
  if (sideStr !== "buy" && sideStr !== "sell") return null;

  const price = parseFloat(row["Price"]);
  const qty = parseFloat(row["Quantity"]);
  const commission = parseFloat(row["commission"] || "0");
  const timestamp = row["_timestamp"] || row["Timestamp"] || "";
  const tradeDate = row["_tradeDate"] || row["Date"] || "";
  const contract = row["Contract"] || "";

  if (Number.isNaN(price) || Number.isNaN(qty) || !timestamp) return null;

  return {
    timestamp,
    tradeDate,
    side: sideStr as "buy" | "sell",
    quantity: qty,
    price,
    contract,
    commission: Number.isNaN(commission) ? 0 : commission,
  };
}

// Backwards-compatible alias if anything still imports parseTradovateTrade
export const parseTradovateTrade = parseTradovateFillRow;

function matchTradovateFills(fills: TradovateFill[]): NormalizedTrade[] {
  const trades: NormalizedTrade[] = [];

  // Group fills by contract
  const byContract = new Map<string, TradovateFill[]>();
  for (const fill of fills) {
    if (!byContract.has(fill.contract)) byContract.set(fill.contract, []);
    byContract.get(fill.contract)!.push(fill);
  }

  for (const [contract, contractFills] of byContract) {
    // Get point value multiplier
    const multiplier = contract.includes("MNQ")
      ? 2
      : contract.includes("NQ")
        ? 20
        : contract.includes("ES")
          ? 50
          : contract.includes("MES")
            ? 5
            : contract.includes("CL")
              ? 1000
              : 2;

    // Use running position tracking
    let position = 0; // net contracts (positive = long, negative = short)
    let avgEntryPrice = 0; // average entry price
    let totalEntryCommission = 0;
    let positionOpenTime = "";

    for (const fill of contractFills) {
      const fillSide = fill.side === "buy" ? 1 : -1;
      const prevPosition = position;

      if (position === 0) {
        // Opening new position
        position = fillSide * fill.quantity;
        avgEntryPrice = fill.price;
        totalEntryCommission = fill.commission * fill.quantity;
        positionOpenTime = fill.timestamp;
      } else if (Math.sign(position) === Math.sign(fillSide * fill.quantity)) {
        // Adding to existing position — update average entry
        const totalQty = Math.abs(position) + fill.quantity;
        avgEntryPrice =
          (avgEntryPrice * Math.abs(position) + fill.price * fill.quantity) /
          totalQty;
        position += fillSide * fill.quantity;
        totalEntryCommission += fill.commission * fill.quantity;
      } else {
        // Closing or reversing position
        const closingQty = Math.min(Math.abs(position), fill.quantity);
        const exitCommission = fill.commission * closingQty;
        const totalCommission =
          (totalEntryCommission / Math.abs(prevPosition)) * closingQty +
          exitCommission;

        // Calculate P&L based on direction
        const isLong = position > 0;
        const priceDiff = isLong
          ? fill.price - avgEntryPrice
          : avgEntryPrice - fill.price;

        const grossPnL = priceDiff * closingQty * multiplier;
        const netPnL = grossPnL - totalCommission;

        const date = new Date(fill.timestamp);
        trades.push({
          timestamp: fill.timestamp,
          symbol: contract,
          side: isLong ? "buy" : "sell",
          quantity: closingQty,
          entryPrice: avgEntryPrice,
          exitPrice: fill.price,
          grossPnL,
          fees: totalCommission,
          netPnL,
          tradeDate: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
          },
        });

        // Update remaining position
        position += fillSide * fill.quantity;
        if (position === 0) {
          avgEntryPrice = 0;
          totalEntryCommission = 0;
        } else if (
          Math.abs(position) > 0 &&
          Math.sign(position) !== Math.sign(prevPosition)
        ) {
          // Reversed — new position opened at this fill's price
          avgEntryPrice = fill.price;
          totalEntryCommission = fill.commission * Math.abs(position);
          positionOpenTime = fill.timestamp;
        }
      }
    }
  }

  return trades.sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

export function parseRithmicTrade(row: Record<string, string>): NormalizedTrade | null {
  const sideRaw = row["B/S"] || row["Side"];
  const side = sideRaw === "B" ? "buy" : sideRaw === "S" ? "sell" : null;
  const qty = Number(row["Quantity"] ?? row["Qty"] ?? 0);
  const price = Number(row["Price"] ?? 0);
  const symbol = row["Ticker"] ?? row["Symbol"] ?? "";
  const commission = Number(row["Commission"] ?? 0) || 0;
  const netPnL = Number(row["Profit"] ?? row["P/L"] ?? 0);

  if (!side || !Number.isFinite(netPnL) || !qty) {
    return null;
  }

  const grossPnL = netPnL + commission;
  const dateStr = row["Time"] || row["Date"] || "";
  const ts = buildTimestamp(dateStr);

  return {
    timestamp: ts.toISOString(),
    symbol,
    side,
    quantity: qty,
    entryPrice: price,
    exitPrice: price,
    grossPnL,
    fees: commission,
    netPnL,
    tradeDate: {
      year: ts.getUTCFullYear(),
      month: ts.getUTCMonth() + 1,
      day: ts.getUTCDate(),
    },
  };
}

export function parseMT5Trade(row: Record<string, string>): NormalizedTrade | null {
  const type = (row["Type"] || "").toLowerCase();
  if (type.includes("balance")) return null;

  const side = type.startsWith("buy") ? "buy" : type.startsWith("sell") ? "sell" : null;
  const volume = Number(row["Volume"] ?? 0);
  const price = Number(row["Price"] ?? 0);
  const symbol = row["Symbol"] ?? "";
  const commission = Number(row["Commission"] ?? 0) || 0;
  const swap = Number(row["Swap"] ?? 0) || 0;
  const netPnL = Number(row["Profit"] ?? 0);

  if (!side || !Number.isFinite(netPnL) || !volume) {
    return null;
  }

  const fees = commission + swap;
  const grossPnL = netPnL + fees;
  const dateStr = row["Time"] || row["Open Time"] || "";
  const ts = buildTimestamp(dateStr);

  return {
    timestamp: ts.toISOString(),
    symbol,
    side,
    quantity: volume,
    entryPrice: price,
    exitPrice: price,
    grossPnL,
    fees,
    netPnL,
    tradeDate: {
      year: ts.getUTCFullYear(),
      month: ts.getUTCMonth() + 1,
      day: ts.getUTCDate(),
    },
  };
}

export function parseGenericTrade(row: Record<string, string>): NormalizedTrade | null {
  const entries = Object.entries(row);
  const pnlEntry = entries.find(([key]) =>
    /p[&\/]?l|profit|pnl/i.test(key),
  );
  const dateEntry = entries.find(([key]) =>
    /time|date/i.test(key),
  );
  if (!pnlEntry || !dateEntry) return null;

  const [pnlKey, pnlVal] = pnlEntry;
  const netPnL = Number(pnlVal ?? 0);
  if (!Number.isFinite(netPnL)) return null;

  const [dateKey, dateVal] = dateEntry;
  const ts = buildTimestamp(dateVal);

  const feeEntry = entries.find(([key]) => /comm|fee/i.test(key));
  const fees = feeEntry ? Number(feeEntry[1] ?? 0) || 0 : 0;
  const grossPnL = netPnL + fees;

  const sideEntry = entries.find(([key]) => /side|b\/s|buy\/sell/i.test(key));
  const sideRaw = sideEntry?.[1] ?? "";
  const sideLower = sideRaw.toLowerCase();
  const side: "buy" | "sell" =
    sideLower.startsWith("b") || sideLower.includes("buy") ? "buy" : "sell";

  const qtyEntry = entries.find(([key]) => /qty|quantity|volume/i.test(key));
  const qty = qtyEntry ? Number(qtyEntry[1] ?? 0) || 1 : 1;

  const symbolEntry = entries.find(([key]) => /symbol|ticker|instrument/i.test(key));
  const symbol = symbolEntry ? symbolEntry[1] : "";

  const priceEntry = entries.find(([key]) => /price/i.test(key));
  const price = priceEntry ? Number(priceEntry[1] ?? 0) || 0 : 0;

  return {
    timestamp: ts.toISOString(),
    symbol,
    side,
    quantity: qty,
    entryPrice: price,
    exitPrice: price,
    grossPnL,
    fees,
    netPnL,
    tradeDate: {
      year: ts.getUTCFullYear(),
      month: ts.getUTCMonth() + 1,
      day: ts.getUTCDate(),
    },
  };
}

function buildTimestamp(dateStr: string, timeStr?: string): Date {
  const combined = timeStr ? `${dateStr} ${timeStr}` : dateStr;
  const parsed = new Date(combined);
  if (!Number.isFinite(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

