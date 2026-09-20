import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkGallery } from "@/components/ArtworkGallery";
import { ArtworkActions } from "@/components/ArtworkActions";
import { Media } from "@/components/ui/Media";
import { formatPrice } from "@/lib/format";
import { getArtworkBySlug, getArtistBySlug } from "@/lib/queries";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) return { title: "Not found — Kasityot" };

  return {
    title: `${artwork.title} — Kasityot`,
    description: artwork.description.slice(0, 155),
    openGraph: {
      title: artwork.title,
      description: artwork.description.slice(0, 155),
      images: artwork.images.length ? [artwork.images[0]] : [],
    },
  };
}

/** One row of the ruled specification table. */
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-t border-bone/16 py-4 text-meta">
      <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
        {label}
      </span>
      <span className="text-right text-bone-soft">{value}</span>
    </div>
  );
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();

  const artist = artwork.artist
    ? await getArtistBySlug(artwork.artist.slug)
    : null;

  const sold = artwork.status === "sold";

  return (
    <article className="px-(--spacing-section-x) py-(--spacing-section-y)">
      <Link
        href="/artworks"
        className="font-mono text-label-sm tracking-rail text-slate uppercase transition-colors hover:text-brass"
      >
        ← All artworks
      </Link>

      <div className="grid grid-cols-1 gap-(--spacing-gap-wide) pt-8 lg:grid-cols-[1.15fr_1fr]">
        <ArtworkGallery images={artwork.images} title={artwork.title} sold={sold} />

        <div className="min-w-0">
          {artwork.artist ? (
            <div className="pb-4 font-mono text-label tracking-wide text-brass uppercase">
              {artwork.artist.craftType}
            </div>
          ) : null}

          <h1 className="m-0 font-display text-section leading-[0.98] font-light tracking-section text-cream">
            {artwork.title}
          </h1>

          <div className="pt-6 font-mono text-[18px] tracking-price text-brass">
            {formatPrice(artwork.price)}
          </div>

          {sold ? (
            <div className="mt-6 border border-brass/40 px-5 py-4 font-mono text-label tracking-rail text-brass uppercase">
              This piece has been sold
            </div>
          ) : null}

          <p className="m-0 pt-8 text-lede leading-[1.75] text-pretty text-bone-soft">
            {artwork.description}
          </p>

          <div className="pt-8">
            <Spec label="Material" value={artwork.material} />
            <Spec label="Dimensions" value={artwork.dimensions} />
            {artwork.artist ? (
              <Spec label="Region" value={artwork.artist.region} />
            ) : null}
          </div>

          {/* Sold pieces cannot be bought or enquired on. */}
          <ArtworkActions
            artworkId={artwork.id}
            artworkTitle={artwork.title}
            sold={sold}
            priceOnRequest={artwork.priceOnRequest}
          />
        </div>
      </div>

      {/* Artist block, linking through to the full profile. */}
      {artist ? (
        <section className="mt-[clamp(64px,8vw,128px)] border-t border-brass/30 pt-[clamp(40px,5vw,72px)]">
          <div className="pb-8 font-mono text-label tracking-wide text-slate uppercase">
            About the artist
          </div>
          <div className="flex flex-wrap items-start gap-(--spacing-gap-col)">
            {artist.photo ? (
              <div className="relative size-24 shrink-0 overflow-hidden rounded-pill bg-ink-raised">
                <Media src={artist.photo} alt={artist.name} sizes="96px" />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 basis-[280px]">
              <Link
                href={`/artists/${artist.slug}`}
                className="font-display text-card-title text-cream transition-colors hover:text-brass"
              >
                {artist.name}
              </Link>
              <div className="pt-2 font-mono text-label-sm tracking-rail text-brass uppercase">
                {artist.craftType} · {artist.region}
              </div>
              <p className="m-0 line-clamp-4 max-w-[60ch] pt-4 text-body-sm leading-[1.7] text-bone-muted">
                {artist.story}
              </p>
              <Link
                href={`/artists/${artist.slug}`}
                className="mt-5 inline-block border-b border-brass/50 pb-[5px] font-mono text-label tracking-nav text-brass uppercase transition-colors hover:text-cream"
              >
                See the full profile →
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
