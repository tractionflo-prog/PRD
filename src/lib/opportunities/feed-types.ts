export type OpportunityIntent = "High" | "Medium";

export type OpportunitySource = "Reddit" | "X" | "Community";

export type OpportunityItem = {
  id: string;
  postText: string;
  source: OpportunitySource;
  sourceUrl: string;
  sourceLabel: string;
  createdUtc: number | null;
  intentLabel: OpportunityIntent;
  intentScore: number;
  suggestedReply: string;
};
