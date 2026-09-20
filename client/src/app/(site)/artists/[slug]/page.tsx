import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkCard } from "@/components/ArtworkCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Media } from "@/components/ui/Media";
import { getArtistBySlug, getArtworksByArtist } from "@/lib/queries";

type Params = { slug: string };

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
            <div className="relative aspect-2/3 min-w-0 overflow-hidden bg-parchment-deep">
              <Media
                src={artist.photo}
                alt={artist.name}
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>
          ) : null}

          <div className="min-w-0">
            <div className="pb-4 font-mono text-label tracking-wide text-clay uppercase">
              {artist.craftType} · {artist.region}
            </div>
            <h1 className="m-0 font-display text-section leading-[0.98] font-light tracking-section text-espresso">
              {artist.name}
            </h1>
            <p className="m-0 max-w-[58ch] pt-8 text-lede leading-[1.75] text-pretty text-espresso-soft">
              {artist.story}
            </p>
          </div>
        </div>
      </section>

      {/*
        HARD CLIENT REQUIREMENT: an artist with no video renders no video
        block whatsoever — no empty frame, no reserved height, no gap. The
        whole <section> is absent from the tree, so the page reflows as if
        it never existed.
      */}
      {artist.videoUrl ? (
        <section className="px-(--spacing-section-x) py-(--spacing-section-y)">
          <div className="pb-8 font-mono text-label tracking-wide text-slate uppercase">
            In the studio
          </div>
          <div className="relative aspect-video w-full overflow-hidden bg-ink-raised">
            <iframe
              src={artist.videoUrl}
              title={`${artist.name} at work`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </div>
        </section>
      ) : null}

      {/* ── Their work ─────────────────────────────────────── */}
      <section className="px-(--spacing-section-x) py-(--spacing-section-y)">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="m-0 font-display text-section-sm leading-none font-light tracking-quote text-cream">
            Work by {artist.name}
          </h2>
          <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
            {artworks.length} {artworks.length === 1 ? "piece" : "pieces"}
          </span>
        </div>
        <div className="mt-(--spacing-rule-mt) h-px bg-brass/30" />

        {artworks.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-(--spacing-gap-grid) pt-(--spacing-rule-mt)">
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
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
