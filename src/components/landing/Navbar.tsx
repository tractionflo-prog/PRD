"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { ScrollCta } from "./ScrollCta";

const BRAND = "Tractionflo";

const links = [
  { label: "Overview", hash: "overview" },
  { label: "Process", hash: "process" },
  { label: "Join", hash: "join" },
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
  const [pastHero, setPastHero] = useState(false);
  const ticking = useRef(false);

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

  const cinematic = isHome && !pastHero;

  return (
    <header
      className={cn(
        "top-0 z-50 w-full border-b pt-[env(safe-area-inset-top,0px)] transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300",
        isHome ? "fixed" : "sticky",
        cinematic
          ? "border-white/5 bg-black/55 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.75)] backdrop-blur-[10px]"
          : "border-[#ECECEC] bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md",
      )}
    >
      <nav
        className="mx-auto flex min-h-[3.25rem] w-full min-w-0 max-w-[1200px] flex-wrap items-center justify-between gap-x-2 gap-y-2 px-4 py-2 sm:h-14 sm:min-h-0 sm:gap-x-6 sm:gap-y-0 sm:px-8 sm:py-0"
        aria-label="Primary"
      >
        <Link
          href="/#overview"
          onClick={(e) => smoothHashNav(e, "overview")}
          className={cn(
            "min-h-11 min-w-11 shrink-0 py-2 text-[15px] font-semibold tracking-[-0.02em] sm:text-[16px]",
            cinematic ? "text-white" : "text-[#0A0A0A]",
          )}
        >
          {BRAND}
        </Link>

        <div className="flex min-w-0 max-w-full flex-1 basis-[min(100%,18rem)] items-center justify-end gap-2 sm:basis-auto sm:gap-8">
          <ul className="flex min-w-0 max-w-full flex-1 items-center justify-end gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-none sm:gap-8 [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <li key={link.hash} className="shrink-0">
                <Link
                  href={`/#${link.hash}`}
                  onClick={(e) => smoothHashNav(e, link.hash)}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-md px-1 text-[13px] font-medium transition-colors sm:px-0 sm:text-[15px]",
                    cinematic
                      ? "text-white/85 hover:text-white focus-visible:outline-white/40"
                      : "text-[#6B7280] hover:text-[#2563EB] focus-visible:outline-[#2563EB]/35",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ScrollCta
            href="/#join"
            className="h-11 max-w-full shrink-0 px-3 text-[13px] sm:h-10 sm:px-6 sm:text-[15px]"
            variant="primary"
            aria-label="Get early access — go to signup form"
          >
            Get early access
          </ScrollCta>
        </div>
      </nav>
    </header>
  );
}
