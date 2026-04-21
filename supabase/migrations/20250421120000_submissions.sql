-- Run in Supabase SQL Editor (or via Supabase CLI) before using the landing APIs.
-- Stores early access signups and contact form messages.

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('early_access', 'contact')),
  email text not null,
  building text,
  name text,
  message text
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_type_idx on public.submissions (type);

alter table public.submissions enable row level security;

-- Inserts: use SUPABASE_SERVICE_ROLE_KEY from API routes (bypasses RLS), OR
-- run 20250421120001_submissions_anon_insert.sql if you only have the publishable/anon key.

comment on table public.submissions is 'Landing page: early_access and contact form rows';
