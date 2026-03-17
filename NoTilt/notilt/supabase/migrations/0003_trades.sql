CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID REFERENCES traders(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES csv_uploads(id) ON DELETE CASCADE,
  
  -- Trade details
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity NUMERIC NOT NULL,
  entry_price NUMERIC,
  exit_price NUMERIC,
  gross_pnl NUMERIC,
  fees NUMERIC DEFAULT 0,
  net_pnl NUMERIC NOT NULL,
  
  -- Timing
  trade_date DATE NOT NULL,
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  
  -- Journal fields (user can add after the fact)
  setup_tag TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  mistake TEXT,
  screenshot_url TEXT,
  
  -- Computed
  r_multiple NUMERIC,
  is_winner BOOLEAN GENERATED ALWAYS AS (net_pnl > 0) STORED,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Traders can view own trades"
  ON trades FOR SELECT
  USING (trader_id IN (
    SELECT id FROM traders WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role can write trades"
  ON trades FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX trades_trader_id_idx ON trades(trader_id);
CREATE INDEX trades_trade_date_idx ON trades(trade_date);
CREATE INDEX trades_symbol_idx ON trades(symbol);

