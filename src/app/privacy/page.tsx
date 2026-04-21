import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Tractionflo collects, uses, and protects information when you join early access or use our site.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="text-[13px] font-medium text-[#2563EB]">
        <Link href="/" className="hover:underline">
          ← Back to home
        </Link>
      </p>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#0A0A0A]">
        Privacy Policy
      </h1>
      <p className="mt-2 text-[15px] text-[#6B7280]">Last updated: April 2026</p>

      <div className="mt-10 max-w-none space-y-6 text-[15px] leading-relaxed text-[#374151]">
        <section>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">Overview</h2>
          <p className="mt-2">
            Tractionflo (“we”, “us”) respects your privacy. This policy describes
            how we handle information when you use our website or join the early
            access waitlist.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">
            Information we collect
          </h2>
          <p className="mt-2">
            When you request early access, we collect your email address and any
            optional details you choose to provide (for example, what you are
            building). We may also collect basic technical data such as browser type
            and analytics events to improve the product and site.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">How we use it</h2>
          <p className="mt-2">
            We use this information to contact you about Tractionflo, operate and
            improve our services, and understand how the site is used. We do not sell
            your personal information.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">Analytics</h2>
          <p className="mt-2">
            We may use third-party analytics (such as Google Analytics) to measure
            traffic and engagement. Those providers process data according to their
            own policies.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">Contact</h2>
          <p className="mt-2">
            For privacy questions, contact us through the same channel you use for
            product support (listed on your deployment or marketing site when
            available).
          </p>
        </section>
      </div>
    </main>
  );
}
