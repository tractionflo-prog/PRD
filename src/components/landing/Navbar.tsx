"use client";

import { cn } from "@/lib/cn";
import { useMobilePerfLayout } from "@/lib/use-mobile-perf-layout";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { IconCloseNav, IconMenu, IconRadar, IconSend, IconTrend } from "./icons";
import { ScrollCta } from "./ScrollCta";

const BRAND = "Tractionflo";

const links = [
  { label: "Overview", hash: "overview", Icon: IconRadar },
  { label: "Process", hash: "process", Icon: IconTrend },
] as const;

/** Hero bottom above this (px) ⇒ solid nav. Slightly above actual bar height for iOS scroll quirks. */
const NAV_CLEARANCE = 80;

function smoothHashNav(e: MouseEvent<HTMLAnchorElement>, hash: string) {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/") return;
  const el = document.getElementById(hash);
  if (el) {
    e.preventDefault();
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isDemand = pathname === "/demand";
  const [pastHero, setPastHero] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const ticking = useRef(false);
  const reduceMotion = useReducedMotion();
  const mobilePerf = useMobilePerfLayout();

  useEffect(() => {
    if (!isHome) {
      setPastHero(true);
      return;
    }

    const run = () => {
      const hero = document.getElementById("overview");
      if (!hero) {
        setPastHero(true);
        return;
      }
      const bottom = hero.getBoundingClientRect().bottom;
      setPastHero(bottom < NAV_CLEARANCE);
    };

    const onScrollOrResize = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        ticking.current = false;
        run();
      });
    };

    run();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isHome]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const close = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  /** Light hero at top of home: dark nav text. Past hero / demand: frosted dark bar + light text. */
  const onDarkLanding = isDemand || (isHome && pastHero);
  const solidDarkBar = isDemand || (isHome && pastHero);
  const transparentHome = isHome && !pastHero;

  const menuButtonClass = cn(
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors md:hidden",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    onDarkLanding
      ? "border-white/20 bg-white/10 text-white focus-visible:outline-white/50"
      : "border-slate-200/90 bg-white/80 text-slate-800 shadow-sm focus-visible:outline-[#635bff]/40",
  );

  const mobilePanelClass = cn(
    "absolute left-0 right-0 top-full border-b shadow-lg md:hidden",
    onDarkLanding
      ? "border-white/10 bg-slate-950/98 text-white backdrop-blur-xl"
      : "border-slate-200/80 bg-white/98 text-slate-900 backdrop-blur-xl",
  );

  const mobileLinkClass = cn(
    "flex min-h-[3rem] w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors",
    onDarkLanding
      ? "text-white/90 hover:bg-white/10 active:bg-white/15"
      : "text-slate-800 hover:bg-slate-50 active:bg-slate-100",
  );

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : mobilePerf ? 0.38 : 0.64,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "relative top-0 z-50 w-full border-b pt-[env(safe-area-inset-top,0px)] transition-[background-color,backdrop-filter,border-color,box-shadow,padding] duration-300",
        isHome ? "fixed inset-x-0 top-0" : "sticky",
        transparentHome
          ? "border-transparent bg-transparent shadow-none"
          : solidDarkBar
            ? "border-white/10 bg-black/50 shadow-[0_10px_28px_-22px_rgba(0,0,0,0.75)] backdrop-blur-md max-md:bg-black/55 md:bg-black/45 md:shadow-[0_12px_40px_-28px_rgba(0,0,0,0.85)] md:backdrop-blur-xl"
            : "border-[#e2e8f0] bg-white/85 shadow-[0_6px_22px_-18px_rgba(15,23,42,0.05)] backdrop-blur-md md:bg-white/80 md:shadow-[0_8px_30px_-24px_rgba(15,23,42,0.06)] md:backdrop-blur-xl",
      )}
    >
      <nav
        className={cn(
          "relative z-[70] mx-auto flex min-h-[3.25rem] w-full min-w-0 max-w-[1200px] flex-nowrap items-center justify-between gap-2 px-4 transition-[padding,min-height] duration-300 sm:h-14 sm:min-h-0 sm:gap-x-6 sm:px-8 sm:py-0",
          isHome && pastHero ? "py-1.5 sm:py-0" : "py-2 sm:py-0",
        )}
        aria-label="Primary"
      >
        <Link
          href={isDemand ? "/" : "/#overview"}
          onClick={isDemand ? undefined : (e) => smoothHashNav(e, "overview")}
          className={cn(
            "min-h-11 min-w-0 shrink-0 py-2 pr-1 text-[15px] font-semibold tracking-[-0.02em] sm:text-[16px]",
            onDarkLanding ? "text-white" : "text-[#0f172a]",
          )}
        >
          {BRAND}
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-8">
          <ul className="hidden min-w-0 items-center gap-8 md:flex">
            {links.map((link) => {
              const Icon = link.Icon;
              return (
                <li key={link.hash} className="shrink-0">
                  <Link
                    href={`/#${link.hash}`}
                    onClick={(e) => smoothHashNav(e, link.hash)}
                    className={cn(
                      "group inline-flex min-h-11 items-center gap-2 rounded-md px-0 text-[15px] font-medium transition-colors",
                      onDarkLanding
                        ? "text-white/80 can-hover:hover:text-white focus-visible:outline-white/40"
                        : "text-[#64748b] can-hover:hover:text-[#635bff] focus-visible:outline-[#635bff]/35",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0 text-[#635bff] transition-colors motion-reduce:transition-none",
                        onDarkLanding &&
                          "text-indigo-300 group-hover:text-indigo-100",
                        !onDarkLanding && "group-hover:text-[#5851ea]",
                      )}
                      width={18}
                      height={18}
                    />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <ScrollCta
            href="/#join"
            className={cn(
              "inline-flex h-11 max-w-full shrink-0 items-center gap-1.5 px-3 text-[13px] sm:h-12 sm:gap-2 sm:px-6 sm:text-[15px]",
              isDemand && solidDarkBar && "ring-1 ring-white/20",
            )}
            variant={isDemand && solidDarkBar ? "subtle" : "primary"}
            aria-label="Join waitlist — scroll to email form at bottom"
          >
            <IconSend
              className={cn(
                "size-[18px] shrink-0 transition-colors",
                isDemand && solidDarkBar ? "text-indigo-300" : "text-white",
              )}
              width={18}
              height={18}
              aria-hidden
            />
            <span className="truncate md:max-w-none">
              <span className="md:hidden">Join</span>
              <span className="hidden md:inline">Join early access</span>
            </span>
          </ScrollCta>

          <button
            type="button"
            className={menuButtonClass}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav-panel"
            id="mobile-nav-toggle"
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <span className="sr-only">{mobileNavOpen ? "Close menu" : "Open menu"}</span>
            {mobileNavOpen ? (
              <IconCloseNav className="size-[22px]" width={22} height={22} />
            ) : (
              <IconMenu className="size-[22px]" width={22} height={22} />
            )}
          </button>
        </div>
      </nav>

      {mobileNavOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[55] bg-slate-900/40 backdrop-blur-[2px] md:hidden"
            aria-label="Close navigation"
            tabIndex={-1}
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            id="mobile-nav-panel"
            className={cn(mobilePanelClass, "z-[60] max-h-[min(70vh,28rem)] overflow-y-auto")}
            role="dialog"
            aria-modal="true"
            aria-label="Page sections"
          >
            <ul className="mx-auto max-w-[1200px] space-y-1 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {links.map((link) => {
                const Icon = link.Icon;
                return (
                  <li key={link.hash}>
                    <Link
                      href={`/#${link.hash}`}
                      className={mobileLinkClass}
                      onClick={(e) => {
                        setMobileNavOpen(false);
                        smoothHashNav(e, link.hash);
                      }}
                    >
                      <Icon
                        className={cn(
                          "size-5 shrink-0",
                          onDarkLanding ? "text-indigo-300" : "text-indigo-600",
                        )}
                        width={20}
                        height={20}
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      ) : null}
    </motion.header>
  );
}
