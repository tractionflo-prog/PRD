import type { CommunitySourceId } from "../types";
import type { CommunityLeadProvider } from "./types";
import { redditLeadProvider } from "./reddit-provider";

const providers: Record<CommunitySourceId, CommunityLeadProvider> = {
  reddit: redditLeadProvider,
};

export function getLeadProvider(id: CommunitySourceId): CommunityLeadProvider {
  const p = providers[id];
  if (!p) throw new Error(`Unknown community source: ${id}`);
  return p;
}
