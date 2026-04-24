"use client";

import { cn } from "@/lib/cn";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type LeadItem = {
  name: string;
  preview: string;
  source: "Reddit";
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
    avatarBg: "bg-[#635bff]",
  },
  {
    name: "Rina",
    preview: "Posted in r/SaaS — drowning in follow-ups after demos.",
    source: "Reddit",
    status: "Queued",
    unread: true,
    avatarBg: "bg-[#5851ea]",
  },
  {
    name: "Alex",
    preview: "Asked r/startups for a simple ops checklist — sounds stuck.",
    source: "Reddit",
    status: "New",
    avatarBg: "bg-[#334155]",
  },
];

/** Draft copy for the right-hand “chat” panel — loops type / delete until approved. */
const MESSAGE_DRAFT_BY_LEAD: Record<string, string> = {
  Marcus:
    "Hey Marcus — saw your post in r/landlords. Built something for this. Happy to share if useful.",
  Rina:
    "Hey Rina — that pile of follow-ups after demos is brutal. How are you keeping threads from slipping this week?",
  Alex:
    "Hey Alex — saw your r/startups thread on ops checklists. Curious what has been the stickiest part day to day?",
};

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
      <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-semibold text-[#16A34A] transition-[background-color,border-color,color] duration-[400ms] ease-out">
        Ready
      </span>
    );
  }
  if (status === "Queued") {
    return (
      <span className="rounded-full border border-[#e9d5ff] bg-[#f5f3ff] px-2 py-0.5 text-[11px] font-semibold text-[#635bff] transition-[background-color,border-color,color] duration-[400ms] ease-out">
        Queued
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#475569] transition-[background-color,border-color,color] duration-[400ms] ease-out">
      New
    </span>
  );
}

function SourceBadge() {
  return (
    <span className="rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#C2410C]">
      Real conversations
    </span>
  );
}

/**
 * Instantly-style loop in the message bubble: type forward → brief pause →
 * delete backward → brief pause → repeat. Runs on load so the chat area
 * always shows motion until the draft is “frozen” (e.g. after Approve).
 */
function MessageDraftTypewriter({ text, frozen }: { text: string; frozen: boolean }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState("");
  const timeoutRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const clearTimer = () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const schedule = (fn: () => void, ms: number) => {
      clearTimer();
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        if (!cancelledRef.current) fn();
      }, ms);
    };

    if (reduceMotion || frozen) {
      clearTimer();
      setShown(text);
      return () => {
        cancelledRef.current = true;
        clearTimer();
      };
    }

    let len = 0;
    let phase: "in" | "pauseFull" | "out" | "pauseEmpty" = "in";

    const step = () => {
      if (cancelledRef.current) return;

      if (phase === "in") {
        if (len < text.length) {
          len += 1;
          setShown(text.slice(0, len));
          schedule(step, 36 + (len % 5) * 6);
          return;
        }
        phase = "pauseFull";
        schedule(() => {
          phase = "out";
          step();
        }, 1500);
        return;
      }

      if (phase === "out") {
        if (len > 0) {
          len -= 1;
          setShown(text.slice(0, len));
          schedule(step, 24 + (len % 4) * 4);
          return;
        }
        phase = "pauseEmpty";
        schedule(() => {
          len = 0;
          setShown("");
          phase = "in";
          step();
        }, 950);
      }
    };

    len = 0;
    setShown("");
    phase = "in";
    schedule(step, 500);

    return () => {
      cancelledRef.current = true;
      clearTimer();
    };
  }, [text, frozen, reduceMotion]);

  const showCaret = !reduceMotion && !frozen;

  return (
    <p className="min-h-[4.5rem] text-[15px] leading-relaxed text-[#475569] sm:min-h-[5rem] sm:text-[16px]">
      {shown}
      {showCaret ? (
        <span
          className="ml-px inline-block h-[1.15em] w-[2px] translate-y-px animate-pulse bg-[#635bff]/55 align-middle motion-reduce:hidden"
          aria-hidden
        />
      ) : null}
    </p>
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

  const draftMessage = useMemo(
    () => MESSAGE_DRAFT_BY_LEAD[activeLead.name] ?? MESSAGE_DRAFT_BY_LEAD["Marcus"],
    [activeLead.name],
  );

  const onApprove = () => triggerApprove();

  return (
    <>
      <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-white px-5 py-3.5 sm:px-6">
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
        <aside className="hidden border-r border-[#e2e8f0] bg-white lg:block">
          <div className="border-b border-[#e2e8f0] px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
              Workspace
            </p>
            <p className="mt-2 text-[15px] font-semibold text-[#0f172a]">
              My launch
            </p>
          </div>
          <nav className="p-3">
            {[
              { name: "Inbox", active: true, unread: 5 },
              { name: "People likely facing this problem", active: false, unread: 2 },
              { name: "Sent", active: false, unread: 0 },
              { name: "Skipped", active: false, unread: 0 },
            ].map((item) => (
              <div
                key={item.name}
                className={`mb-1 flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[15px] transition-colors ${
                  item.active
                    ? "bg-[rgba(99,91,255,0.08)] font-semibold text-[#635bff]"
                    : "font-medium text-[#64748b] can-hover:hover:bg-[#fafafa]"
                }`}
              >
                <span>{item.name}</span>
                {item.unread > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                      item.active
                        ? "bg-[#635bff] text-white"
                        : "bg-[#f5f3ff] text-[#635bff]"
                    }`}
                  >
                    {item.unread}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <div className="border-b border-[#e2e8f0] bg-white lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-3.5 sm:px-6">
            <h3 className="text-[15px] font-semibold text-[#0f172a]">
              People likely facing this problem
            </h3>
            <span
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition-[background-color,border-color,color] duration-[400ms] ease-out ${
                sent
                  ? "border-[#ddd6fe] bg-[#f5f3ff] text-[#635bff]"
                  : "border-[#e9d5ff] bg-[#faf5ff] text-[#635bff]"
              }`}
            >
              {queueCount} demand signals
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
                  className={`group flex w-full cursor-pointer items-center gap-3.5 border-b border-[#f1f5f9] px-4 py-3 text-left transition-[background-color,box-shadow,transform,opacity] duration-300 ease-out last:border-0 sm:gap-4 sm:px-5 sm:py-3.5 ${
                    spotlight
                      ? "-translate-y-px bg-[#faf5ff] shadow-[inset_0_0_0_1px_rgba(99,91,255,0.1),0_14px_32px_-18px_rgba(99,91,255,0.2)] ring-1 ring-inset ring-[#635bff]/15"
                      : rowSent
                        ? "bg-[#f8fafc] opacity-85"
                      : isActive
                        ? "bg-[#faf5ff]"
                        : "bg-white can-hover:hover:bg-[#fafafa]"
                  }`}
                >
                  <span
                    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 sm:h-10 sm:w-10 sm:text-xs ${
                      isActive ? "ring-[#ddd6fe]" : "ring-[#f1f5f9]"
                    } ${item.avatarBg}`}
                  >
                    {item.name.slice(0, 1)}
                    {item.unread && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-[#16A34A]" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-[14px] font-semibold text-[#0f172a] sm:text-[15px]">
                        {item.name}
                      </p>
                      <SourceBadge />
                    </div>
                    <p className="mt-0.5 line-clamp-2 break-words text-[13px] text-[#64748B] sm:truncate sm:text-[14px]">
                      {item.preview}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill status={item.status} />
                    {rowSent ? (
                      <span className="rounded-full border border-[#86EFAC] bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-semibold text-[#15803D] sm:text-xs">
                        Approved
                      </span>
                    ) : isActive ? (
                      <span className="rounded-full bg-[#635bff] px-2.5 py-1 text-[11px] font-semibold text-white sm:text-xs">
                        Open
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[#fafafa] p-5 sm:p-6 lg:p-7">
          <div
            className={`relative rounded-xl border border-[#e2e8f0] bg-white p-5 ring-1 ring-[#635bff]/10 transition-[transform,box-shadow,filter,background-color] duration-[420ms] ease-out sm:p-6 ${
              panelFocus
                ? "scale-[1.01] shadow-[0_24px_60px_-24px_rgba(99,91,255,0.18)]"
                : "shadow-[0_16px_48px_-28px_rgba(15,23,42,0.08)]"
            }`}
          >
            <div
              className={`absolute right-4 top-3 z-20 flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-white/95 px-3 py-1 text-[12px] font-medium text-[#15803D] shadow-[0_8px_20px_-14px_rgba(22,163,74,0.45)] transition-[transform,opacity] duration-[420ms] ease-out motion-reduce:transition-none ${
                showToast
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-1.5 opacity-0"
              }`}
              aria-live="polite"
            >
              <span
                className={`h-2 w-2 rounded-full bg-[#16A34A] ${
                  livePulse ? "animate-pulse" : ""
                }`}
                aria-hidden
              />
              Starter ready
            </div>

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#635bff]">
                  Message draft
                </p>
                <p className="mt-1.5 text-[15px] font-semibold text-[#0f172a]">
                  For {activeLead.name}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-[background-color,border-color,color] duration-[400ms] ease-out ${
                  sent
                    ? "border-[#86EFAC] bg-[#DCFCE7] text-[#15803D]"
                    : "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]"
                }`}
              >
                {sent ? "Approved" : "Ready"}
              </span>
            </div>
            <div
              className={`mt-5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 transition-[opacity,background-color] duration-[400ms] ease-out sm:p-5 ${
                sent ? "opacity-75" : "opacity-100"
              }`}
            >
              <MessageDraftTypewriter text={draftMessage} frozen={sent} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onApprove}
                disabled={approveLoading || sent}
                className={cn(
                  "inline-flex h-10 items-center rounded-xl bg-[#635bff] px-4 text-[14px] font-semibold text-white transition-[transform,box-shadow,background-color] duration-200 ease-out can-hover:hover:bg-[#5851ea]",
                  approvePressed ? "scale-[0.96]" : "scale-100",
                  approveGlow &&
                    !approveLoading &&
                    !sent &&
                    "shadow-[0_0_0_1px_rgba(99,91,255,0.25),0_0_0_8px_rgba(99,91,255,0.12),0_20px_36px_-20px_rgba(99,91,255,0.35)] motion-safe:demo-approve-pulse",
                  "disabled:cursor-not-allowed disabled:opacity-80",
                )}
              >
                {approveLoading ? "Saving…" : sent ? "Approved" : "Approve"}
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-xl border border-[#e2e8f0] bg-white px-4 text-[14px] font-semibold text-[#0f172a] transition-[border-color,background-color] duration-200 ease-out can-hover:hover:border-[#e9d5ff] can-hover:hover:bg-[#faf5ff]"
              >
                Edit
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-xl px-4 text-[14px] font-semibold text-[#64748b] transition-colors duration-200 ease-out can-hover:hover:text-[#0f172a]"
              >
                Skip
              </button>
            </div>
            <p className="mt-4 text-[13px] font-medium text-[#64748B]">
              Nothing sends from Tractionflo — you copy, edit, and send yourself.
            </p>

            {/* Optional subtle cursor indicator for demo guidance */}
            <span
              className={`pointer-events-none absolute left-[4.7rem] top-[16.45rem] h-2.5 w-2.5 rounded-full bg-white ring-2 ring-[#635bff]/55 transition-all duration-300 ${
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
              Draft saved — copy and send from your own account.
            </div>
            <button
              type="button"
              onClick={() => {
                clearTimers();
                runDemo();
              }}
              className="mt-2 text-[12px] font-medium text-[#635bff]/85 transition-colors duration-200 ease-out can-hover:hover:text-[#5851ea]"
            >
              Replay demo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
