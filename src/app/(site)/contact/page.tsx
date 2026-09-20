import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Contact — Kasityot",
  description:
    "Questions about a piece, a commission or an order? Reach the Kasityot studio directly.",
};

const CHANNELS = [
  {
    label: "Email",
    value: "hello@kasityot.com",
    href: "mailto:hello@kasityot.com",
  },
  {
    label: "Phone / WhatsApp",
    value: "+91 00000 00000",
    href: "tel:+910000000000",
  },
];

export default function ContactPage() {
  return (
    <section className="px-(--spacing-section-x) py-(--spacing-section-y)">
      <SectionHeading eyebrow="Get in touch" title="Contact" />
      <div className="mt-(--spacing-rule-mt) h-px bg-brass/30" />

      <div className="grid grid-cols-1 gap-(--spacing-gap-wide) pt-(--spacing-rule-mt) lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0">
          <p className="m-0 max-w-[46ch] text-lede leading-[1.75] text-pretty text-bone-soft">
            For a question about a particular piece, the enquiry button on that
            artwork&rsquo;s page reaches us fastest — it tells us which work you
            mean. For anything else, write or call.
          </p>

          <div className="pt-10">
            {CHANNELS.map((c) => (
              <div
                key={c.label}
                className="flex flex-wrap justify-between gap-4 border-t border-bone/16 py-5 last:border-b"
              >
                <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
                  {c.label}
                </span>
                <a
                  href={c.href}
                  className="text-bone-soft transition-colors hover:text-brass"
                >
                  {c.value}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="border border-brass/30 p-(--spacing-gap-col)">
            <div className="pb-4 font-mono text-label tracking-wide text-brass uppercase">
              Studio
            </div>
            <p className="m-0 text-body leading-[1.8] text-bone-soft">
              Kasityot
              <br />
              Handmade in India
            </p>
            <p className="m-0 pt-6 text-body-sm leading-[1.7] text-bone-muted">
              We reply to most messages within two working days. For
              commissions, allow a little longer — we speak to the artist
              before we answer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
