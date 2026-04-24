import type { CommunitySourceId, DemandLead } from "../types";

/** Raw hit from a provider before intent scoring / reply drafting */
export type ProviderSearchHit = Omit<
  DemandLead,
  "intentScore" | "whyMatch" | "replyDraft" | "leadType" | "signalBand"
>;

export interface CommunityLeadProvider {
  readonly id: CommunitySourceId;
  search(query: string, opts: { limit: number }): Promise<ProviderSearchHit[]>;
}
