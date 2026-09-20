import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { getArtists, getFeaturedArtworks } from "@/lib/queries";

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
  const [artworks, artists] = await Promise.all([
    getFeaturedArtworks(6),
    getArtists(),
  ]);

  // The maker-in-residence block features whichever artist has a story to
  // tell; falling back to none renders nothing rather than an empty frame.
  const resident = artists[0] ?? null;
  const others = artists.slice(1, 5);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        id="top"
        className="relative grid min-h-[min(92vh,900px)] items-end overflow-hidden bg-ink-raised"
      >
        <div className="absolute inset-0 animate-fade">
          <Media
            src="/design/a7cbff28-f98a-4d87-b8e1-ff3b89c4275c.jpg"
            alt="An artist at work"
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
              <span>Handmade in India</span>
            </div>
            <h1 className="m-0 font-display text-hero leading-[0.82] font-light tracking-hero text-balance text-cream">
              The hand,
              <br />
              <em className="italic text-brass-light">unhurried.</em>
            </h1>
            <p className="m-0 max-w-[44ch] text-lede leading-[1.75] text-pretty text-bone-soft">
              Objects made slowly, by people we know by name. Signed,
              traceable, and meant to outlive their first owner.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-2.5">
              <Button href="/artworks">View the full collection</Button>
              <Button href="/artists" variant="secondary">
                Meet the artists
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-[clamp(18px,4vw,60px)] border-t border-brass/42 pt-5.5 font-mono text-label tracking-rail text-stone uppercase">
            <span>Every piece one of a kind</span>
            <div className="flex flex-wrap gap-[clamp(18px,3vw,44px)] text-brass">
              <span>{artists.length} artists</span>
              <span>{artworks.length ? "Never a series" : "Newly opened"}</span>
            </div>
          </div>
        </div>
      </section>

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
        <div className="mt-(--spacing-rule-mt) h-px animate-rule bg-brass/30" />

        {artworks.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-(--spacing-gap-grid) pt-(--spacing-rule-mt)">
            {artworks.map((artwork, i) => (
              <ArtworkCard key={artwork.id} artwork={artwork} priority={i < 3} />
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
          <Media
            src="/design/279965af-0eed-4455-805c-d10ab40a07ed.jpg"
            alt="Hands at the wheel"
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
            <div className="grid min-w-0 grid-cols-2 gap-3.5">
              <div className="relative aspect-2/3 overflow-hidden bg-parchment-deep">
                {resident.photo ? (
                  <Media
                    src={resident.photo}
                    alt={`${resident.name} at work`}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : null}
              </div>
              <div className="grid content-end gap-3.5">
                <div className="relative aspect-square overflow-hidden bg-parchment-deep">
                  <Media
                    src="/design/d15d5026-9ae9-4067-8eb7-c52d4742cd24.jpg"
                    alt="Hands shaping the work"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden bg-parchment-deep">
                  <Media
                    src="/design/121d59b0-96d8-4319-8eb9-b16c34cedbce.jpg"
                    alt="Tools of the craft"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="pb-7.5 font-mono text-label tracking-nav text-clay uppercase">
                {resident.craftType} · {resident.region}
              </div>
              <blockquote className="m-0 max-w-[34ch] font-display text-pull leading-[1.32] font-light text-espresso italic">
                {resident.story}
              </blockquote>
              <Button
                href={`/artists/${resident.slug}`}
                variant="secondary-dark"
                className="mt-10"
              >
                Visit the studio
              </Button>
            </div>
          </div>

          {others.length ? (
            <div className="mt-[clamp(56px,7vw,112px)] border-t border-espresso/22 pt-9">
              <div className="pb-8.5 font-mono text-label tracking-wide text-clay uppercase">
                Also showing
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-(--spacing-gap-col)">
                {others.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
