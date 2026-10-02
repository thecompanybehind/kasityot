"use client";

import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/format";

const DURATION_MS = 1600;

/**
 * A price that counts up to its value the first time it is seen. The real
 * price is what the server renders, so it is correct before, without and
 * after the animation.
 */
export function CountUp({ paise }: { paise: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / DURATION_MS, 1);
        // Fast at first, settling slowly onto the final figure.
        const eased = 1 - Math.pow(1 - progress, 4);
        // Whole rupees only, so no paise flicker on the way up.
        el.textContent = formatPrice(Math.round((paise * eased) / 100) * 100);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = formatPrice(paise);
    };
  }, [paise]);

  return <span ref={ref}>{formatPrice(paise)}</span>;
}
