const FALLBACK_CONTEXT = "when you're busy or not around";

/** Minimal fields from problem interpretation — avoids circular imports. */
export type InterpretationReplySlice = {
  audience: string[];
  pain: string;
  context: string;
  cleanProblem: string;
  /** Short phrase after “a few …” — concrete, not “students” alone */
  outreachGroupPhrase?: string;
  outreachActivityPhrase?: string;
  outreachSituationPhrase?: string;
};

export type ConversationReplySlots = {
  /** Who has the problem — phrase after "a few …" */
  actor: string;
  /** What is going wrong — short, no "dealing with" prefix */
  pain: string;
  /** When/where; may be empty → caller uses fallback */
  context: string;
};

function collapseWs(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function audiencePhrase(aud: string[]): string {
  if (aud.length === 0) return "people in roles like yours";
  if (aud.length === 1) return aud[0] ?? "people in roles like yours";
  if (aud.length === 2) return `${aud[0]} and ${aud[1]}`;
  return `${aud.slice(0, -1).join(", ")}, and ${aud[aud.length - 1]}`;
}

function lowerSentenceStart(s: string): string {
  const t = collapseWs(s);
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function isUnclearContext(context: string): boolean {
  const t = collapseWs(context);
  if (t.length < 3) return true;
  if (/^(n\/a|na|none|unknown|n\.a\.|—|-|\.{2,})$/i.test(t)) return true;
  if (/^(general|various|overall|broadly|typically)$/i.test(t)) return true;
  return false;
}

/**
 * Parse extended `interpretationToProductContext` blobs (incl. outreach lines) for reply generation
 * when full interpretation JSON is not available.
 */
export function parseInterpretationReplySliceFromProduct(product: string): InterpretationReplySlice | null {
  const text = product.replace(/\r\n/g, "\n");
  const painM = /^Pain:\s*(.+)$/im.exec(text);
  if (!painM?.[1]) return null;
  const pain = collapseWs(painM[1]).slice(0, 300);
  const audLine = /^Audience:\s*(.+)$/im.exec(text)?.[1] ?? "";
  const audience = audLine
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .slice(0, 8);
  const context = collapseWs(/^Context:\s*(.+)$/im.exec(text)?.[1] ?? "").slice(0, 300);
  const cleanProblem = collapseWs(/^Problem \(clean\):\s*(.+)$/im.exec(text)?.[1] ?? "").slice(
    0,
    400,
  );
  const outreachGroupPhrase = collapseWs(/^Outreach group:\s*(.+)$/im.exec(text)?.[1] ?? "").slice(
    0,
    140,
  );
  const outreachActivityPhrase = collapseWs(
    /^Outreach activity:\s*(.+)$/im.exec(text)?.[1] ?? "",
  ).slice(0, 160);
  const outreachSituationPhrase = collapseWs(
    /^Outreach situation:\s*(.+)$/im.exec(text)?.[1] ?? "",
  ).slice(0, 120);

  return {
    audience: audience.length > 0 ? audience : ["People in this workflow"],
    pain,
    context,
    cleanProblem: cleanProblem || pain,
    ...(outreachGroupPhrase ? { outreachGroupPhrase } : {}),
    ...(outreachActivityPhrase ? { outreachActivityPhrase } : {}),
    ...(outreachSituationPhrase ? { outreachSituationPhrase } : {}),
  };
}

/** Pull Audience / Pain / Context from `interpretationToProductContext` style blobs. */
export function parseStructuredProductLines(product: string): ConversationReplySlots | null {
  const text = product.replace(/\r\n/g, "\n");
  const audM = /^Audience:\s*(.+)$/im.exec(text);
  const painM = /^Pain:\s*(.+)$/im.exec(text);
  if (!painM?.[1]) return null;
  const actorRaw = audM?.[1] ? collapseWs(audM[1]) : "";
  const pain = collapseWs(painM[1]).slice(0, 160);
  const ctxM = /^Context:\s*(.+)$/im.exec(text);
  const context = ctxM?.[1] ? collapseWs(ctxM[1]).slice(0, 120) : "";
  if (!pain) return null;
  const actor =
    actorRaw ||
    (() => {
      const cat = /^Category:\s*(.+)$/im.exec(text);
      return cat?.[1] ? collapseWs(cat[1]).slice(0, 80) : "people in your space";
    })();
  return {
    actor: lowerSentenceStart(actor),
    pain: lowerSentenceStart(pain),
    context,
  };
}

export function slotsFromInterpretationSlice(i: InterpretationReplySlice): ConversationReplySlots {
  const actor =
    collapseWs(i.outreachGroupPhrase ?? "").length >= 3
      ? lowerSentenceStart(i.outreachGroupPhrase!)
      : lowerSentenceStart(audiencePhrase(i.audience));
  const pain = lowerSentenceStart(i.pain.trim() || i.cleanProblem.trim() || "this");
  const context = collapseWs(i.context).slice(0, 120);
  return { actor, pain, context };
}

/** Slots for the “specific situation + group” outreach DM (fallback card + Reddit when interpretation is present). */
export type PersonalizedOutreachDmInput = {
  outreachGroupPhrase: string;
  outreachActivityPhrase: string;
  outreachSituationPhrase: string;
  /** Short pain phrase for “dealing with ___ during ___” (optional). */
  painForDealingLine?: string;
};

/**
 * DM shaped around time/pressure + a concrete group — no product pitch.
 * `variantBit` alternates the social line opener.
 */
export function buildPersonalizedOutreachDm(
  input: PersonalizedOutreachDmInput,
  variantBit = 0,
): string {
  const painLine = collapseWs(input.painForDealingLine ?? "").slice(0, 80);
  const situationRaw = collapseWs(input.outreachSituationPhrase).slice(0, 100);

  let mid: string;
  if (painLine) {
    let during = situationRaw;
    if (during && /^(before|during|while|after)\b/i.test(during)) {
      during = during.replace(/^(before|during|while|after)\s+/i, "").trim();
    }
    const tail = during || "busy stretches and handoffs";
    mid = `Are you still dealing with ${painLine} during ${tail}?`;
  } else {
    let activity = collapseWs(input.outreachActivityPhrase).slice(0, 140);
    if (!activity) activity = "running into this";
    const situationTail = situationRaw
      ? /^(before|during|while|after)\b/i.test(situationRaw)
        ? ` ${situationRaw.charAt(0).toLowerCase()}${situationRaw.slice(1)}`
        : ` before ${situationRaw}`
      : " when work stacks up";
    mid = `Are you still ${activity}${situationTail}?`;
  }

  const group = collapseWs(input.outreachGroupPhrase).slice(0, 120) || "people in roles like yours";
  const social =
    variantBit % 2 === 0
      ? `I've been talking to a few ${group} and this keeps coming up.`
      : `I've heard this from a few ${group} and this keeps coming up.`;

  return [
    "Hey — quick question.",
    "",
    mid,
    "",
    social,
    "",
    "Curious how you're handling it right now?",
  ].join("\n");
}

/**
 * Human DM: reflects user slots, no pitch, no links, ~4 short blocks.
 * `variantBit` picks between two soft social-proof openers (stable if same number passed per lead).
 */
export function buildContextAwareConversationReply(
  slots: ConversationReplySlots,
  variantBit = 0,
): string {
  const pain = collapseWs(slots.pain).slice(0, 120) || "this";
  const ctxRaw = collapseWs(slots.context);
  const useFallback = isUnclearContext(ctxRaw);
  const contextTail = useFallback ? FALLBACK_CONTEXT : ctxRaw.slice(0, 100);
  const contextReadsAsPhrase =
    /^(when|while|during|after|before|between|on|in|at|every|each|as|if|once)\b/i.test(
      contextTail,
    );
  const contextFragment = useFallback
    ? contextTail
    : contextReadsAsPhrase
      ? contextTail
      : `in ${contextTail}`;
  const dealingLine = useFallback
    ? `Are you still dealing with ${pain}, ${contextFragment}?`
    : `Are you still dealing with ${pain} ${contextFragment}?`;

  const actor = collapseWs(slots.actor).slice(0, 120) || "people in roles like yours";
  const social =
    variantBit % 2 === 0
      ? `I've been talking to a few ${actor} and this keeps coming up.`
      : `I've heard this from a few ${actor} and this keeps coming up.`;

  return [
    "Hey — quick question.",
    "",
    dealingLine,
    "",
    social,
    "",
    "Curious how you're handling it right now?",
  ].join("\n");
}
