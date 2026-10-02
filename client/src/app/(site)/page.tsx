import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Words } from "@/components/ui/SplitText";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Preloader } from "@/components/Preloader";
import { getArtists, getFeaturedArtworks, getHeroSlides } from "@/lib/queries";

/**
 * The home page reads the banner, featured artworks and artists from the
 * database. Without this it would be baked at build time and the owner's
 * changes in the admin panel would never appear until the next deploy.
 */
export const revalidate = 60;

const INTERLUDE =
  "Nothing here was made in a hurry, and nothing here was made twice.";

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

export default async function Home() {
  const [artworks, artists, heroSlides] = await Promise.all([
    getFeaturedArtworks(6),
    getArtists(),
    getHeroSlides(),
  ]);

  // The maker-in-residence block features whichever artist has a story to
  // tell; falling back to none renders nothing rather than an empty frame.
  const resident = artists[0] ?? null;
  const others = artists.slice(1, 5);

  return (
    <>
      <Preloader />
      <HeroCarousel slides={heroSlides} artistCount={artists.length} />

      {/* ── I. Artworks ──────────────────────────────────────── */}
      <section
        id="pieces"
        className="px-(--spacing-section-x) py-(--spacing-section-y)"
      >
        <SectionHeading
          numeral="I."
          eyebrow="Currently available"
          title="Pieces in the room"
          action={<RailLink href="/artworks">All artworks →</RailLink>}
        />
        <Reveal className="rv-rule mt-(--spacing-rule-mt) h-px bg-brass/30" />

        {artworks.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-(--spacing-gap-grid) pt-(--spacing-rule-mt)">
            {artworks.map((artwork, i) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                priority={i < 3}
                stagger={i % 3}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No artworks yet"
            body="The first pieces are being photographed. Check back shortly."
          />
        )}
      </section>

      {/* ── Interlude ────────────────────────────────────────── */}
      <section className="relative grid min-h-[min(78vh,760px)] items-center overflow-hidden bg-ink-panel">
        <div className="absolute inset-0 opacity-62">
          {/* The photograph drifts against the scroll, behind the quote. */}
          <div className="k-parallax absolute inset-0">
            <Media
              src="/design/279965af-0eed-4455-805c-d10ab40a07ed.jpg"
              alt="Hands at the wheel"
              sizes="100vw"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-ink-overlay/90 via-ink-overlay/50 via-55% to-ink-overlay/25" />
        <Reveal className="relative max-w-[min(100%,900px)] px-(--spacing-section-x) py-[clamp(48px,7vw,120px)]">
          <div className="pb-7 font-mono text-label tracking-wider text-brass uppercase">
            <span className="rv-type inline-block">Interlude</span>
          </div>
          {/* The quote is set a word at a time, at reading pace. */}
          <p className="m-0 font-display text-quote leading-[1.16] font-light tracking-quote text-balance text-cream italic [--rv-base:300ms]">
            <Words text={INTERLUDE} />
          </p>
        </Reveal>
      </section>

      {/* ── II. Artist in residence ──────────────────────────── */}
      {resident ? (
        <section
          id="maker"
          className="bg-parchment px-(--spacing-section-x) py-(--spacing-section-y) text-espresso"
        >
          <SectionHeading
            numeral="II."
            eyebrow="Artist in residence"
            title={resident.name}
            tone="light"
            className="pb-(--spacing-head-pb)"
          />

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-end gap-(--spacing-gap-wide)">
            <Reveal className="grid min-w-0 grid-cols-2 gap-3.5">
              <div className="rv-curtain relative aspect-2/3 overflow-hidden bg-parchment-deep">
                {resident.photo ? (
                  <div className="rv-zoom absolute inset-0">
                    <Media
                      src={resident.photo}
                      alt={`${resident.name} at work`}
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                ) : null}
              </div>
              <div className="grid content-end gap-3.5">
                <div className="rv-curtain relative aspect-square overflow-hidden bg-parchment-deep [--rv-offset:160ms]">
                  <div className="rv-zoom absolute inset-0">
                    <Media
                      src="/design/d15d5026-9ae9-4067-8eb7-c52d4742cd24.jpg"
                      alt="Hands shaping the work"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </div>
                <div className="rv-curtain relative aspect-square overflow-hidden bg-parchment-deep [--rv-offset:320ms]">
                  <div className="rv-zoom absolute inset-0">
                    <Media
                      src="/design/121d59b0-96d8-4319-8eb9-b16c34cedbce.jpg"
                      alt="Tools of the craft"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal className="min-w-0">
              <div className="pb-7.5 font-mono text-label tracking-nav text-clay uppercase">
                <span className="rv-type inline-block">
                  {resident.craftType} · {resident.region}
                </span>
              </div>
              {/* The story unrolls downward, like a scroll being opened. */}
              <blockquote className="rv-unroll m-0 max-w-[34ch] font-display text-pull leading-[1.32] font-light text-espresso italic [--rv-offset:200ms]">
                {resident.story}
              </blockquote>
              <div className="rv-wipe [--rv-offset:700ms]">
                <Button
                  href={`/artists/${resident.slug}`}
                  variant="secondary-dark"
                  className="mt-10"
                >
                  Visit the studio
                </Button>
              </div>
            </Reveal>
          </div>

          {others.length ? (
            <div className="mt-[clamp(56px,7vw,112px)]">
              <Reveal className="relative pt-9 pb-8.5 font-mono text-label tracking-wide text-clay uppercase">
                <span
                  aria-hidden
                  className="rv-rule absolute inset-x-0 top-0 h-px bg-espresso/22"
                />
                <span className="rv-type inline-block [--rv-offset:300ms]">
                  Also showing
                </span>
              </Reveal>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-(--spacing-gap-col)">
                {others.map((artist, i) => (
                  <ArtistCard key={artist.id} artist={artist} stagger={i} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
