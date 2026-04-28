"use client";

import { useState } from "react";
import type { OpportunityItem } from "@/lib/opportunities/feed-types";

function formatAgo(utc: number | null): string {
  if (!utc || !Number.isFinite(utc)) return "recent";
  const ageSec = Math.max(0, Math.floor(Date.now() / 1000 - utc));
  const min = Math.floor(ageSec / 60);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function intentBadge(item: OpportunityItem): { label: string; tone: string } {
  if (item.intentScore >= 76) {
    return {
      label: "🟢 Actively looking",
      tone: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70",
    };
  }
  if (item.intentScore >= 58) {
    return {
      label: "🟡 Exploring options",
      tone: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/70",
    };
  }
  return {
    label: "🔵 Talking about problem",
    tone: "bg-sky-50 text-sky-900 ring-1 ring-sky-200/70",
  };
}

function signalSummary(item: OpportunityItem): string {
  const t = item.postText.toLowerCase();
  if (/\b(recommend|suggest|what tool|which tool|crm)\b/.test(t)) {
    return "Asked for a tool recommendation";
  }
  if (/\b(manage|how do you manage|how are you managing)\b/.test(t)) {
    return "Asked how others manage this";
  }
  if (/\b(alternative|replace|better way|switch)\b/.test(t)) {
    return "Looking for alternatives";
  }
  if (/\b(compare|vs|versus)\b/.test(t)) return "Comparing tools";
  return "Described a workflow pain";
}

function whyThisMatters(item: OpportunityItem): string {
  const signal = signalSummary(item);
  if (signal === "Asked for a tool recommendation") {
    return "They are actively looking for a better workflow.";
  }
  if (signal === "Comparing tools" || signal === "Looking for alternatives") {
    return "They are comparing tools, which makes this a good time to enter the conversation.";
  }
  if (signal === "Asked how others manage this") {
    return "They asked for practical approaches, so a concise real-world answer can stand out.";
  }
  return "They described pain clearly, so a helpful reply is likely to land.";
}

function bestReasonToReply(item: OpportunityItem): string {
  const signal = signalSummary(item);
  if (signal === "Asked for a tool recommendation") return "Direct ask for recommendations right now.";
  if (signal === "Comparing tools") return "They are in decision mode and evaluating options.";
  if (signal === "Looking for alternatives") return "Current setup is not working for them.";
  if (signal === "Asked how others manage this") return "Open to practical examples from peers.";
  return "Clear workflow pain with room for a useful suggestion.";
}

function bestAction(item: OpportunityItem): string {
  if (item.source === "Reddit") return "Reply directly in Reddit thread";
  if (item.source === "X") return "Reply in-thread with a short helpful note";
  return "Join the conversation where they posted";
}

export function FeedCards({ items, featured = false }: { items: OpportunityItem[]; featured?: boolean }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyReply(item: OpportunityItem) {
    try {
      await navigator.clipboard.writeText(item.suggestedReply);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <div className={`grid gap-4 sm:gap-5 ${featured ? "lg:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
      {items.map((item) => (
        <article
          key={item.id}
          className={`group relative overflow-hidden rounded-[1.2rem] border border-slate-200/85 bg-white p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.2)] ring-1 ring-slate-100/90 transition-[transform,border-color,box-shadow] duration-300 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-slate-300 [@media(hover:hover)]:hover:shadow-[0_30px_60px_-34px_rgba(15,23,42,0.25)] sm:p-5 ${
            featured ? "md:min-h-[27rem] md:p-6" : "sm:min-h-[24.5rem]"
          }`}
        >
          {featured ? (
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-200/45 blur-2xl"
              aria-hidden
            />
          ) : null}

          <div className="relative flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">{item.source}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">{item.sourceLabel}</span>
            <span className={`rounded-full px-2.5 py-0.5 ${intentBadge(item).tone}`}>{intentBadge(item).label}</span>
          </div>

          <div className="relative mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Post</p>
            <p className="mt-2 text-[15px] leading-[1.55] text-slate-900 sm:text-[16px]">{item.postText}</p>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Signal detected</p>
            <p className="mt-2 text-[14px] text-slate-800">
              🟢 {signalSummary(item)} • {formatAgo(item.createdUtc)}
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Why this matters</p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-700">{whyThisMatters(item)}</p>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Best action</p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-700">{bestAction(item)}</p>
          </div>

          {featured ? (
            <p className="mt-3 text-[12px] font-medium text-violet-700">Best reason to reply: {bestReasonToReply(item)}</p>
          ) : null}

          <div className="relative mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyReply(item)}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#635bff] px-4 text-[13px] font-semibold text-white shadow-[0_12px_24px_-14px_rgba(99,91,255,0.6)] transition-colors hover:bg-[#5851ea]"
            >
              {copiedId === item.id ? "Copied" : "Copy reply"}
            </button>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Join conversation
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
