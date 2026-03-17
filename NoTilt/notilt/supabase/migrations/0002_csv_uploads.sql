-- CSV upload history table
CREATE TABLE IF NOT EXISTS public.csv_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID REFERENCES public.traders(id) ON DELETE CASCADE,
  broker_format TEXT NOT NULL,
  filename TEXT,
  trades_processed INTEGER DEFAULT 0,
  skipped_rows INTEGER DEFAULT 0,
  date_range_from DATE,
  date_range_to DATE,
  performance_score NUMERIC,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Traders can view own uploads"
  ON public.csv_uploads FOR SELECT
  USING (trader_id IN (
    SELECT id FROM public.traders WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role can write uploads"
  ON public.csv_uploads FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.traders
  ADD COLUMN IF NOT EXISTS last_upload_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS upload_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'csv';

