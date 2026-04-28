import type { OpportunityItem } from "./feed-types";

type OfflineOpportunity = Pick<
  OpportunityItem,
  | "postText"
  | "source"
  | "sourceUrl"
  | "sourceLabel"
  | "createdUtc"
  | "intentLabel"
  | "intentScore"
  | "suggestedReply"
>;

const NOW_UTC = Math.floor(Date.now() / 1000);

export const OFFLINE_OPPORTUNITY_SEED: OfflineOpportunity[] = [
  {
    postText: "What CRM are solo founders using to track leads without getting buried in admin?",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-1",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 7200,
    intentLabel: "High",
    intentScore: 84,
    suggestedReply:
      "I had the same issue and moved to a lightweight pipeline + reminders workflow that cut admin time. Happy to share the exact setup if useful.",
  },
  {
    postText: "My follow-up process is still spreadsheets + calendar reminders. Any better system that stays simple?",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-2",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 10800,
    intentLabel: "High",
    intentScore: 82,
    suggestedReply:
      "You can keep it simple: one inbox + stage-based lead tracker + scheduled nudges. I can share a minimal template that works for small teams.",
  },
  {
    postText: "Agency owners: how do you manage client conversations and handoffs without losing context?",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-3",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 14400,
    intentLabel: "Medium",
    intentScore: 74,
    suggestedReply:
      "A shared timeline for each client plus role-based handoff notes usually solves this quickly. I can show a concise workflow map if you want.",
  },
  {
    postText: "Looking for alternatives to bloated CRMs. Need only pipeline, reminders, and message history.",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-4",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 18000,
    intentLabel: "High",
    intentScore: 86,
    suggestedReply:
      "If you want lean, focus on 3 modules only: pipeline, follow-up queue, and thread history. I can send the exact structure that keeps it lightweight.",
  },
  {
    postText: "Our lead response times are inconsistent. What process helps teams reply within a few hours?",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-5",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 21600,
    intentLabel: "Medium",
    intentScore: 71,
    suggestedReply:
      "A daily triage queue + SLA tags + auto-reminders works well for this. I can share the checklist we use to keep replies predictable.",
  },
  {
    postText: "How do you avoid leads slipping through after the first demo call?",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-6",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 25200,
    intentLabel: "High",
    intentScore: 80,
    suggestedReply:
      "A post-demo sequence with timed tasks and one owner per lead fixes most drop-off. I can share a practical follow-up cadence.",
  },
  {
    postText: "Freelancer here, juggling too many prospects manually. Any workflow that does not require a full CRM migration?",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-7",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 28800,
    intentLabel: "Medium",
    intentScore: 69,
    suggestedReply:
      "You can layer a lightweight opportunity tracker on top of your current tools first, then migrate only if needed. Happy to outline that path.",
  },
  {
    postText: "What tool stack are people using for outreach + client follow-up in 2026?",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-8",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 32400,
    intentLabel: "High",
    intentScore: 83,
    suggestedReply:
      "Most winning setups are simple and integrated, not huge stacks. I can break down a compact outreach + follow-up stack that teams adopt quickly.",
  },
  {
    postText: "We have demand but no structured way to track conversations across inboxes. Suggestions?",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-9",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 36000,
    intentLabel: "Medium",
    intentScore: 70,
    suggestedReply:
      "Centralizing conversation context first gives immediate gains. I can share a structure that unifies email, DMs, and notes without heavy tooling.",
  },
  {
    postText: "Any proven workflow for qualifying inbound leads before scheduling calls?",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-10",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 39600,
    intentLabel: "High",
    intentScore: 79,
    suggestedReply:
      "A quick qualification rubric + templated reply paths saves a lot of time. I can share a compact scoring model you can copy today.",
  },
  {
    postText: "Need a better way to keep sales notes, tasks, and follow-ups tied to each lead.",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-11",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 43200,
    intentLabel: "Medium",
    intentScore: 68,
    suggestedReply:
      "A single lead timeline with note/task linkage usually solves this immediately. I can show a straightforward structure to implement it.",
  },
  {
    postText: "What are founders using instead of Notion + Sheets for pipeline management?",
    source: "Community",
    sourceUrl: "https://news.ycombinator.com/item?id=off-12",
    sourceLabel: "Community",
    createdUtc: NOW_UTC - 46800,
    intentLabel: "High",
    intentScore: 81,
    suggestedReply:
      "Many teams move to a purpose-built lightweight pipeline once manual upkeep grows. I can share what that transition looks like with low effort.",
  },
];
