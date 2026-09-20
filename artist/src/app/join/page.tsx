import type { Metadata } from "next";
import Link from "next/link";
import { JoinForm } from "@/components/JoinForm";
import { PageHeading, Rule } from "@/components/ui";

/**
 * Unlike the rest of this app, the join page is meant to be found — it is how
 * an artist hears they can apply at all, so the layout's blanket noindex is
 * lifted here.
 */
export const metadata: Metadata = {
  title: "Work with Kasityot — apply",
  description:
    "Kasityot works with a small number of Indian craftspeople. Tell us about your work.",
  robots: { index: true, follow: true },
};

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-[900px] px-[clamp(20px,4vw,44px)] py-[clamp(40px,6vw,88px)]">
      <PageHeading
        eyebrow="Work with us"
        title="Tell us about your work"
        action={
          <Link
            href="/login"
            className="font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-brass"
          >
            Already with us? Sign in →
          </Link>
        }
      />
      <Rule />

      <p className="max-w-[60ch] pt-8 pb-10 text-body leading-[1.8] text-bone-muted">
        We work with a small number of craftspeople and add slowly, so we read
        every application properly rather than quickly. If your work is a fit
        we will write to you; if it is not, we will still write, and say why.
      </p>

      <JoinForm />
    </div>
  );
}
