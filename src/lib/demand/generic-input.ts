/**
 * Broad categories that produce weak Reddit seeds unless expanded.
 * Matches whole-word / phrase boundaries (does not match "apple" for "app").
 */
const GENERIC_CATEGORY_RE =
  /\b(saas|crm|ai\s+tools?|platform|\bapps?\b|software\s+as\s+a\s+service)\b/i;

function collapseWs(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Word count for the user’s description (not characters). */
export function describeWordCount(text: string): number {
  const t = collapseWs(text);
  if (!t) return 0;
  return t.split(" ").length;
}

/**
 * True when the user should add a concrete problem before we run a single-seed search.
 * Rules: fewer than 3 words, OR (short text ≤5 words that names only a broad category like SaaS / CRM).
 */
export function isGenericProductInput(text: string): boolean {
  const t = collapseWs(text);
  if (!t) return false;
  const wc = describeWordCount(t);
  if (wc < 3) return true;
  if (wc <= 5 && GENERIC_CATEGORY_RE.test(t)) return true;
  return false;
}
