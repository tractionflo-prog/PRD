import {
  buildContextAwareConversationReply,
  buildPersonalizedOutreachDm,
  parseInterpretationReplySliceFromProduct,
  parseStructuredProductLines,
  slotsFromInterpretationSlice,
  type ConversationReplySlots,
  type InterpretationReplySlice,
} from "./context-aware-reply";
import { openaiJson } from "./openai-json";
import type { DemandReplyItem } from "./types";

type LeadIn = {
  id: string;
  title: string;
  snippet: string;
  url: string;
};

/** When the model omits a lead: acknowledge → tie to their title → question — no pitch. */
function fallbackReply(lead: LeadIn): string {
  const t = lead.title.replace(/\s+/g, " ").trim();
  const hook = t.length > 110 ? `${t.slice(0, 107)}…` : t;
  const open = hook
    ? `That sounds familiar — especially what you wrote about ${hook}.`
    : "That sounds familiar from what you described.";
  return `${open}\n\nWhat part has been the stickiest for you day to day?`;
}

function collapseWs(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function hasFullOutreachSlice(slice: InterpretationReplySlice): boolean {
  return (
    collapseWs(slice.outreachGroupPhrase ?? "").length >= 6 &&
    collapseWs(slice.outreachActivityPhrase ?? "").length >= 8 &&
    collapseWs(slice.outreachSituationPhrase ?? "").length >= 4
  );
}

function asSlotString(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return collapseWs(v).slice(0, max);
}

/** One JSON extract from freeform founder notes — slots only, no final message. */
async function extractReplySlotsFromProduct(
  product: string,
  apiKey: string,
): Promise<ConversationReplySlots | null> {
  const trimmed = product.trim().slice(0, 1600);
  if (!trimmed) return null;

  const structured = parseStructuredProductLines(trimmed);
  if (structured && structured.pain) return structured;

  const system = `You extract three short phrases from the founder's notes. Output JSON only.

Return shape: { "actor": string, "pain": string, "context": string }

Definitions:
- actor: who runs into this problem (roles or segment). Short phrase that fits after "a few ___" in conversation (e.g. "night-shift nurses", "solo founders"). No quotes. Not a full sentence.
- pain: what is going wrong in plain words (3–14 words). No "we", no product name, no "dealing with" prefix.
- context: when, where, or how it shows up (e.g. "during deployments", "on client calls"). If truly unknown, use empty string "".

Rules:
- Pull meaning only from the notes — do not invent a niche they did not imply.
- No URLs, no product pitch language, no "solution" or "platform".`;

  const parsed = await openaiJson<Record<string, unknown>>(apiKey, system, trimmed, 0.28);
  if (!parsed) return null;
  const actor = asSlotString(parsed.actor, 120);
  const pain = asSlotString(parsed.pain, 160);
  const context = asSlotString(parsed.context, 120);
  if (!pain) return null;
  return {
    actor: actor || "people in roles like yours",
    pain,
    context,
  };
}

export async function generateDemandReplies(
  product: string,
  leads: LeadIn[],
  apiKey: string,
  interpretation?: InterpretationReplySlice | null,
): Promise<DemandReplyItem[]> {
  if (leads.length === 0) return [];

  const sliceFromProduct = !interpretation
    ? parseInterpretationReplySliceFromProduct(product.trim())
    : null;
  const slice = interpretation ?? sliceFromProduct;

  if (slice && hasFullOutreachSlice(slice)) {
    const rawPain = collapseWs(slice.pain);
    const painForLine = rawPain
      ? rawPain.charAt(0).toLowerCase() + rawPain.slice(1).slice(0, 78)
      : undefined;
    return leads.map((l, idx) => ({
      id: l.id,
      reply: buildPersonalizedOutreachDm(
        {
          outreachGroupPhrase: slice.outreachGroupPhrase!,
          outreachActivityPhrase: slice.outreachActivityPhrase!,
          outreachSituationPhrase: slice.outreachSituationPhrase!,
          ...(painForLine ? { painForDealingLine: painForLine } : {}),
        },
        idx,
      ),
    }));
  }

  const baseSlots = slice
    ? slotsFromInterpretationSlice(slice)
    : await extractReplySlotsFromProduct(product, apiKey);

  if (!baseSlots) {
    return leads.map((l) => ({ id: l.id, reply: fallbackReply(l) }));
  }

  return leads.map((l, idx) => {
    const reply = buildContextAwareConversationReply(baseSlots, idx);
    return { id: l.id, reply };
  });
}
