import { openaiJson } from "./openai-json";

export type ExtractedWebsiteContext = {
  productDescription: string;
  targetUser: string;
  mainUseCases: string[];
  keywords: string[];
};

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim() !== "")
    .map((x) => x.trim())
    .slice(0, 12);
}

function parseExtracted(v: unknown): ExtractedWebsiteContext | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const productDescription =
    typeof o.productDescription === "string" ? o.productDescription.trim() : "";
  const targetUser = typeof o.targetUser === "string" ? o.targetUser.trim() : "";
  const mainUseCases =
    typeof o.mainUseCases === "string" && o.mainUseCases.trim()
      ? [o.mainUseCases.trim()]
      : asStringArray(o.mainUseCases);
  const keywords =
    typeof o.keywords === "string" && o.keywords.trim()
      ? o.keywords.split(/[,;]+/).map((x) => x.trim()).filter(Boolean)
      : asStringArray(o.keywords);
  if (!productDescription || productDescription.length < 12) return null;
  if (keywords.length < 2) return null;
  return {
    productDescription: productDescription.slice(0, 400),
    targetUser: targetUser.slice(0, 240) || "General users",
    mainUseCases: mainUseCases.slice(0, 6),
    keywords: keywords.slice(0, 10),
  };
}

/** Build a single blob for Reddit query generation. */
export function formatExtractedForQueries(ctx: ExtractedWebsiteContext): string {
  const useCases = ctx.mainUseCases.length ? ctx.mainUseCases.join("; ") : "n/a";
  const kw = ctx.keywords.join(", ");
  return [
    `Product (from website): ${ctx.productDescription}`,
    `Target user: ${ctx.targetUser}`,
    `Main use cases: ${useCases}`,
    `Keywords for search: ${kw}`,
  ].join("\n");
}

/** One-line + keywords for UI / scoring downstream. */
export function formatExtractedAsProductSummary(ctx: ExtractedWebsiteContext): string {
  const k = ctx.keywords.slice(0, 6).join(", ");
  return `${ctx.productDescription}\n\nAudience: ${ctx.targetUser}. Focus: ${k}.`;
}

export async function extractWebsiteContext(
  visiblePageText: string,
  apiKey: string,
): Promise<ExtractedWebsiteContext | null> {
  const system = `You read noisy homepage text and output JSON only.

Extract:
- productDescription: 1–2 clear lines (what the product does), no marketing fluff.
- targetUser: who it is for (one short phrase).
- mainUseCases: 3–6 short bullet phrases (real jobs-to-be-done).
- keywords: 5–10 concrete words or short phrases a Reddit user might type when looking for help in this space (no brand name spam).

If the text is too thin or not a product site, return { "reject": true }.

Otherwise return:
{ "productDescription": string, "targetUser": string, "mainUseCases": string[], "keywords": string[] }`;

  const user = visiblePageText.slice(0, 5000);
  const parsed = await openaiJson<Record<string, unknown>>(apiKey, system, user, 0.25);
  if (!parsed || parsed.reject === true) return null;
  return parseExtracted(parsed);
}
