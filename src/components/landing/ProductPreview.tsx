"use client";

import { motion } from "framer-motion";
import { FadeUp } from "./FadeUp";
import { Section } from "./Section";

type LeadItem = {
  name: string;
  preview: string;
  source: "Reddit" | "X" | "Indie";
  status: "New" | "Queued" | "Ready";
  unread?: boolean;
  active?: boolean;
  avatarBg: string;
};

const leads: LeadItem[] = [
  {
    name: "Marcus",
    preview: "Looking for a tool to manage tenants this month...",
    source: "Reddit",
    status: "Ready",
    unread: true,
    active: true,
    avatarBg: "bg-[#2563EB]",
  },
  {
    name: "Rina",
    preview: "Posted in r/SaaS about CRM overload and no follow-up.",
    source: "X",
    status: "Queued",
    unread: true,
    avatarBg: "bg-[#7C3AED]",
  },
  {
    name: "Alex",
    preview: "DM’d about beta access for his startup ops team.",
    source: "Indie",
    status: "New",
    avatarBg: "bg-[#57534E]",
  },
];

function Dot({ live }: { live?: boolean }) {
  return (
    <span
      className={`h-2 w-2 rounded-full ${live ? "bg-[#16A34A]" : "bg-[#D1D5DB]"}`}
      aria-hidden
    />
  );
}

function StatusPill({ status }: { status: LeadItem["status"] }) {
  if (status === "Ready") {
    return (
      <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A]">
        Ready
      </span>
    );
  }
  if (status === "Queued") {
    return (
      <span className="rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">
        Queued
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
      New
    </span>
  );
}

function SourceBadge({ source }: { source: LeadItem["source"] }) {
  if (source === "Reddit") {
    return (
      <span className="rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold text-[#C2410C]">
        Reddit
      </span>
    );
  }
  if (source === "X") {
    return (
      <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[10px] font-semibold text-[#374151]">
        X
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
      Indie
    </span>
  );
}

function Row({ item }: { item: LeadItem }) {
  return (
    <div
      className={`group flex cursor-default items-center gap-3 border-b border-[#F0F0F0] px-3 py-2.5 transition-colors last:border-0 sm:px-4 ${
        item.active ? "bg-[#EFF6FF]" : "bg-white hover:bg-[#FAFAFA]"
      }`}
    >
      <span
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ${item.active ? "ring-[#BFDBFE]" : "ring-[#F3F4F6]"} ${item.avatarBg}`}
      >
        {item.name.slice(0, 1)}
        {item.unread && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-[#16A34A]" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] font-medium text-[#0A0A0A]">
            {item.name}
          </p>
          <SourceBadge source={item.source} />
        </div>
        <p className="truncate text-[12px] text-[#9CA3AF]">{item.preview}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <StatusPill status={item.status} />
        {item.active && (
          <span className="shrink-0 rounded-full bg-[#2563EB] px-2 py-0.5 text-[10px] font-medium text-white">
            Open
          </span>
        )}
      </div>
    </div>
  );
}

export function ProductPreview() {
  return (
    <Section
      id="preview"
      className="border-b border-[#ECECEC] bg-white py-20 sm:py-24 md:py-28 lg:py-32"
    >
      <FadeUp>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7C3AED]">
          Inside the product
        </p>
        <h2 className="mt-3 max-w-xl text-[1.75rem] font-semibold leading-tight tracking-tight text-[#0A0A0A] sm:text-3xl lg:text-[2rem]">
          One calm place to review users and messages.
        </h2>
      </FadeUp>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-12 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_32px_64px_-32px_rgba(15,23,42,0.14)] lg:mt-16"
      >
        <div className="flex items-center justify-between border-b border-[#ECECEC] bg-white px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <Dot />
            <Dot />
            <Dot live />
          </div>
          <span className="text-[12px] font-medium text-[#9CA3AF]">
            tractionflo.app
          </span>
          <div className="w-10" />
        </div>

        <div className="grid lg:min-h-[420px] lg:grid-cols-[220px_1fr_340px]">
          <aside className="hidden border-r border-[#ECECEC] bg-white lg:block">
            <div className="border-b border-[#F0F0F0] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Workspace
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[#0A0A0A]">
                My launch
              </p>
            </div>
            <nav className="p-2">
              {[
                { name: "Inbox", active: true, unread: 5 },
                { name: "Leads", active: false, unread: 2 },
                { name: "Sent", active: false, unread: 0 },
                { name: "Skipped", active: false, unread: 0 },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`mb-0.5 flex items-center justify-between rounded-lg px-3 py-2 text-[14px] transition-colors ${
                    item.active
                      ? "bg-[#EFF6FF] font-medium text-[#2563EB]"
                      : "text-[#6B7280] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <span>{item.name}</span>
                  {item.unread > 0 && (
                    <span
                      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                        item.active
                          ? "bg-[#2563EB] text-white"
                          : "bg-[#F5F3FF] text-[#7C3AED]"
                      }`}
                    >
                      {item.unread}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          <div className="border-b border-[#ECECEC] bg-white lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] px-4 py-3 sm:px-5">
              <h3 className="text-[14px] font-semibold text-[#0A0A0A]">
                Leads
              </h3>
              <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#7C3AED]">
                5 queued
              </span>
            </div>
            <div className="max-h-[280px] overflow-y-auto lg:max-h-none">
              {leads.map((item) => (
                <Row key={item.name} item={item} />
              ))}
            </div>
          </div>

          <div className="bg-[#FAFAFA] p-4 sm:p-5">
            <div className="rounded-xl border border-[#BFDBFE] bg-white p-4 shadow-[0_8px_24px_-16px_rgba(37,99,235,0.35)] ring-1 ring-[#2563EB]/15 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7C3AED]">
                    Message
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-[#0A0A0A]">
                    Draft for Marcus
                  </p>
                </div>
                <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-semibold text-[#16A34A]">
                  Ready
                </span>
              </div>
              <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-3.5">
                <p className="text-[14px] leading-relaxed text-[#374151]">
                  Hey Marcus — saw your post in r/landlords. Built something for
                  this. Happy to share if useful.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-lg bg-[#2563EB] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] transition-colors hover:border-[#BFDBFE] hover:bg-[#EFF6FF]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A]"
                >
                  Skip
                </button>
              </div>
              <p className="mt-3 text-[12px] text-[#9CA3AF]">
                Nothing sends without you.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
