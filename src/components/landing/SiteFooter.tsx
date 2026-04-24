import Link from "next/link";
import { Section } from "./Section";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#e2e8f0] bg-white">
      <Section className="py-10 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-[#0f172a]">Tractionflo</p>
            <p className="mt-1 max-w-md text-[14px] leading-relaxed text-[#64748b]">
              First users, without the grind.
            </p>
          </div>
          <nav
            className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium"
            aria-label="Footer"
          >
            <Link
              href="/privacy"
              className="text-[#64748b] underline-offset-4 transition-colors hover:text-[#635bff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]/35"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[#64748b] underline-offset-4 transition-colors hover:text-[#635bff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]/35"
            >
              Terms
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-[13px] text-[#94a3b8]">
          © {year} Tractionflo. All rights reserved.
        </p>
      </Section>
    </footer>
  );
}
