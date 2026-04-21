-- Required only if you use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or anon key
-- (not needed when using SUPABASE_SERVICE_ROLE_KEY — service role bypasses RLS).

drop policy if exists "Landing forms insert" on public.submissions;

create policy "Landing forms insert"
  on public.submissions
  for insert
  to anon
  with check (true);
