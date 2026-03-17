-- No Tilt - Initial schema

-- Traders table
create table public.traders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  verified boolean not null default false,
  badge text,
  strategy text,
  instruments text[] default '{}'::text[],
  performance_score numeric(6,2),
  score_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.traders enable row level security;

create policy "Users can view traders"
  on public.traders
  for select
  using (true);

create policy "Users manage own trader profile"
  on public.traders
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- Trade accounts table
create table public.trade_accounts (
  id uuid primary key default gen_random_uuid(),
  trader_id uuid not null references public.traders(id) on delete cascade,
  broker text not null,
  account_id text not null,
  access_token text not null,
  refresh_token text,
  is_live boolean not null default true,
  connected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.trade_accounts enable row level security;

create policy "Traders manage own trade accounts"
  on public.trade_accounts
  for all
  using (exists (
    select 1 from public.traders t
    where t.id = trader_id and t.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.traders t
    where t.id = trader_id and t.user_id = auth.uid()
  ));


-- Performance snapshots table
create table public.performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  trader_id uuid not null references public.traders(id) on delete cascade,
  snapshot_date date not null,
  profit_factor numeric(10,4),
  win_rate numeric(5,2),
  sharpe_ratio numeric(10,4),
  max_drawdown numeric(6,2),
  avg_rr numeric(6,2),
  consistency_score numeric(6,2),
  total_trades integer,
  monthly_return numeric(6,2),
  performance_score numeric(6,2),
  created_at timestamptz not null default now()
);

create unique index performance_snapshots_trader_date_idx
  on public.performance_snapshots(trader_id, snapshot_date);

alter table public.performance_snapshots enable row level security;

create policy "Users can view performance snapshots"
  on public.performance_snapshots
  for select
  using (true);

create policy "Service role can insert performance snapshots"
  on public.performance_snapshots
  for insert
  with check (auth.role() = 'service_role');


-- Communities table
create table public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.traders(id) on delete cascade,
  name text not null,
  handle text not null unique,
  description text,
  platform text,
  pricing text,
  focus text,
  listed boolean not null default false,
  listing_paid_until date,
  community_score numeric(6,2),
  join_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.communities enable row level security;

create policy "Communities are publicly viewable"
  on public.communities
  for select
  using (true);

create policy "Owners manage their communities"
  on public.communities
  for all
  using (exists (
    select 1 from public.traders t
    where t.id = owner_id and t.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.traders t
    where t.id = owner_id and t.user_id = auth.uid()
  ));


-- Conversions table
create table public.conversions (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  referral_code text not null,
  converted_at timestamptz not null default now(),
  commission_amount numeric(10,2),
  commission_paid boolean not null default false,
  created_at timestamptz not null default now()
);

create index conversions_community_id_idx
  on public.conversions(community_id);

alter table public.conversions enable row level security;

create policy "Service role manages conversions"
  on public.conversions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- Simple trigger to keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_traders_updated_at
before update on public.traders
for each row
execute function public.set_updated_at();

create trigger set_communities_updated_at
before update on public.communities
for each row
execute function public.set_updated_at();

