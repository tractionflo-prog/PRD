"use client";

import { useEffect, useState } from "react";

/** Tailwind `md` breakpoint — tune landing motion & effects below this width. */
const MOBILE_PERF_MQ = "(max-width: 767px)";

export function useMobilePerfLayout(): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_PERF_MQ);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile;
}
