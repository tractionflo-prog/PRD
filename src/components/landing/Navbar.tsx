"use client";

import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { IconRadar, IconSend, IconTrend } from "./icons";
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
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isDemand = pathname === "/demand";
  const [pastHero, setPastHero] = useState(false);
  const ticking = useRef(false);
  const reduceMotion = useReducedMotion();

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

  /** Light hero at top of home: dark nav text. Past hero / demand: frosted dark bar + light text. */
  const onDarkLanding = isDemand || (isHome && pastHero);
  const solidDarkBar = isDemand || (isHome && pastHero);
  const transparentHome = isHome && !pastHero;

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.64,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "top-0 z-50 w-full border-b pt-[env(safe-area-inset-top,0px)] transition-[background-color,backdrop-filter,border-color,box-shadow,padding] duration-300",
        isHome ? "fixed" : "sticky",
        transparentHome
          ? "border-transparent bg-transparent shadow-none"
          : solidDarkBar
            ? "border-white/10 bg-black/45 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.85)] backdrop-blur-xl"
            : "border-[#e2e8f0] bg-white/80 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.06)] backdrop-blur-xl",
      )}
    >
      <nav
        className={cn(
          "mx-auto flex min-h-[3.25rem] w-full min-w-0 max-w-[1200px] flex-wrap items-center justify-between gap-x-2 gap-y-2 px-4 transition-[padding,min-height] duration-300 sm:h-14 sm:min-h-0 sm:gap-x-6 sm:gap-y-0 sm:px-8 sm:py-0",
          isHome && pastHero ? "py-1.5 sm:py-0" : "py-2 sm:py-0",
        )}
        aria-label="Primary"
      >
        <Link
          href={isDemand ? "/" : "/#overview"}
          onClick={isDemand ? undefined : (e) => smoothHashNav(e, "overview")}
          className={cn(
            "min-h-11 min-w-11 shrink-0 py-2 text-[15px] font-semibold tracking-[-0.02em] sm:text-[16px]",
            onDarkLanding ? "text-white" : "text-[#0f172a]",
          )}
        >
          {BRAND}
        </Link>

        <div className="flex min-w-0 max-w-full flex-1 basis-[min(100%,18rem)] items-center justify-end gap-2 sm:basis-auto sm:gap-8">
          <ul className="flex min-w-0 max-w-full flex-1 items-center justify-end gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-none sm:gap-8 [&::-webkit-scrollbar]:hidden">
            {links.map((link) => {
              const Icon = link.Icon;
              return (
                <li key={link.hash} className="shrink-0">
                  <Link
                    href={`/#${link.hash}`}
                    onClick={(e) => smoothHashNav(e, link.hash)}
                    className={cn(
                      "group inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-[13px] font-medium transition-colors sm:px-0 sm:text-[15px]",
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
              "inline-flex h-11 max-w-full shrink-0 items-center gap-2 px-3 text-[13px] sm:h-12 sm:px-6 sm:text-[15px]",
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
            <span className="truncate">Join early access</span>
          </ScrollCta>
        </div>
      </nav>
    </motion.header>
  );
}
