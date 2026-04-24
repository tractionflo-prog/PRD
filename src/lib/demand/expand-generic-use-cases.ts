import { openaiJson } from "./openai-json";

function fallbackUseCases(category: string): string[] {
  const c = category.trim().slice(0, 72) || "this product space";
  return [
    `onboarding new users and teams to ${c} without chaos`,
    `day-to-day workflow bottlenecks people hit with ${c}`,
    `switching from spreadsheets or legacy tools to something like ${c}`,
    `pricing or contracts feeling too expensive for ${c}`,
    `integrations and data sync pain when using ${c}`,
    `reporting visibility and who owns what in ${c}`,
  ];
}

/**
 * Turn a broad category into 4–6 concrete Reddit-shaped problem phrases, then merged search runs per phrase.
 */
export async function expandCategoryToUseCases(
  category: string,
  apiKey: string | undefined,
): Promise<string[]> {
  const raw = category.trim();
  if (!raw) return fallbackUseCases("your product").slice(0, 6);

  if (!apiKey) {
    return fallbackUseCases(raw).slice(0, 6);
  }

  const system = `You reply with JSON only using this shape: { "useCases": string[] }.
Given a broad or vague product category, set useCases to 4–6 distinct lines: concrete problems or tasks (4–14 words each) that someone might describe on Reddit when looking for help, tools, or alternatives.
No brand names, no buzzwords, no duplicates. English only.`;

  const user = `User typed (may be vague):\n${raw.slice(0, 400)}`;

  const parsed = await openaiJson<{ useCases?: unknown }>(apiKey, system, user, 0.35);
  const arr = Array.isArray(parsed?.useCases) ? parsed!.useCases : [];
  const cleaned = arr
    .filter((x): x is string => typeof x === "string" && x.trim().length > 10)
    .map((x) => x.trim().replace(/\s+/g, " "))
    .slice(0, 6);

  if (cleaned.length >= 4) return cleaned;

  const fb = fallbackUseCases(raw);
  const merged: string[] = [...cleaned];
  for (const line of fb) {
    if (merged.length >= 6) break;
    const low = line.toLowerCase();
    if (!merged.some((m) => m.toLowerCase() === low)) merged.push(line);
  }
  return merged.slice(0, 6);
}
