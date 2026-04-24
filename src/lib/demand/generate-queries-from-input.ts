import { expandCategoryToUseCases } from "./expand-generic-use-cases";
import {
  generateDemandQueries,
  mergeDemandQueryPacks,
} from "./generate-queries-service";
import { isGenericProductInput } from "./generic-input";
import {
  formatParsedIntentForScoring,
  parseDemandIntentFromNotes,
  parsedIntentFromPainLine,
} from "./parse-demand-intent";
import {
  extractWebsiteContext,
  formatExtractedAsProductSummary,
  formatExtractedForQueries,
} from "./website-extract-context";
import { fetchHomepageVisibleText, normalizeWebsiteUrl } from "./website-fetch";
import type { DemandParsedIntent } from "./types";

export type GenerateQueriesFromInputResult = {
  queries: string[];
  /** When derived from a website, summary for Reddit scoring + replies */
  productSummary?: string;
  /** Same context compressed for lead relevance scoring */
  intentHintsForScoring?: string;
  /** When we expanded a vague category into concrete angles */
  expandedUseCases?: string[];
  /** Structured intent used for queries + fetch-leads keyword gate */
  parsedIntent?: DemandParsedIntent;
};

export type GenerateQueriesFromInputOptions = {
  /** Describe-mode only: merge searches from several inferred use cases */
  expandGeneric?: boolean;
};

/**
 * Text-only, website-only, or website + optional notes.
 * Search queries are always **deterministic Reddit patterns** (no query LLM).
 * Website extraction still uses OpenAI when `apiKey` is set.
 * Optional `expandGeneric`: for vague describe-only input, run query gen per inferred use case and merge.
 */
export async function generateQueriesFromInput(
  productNotes: string,
  websiteRaw: string | undefined,
  apiKey: string | undefined,
  options?: GenerateQueriesFromInputOptions,
): Promise<GenerateQueriesFromInputResult> {
  const notes = productNotes.trim();
  const web = websiteRaw?.trim() ?? "";

  if (!web) {
    if (!notes) return { queries: [] };
    if (isGenericProductInput(notes) && !options?.expandGeneric) {
      return { queries: [] };
    }

    if (options?.expandGeneric === true && isGenericProductInput(notes)) {
      const mainParsed = await parseDemandIntentFromNotes(notes, apiKey);
      const useCases = await expandCategoryToUseCases(notes, apiKey);
      const packs = await Promise.all(
        useCases.map((u) =>
          generateDemandQueries(u, apiKey, {
            parsed: parsedIntentFromPainLine(u, mainParsed.audience),
          }),
        ),
      );
      const mainHint = formatParsedIntentForScoring(mainParsed);
      const merged = mergeDemandQueryPacks(
        [
          {
            queries: [],
            intentHintsForScoring: mainHint,
          },
          ...packs.filter((p) => p.queries.length > 0),
        ],
        40,
      );

      let queries = merged.queries;
      let intentHintsForScoring = merged.intentHintsForScoring;

      if (queries.length < 8) {
        const joined = await generateDemandQueries(useCases.join("\n\n"), apiKey, {
          parsed: mainParsed,
        });
        if (joined.queries.length >= 8) {
          queries = joined.queries;
          intentHintsForScoring =
            joined.intentHintsForScoring ??
            intentHintsForScoring ??
            useCases.join("; ").slice(0, 800);
        } else {
          return {
            queries: [],
            intentHintsForScoring: intentHintsForScoring ?? mainHint,
            parsedIntent: mainParsed,
          };
        }
      }

      return {
        queries,
        intentHintsForScoring,
        productSummary: `Broad: ${notes}\n\nConcrete search angles: ${useCases.join(" · ")}`,
        expandedUseCases: useCases,
        parsedIntent: mainParsed,
      };
    }

    const parsed = await parseDemandIntentFromNotes(notes, apiKey);
    const pack = await generateDemandQueries(notes, apiKey, { parsed });
    return { ...pack, parsedIntent: parsed };
  }

  const normalized = normalizeWebsiteUrl(web);
  if (!normalized) {
    if (!notes) return { queries: [] };
    const parsed = await parseDemandIntentFromNotes(notes, apiKey);
    const pack = await generateDemandQueries(notes, apiKey, { parsed });
    return { ...pack, productSummary: notes, parsedIntent: parsed };
  }

  const host = new URL(normalized).hostname.replace(/^www\./, "");
  const pageText = await fetchHomepageVisibleText(normalized);

  let contextForQueries = notes;
  let productSummary: string | undefined;

  if (pageText && apiKey) {
    const extracted = await extractWebsiteContext(pageText, apiKey);
    if (extracted) {
      contextForQueries = formatExtractedForQueries(extracted);
      productSummary = formatExtractedAsProductSummary(extracted);
    } else if (notes) {
      contextForQueries = `${notes}\n\n(Website was unclear — rely more on the notes above.)`;
      productSummary = notes;
    } else {
      contextForQueries = [
        `Company/site: ${host}`,
        `Page excerpt (noisy): ${pageText.slice(0, 1500)}`,
      ].join("\n\n");
      productSummary = `From ${host} — add a short text description for tighter matches.`;
    }
  } else {
    if (notes) {
      contextForQueries = `${notes}\n\n(We could not load the homepage — using your notes only.)`;
      productSummary = notes;
    } else {
      contextForQueries = `Product website: ${host}. Tools and workflows people discuss in this space.`;
      productSummary = `From ${host} — paste a short description for better results.`;
    }
  }

  const parseSource = notes.trim()
    ? notes
    : contextForQueries.replace(/\s+/g, " ").trim().slice(0, 1800);
  const parsed = await parseDemandIntentFromNotes(parseSource, apiKey);
  const pack = await generateDemandQueries(contextForQueries, apiKey, { parsed });
  return {
    ...pack,
    ...(productSummary ? { productSummary } : {}),
    parsedIntent: parsed,
  };
}
