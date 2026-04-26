"use client";

import { cn } from "@/lib/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
        Ready to reach
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
    <span className="rounded-full border border-amber-200/90 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
      Live conversation
    </span>
  );
}

type DemoSystemStatus = "scanning" | "found" | "drafting" | "ready" | "done";

function systemStatusCopy(status: DemoSystemStatus): string {
  switch (status) {
    case "scanning":
      return "Scanning conversations…";
    case "found":
      return "Found 12 matches";
    case "drafting":
      return "Drafting message…";
    case "ready":
      return "Ready — review and send yourself";
    case "done":
      return "Saved — copy when you’re ready";
    default:
      return "";
  }
}

function splitDraftForHighlight(text: string): { lead: string; rest: string } {
  const em = text.indexOf(" — ");
  if (em > 0) return { lead: text.slice(0, em), rest: text.slice(em) };
  const dot = text.indexOf(". ");
  if (dot > 0) return { lead: text.slice(0, dot + 1), rest: text.slice(dot + 1) };
  return { lead: text, rest: "" };
}

function DraftWithHighlight({ text }: { text: string }) {
  const { lead, rest } = splitDraftForHighlight(text);
  return (
    <>
      <span className="font-medium text-slate-900">{lead}</span>
      {rest ? <span className="text-slate-600">{rest}</span> : null}
    </>
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
    <p className="min-h-[4.5rem] text-[15px] leading-[1.65] text-slate-600 sm:min-h-[5rem] sm:text-[16px] sm:leading-relaxed">
      <DraftWithHighlight text={shown} />
      {showCaret ? (
        <span
          className="ml-px inline-block h-[1.15em] w-[2px] translate-y-px animate-pulse bg-indigo-500/55 align-middle motion-reduce:hidden"
          aria-hidden
        />
      ) : null}
    </p>
  );
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export function ProductDemo() {
  const reduceMotion = useReducedMotion();
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
  const [systemStatus, setSystemStatus] = useState<DemoSystemStatus>("scanning");
  const [copyFlash, setCopyFlash] = useState(false);
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
    setSystemStatus("scanning");
    setCopyFlash(false);
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
    setSystemStatus("done");
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
    timers.current.push(
      window.setTimeout(() => {
        setRowHighlight(true);
        setSystemStatus("found");
      }, 500),
    );
    timers.current.push(window.setTimeout(() => setSystemStatus("drafting"), 1100));
    timers.current.push(window.setTimeout(() => setPanelFocus(true), 1500));
    timers.current.push(window.setTimeout(() => setSystemStatus("ready"), 2100));
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

  const handleCopyDraft = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(draftMessage);
      setCopyFlash(true);
      timers.current.push(
        window.setTimeout(() => {
          setCopyFlash(false);
        }, 1600),
      );
    } catch {
      setCopyFlash(true);
      timers.current.push(
        window.setTimeout(() => {
          setCopyFlash(false);
        }, 1600),
      );
    }
  }, [draftMessage]);

  const leadListVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.09,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  };

  const leadRowVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.32, ease: easeOut },
    },
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-2">
          <Dot />
          <Dot />
          <Dot live />
        </div>
        <span className="text-sm font-medium text-slate-500">tractionflo.app</span>
        <div className="w-10 shrink-0" aria-hidden />
      </div>

      <div
        className="relative flex min-h-[2.75rem] items-center border-b border-slate-100 bg-gradient-to-r from-slate-50/95 via-indigo-50/30 to-slate-50/95 px-4 sm:min-h-10 sm:px-6"
        role="status"
        aria-live="polite"
      >
        <div className="flex w-full items-center gap-2.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 transition-opacity ${
              systemStatus === "scanning" ? "animate-pulse opacity-100" : "opacity-40"
            }`}
            aria-hidden
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={systemStatus}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: easeOut }}
              className="text-[13px] font-medium text-slate-600 sm:text-sm"
            >
              {systemStatusCopy(systemStatus)}
            </motion.p>
          </AnimatePresence>
        </div>
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
              People to talk to
            </h3>
            <span
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition-[background-color,border-color,color] duration-[400ms] ease-out ${
                sent
                  ? "border-[#ddd6fe] bg-[#f5f3ff] text-[#635bff]"
                  : "border-[#e9d5ff] bg-[#faf5ff] text-[#635bff]"
              }`}
            >
              {queueCount} to reach
            </span>
          </div>
          <motion.ul
            className="max-h-[min(52vh,360px)] space-y-0 overflow-y-auto px-1 pb-1 pt-0.5 lg:max-h-none"
            variants={leadListVariants}
            initial="hidden"
            animate="visible"
          >
            {leads.map((item) => {
              const isActive = item.name === selectedLead;
              const isMarcus = item.name === "Marcus";
              const rowSent = sent && isMarcus;
              const spotlight = isActive && rowHighlight;
              return (
                <motion.li key={item.name} variants={leadRowVariants} className="last:[&>button]:rounded-b-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(item.name)}
                    className={cn(
                      "group flex w-full cursor-pointer items-center gap-3.5 border-b border-slate-100 px-3 py-3 text-left transition-[background-color,box-shadow,transform,opacity,border-color] duration-200 ease-out last:border-0 sm:gap-4 sm:px-4 sm:py-3.5",
                      "can-hover:hover:-translate-y-0.5 can-hover:hover:shadow-md",
                      !isActive &&
                        "opacity-[0.78] contrast-[0.96] can-hover:opacity-95 can-hover:contrast-100",
                      isActive &&
                        "relative z-[1] rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-white shadow-[0_14px_40px_-28px_rgba(79,70,229,0.35)] ring-2 ring-indigo-500/20 sm:scale-[1.02]",
                      spotlight &&
                        isActive &&
                        "shadow-[0_18px_48px_-26px_rgba(79,70,229,0.45),inset_0_0_0_1px_rgba(99,102,241,0.12)]",
                      rowSent && "rounded-xl opacity-90 grayscale-[0.15]",
                      !isActive &&
                        "can-hover:border-slate-200/80 can-hover:bg-slate-50/80",
                    )}
                  >
                    <span
                      className={cn(
                        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 sm:h-10 sm:w-10 sm:text-xs",
                        isActive ? "ring-indigo-300 shadow-inner shadow-indigo-900/10" : "ring-slate-100",
                        item.avatarBg,
                      )}
                    >
                      {item.name.slice(0, 1)}
                      {item.unread ? (
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p
                          className={cn(
                            "truncate text-sm font-semibold sm:text-[15px]",
                            isActive ? "text-slate-900" : "text-slate-700",
                          )}
                        >
                          {item.name}
                        </p>
                        <SourceBadge />
                      </div>
                      <p
                        className={cn(
                          "mt-0.5 line-clamp-2 break-words text-[13px] sm:truncate sm:text-sm",
                          isActive ? "text-slate-600" : "text-slate-500",
                        )}
                      >
                        {item.preview}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                      <StatusPill status={item.status} />
                      {rowSent ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 sm:text-xs">
                          Approved
                        </span>
                      ) : isActive ? (
                        <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white sm:text-xs">
                          Selected
                        </span>
                      ) : null}
                    </div>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        <div className="relative border-l border-indigo-100/60 bg-gradient-to-b from-slate-50/95 via-white to-indigo-50/25 p-4 sm:p-6 lg:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-[22%] hidden h-[42%] w-px bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent lg:block"
          />
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border bg-white p-5 transition-[transform,box-shadow,filter,border-color] duration-[420ms] ease-out sm:p-6",
              panelFocus
                ? "scale-[1.01] border-indigo-200/90 shadow-[0_28px_64px_-32px_rgba(79,70,229,0.28)] ring-2 ring-indigo-500/20"
                : "border-slate-200/70 shadow-[0_16px_48px_-32px_rgba(15,23,42,0.1)] ring-1 ring-slate-200/40",
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute bottom-8 left-0 top-24 w-1 rounded-full bg-gradient-to-b from-indigo-500 via-indigo-400 to-indigo-100/0 opacity-90",
                panelFocus ? "opacity-100" : "opacity-40",
              )}
              aria-hidden
            />

            <div
              className={`absolute right-4 top-3 z-20 flex items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm transition-[transform,opacity] duration-[420ms] ease-out motion-reduce:transition-none ${
                showToast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1.5 opacity-0"
              }`}
              aria-live="polite"
            >
              <span
                className={cn("h-2 w-2 rounded-full bg-emerald-500", livePulse && "animate-pulse")}
                aria-hidden
              />
              Starter ready
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeLead.name}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: easeOut, delay: reduceMotion ? 0 : 0.1 }}
                className="relative pl-3 sm:pl-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm ring-2 ring-indigo-200/80",
                        activeLead.avatarBg,
                      )}
                      aria-hidden
                    >
                      {activeLead.name.slice(0, 1)}
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
                        Message for
                      </p>
                      <p className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900">
                        {activeLead.name}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">Linked to this conversation</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold transition-[background-color,border-color,color] duration-300",
                      sent
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-emerald-200/90 bg-emerald-50/95 text-emerald-700",
                    )}
                  >
                    {sent ? "Approved" : "Ready to reach"}
                  </span>
                </div>

                <div
                  className={cn(
                    "mt-5 rounded-xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/50 to-slate-50/90 p-4 transition-[opacity,box-shadow] duration-300 sm:p-5",
                    sent ? "opacity-80 shadow-inner" : "shadow-sm",
                  )}
                >
                  <MessageDraftTypewriter text={draftMessage} frozen={sent} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onApprove}
                    disabled={approveLoading || sent}
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-600/15 transition-[transform,box-shadow,background-color] duration-200 can-hover:hover:bg-indigo-500",
                      approvePressed ? "scale-[0.97]" : "scale-100",
                      approveGlow &&
                        !approveLoading &&
                        !sent &&
                        "shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_0_0_6px_rgba(99,102,241,0.12)] motion-safe:demo-approve-pulse",
                      "disabled:cursor-not-allowed disabled:opacity-80",
                    )}
                  >
                    {approveLoading ? "Saving…" : sent ? "Approved" : "Use message"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 transition-[border-color,background-color,transform] duration-200 can-hover:-translate-y-px can-hover:border-indigo-200 can-hover:bg-indigo-50/40"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopyDraft()}
                    className={cn(
                      "inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-[border-color,background-color,color,transform] duration-200 can-hover:-translate-y-px can-hover:border-slate-300 can-hover:text-slate-900",
                      copyFlash && "border-indigo-200 bg-indigo-50 text-indigo-800",
                    )}
                  >
                    {copyFlash ? "Copied" : "Copy"}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div
              className={cn(
                "mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700 transition-opacity duration-300",
                showSuccess ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              aria-live="polite"
            >
              <span
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-800"
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
              className="mt-3 text-xs font-medium text-indigo-600/90 transition-colors can-hover:text-indigo-700 sm:text-sm"
            >
              Replay demo
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/70 bg-gradient-to-r from-indigo-50/40 via-white to-indigo-50/40 px-5 py-4 text-center sm:px-8">
        <p className="text-sm font-medium text-slate-600">
          Nothing sends automatically — you stay in control.
        </p>
      </div>
    </>
  );
}
