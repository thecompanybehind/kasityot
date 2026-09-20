import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
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
            <span className="block h-px w-[34px] bg-brass" />
            <span>About</span>
          </div>
          <h1 className="m-0 max-w-[16ch] font-display text-display leading-[0.94] font-light tracking-display text-balance text-cream">
            Made by hand,
            <br />
            <em className="italic text-brass-light">signed by name.</em>
          </h1>
        </div>
      </section>

      <section className="px-(--spacing-section-x) py-(--spacing-section-y)">
        <div className="grid grid-cols-1 gap-(--spacing-gap-wide) lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading numeral="I." eyebrow="Why we exist" title="The premise" />
          <div className="min-w-0">
            <p className="m-0 text-lede leading-[1.75] text-pretty text-bone-soft">
              India&rsquo;s handicraft traditions are held by people, not
              factories — a Madhubani line learned at six, a lac colour pressed
              onto wood on a foot-turned lathe, a kani shawl that takes two
              years on the loom. Most of that work reaches buyers stripped of
              the name of whoever made it.
            </p>
            <p className="m-0 pt-6 text-lede leading-[1.75] text-pretty text-bone-soft">
              Kasityot exists to put the artist back in front of the object. You
              see the work, you see who made it and where, and you can reach
              them through us. Nothing is mass-produced, nothing is restocked.
            </p>
            <Button href="/artists" className="mt-10">
              Meet the artists
            </Button>
          </div>
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
            <div
              key={num}
              className={`grid grid-cols-1 gap-4 border-t border-espresso/22 py-8 sm:grid-cols-[auto_1fr] sm:gap-10 ${
                i === PRINCIPLES.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="font-mono text-label tracking-numeral text-brass-deep">
                {num}
              </span>
              <div className="min-w-0">
                <div className="font-display text-card-title leading-[1.14] text-espresso">
                  {title}
                </div>
                <p className="m-0 max-w-[60ch] pt-3 text-body leading-[1.7] text-espresso-soft">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
