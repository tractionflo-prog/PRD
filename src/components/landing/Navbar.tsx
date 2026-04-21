"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { ScrollCta } from "./ScrollCta";

const BRAND = "Tractionflo";

const links = [
  { label: "Overview", hash: "overview" },
  { label: "Process", hash: "process" },
  { label: "Join", hash: "join" },
] as const;

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
  return (
    <header className="sticky top-0 z-50 border-b border-[#ECECEC] bg-white/90 backdrop-blur-md">
      <nav
        className="mx-auto flex min-h-[3.25rem] max-w-[1200px] flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2 sm:h-14 sm:min-h-0 sm:gap-6 sm:px-8 sm:py-0"
        aria-label="Primary"
      >
        <Link
          href="/#overview"
          onClick={(e) => smoothHashNav(e, "overview")}
          className="min-h-11 min-w-11 shrink-0 py-2 text-[15px] font-semibold tracking-[-0.02em] text-[#0A0A0A] sm:text-[16px]"
        >
          {BRAND}
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-8">
          <ul className="flex min-w-0 items-center gap-3 overflow-x-auto sm:gap-8">
            {links.map((link) => (
              <li key={link.hash} className="shrink-0">
                <Link
                  href={`/#${link.hash}`}
                  onClick={(e) => smoothHashNav(e, link.hash)}
                  className="inline-flex min-h-11 items-center rounded-md px-1 text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]/35 sm:px-0 sm:text-[15px]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ScrollCta
            href="/#join"
            className="h-11 shrink-0 px-4 text-[14px] sm:h-10 sm:px-6 sm:text-[15px]"
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
