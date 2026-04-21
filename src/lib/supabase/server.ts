import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/**
 * Supabase client for Route Handlers only (never import in client components).
 *
 * Key resolution (first match wins):
 * 1. `SUPABASE_SERVICE_ROLE_KEY` — preferred; bypasses RLS. From Supabase → Settings → API → service_role.
 * 2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public keys; you must run
 *    `supabase/migrations/20250421120001_submissions_anon_insert.sql` so `anon` can insert into `submissions`.
 *
 * URL: `NEXT_PUBLIC_SUPABASE_URL`
 */
export function getServiceSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || publishableKey || anonKey;

  if (!url || !key) {
    cached = null;
    return null;
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
