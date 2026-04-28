-- Cache table for public /opportunities feed.
-- The app reads cached rows first and refreshes from providers when stale/empty.

create table if not exists public.opportunities_feed_items (
  item_id text primary key,
  post_text text not null,
  source text not null check (source in ('Reddit', 'X', 'Community')),
  source_url text not null,
  source_label text not null,
  created_utc bigint,
  intent_label text not null check (intent_label in ('High', 'Medium')),
  intent_score int not null check (intent_score >= 0 and intent_score <= 100),
  suggested_reply text not null,
  captured_at timestamptz not null default now()
);

create index if not exists opportunities_feed_items_captured_at_idx
  on public.opportunities_feed_items (captured_at desc);

create index if not exists opportunities_feed_items_intent_score_idx
  on public.opportunities_feed_items (intent_score desc);

alter table public.opportunities_feed_items enable row level security;

drop policy if exists "Opportunities cache read" on public.opportunities_feed_items;
create policy "Opportunities cache read"
  on public.opportunities_feed_items
  for select
  to anon
  using (true);

drop policy if exists "Opportunities cache write" on public.opportunities_feed_items;
create policy "Opportunities cache write"
  on public.opportunities_feed_items
  for insert
  to anon
  with check (true);

drop policy if exists "Opportunities cache clear" on public.opportunities_feed_items;
create policy "Opportunities cache clear"
  on public.opportunities_feed_items
  for delete
  to anon
  using (true);

comment on table public.opportunities_feed_items is
  'Cached rows for public opportunities feed; refreshed by server pipeline.';
