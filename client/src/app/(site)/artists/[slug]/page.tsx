import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtistVideo } from "@/components/ArtistVideo";
import { ArtworkCard } from "@/components/ArtworkCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Chars } from "@/components/ui/SplitText";
import { getArtistBySlug, getArtists, getArtworksByArtist } from "@/lib/queries";

/** Cached for a minute. generateStaticParams pre-builds the pages that exist at deploy time. */
export const revalidate = 60;

type Params = { slug: string };

/** Pre-build every artist page that exists at deploy time. */
export async function generateStaticParams() {
  const artists = await getArtists();
  return artists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "Not found — Kasityot" };

  return {
    title: `${artist.name} — Kasityot`,
    description: artist.story.slice(0, 155),
    openGraph: {
      title: artist.name,
      description: artist.story.slice(0, 155),
      images: artist.photo ? [artist.photo] : [],
    },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const artworks = await getArtworksByArtist(artist.id);

  return (
    <article>
      {/* ── Profile header on parchment ────────────────────── */}
      <section className="bg-parchment px-(--spacing-section-x) py-(--spacing-section-y) text-espresso">
        <Link
          href="/artists"
          className="font-mono text-label-sm tracking-rail text-clay uppercase transition-colors hover:text-brass-deep"
        >
          ← All artists
        </Link>

        <div className="grid grid-cols-1 gap-(--spacing-gap-wide) pt-8 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          {/*
            Optional field: no photo means no frame at all. The grid gap
            collapses because the element is absent, not empty.
          */}
          {artist.photo ? (
            <Reveal className="min-w-0">
              {/* The portrait is uncovered behind a slanted edge. */}
              <div className="rv-slant relative aspect-2/3 overflow-hidden bg-parchment-deep">
                <div className="rv-zoom absolute inset-0">
                  <Media
                    src={artist.photo}
                    alt={artist.name}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                </div>
              </div>
            </Reveal>
          ) : null}

          <Reveal className="min-w-0">
            <div className="pb-4 font-mono text-label tracking-wide text-clay uppercase">
              <span className="rv-type inline-block [--rv-offset:300ms]">
                {artist.craftType} · {artist.region}
              </span>
            </div>
            {/* The name is set a letter at a time, like a signature. */}
            <h1 className="m-0 font-display text-section leading-[0.98] font-light tracking-section text-espresso [--rv-base:450ms]">
              <Chars text={artist.name} />
            </h1>
            <p className="rv-unroll m-0 max-w-[58ch] pt-8 text-lede leading-[1.75] text-pretty text-espresso-soft [--rv-offset:900ms]">
              {artist.story}
            </p>
          </Reveal>
        </div>
      </section>

      {/*
        HARD CLIENT REQUIREMENT: an artist with no video renders no video
        block whatsoever — no empty frame, no reserved height, no gap. The
        whole <section> is absent from the tree, so the page reflows as if
        it never existed.
      */}
      {artist.videoUrl ? (
        <Reveal
          as="section"
          className="px-(--spacing-section-x) py-(--spacing-section-y)"
        >
          {/* Centred as one block, so the label stays on the video's edge. */}
          <div className="mx-auto max-w-[1230px]">
            <div className="pb-8 font-mono text-label tracking-wide text-slate uppercase">
              <span className="rv-type inline-block">In the studio</span>
            </div>
            <ArtistVideo
              url={artist.videoUrl}
              name={artist.name}
              wide
              className="rv-slant [--rv-offset:200ms]"
            />
          </div>
        </Reveal>
      ) : null}

      {/* ── Their work ─────────────────────────────────────── */}
      <section className="px-(--spacing-section-x) py-(--spacing-section-y)">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="m-0 font-display text-section-sm leading-none font-light tracking-quote text-cream">
            <span className="mask-line">
              <span className="rv-line">Work by {artist.name}</span>
            </span>
          </h2>
          <span className="rv-type font-mono text-label-sm tracking-rail text-slate uppercase [--rv-offset:400ms]">
            {artworks.length} {artworks.length === 1 ? "piece" : "pieces"}
          </span>
        </Reveal>
        <Reveal className="rv-rule mt-(--spacing-rule-mt) h-px bg-brass/30" />

        {artworks.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-(--spacing-gap-grid) pt-(--spacing-rule-mt)">
            {artworks.map((artwork, i) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                stagger={i % 3}
                unveil="aside"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No pieces listed yet"
            body={`${artist.name}'s work is being photographed and will appear here shortly.`}
          />
        )}
      </section>
    </article>
  );
}
