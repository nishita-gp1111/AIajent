-- Google Maps参考順位のバッチ・結果保存テーブル
create table if not exists ranking_batches (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  provider text not null default 'playwright' check (provider in ('playwright', 'serpapi', 'dataforseo')),
  status text not null default 'running' check (status in ('running', 'succeeded', 'partial', 'failed')),
  requested_count int not null default 0,
  succeeded_count int not null default 0,
  failed_count int not null default 0,
  retry_of uuid references ranking_batches(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists ranking_results (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references ranking_batches(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  keyword text not null,
  rank_position int check (rank_position is null or rank_position > 0),
  matched_store_name text,
  status text not null check (status in ('succeeded', 'not_found', 'failed')),
  detection_source text not null default 'none' check (detection_source in ('dom', 'gemini_vision', 'none')),
  confidence numeric(4, 3) not null default 0 check (confidence between 0 and 1),
  result_count int not null default 0,
  attempt_count int not null default 1,
  screenshot_path text,
  error text,
  is_reference boolean not null default true,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists ranking_results_store_keyword_checked_idx
on ranking_results (store_id, keyword, checked_at desc);

alter table ranking_batches enable row level security;
alter table ranking_results enable row level security;

drop policy if exists "ranking_batches_member_access" on ranking_batches;
create policy "ranking_batches_member_access" on ranking_batches
for all using (can_access_store(store_id)) with check (can_access_store(store_id));

drop policy if exists "ranking_results_member_access" on ranking_results;
create policy "ranking_results_member_access" on ranking_results
for all using (can_access_store(store_id)) with check (can_access_store(store_id));
