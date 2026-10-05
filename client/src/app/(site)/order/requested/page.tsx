import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Order received — Kasityot",
  robots: { index: false, follow: false },
};

export default function OrderRequestedPage() {
  return (
    <section className="grid min-h-[60vh] place-items-center px-(--spacing-section-x) py-(--spacing-section-y)">
      <div className="max-w-[54ch] text-center">
        <div className="flex items-center justify-center gap-4 pb-8 font-mono text-label tracking-wider text-brass uppercase">
          <span className="block h-px w-[34px] bg-brass" />
          <span>Order received</span>
          <span className="block h-px w-[34px] bg-brass" />
        </div>

        <h1 className="m-0 font-display text-section leading-[0.98] font-light tracking-section text-balance text-cream">
          Thank you.
        </h1>

        <p className="m-0 pt-8 text-lede leading-[1.75] text-pretty text-bone-soft">
          We have your order request. Nothing has been charged — we will call
          you within two working days to confirm the piece and arrange payment
          and delivery.
        </p>

        <div className="flex flex-wrap justify-center gap-3.5 pt-10">
          <Button href="/artworks">Continue browsing</Button>
          <Button href="/contact" variant="secondary">
            Contact us
          </Button>
        </div>
      </div>
    </section>
  );
}
