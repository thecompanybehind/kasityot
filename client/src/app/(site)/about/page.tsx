import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { paragraphs } from "@kasityot/core/about";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAboutContent } from "@/lib/queries";

/** The owner edits this page from the panel; a save shows within a minute. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "About — Kasityot",
  description:
    "A marketplace for Indian handicraft. Every piece is one of a kind, made by hand, and signed by the artist who made it.",
};

export default async function AboutPage() {
  const about = await getAboutContent();
  const premise = paragraphs(about.premiseBody);

  return (
    <>
      <section className="relative grid min-h-[min(60vh,600px)] items-end overflow-hidden bg-ink-raised">
        <div className="absolute inset-0 opacity-70">
          <Media
            src={about.heroImage}
            alt={about.heroAlt}
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-ink-overlay/92 via-ink-overlay/55 via-40% to-ink-overlay/30" />
        <div className="relative px-(--spacing-section-x) py-[clamp(40px,6vw,88px)]">
          <div className="flex items-center gap-4 pb-6 font-mono text-label tracking-wider text-brass uppercase">
            <span className="block h-px w-[34px] animate-rule bg-brass" />
            <span className="mask-line">
              <span className="animate-line">About</span>
            </span>
          </div>
          <h1 className="m-0 max-w-[16ch] font-display text-display leading-[0.94] font-light tracking-display text-balance text-cream [--mask-pad:0.18em]">
            <span className="mask-line">
              <span className="animate-line [--anim-delay:100ms]">
                {about.heading}
              </span>
            </span>
            <span className="mask-line">
              <em className="animate-line italic text-brass-light [--anim-delay:240ms]">
                {about.headingAccent}
              </em>
            </span>
          </h1>
        </div>
      </section>

      <section className="px-(--spacing-section-x) py-(--spacing-section-y)">
        <div className="grid grid-cols-1 gap-(--spacing-gap-wide) lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading
            numeral="I."
            eyebrow={about.premiseEyebrow}
            title={about.premiseTitle}
          />
          <Reveal className="min-w-0">
            {/* Paragraphs unroll one after another, as the design's two did. */}
            {premise.map((text, i) => (
              <p
                key={i}
                className={`rv-unroll m-0 text-lede leading-[1.75] text-pretty text-bone-soft ${i ? "pt-6" : ""}`}
                style={{ "--rv-offset": `${300 + i * 300}ms` } as CSSProperties}
              >
                {text}
              </p>
            ))}
            <div className="rv-wipe [--rv-offset:1000ms]">
              <Button href="/artists" className="mt-10">
                Meet the artists
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-parchment px-(--spacing-section-x) py-(--spacing-section-y) text-espresso">
        <SectionHeading
          numeral="II."
          eyebrow={about.principlesEyebrow}
          title={about.principlesTitle}
          tone="light"
          className="pb-(--spacing-head-pb)"
        />
        <div className="flex flex-col">
          {about.principles.map(({ title, body }, i) => (
            <Reveal
              key={i}
              className="relative grid grid-cols-1 gap-4 py-8 sm:grid-cols-[auto_1fr] sm:gap-10"
            >
              {/* Each principle is ruled off first; its number and title
                  then slide in from the left margin. */}
              <span
                aria-hidden
                className="rv-rule absolute inset-x-0 top-0 h-px bg-espresso/22"
              />
              {i === about.principles.length - 1 ? (
                <span
                  aria-hidden
                  className="rv-rule absolute inset-x-0 bottom-0 h-px bg-espresso/22 [--rv-offset:500ms]"
                />
              ) : null}
              <span className="overflow-hidden font-mono text-label tracking-numeral text-brass-deep">
                <span className="rv-slide-l block [--rv-offset:250ms]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <div className="min-w-0">
                <div className="overflow-hidden font-display text-card-title leading-[1.14] text-espresso">
                  <span className="rv-slide-l block [--rv-offset:350ms]">
                    {title}
                  </span>
                </div>
                <p className="rv-unroll m-0 max-w-[60ch] pt-3 text-body leading-[1.7] text-espresso-soft [--rv-offset:650ms]">
                  {body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
