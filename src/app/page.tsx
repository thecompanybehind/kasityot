import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  collections,
  journal,
  makers,
  pieces,
  showPrices,
  stills,
} from "@/lib/fixtures";

/** The underlined mono link used opposite section headings. */
function RailLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="border-b border-brass/50 pb-[5px] font-mono text-label tracking-nav text-brass uppercase transition-colors duration-200 hover:text-cream"
    >
      {children}
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <Header />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        id="top"
        className="relative grid min-h-[min(92vh,900px)] items-end overflow-hidden bg-ink-raised"
      >
        <div className="absolute inset-0 animate-fade">
          <Media
            src={stills.hero}
            alt="A potter at the wheel"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-ink-overlay/92 via-ink-overlay/55 via-36% to-ink-overlay/45" />
        <div className="absolute inset-0 opacity-22 [background:repeating-linear-gradient(112deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_4px)]" />

        <div className="relative flex animate-rise flex-col gap-[clamp(30px,4vw,56px)] px-(--spacing-section-x) pt-[clamp(44px,6vw,96px)] pb-[clamp(30px,3vw,48px)]">
          <div className="flex max-w-[min(100%,1060px)] flex-col gap-6.5">
            <div className="flex items-center gap-4 font-mono text-label tracking-wider text-brass uppercase">
              <span className="block h-px w-[34px] bg-brass" />
              <span>From our atelier — Vol. IX</span>
            </div>
            <h1 className="m-0 font-display text-hero leading-[0.82] font-light tracking-hero text-balance text-cream">
              The hand,
              <br />
              <em className="italic text-brass-light">unhurried.</em>
            </h1>
            <p className="m-0 max-w-[44ch] text-lede leading-[1.75] text-pretty text-bone-soft">
              Objects made slowly, by people we know by name. Signed, traceable,
              and meant to outlive their first owner.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-2.5">
              <Button href="#pieces">View the full curation</Button>
              <Button href="#maker" variant="secondary">
                Meet the makers
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-[clamp(18px,4vw,60px)] border-t border-brass/42 pt-5.5 font-mono text-label tracking-rail text-stone uppercase">
            <span>Fig. 01 — Iida Mäkelä, Helsinki · Ceramics</span>
            <div className="flex flex-wrap gap-[clamp(18px,3vw,44px)] text-brass">
              <span>214 ateliers</span>
              <span>11 disciplines</span>
              <span>Never a series</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── I. Pieces ────────────────────────────────────────── */}
      <section
        id="pieces"
        className="px-(--spacing-section-x) py-(--spacing-section-y)"
      >
        <SectionHeading
          numeral="I."
          eyebrow="Currently available"
          title="Pieces in the room"
          action={<RailLink href="#collections">All 618 works →</RailLink>}
        />
        <div className="mt-(--spacing-rule-mt) h-px animate-rule bg-brass/30" />

        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-(--spacing-gap-grid) pt-(--spacing-rule-mt)">
          {pieces.map((piece, i) => (
            <ArtworkCard
              key={piece.no}
              piece={piece}
              showPrice={showPrices}
              priority={i < 3}
            />
          ))}
        </div>
      </section>

      {/* ── Interlude ────────────────────────────────────────── */}
      <section className="relative grid min-h-[min(78vh,760px)] items-center overflow-hidden bg-ink-panel">
        <div className="absolute inset-0 opacity-62">
          <Media
            src={stills.interlude}
            alt="Raising a vase on the wheel"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-ink-overlay/90 via-ink-overlay/50 via-55% to-ink-overlay/25" />
        <div className="relative max-w-[min(100%,900px)] px-(--spacing-section-x) py-[clamp(48px,7vw,120px)]">
          <div className="pb-7 font-mono text-label tracking-wider text-brass uppercase">
            Interlude
          </div>
          <p className="m-0 font-display text-quote leading-[1.16] font-light tracking-quote text-balance text-cream italic">
            Nothing here was made in a hurry, and nothing here was made twice.
          </p>
        </div>
      </section>

      {/* ── II. Maker in residence ───────────────────────────── */}
      <section
        id="maker"
        className="bg-parchment px-(--spacing-section-x) py-(--spacing-section-y) text-espresso"
      >
        <SectionHeading
          numeral="II."
          eyebrow="Maker in residence"
          title="Iida Mäkelä"
          tone="light"
          className="pb-(--spacing-head-pb)"
        />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-end gap-(--spacing-gap-wide)">
          <div className="grid min-w-0 grid-cols-2 gap-3.5">
            <div className="relative aspect-2/3 overflow-hidden bg-parchment-deep">
              <Media
                src={stills.makerPortrait}
                alt="Iida Mäkelä in her studio"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="grid content-end gap-3.5">
              <div className="relative aspect-square overflow-hidden bg-parchment-deep">
                <Media
                  src={stills.makerHands}
                  alt="Hands shaping a pot"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative aspect-square overflow-hidden bg-parchment-deep">
                <Media
                  src={stills.makerTools}
                  alt="Wheel and tools"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="pb-7.5 font-mono text-label tracking-nav text-clay uppercase">
              Ceramicist · Vallila, Helsinki · b. 1984
            </div>
            <blockquote className="m-0 max-w-[32ch] font-display text-pull leading-[1.32] font-light text-espresso italic">
              “I never decide the form. The clay is already leaning somewhere —
              I only agree with it.”
            </blockquote>

            <div className="mt-11 flex flex-col">
              {[
                ["01", "Clay dug within 200 km of the studio"],
                ["02", "Ninety-two hours at the wheel, per vessel"],
                ["03", "Fired once, in wood, and never twice alike"],
              ].map(([num, text], i) => (
                <div
                  key={num}
                  className={`flex items-baseline gap-5.5 border-t border-espresso/22 py-4.5 ${
                    i === 2 ? "border-b" : ""
                  }`}
                >
                  <span className="font-mono text-label tracking-numeral text-brass-deep">
                    {num}
                  </span>
                  <span className="text-body text-espresso-soft">{text}</span>
                </div>
              ))}
            </div>

            <Button href="#maker" variant="secondary-dark" className="mt-10">
              Visit the atelier
            </Button>
          </div>
        </div>

        <div className="mt-[clamp(56px,7vw,112px)] border-t border-espresso/22 pt-9">
          <div className="pb-8.5 font-mono text-label tracking-wide text-clay uppercase">
            Also listed this season
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-(--spacing-gap-col)">
            {makers.map((maker) => (
              <ArtistCard key={maker.name} maker={maker} />
            ))}
          </div>
        </div>
      </section>

      {/* ── III. Collections ─────────────────────────────────── */}
      <section
        id="collections"
        className="px-(--spacing-section-x) py-(--spacing-section-y)"
      >
        <SectionHeading
          numeral="III."
          eyebrow="Curated by hand"
          title="Collections"
          className="pb-(--spacing-head-pb)"
        />
        <div className="flex flex-wrap gap-(--spacing-gap-col)">
          {collections.map((collection) => (
            <Link
              key={collection.title}
              href="#collections"
              className="flex min-w-0 flex-1 basis-[260px] flex-col gap-4.5 transition-opacity duration-200 hover:opacity-86"
            >
              <div className="relative aspect-3/4 max-h-[560px] overflow-hidden bg-ink-raised">
                <Media
                  src={collection.image}
                  alt={collection.title}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-brass/35 pt-4">
                <span className="font-display text-[27px] leading-[1.1] text-cream">
                  {collection.title}
                </span>
                <span className="font-mono text-label-sm tracking-rail whitespace-nowrap text-slate uppercase">
                  {collection.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── IV. Commission ───────────────────────────────────── */}
      <section
        id="commission"
        className="border-y border-brass/30 bg-ink-commission px-(--spacing-section-x) py-[clamp(64px,9vw,170px)]"
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-end gap-[clamp(36px,5vw,90px)]">
          <div className="min-w-0">
            <div className="pb-6.5 font-mono text-label tracking-wide text-brass uppercase">
              IV. — Bespoke
            </div>
            <h2 className="m-0 font-display text-display leading-[0.94] font-light tracking-display text-cream">
              Commission
              <br />
              <em className="italic text-brass-light">a piece.</em>
            </h2>
          </div>

          <div className="flex min-w-0 flex-col gap-7.5">
            <p className="m-0 max-w-[40ch] text-lede leading-[1.75] text-pretty text-bone-soft">
              Tell us the room, the use, and the light it will sit in. Within
              ten days we return with three makers, three sketches, and a price
              — no obligation.
            </p>
            <form className="flex max-w-[540px] flex-wrap gap-3">
              <label htmlFor="commission-email" className="sr-only">
                Your email
              </label>
              <input
                id="commission-email"
                type="email"
                placeholder="Your email"
                className="min-w-0 flex-1 basis-[220px] border border-brass/45 bg-transparent px-5 py-[17px] font-sans text-[14px] text-bone outline-none focus:border-brass"
              />
              <button
                type="button"
                className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors duration-200 hover:bg-cream"
              >
                Start a brief
              </button>
            </form>
            <div className="font-mono text-label-sm tracking-rail text-slate uppercase">
              Avg. lead time 14 weeks · 38 commissions this year
            </div>
          </div>
        </div>
      </section>

      {/* ── Journal ──────────────────────────────────────────── */}
      <section
        id="journal"
        className="px-(--spacing-section-x) py-[clamp(64px,9vw,150px)]"
      >
        <div className="flex flex-wrap items-end justify-between gap-6 pb-[clamp(32px,4vw,56px)]">
          <h2 className="m-0 font-display text-section-sm leading-none font-light tracking-quote text-cream">
            From the journal
          </h2>
          <RailLink href="#journal">All writing →</RailLink>
        </div>
        <div className="flex flex-wrap gap-(--spacing-gap-col)">
          {journal.map((entry) => (
            <Link
              key={entry.title}
              href="#journal"
              className="flex min-w-0 flex-1 basis-[260px] flex-col gap-4.5 transition-opacity duration-200 hover:opacity-86"
            >
              <div className="relative aspect-16/10 max-h-[300px] overflow-hidden bg-ink-raised">
                <Media
                  src={entry.image}
                  alt={entry.title}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="font-mono text-label-sm tracking-nav text-brass uppercase">
                {entry.date} · {entry.kind}
              </div>
              <div className="font-display text-card-title-sm leading-[1.18] text-cream">
                {entry.title}
              </div>
              <p className="m-0 text-body-sm leading-[1.7] text-bone-muted">
                {entry.blurb}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
