import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using the Tractionflo website and participating in early access.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="text-[13px] font-medium text-[#2563EB]">
        <Link href="/" className="hover:underline">
          ← Back to home
        </Link>
      </p>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#0A0A0A]">
        Terms of Service
      </h1>
      <p className="mt-2 text-[15px] text-[#6B7280]">Last updated: April 2026</p>

      <div className="mt-10 max-w-none space-y-6 text-[15px] leading-relaxed text-[#374151]">
        <section>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">Agreement</h2>
          <p className="mt-2">
            By using the Tractionflo website or joining early access, you agree to
            these terms. If you do not agree, please do not use the site or submit
            your information.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">Early access</h2>
          <p className="mt-2">
            Early access is offered on a discretionary basis. We may accept or
            decline requests, change timing, or modify the program. Nothing on this
            site guarantees access, features, or availability.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">No warranty</h2>
          <p className="mt-2">
            The site and any descriptions of the product are provided “as is”
            without warranties of any kind, to the fullest extent permitted by law.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">Limitation of liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, Tractionflo and its team will
            not be liable for any indirect, incidental, or consequential damages
            arising from your use of the site or participation in early access.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">Changes</h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of the site
            after changes constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </main>
  );
}
