import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
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
    value: "+91 99200 22433",
    href: "tel:+919920022433",
  },
];

export default function ContactPage() {
  return (
    <section className="px-(--spacing-section-x) py-(--spacing-section-y)">
      <SectionHeading eyebrow="Get in touch" title="Contact" />
      <Reveal className="rv-rule mt-(--spacing-rule-mt) h-px bg-brass/30" />

      <div className="grid grid-cols-1 gap-(--spacing-gap-wide) pt-(--spacing-rule-mt) lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0">
          <Reveal
            as="p"
            className="rv-unroll m-0 max-w-[46ch] text-lede leading-[1.75] text-pretty text-bone-soft [--rv-offset:500ms]"
          >
            For a question about a particular piece, the enquiry button on that
            artwork&rsquo;s page reaches us fastest — it tells us which work you
            mean. For anything else, write or call.
          </Reveal>

          <div className="pt-10">
            {/* Each line is ruled, then typed out: label first, then the
                address or number. */}
            {CHANNELS.map((c, i) => (
              <Reveal
                key={c.label}
                delay={i * 250}
                className="relative flex flex-wrap justify-between gap-4 py-5"
              >
                <span
                  aria-hidden
                  className="rv-rule absolute inset-x-0 top-0 h-px bg-bone/16"
                />
                {i === CHANNELS.length - 1 ? (
                  <span
                    aria-hidden
                    className="rv-rule absolute inset-x-0 bottom-0 h-px bg-bone/16 [--rv-offset:300ms]"
                  />
                ) : null}
                <span className="rv-type font-mono text-label-sm tracking-rail text-slate uppercase [--rv-offset:300ms]">
                  {c.label}
                </span>
                <span className="rv-type [--rv-offset:800ms]">
                  <a
                    href={c.href}
                    className="text-bone-soft transition-colors hover:text-brass"
                  >
                    {c.value}
                  </a>
                </span>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="min-w-0">
          {/* The card's border draws itself, then its contents unroll. */}
          <div className="rv-frame p-(--spacing-gap-col)">
            <div className="pb-4 font-mono text-label tracking-wide text-brass uppercase">
              <span className="rv-type inline-block [--rv-offset:700ms]">
                Studio
              </span>
            </div>
            <p className="rv-unroll m-0 text-body leading-[1.8] text-bone-soft [--rv-offset:900ms]">
              Kasityot
              <br />
              Handmade in India
            </p>
            <p className="rv-unroll m-0 pt-6 text-body-sm leading-[1.7] text-bone-muted [--rv-offset:1200ms]">
              We reply to most messages within two working days. For
              commissions, allow a little longer — we speak to the artist
              before we answer.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
