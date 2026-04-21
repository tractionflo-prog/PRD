import Link from "next/link";
import { Section } from "./Section";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#ECECEC] bg-[#FAFAFA]">
      <Section className="py-10 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-[#0A0A0A]">Tractionflo</p>
            <p className="mt-1 max-w-md text-[14px] leading-relaxed text-[#6B7280]">
              First users, without the grind.
            </p>
          </div>
          <nav
            className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium"
            aria-label="Footer"
          >
            <Link
              href="/privacy"
              className="text-[#6B7280] underline-offset-4 transition-colors hover:text-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]/35"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[#6B7280] underline-offset-4 transition-colors hover:text-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]/35"
            >
              Terms
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-[13px] text-[#9CA3AF]">
          © {year} Tractionflo. All rights reserved.
        </p>
      </Section>
    </footer>
  );
}
