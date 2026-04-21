import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { getServiceSupabase } from "@/lib/supabase/server";

type SubmissionType = "early_access" | "contact";

function normalizeRow(record: Record<string, unknown>) {
  const type = record.type;
  if (type !== "early_access" && type !== "contact") {
    throw new Error("Invalid submission type.");
  }

  return {
    type: type as SubmissionType,
    email: String(record.email),
    building:
      record.building != null && record.building !== ""
        ? String(record.building)
        : null,
    name:
      record.name != null && record.name !== ""
        ? String(record.name)
        : null,
    message:
      record.message != null && record.message !== ""
        ? String(record.message)
        : null,
  };
}

async function persistToSupabase(record: Record<string, unknown>): Promise<boolean> {
  const supabase = getServiceSupabase();
  if (!supabase) return false;

  const row = normalizeRow(record);
  const { error } = await supabase.from("submissions").insert(row);

  if (error) {
    throw new Error(error.message);
  }
  return true;
}

/**
 * Persists landing-page form submissions.
 *
 * Priority:
 * 1. **Supabase** — set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
 *    (create `public.submissions` using `supabase/migrations/*.sql`).
 * 2. **Webhook** — set `SUBMISSIONS_WEBHOOK_URL` to POST JSON (includes `at`).
 * 3. **Local file** — `data/submissions.jsonl` when not on Vercel (dev / self-hosted).
 */
export async function persistSubmission(
  record: Record<string, unknown>,
): Promise<void> {
  try {
    if (await persistToSupabase(record)) return;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Supabase insert failed.");
  }

  const payload = {
    ...record,
    at: new Date().toISOString(),
  };

  const webhook = process.env.SUBMISSIONS_WEBHOOK_URL?.trim();
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Webhook returned ${res.status}`);
    }
    return;
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Configure Supabase (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) or SUBMISSIONS_WEBHOOK_URL.",
    );
  }

  const dir = path.join(process.cwd(), "data");
  const file = path.join(dir, "submissions.jsonl");
  await mkdir(dir, { recursive: true });
  await appendFile(file, `${JSON.stringify(payload)}\n`, "utf8");
}
