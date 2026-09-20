import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Payment not completed — Kasityot",
  robots: { index: false, follow: false },
};

const REASONS: Record<string, string> = {
  declined:
    "Your bank declined the payment. Nothing has been charged — you are welcome to try again with another card or UPI app.",
  verification:
    "We could not verify the payment with our payment provider. If money has left your account, do not pay again — contact us and we will check it for you.",
};

export default async function OrderFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const explanation =
    REASONS[reason ?? ""] ??
    "The payment did not complete. Nothing has been charged.";

  return (
    <section className="grid min-h-[60vh] place-items-center px-(--spacing-section-x) py-(--spacing-section-y)">
      <div className="max-w-[54ch] text-center">
        <div className="flex items-center justify-center gap-4 pb-8 font-mono text-label tracking-wider text-brass uppercase">
          <span className="block h-px w-[34px] bg-brass" />
          <span>Payment not completed</span>
          <span className="block h-px w-[34px] bg-brass" />
        </div>

        <h1 className="m-0 font-display text-section leading-[0.98] font-light tracking-section text-balance text-cream">
          Not quite done.
        </h1>

        <p className="m-0 pt-8 text-lede leading-[1.75] text-pretty text-bone-soft">
          {explanation}
        </p>

        <div className="flex flex-wrap justify-center gap-3.5 pt-10">
          <Button href="/artworks">Back to the collection</Button>
          <Button href="/contact" variant="secondary">
            Contact us
          </Button>
        </div>
      </div>
    </section>
  );
}
