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
    avatarBg: "bg-[#1D4ED8]",
  },
  {
    name: "Alex",
    preview: "DM’d about beta access for his startup ops team.",
    source: "Indie",
    status: "New",
    avatarBg: "bg-[#334155]",
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
      <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-semibold text-[#16A34A]">
        Ready
      </span>
    );
  }
  if (status === "Queued") {
    return (
      <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#2563EB]">
        Queued
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">
      New
    </span>
  );
}

function SourceBadge({ source }: { source: LeadItem["source"] }) {
  if (source === "Reddit") {
    return (
      <span className="rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[11px] font-semibold text-[#C2410C]">
        Reddit
      </span>
    );
  }
  if (source === "X") {
    return (
      <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#374151]">
        X
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">
      Indie
    </span>
  );
}

function Row({ item }: { item: LeadItem }) {
  return (
    <div
      className={`group flex cursor-default items-center gap-3.5 border-b border-[#F0F0F0] px-4 py-3 transition-colors last:border-0 sm:gap-4 sm:px-5 sm:py-3.5 ${
        item.active ? "bg-[#EFF6FF]" : "bg-white hover:bg-[#FAFAFA]"
      }`}
    >
      <span
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 sm:h-10 sm:w-10 sm:text-xs ${item.active ? "ring-[#BFDBFE]" : "ring-[#F3F4F6]"} ${item.avatarBg}`}
      >
        {item.name.slice(0, 1)}
        {item.unread && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-[#16A34A]" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-[14px] font-semibold text-[#0A0A0A] sm:text-[15px]">
            {item.name}
          </p>
          <SourceBadge source={item.source} />
        </div>
        <p className="mt-0.5 truncate text-[13px] text-[#64748B] sm:text-[14px]">
          {item.preview}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusPill status={item.status} />
        {item.active && (
          <span className="rounded-full bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white sm:text-xs">
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
      className="border-b border-[#ECECEC] bg-white py-16 sm:py-20 md:py-24"
    >
      <FadeUp>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
          Inside the product
        </p>
        <h2 className="mt-3 max-w-[40rem] text-balance text-[1.875rem] font-semibold leading-[1.12] tracking-tight text-[#0A0A0A] sm:text-[2.25rem] lg:text-[2.5rem]">
          See interested users. Approve messages. Start conversations.
        </h2>
        <p className="mt-4 max-w-[36rem] text-pretty text-[17px] leading-relaxed text-[#374151] sm:text-lg">
          No bloated CRM. No messy spreadsheets. Just the people worth talking
          to.
        </p>
      </FadeUp>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-6%" }}
        transition={{ duration: 0.52, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-10 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] shadow-[0_4px_6px_rgba(15,23,42,0.04),0_24px_48px_-20px_rgba(15,23,42,0.16)] sm:mt-12 lg:rounded-[1.25rem]"
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <Dot />
            <Dot />
            <Dot live />
          </div>
          <span className="text-[13px] font-medium text-[#64748B]">
            tractionflo.app
          </span>
          <div className="w-10 shrink-0" aria-hidden />
        </div>

        <div className="grid lg:min-h-[480px] lg:grid-cols-[minmax(0,248px)_minmax(0,1fr)_minmax(0,400px)]">
          <aside className="hidden border-r border-[#E5E7EB] bg-white lg:block">
            <div className="border-b border-[#F0F0F0] px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                Workspace
              </p>
              <p className="mt-2 text-[15px] font-semibold text-[#0A0A0A]">
                My launch
              </p>
            </div>
            <nav className="p-3">
              {[
                { name: "Inbox", active: true, unread: 5 },
                { name: "Leads", active: false, unread: 2 },
                { name: "Sent", active: false, unread: 0 },
                { name: "Skipped", active: false, unread: 0 },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`mb-1 flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[15px] transition-colors ${
                    item.active
                      ? "bg-[#EFF6FF] font-semibold text-[#2563EB]"
                      : "font-medium text-[#475569] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <span>{item.name}</span>
                  {item.unread > 0 && (
                    <span
                      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                        item.active
                          ? "bg-[#2563EB] text-white"
                          : "bg-[#EEF2FF] text-[#4338CA]"
                      }`}
                    >
                      {item.unread}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          <div className="border-b border-[#E5E7EB] bg-white lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] px-5 py-3.5 sm:px-6">
              <h3 className="text-[15px] font-semibold text-[#0A0A0A]">
                Leads
              </h3>
              <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-[12px] font-semibold text-[#1D4ED8]">
                5 queued
              </span>
            </div>
            <div className="max-h-[min(52vh,360px)] overflow-y-auto lg:max-h-none">
              {leads.map((item) => (
                <Row key={item.name} item={item} />
              ))}
            </div>
          </div>

          <div className="bg-[#F1F5F9] p-5 sm:p-6 lg:p-7">
            <div className="rounded-xl border border-[#BFDBFE] bg-white p-5 shadow-[0_12px_32px_-16px_rgba(37,99,235,0.45)] ring-1 ring-[#2563EB]/12 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2563EB]">
                    Message
                  </p>
                  <p className="mt-1.5 text-[15px] font-semibold text-[#0A0A0A]">
                    Draft for Marcus
                  </p>
                </div>
                <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1 text-[12px] font-semibold text-[#16A34A]">
                  Ready
                </span>
              </div>
              <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 sm:p-5">
                <p className="text-[15px] leading-relaxed text-[#334155] sm:text-[16px]">
                  Hey Marcus — saw your post in r/landlords. Built something for
                  this. Happy to share if useful.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-[14px] font-semibold text-[#0A0A0A] transition-colors hover:border-[#BFDBFE] hover:bg-[#EFF6FF]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center rounded-xl px-4 text-[14px] font-semibold text-[#64748B] transition-colors hover:text-[#0A0A0A]"
                >
                  Skip
                </button>
              </div>
              <p className="mt-4 text-[13px] font-medium text-[#64748B]">
                Nothing sends without you.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
