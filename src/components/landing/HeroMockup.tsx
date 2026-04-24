"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { SurfaceCard } from "./SurfaceCard";

type LeadRow = {
  name: string;
  initials: string;
  body: string;
  subreddit: string;
  time: string;
  status: "New" | "Queued" | "Ready";
  active?: boolean;
  avatarClass: string;
  ringClass: string;
};

const leads: LeadRow[] = [
  {
    name: "Marcus",
    initials: "MA",
    body: "Looking for a tool to manage tenants before next month...",
    subreddit: "r/landlords",
    time: "2m ago",
    status: "New",
    active: true,
    avatarClass: "bg-[#3F3F46]",
    ringClass: "ring-[#BFDBFE]",
  },
  {
    name: "Nora",
    initials: "NO",
    body: "Any recommendations for tracking rent payments without spreadsheets?",
    subreddit: "r/realestateinvesting",
    time: "9m ago",
    status: "Queued",
    avatarClass: "bg-[#7C3AED]",
    ringClass: "ring-[#F3D6C0]",
  },
  {
    name: "Ibrahim",
    initials: "IB",
    body: "Struggling with tenant communication — what do you use?",
    subreddit: "r/PropertyManagement",
    time: "14m ago",
    status: "Ready",
    avatarClass: "bg-[#2563EB]",
    ringClass: "ring-[#BFDBFE]",
  },
];

function Avatar({
  label,
  className,
  ringClass,
  showOnline,
}: {
  label: string;
  className: string;
  ringClass?: string;
  showOnline?: boolean;
}) {
  return (
    <span className="relative inline-flex shrink-0" aria-hidden>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2",
          ringClass ?? "ring-white",
          className,
        )}
      >
        {label}
      </span>
      {showOnline && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#16A34A]" />
      )}
    </span>
  );
}

function StatusChip({ status }: { status: LeadRow["status"] }) {
  if (status === "Ready") {
    return (
      <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A]">
        Approved
      </span>
    );
  }
  if (status === "New") {
    return (
      <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
        New
      </span>
    );
  }
  if (status === "Queued") {
    return (
      <span className="rounded-full border border-[#F3D6C0] bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold text-[#C2410C]">
        Queued
      </span>
    );
  }
  return null;
}

function RedditBadge({ subreddit }: { subreddit: string }) {
  return (
    <span
      className="rounded-full border border-[#F3D6C0] bg-[#FFF7ED] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#C2410C]"
      title={subreddit}
    >
      Real conversations
    </span>
  );
}

function MockChrome() {
  return (
    <div className="flex items-center justify-between border-b border-[#ECECEC] bg-white px-5 py-3 sm:px-6">
      <span className="rounded-full bg-[#FFF7ED] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C2410C]">
        Inbox
      </span>
      <div className="flex items-center gap-2" aria-hidden>
        <span className="rounded-full border border-[#F3D6C0] bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-medium text-[#C2410C] sm:px-2.5 sm:text-[11px]">
          Tractionflo
        </span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E5E7EB]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#E5E7EB]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#86EFAC]" />
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: LeadRow }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all sm:p-5",
        lead.active
          ? "border-[#BFDBFE] bg-white shadow-[0_10px_28px_-14px_rgba(37,99,235,0.3)] ring-1 ring-[#2563EB]/15"
          : "border-[#E5E7EB] bg-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]",
      )}
    >
      <div className={cn("flex items-start gap-3", lead.active ? "mb-2" : "mb-2.5")}>
        <Avatar
          label={lead.initials}
          className={lead.avatarClass}
          ringClass={lead.ringClass}
          showOnline={lead.active}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[13px] font-semibold text-[#0A0A0A]">
              {lead.name}
            </p>
            <RedditBadge subreddit={lead.subreddit} />
            <StatusChip status={lead.status} />
          </div>
          <time className="mt-1 block text-[12px] tabular-nums text-[#9CA3AF]">
            {lead.time}
          </time>
        </div>
      </div>
      <p className="text-[14px] leading-relaxed text-[#374151]">{lead.body}</p>
    </div>
  );
}

function MockBody() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#ECECEC] bg-white px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-lg font-semibold tracking-tight text-[#0A0A0A] sm:text-xl">
          People to talk to
        </h2>
        <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[12px] font-semibold text-[#2563EB]">
          Demand signals
        </span>
      </div>

      <div className="relative space-y-2.5 bg-[#FAFAFA] px-3 py-4 sm:px-5 sm:py-5">
        {leads.map((lead) => (
          <LeadCard key={lead.name} lead={lead} />
        ))}

        <div className="rounded-xl border border-[#BFDBFE] bg-white p-4 shadow-[0_10px_24px_-16px_rgba(37,99,235,0.35)] ring-1 ring-[#2563EB]/20 sm:p-5">
          <div className="mb-2.5 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
              <Avatar
                label="JD"
                className="bg-[#2563EB] text-[11px]"
                ringClass="ring-[#BFDBFE]"
              />
              <span className="text-[13px] font-semibold text-[#0A0A0A]">
                Conversation starter
              </span>
              <StatusChip status="Ready" />
            </div>
            <time
              dateTime="PT0S"
              className="shrink-0 text-[12px] tabular-nums text-[#9CA3AF]"
            >
              Just now
            </time>
          </div>
          <p className="text-[14px] leading-relaxed text-[#374151]">
            Hey Marcus — saw your post in r/landlords. Built something for this.
            Happy to share if useful.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[#ECECEC] bg-white px-5 py-4 sm:px-6">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2563EB] px-4 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
        >
          Approved
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] transition-colors hover:border-[#BFDBFE] hover:bg-[#EFF6FF]"
        >
          Edit
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-[14px] font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
        >
          Skipped
        </button>
      </div>
    </>
  );
}

export function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative mx-auto w-full max-w-xl lg:max-w-none"
    >
      <div
        className="pointer-events-none absolute -right-2 top-6 hidden h-[78%] w-[92%] rounded-2xl border border-[#ECECEC] bg-[#EFF6FF]/40 shadow-[0_12px_40px_-20px_rgba(37,99,235,0.12)] blur-[0.2px] sm:block lg:-right-4 lg:top-8"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-1 bottom-10 hidden h-24 w-40 rounded-xl border border-[#F3D6C0] bg-[#FFF7ED]/80 shadow-sm blur-[0.2px] sm:block lg:-left-3"
        aria-hidden
      />

      <SurfaceCard className="relative overflow-hidden border-[#E5E7EB] bg-white p-0 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-20px_rgba(15,23,42,0.1)]">
        <MockChrome />
        <MockBody />
      </SurfaceCard>
    </motion.div>
  );
}
