"use client";

import { useState } from "react";
import type { OpportunityItem } from "@/lib/opportunities/feed-types";

export function ActionBar({ best }: { best: OpportunityItem }) {
  const [copied, setCopied] = useState(false);

  async function copyBestReply() {
    try {
      await navigator.clipboard.writeText(best.suggestedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="sticky bottom-4 z-30 mt-10 rounded-[1.1rem] border border-slate-200/85 bg-white/95 p-4 shadow-[0_20px_44px_-30px_rgba(15,23,42,0.22)] backdrop-blur-md sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[14px] font-semibold tracking-tight text-slate-800">Pick 1 conversation - start today</p>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyBestReply}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#635bff] px-4 text-[13px] font-semibold text-white shadow-[0_14px_30px_-18px_rgba(99,91,255,0.55)] transition-colors hover:bg-[#5851ea]"
          >
            {copied ? "Copied" : "Copy best reply"}
          </button>
          <a
            href={best.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            Open best opportunity
          </a>
        </div>
      </div>
    </div>
  );
}
