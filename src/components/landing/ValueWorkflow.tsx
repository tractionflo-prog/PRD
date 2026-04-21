"use client";

import { motion } from "framer-motion";
import { IconArrowRight } from "./icons";

function MiniInput() {
  return (
    <div className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2563EB]">
        Product
      </p>
      <p className="mt-1 text-[13px] leading-snug text-[#0A0A0A]">
        Workflow tool for small landlord teams.
      </p>
    </div>
  );
}

function LeadStackCard({
  initials,
  label,
  tone,
  offset,
}: {
  initials: string;
  label: string;
  tone: string;
  offset: string;
}) {
  return (
    <div
      className={`relative rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 shadow-sm ${offset}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white ${tone}`}
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-[#0A0A0A]">
            {label}
          </p>
          <div className="mt-1 h-1 w-[55%] rounded-full bg-[#E5E7EB]" />
        </div>
        <span className="rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">
          Lead
        </span>
      </div>
    </div>
  );
}

function MiniLeads() {
  return (
    <div className="relative h-[126px]">
      <LeadStackCard
        initials="MA"
        label="r/landlords"
        tone="bg-[#2563EB]"
        offset="z-30"
      />
      <LeadStackCard
        initials="NO"
        label="x.com founder"
        tone="bg-[#7C3AED]"
        offset="z-20 -mt-7 ml-3"
      />
      <LeadStackCard
        initials="IB"
        label="indiehackers"
        tone="bg-[#57534E]"
        offset="z-10 -mt-7 ml-6"
      />
    </div>
  );
}

function MiniApprove() {
  return (
    <div className="rounded-lg border border-[#BFDBFE] bg-white p-3.5 shadow-[0_8px_20px_-14px_rgba(37,99,235,0.3)] ring-1 ring-[#2563EB]/10">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#16A34A]">
          Ready
        </p>
        <span className="text-[11px] text-[#9CA3AF]">Draft</span>
      </div>
      <p className="mt-2 text-[12px] leading-snug text-[#374151]">
        Hey Marcus — saw your post in r/landlords...
      </p>
      <div className="mt-3 flex gap-2">
        <span className="rounded-md bg-[#2563EB] px-2.5 py-1 text-[11px] font-medium text-white">
          Approve
        </span>
        <span className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] text-[#6B7280]">
          Edit
        </span>
      </div>
    </div>
  );
}

export function ValueWorkflow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="mt-14 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:mt-16 sm:px-8 sm:py-10 lg:mt-20"
    >
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7C3AED]">
        How it flows
      </p>
      <div className="mt-8 flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex-1 lg:max-w-[220px]">
          <MiniInput />
        </div>
        <div className="flex justify-center text-[#2563EB]/50 lg:flex-none">
          <IconArrowRight className="rotate-90 lg:rotate-0" />
        </div>
        <div className="flex-1 lg:max-w-[250px]">
          <p className="mb-2 text-center text-[12px] font-medium text-[#6B7280] lg:text-left">
            Leads surfaced
          </p>
          <MiniLeads />
        </div>
        <div className="flex justify-center text-[#2563EB]/50 lg:flex-none">
          <IconArrowRight className="rotate-90 lg:rotate-0" />
        </div>
        <div className="flex-1 lg:max-w-[225px]">
          <p className="mb-2 text-center text-[12px] font-medium text-[#6B7280] lg:text-left">
            You approve
          </p>
          <MiniApprove />
        </div>
      </div>
    </motion.div>
  );
}
