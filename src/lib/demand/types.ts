/** Structured intent from user notes — used before queries, scoring, and keyword gate. */
export type DemandParsedIntent = {
  audience: string;
  pain: string;
  context: string;
};

/** Pluggable community sources — add HN, etc. behind the same interface */
export type CommunitySourceId = "reddit";

/** How the thread reads: explicit tool ask vs pain / workflow (UI + reply tone). */
export type DemandLeadType = "high_intent" | "problem";

/** Demand strength for UI — from intent score after fetch. */
export type DemandSignalBand = "strong" | "medium" | "early";

export type DemandLead = {
  id: string;
  source: CommunitySourceId;
  /** Score ≥75 → high_intent; 65–74 → problem */
  leadType: DemandLeadType;
  /** 🔥 / ⚡ / 🌱 label tier */
  signalBand: DemandSignalBand;
  title: string;
  subreddit: string;
  author: string;
  url: string;
  snippet: string;
  createdUtc: number | null;
  numComments: number;
  intentScore: number;
  /** Short human-readable match rationale (rules-based pre-reply) */
  whyMatch: string;
  /** Filled after reply generation; user-editable in UI */
  replyDraft: string;
};

export type DemandQueryResponse = {
  queries: string[];
  /** Present when queries were informed by website extraction — use for lead search + replies */
  productSummary?: string;
  /** Comma-separated intents for lead scoring — adjacent vocabulary, not only product name */
  intentHintsForScoring?: string;
  /** When a vague category was expanded into several concrete Reddit search angles */
  expandedUseCases?: string[];
  /** Parsed audience / pain / context — pass to fetch-leads for relevance filtering */
  parsedIntent?: DemandParsedIntent;
};

export type DemandFetchResponse = {
  /** Present on successful fetch-leads responses from the API route */
  ok?: true;
  leads: DemandLead[];
  /** True when Reddit returned nothing usable and we served demo rows */
  usedMock: boolean;
  /** Optional hint when live posts existed but none passed quality filters */
  notice?: string;
};

export type DemandReplyItem = {
  id: string;
  reply: string;
};

export type DemandRepliesResponse = {
  replies: DemandReplyItem[];
};
