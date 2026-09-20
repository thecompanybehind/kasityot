import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Payment received — Kasityot",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const { payment } = await searchParams;

  return (
    <section className="grid min-h-[60vh] place-items-center px-(--spacing-section-x) py-(--spacing-section-y)">
      <div className="max-w-[54ch] text-center">
        <div className="flex items-center justify-center gap-4 pb-8 font-mono text-label tracking-wider text-brass uppercase">
          <span className="block h-px w-[34px] bg-brass" />
          <span>Payment received</span>
          <span className="block h-px w-[34px] bg-brass" />
        </div>

        <h1 className="m-0 font-display text-section leading-[0.98] font-light tracking-section text-balance text-cream">
          Thank you.
        </h1>

        <p className="m-0 pt-8 text-lede leading-[1.75] text-pretty text-bone-soft">
          Your payment has gone through and the piece is now reserved for you.
          We will call you within two working days to arrange delivery.
        </p>

        {payment ? (
          <p className="m-0 pt-6 font-mono text-label-sm tracking-rail text-slate uppercase">
            Reference {payment}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-center gap-3.5 pt-10">
          <Button href="/artworks">Continue browsing</Button>
          <Button href="/contact" variant="secondary">
            Contact us
          </Button>
        </div>

        <p className="m-0 pt-10 text-body-sm leading-[1.7] text-bone-muted">
          Keep this reference in case you need to{" "}
          <Link href="/contact" className="text-brass hover:underline">
            get in touch
          </Link>{" "}
          about the order.
        </p>
      </div>
    </section>
  );
}
