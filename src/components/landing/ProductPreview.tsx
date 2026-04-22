"use client";

import { motion } from "framer-motion";
import { FadeUp } from "./FadeUp";
import { ProductDemo } from "./ProductDemo";
import { Section } from "./Section";

export function ProductPreview() {
  return (
    <Section
      id="preview"
      className="bg-white py-20 sm:py-24 md:py-28 lg:py-32"
    >
      <FadeUp>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
          Inside the product
        </p>
        <h2 className="mt-3 max-w-[42rem] text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight text-[#0A0A0A] sm:text-[2.4rem] lg:text-[2.75rem]">
          See interested users. Approve messages. Start conversations.
        </h2>
        <p className="mt-5 max-w-[39rem] text-pretty text-[17px] leading-relaxed text-[#475569] sm:text-[1.08rem]">
          No bloated CRM. No messy spreadsheets. Just the people worth talking
          to.
        </p>
      </FadeUp>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-6%" }}
        transition={{ duration: 0.52, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-12 overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-[#F8FAFC] shadow-[0_14px_34px_-18px_rgba(15,23,42,0.3),0_44px_80px_-40px_rgba(15,23,42,0.38)] ring-1 ring-[#2563EB]/6 sm:mt-14 lg:rounded-[1.3rem]"
      >
        <ProductDemo />
      </motion.div>
    </Section>
  );
}
