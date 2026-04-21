"use client";

import type { MouseEvent } from "react";
import { ScrollCta } from "./ScrollCta";

const BRAND = "FirstUsers";

const links = [
  { label: "Overview", href: "#overview" },
  { label: "Process", href: "#process" },
  { label: "Join", href: "#join" },
] as const;

function scrollToHash(e: MouseEvent<HTMLAnchorElement>, href: string) {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#ECECEC] bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-[3.25rem] max-w-[1200px] items-center justify-between gap-6 px-5 sm:h-14 sm:px-8">
        <a
          href="#overview"
          onClick={(e) => scrollToHash(e, "#overview")}
          className="text-[16px] font-semibold tracking-[-0.02em] text-[#0A0A0A]"
        >
          {BRAND}
        </a>

        <div className="flex items-center gap-5 sm:gap-8">
          <ul className="hidden items-center gap-8 sm:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => scrollToHash(e, link.href)}
                  className="text-[15px] font-medium text-[#6B7280] transition-colors hover:text-[#2563EB]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <ScrollCta
            className="h-10 px-5 text-[15px] sm:h-10 sm:px-6"
            variant="primary"
          >
            Get early access
          </ScrollCta>
        </div>
      </nav>
    </header>
  );
}
