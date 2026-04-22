"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LeadItem = {
  name: string;
  preview: string;
  source: "Reddit" | "X" | "Indie";
  status: "New" | "Queued" | "Ready";
  unread?: boolean;
  avatarBg: string;
};

const leads: LeadItem[] = [
  {
    name: "Marcus",
    preview: "Looking for a tool to manage tenants this month...",
    source: "Reddit",
    status: "Ready",
    unread: true,
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

export function ProductDemo() {
  const [selectedLead, setSelectedLead] = useState("Marcus");
  const [rowHighlight, setRowHighlight] = useState(false);
  const [panelFocus, setPanelFocus] = useState(false);
  const [approveGlow, setApproveGlow] = useState(false);
  const [approvePressed, setApprovePressed] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [queueCount, setQueueCount] = useState(5);
  const [livePulse, setLivePulse] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const resetDemo = () => {
    setSelectedLead("Marcus");
    setRowHighlight(false);
    setPanelFocus(false);
    setApproveGlow(false);
    setApprovePressed(false);
    setApproveLoading(false);
    setSent(false);
    setShowSuccess(false);
    setShowToast(false);
    setQueueCount(5);
    setLivePulse(false);
  };

  const completeApprove = () => {
    setApprovePressed(false);
    setApproveLoading(false);
    setSent(true);
    setShowSuccess(true);
    setShowToast(true);
    setQueueCount(4);
    setPanelFocus(true);
    setRowHighlight(true);
    setLivePulse(true);
    timers.current.push(
      window.setTimeout(() => {
        setShowToast(false);
      }, 1800),
    );
    timers.current.push(
      window.setTimeout(() => {
        setLivePulse(false);
      }, 2400),
    );
  };

  const triggerApprove = () => {
    if (approveLoading || sent) return;
    setApproveGlow(true);
    setApprovePressed(true);
    setApproveLoading(true);
    timers.current.push(
      window.setTimeout(() => {
        completeApprove();
      }, 540),
    );
  };

  const runDemo = () => {
    resetDemo();
    timers.current.push(window.setTimeout(() => setRowHighlight(true), 500));
    timers.current.push(window.setTimeout(() => setPanelFocus(true), 1500));
    timers.current.push(window.setTimeout(() => setApproveGlow(true), 2500));
    timers.current.push(window.setTimeout(() => triggerApprove(), 3500));
  };

  useEffect(() => {
    runDemo();
    const loop = window.setInterval(() => {
      clearTimers();
      runDemo();
    }, 7600);

    return () => {
      window.clearInterval(loop);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeLead = useMemo(
    () => leads.find((l) => l.name === selectedLead) ?? leads[0],
    [selectedLead],
  );

  const onApprove = () => triggerApprove();

  return (
    <>
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

      <div className="grid lg:min-h-[520px] lg:grid-cols-[minmax(0,250px)_minmax(0,1fr)_minmax(0,420px)]">
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
            <h3 className="text-[15px] font-semibold text-[#0A0A0A]">Leads</h3>
            <span
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition-all duration-300 ${
                sent
                  ? "border-[#93C5FD] bg-[#EFF6FF] text-[#1D4ED8]"
                  : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              }`}
            >
              {queueCount} queued
            </span>
          </div>
          <div className="max-h-[min(52vh,360px)] overflow-y-auto lg:max-h-none">
            {leads.map((item) => {
              const isActive = item.name === selectedLead;
              const isMarcus = item.name === "Marcus";
              const rowSent = sent && isMarcus;
              const spotlight = isActive && rowHighlight;
              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setSelectedLead(item.name)}
                  className={`group flex w-full cursor-pointer items-center gap-3.5 border-b border-[#F0F0F0] px-4 py-3 text-left transition-all last:border-0 sm:gap-4 sm:px-5 sm:py-3.5 ${
                    spotlight
                      ? "bg-[#EFF6FF] ring-1 ring-inset ring-[#2563EB]/20 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08),0_10px_26px_-18px_rgba(37,99,235,0.52)]"
                      : rowSent
                        ? "bg-[#F8FAFC] opacity-85"
                      : isActive
                        ? "bg-[#EFF6FF]"
                        : "bg-white hover:bg-[#FAFAFA]"
                  }`}
                >
                  <span
                    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 sm:h-10 sm:w-10 sm:text-xs ${
                      isActive ? "ring-[#BFDBFE]" : "ring-[#F3F4F6]"
                    } ${item.avatarBg}`}
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
                    <p className="mt-0.5 line-clamp-2 break-words text-[13px] text-[#64748B] sm:truncate sm:text-[14px]">
                      {item.preview}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill status={item.status} />
                    {rowSent ? (
                      <span className="rounded-full border border-[#86EFAC] bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-semibold text-[#15803D] sm:text-xs">
                        Sent
                      </span>
                    ) : isActive ? (
                      <span className="rounded-full bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white sm:text-xs">
                        Open
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#EEF4FC] to-[#EDF2F8] p-5 sm:p-6 lg:p-7">
          <div
            className={`relative rounded-xl border border-[#BFDBFE]/80 bg-white p-5 ring-1 ring-[#2563EB]/14 transition-all duration-300 sm:p-6 ${
              panelFocus
                ? "scale-[1.02] brightness-[1.01] shadow-[0_28px_60px_-22px_rgba(37,99,235,0.56)]"
                : "shadow-[0_16px_36px_-20px_rgba(15,23,42,0.22)]"
            }`}
          >
            <div
              className={`absolute right-4 top-3 z-20 flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-white/95 px-3 py-1 text-[12px] font-medium text-[#15803D] shadow-[0_8px_20px_-14px_rgba(22,163,74,0.45)] transition-all duration-300 ${
                showToast
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-1 opacity-0 pointer-events-none"
              }`}
              aria-live="polite"
            >
              <span
                className={`h-2 w-2 rounded-full bg-[#16A34A] ${
                  livePulse ? "animate-pulse" : ""
                }`}
                aria-hidden
              />
              Message approved
            </div>

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2563EB]">
                  Message
                </p>
                <p className="mt-1.5 text-[15px] font-semibold text-[#0A0A0A]">
                  Draft for {activeLead.name}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-all duration-300 ${
                  sent
                    ? "border-[#86EFAC] bg-[#DCFCE7] text-[#15803D]"
                    : "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]"
                }`}
              >
                {sent ? "Sent" : "Ready"}
              </span>
            </div>
            <div
              className={`mt-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 transition-all duration-300 sm:p-5 ${
                sent ? "opacity-75" : "opacity-100"
              }`}
            >
              <p className="text-[15px] leading-relaxed text-[#334155] sm:text-[16px]">
                Hey Marcus — saw your post in r/landlords. Built something for
                this. Happy to share if useful.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onApprove}
                disabled={approveLoading || sent}
                className={`inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-[#1D4ED8] ${
                  approvePressed ? "scale-[0.96]" : "scale-100"
                } ${
                  approveGlow
                    ? "shadow-[0_0_0_1px_rgba(37,99,235,0.25),0_0_0_8px_rgba(37,99,235,0.14),0_20px_36px_-20px_rgba(37,99,235,0.65)]"
                    : ""
                } disabled:cursor-not-allowed disabled:opacity-80`}
              >
                {approveLoading ? "Sending..." : sent ? "Sent" : "Approve"}
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

            {/* Optional subtle cursor indicator for demo guidance */}
            <span
              className={`pointer-events-none absolute left-[4.7rem] top-[16.45rem] h-2.5 w-2.5 rounded-full bg-white ring-2 ring-[#2563EB]/65 transition-all duration-300 ${
                approveGlow ? "opacity-90" : "opacity-0"
              }`}
              aria-hidden
            />

            <div
              className={`mt-3 flex items-center gap-2 text-[13px] font-medium text-[#16A34A] transition-opacity duration-300 ${
                showSuccess ? "opacity-100" : "opacity-0"
              }`}
              aria-live="polite"
            >
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#DCFCE7] text-[12px]"
                aria-hidden
              >
                ✓
              </span>
              Message sent.
            </div>
            <button
              type="button"
              onClick={() => {
                clearTimers();
                runDemo();
              }}
              className="mt-2 text-[12px] font-medium text-[#2563EB]/80 transition-colors hover:text-[#1D4ED8]"
            >
              Replay demo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
