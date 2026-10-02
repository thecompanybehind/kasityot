import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About — Kasityot",
  description:
    "A marketplace for Indian handicraft. Every piece is one of a kind, made by hand, and signed by the artist who made it.",
};

const PRINCIPLES = [
  [
    "01",
    "Every piece is one of a kind",
    "Nothing here is produced in a series. When a work is sold, it is gone — we do not make another.",
  ],
  [
    "02",
    "The artist is named",
    "Each work carries the name, craft and region of the person who made it. No anonymous inventory.",
  ],
  [
    "03",
    "The price reaches the maker",
    "We settle directly with the artist. There is no chain of intermediaries between their hands and yours.",
  ],
];

export default function AboutPage() {
  return (
    <>
      <section className="relative grid min-h-[min(60vh,600px)] items-end overflow-hidden bg-ink-raised">
        <div className="absolute inset-0 opacity-70">
          <Media
            src="/design/279965af-0eed-4455-805c-d10ab40a07ed.jpg"
            alt="An artist at work"
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
                Made by hand,
              </span>
            </span>
            <span className="mask-line">
              <em className="animate-line italic text-brass-light [--anim-delay:240ms]">
                signed by name.
              </em>
            </span>
          </h1>
        </div>
      </section>

      <section className="px-(--spacing-section-x) py-(--spacing-section-y)">
        <div className="grid grid-cols-1 gap-(--spacing-gap-wide) lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading numeral="I." eyebrow="Why we exist" title="The premise" />
          <Reveal className="min-w-0">
            <p className="rv-unroll m-0 text-lede leading-[1.75] text-pretty text-bone-soft [--rv-offset:300ms]">
              India&rsquo;s handicraft traditions are held by people, not
              factories — a Madhubani line learned at six, a lac colour pressed
              onto wood on a foot-turned lathe, a kani shawl that takes two
              years on the loom. Most of that work reaches buyers stripped of
              the name of whoever made it.
            </p>
            <p className="rv-unroll m-0 pt-6 text-lede leading-[1.75] text-pretty text-bone-soft [--rv-offset:600ms]">
              Kasityot exists to put the artist back in front of the object. You
              see the work, you see who made it and where, and you can reach
              them through us. Nothing is mass-produced, nothing is restocked.
            </p>
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
          eyebrow="How we work"
          title="Three principles"
          tone="light"
          className="pb-(--spacing-head-pb)"
        />
        <div className="flex flex-col">
          {PRINCIPLES.map(([num, title, body], i) => (
            <Reveal
              key={num}
              className="relative grid grid-cols-1 gap-4 py-8 sm:grid-cols-[auto_1fr] sm:gap-10"
            >
              {/* Each principle is ruled off first; its number and title
                  then slide in from the left margin. */}
              <span
                aria-hidden
                className="rv-rule absolute inset-x-0 top-0 h-px bg-espresso/22"
              />
              {i === PRINCIPLES.length - 1 ? (
                <span
                  aria-hidden
                  className="rv-rule absolute inset-x-0 bottom-0 h-px bg-espresso/22 [--rv-offset:500ms]"
                />
              ) : null}
              <span className="overflow-hidden font-mono text-label tracking-numeral text-brass-deep">
                <span className="rv-slide-l block [--rv-offset:250ms]">{num}</span>
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
