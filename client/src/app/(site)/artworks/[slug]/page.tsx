import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkGallery } from "@/components/ArtworkGallery";
import { ArtworkActions } from "@/components/ArtworkActions";
import { CountUp } from "@/components/ui/CountUp";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/format";
import { getArtworkBySlug, getArtistBySlug, getArtworks } from "@/lib/queries";

/** Cached for a minute. generateStaticParams pre-builds the pages that exist at deploy time. */
export const revalidate = 60;

type Params = { slug: string };

/** Pre-build every artwork page that exists at deploy time, so the first
 *  visitor does not pay for a cold database round trip. */
export async function generateStaticParams() {
  const artworks = await getArtworks();
  return artworks.map((a) => ({ slug: a.slug }));
}

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
    alternates: { canonical: `/artworks/${artwork.slug}` },
    openGraph: {
      type: "website",
      title: artwork.title,
      description: artwork.description.slice(0, 155),
      images: artwork.images.length ? [artwork.images[0]] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: artwork.title,
      description: artwork.description.slice(0, 155),
      images: artwork.images.length ? [artwork.images[0]] : [],
    },
  };
}

/** When the first specification row starts, and the gap to each after it. */
const SPECS_START_MS = 700;
const SPEC_STEP_MS = 120;

/**
 * One row of the ruled specification table. The rule draws across, the
 * label rises behind it and the value slides in from the right-hand edge.
 */
function Spec({ label, value, n }: { label: string; value: string; n: number }) {
  return (
    <div
      className="relative flex items-baseline justify-between gap-6 overflow-hidden py-4.5 text-lede"
      style={
        { "--rv-offset": `${SPECS_START_MS + n * SPEC_STEP_MS}ms` } as CSSProperties
      }
    >
      <span
        aria-hidden
        className="rv-rule absolute inset-x-0 top-0 h-px bg-bone/16"
      />
      <span className="rv-line font-mono text-spec-label tracking-rail text-slate uppercase">
        {label}
      </span>
      <span className="rv-slide text-right text-bone-soft">{value}</span>
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

  const specs: [string, string][] = [
    ["Material", artwork.material],
    ["Dimensions", artwork.dimensions],
    ...(artwork.artist
      ? ([["Region", artwork.artist.region]] as [string, string][])
      : []),
  ];

  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  /* Product structured data. Price-on-request pieces advertise no offer
     price, since schema.org has no way to say "ask us". */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: artwork.title,
    description: artwork.description,
    image: artwork.images,
    material: artwork.material,
    ...(artist ? { brand: { "@type": "Person", name: artist.name } } : {}),
    offers: {
      "@type": "Offer",
      url: `${base}/artworks/${artwork.slug}`,
      priceCurrency: "INR",
      ...(artwork.price != null
        ? { price: (artwork.price / 100).toFixed(2) }
        : {}),
      availability: sold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <article className="px-(--spacing-section-x) py-(--spacing-section-y)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/artworks"
        className="font-mono text-label-sm tracking-rail text-slate uppercase transition-colors hover:text-brass"
      >
        ← All artworks
      </Link>

      <div className="grid grid-cols-1 gap-(--spacing-gap-wide) pt-8 lg:grid-cols-[1.15fr_1fr]">
        {/* The photograph's cover draws aside; the details then assemble
            beside it, ending on the price counting up. */}
        <Reveal className="min-w-0">
          <ArtworkGallery images={artwork.images} title={artwork.title} sold={sold} />
        </Reveal>

        <Reveal className="min-w-0">
          {artwork.artist ? (
            <div className="pb-4 font-mono text-spec-label tracking-wide text-brass uppercase">
              <span className="rv-type inline-block">
                {artwork.artist.craftType}
              </span>
            </div>
          ) : null}

          <h1 className="m-0 font-display text-section leading-[0.98] font-light tracking-section text-cream">
            <span className="mask-line">
              <span className="rv-line [--rv-offset:120ms]">{artwork.title}</span>
            </span>
          </h1>

          <div className="pt-7 font-mono text-price-lg leading-[1.1] tracking-price text-brass">
            <span className="mask-line">
              <span className="rv-line [--rv-offset:300ms]">
                {artwork.price != null ? (
                  <CountUp paise={artwork.price} />
                ) : (
                  formatPrice(artwork.price)
                )}
              </span>
            </span>
          </div>

          {sold ? (
            <div className="rv-wipe mt-6 border border-brass/40 px-5 py-4 font-mono text-spec-label tracking-rail text-brass uppercase [--rv-offset:400ms]">
              This piece has been sold
            </div>
          ) : null}

          <p className="rv-unroll m-0 pt-8 text-lede leading-[1.75] text-pretty text-bone-soft [--rv-offset:480ms]">
            {artwork.description}
          </p>

          <div className="pt-8">
            {specs.map(([label, value], n) => (
              <Spec key={label} label={label} value={value} n={n} />
            ))}
          </div>

          {/* Sold pieces cannot be bought or enquired on. */}
          <div className="rv-wipe [--rv-offset:1100ms]">
            <ArtworkActions
              artworkId={artwork.id}
              artworkTitle={artwork.title}
              sold={sold}
              priceOnRequest={artwork.priceOnRequest}
            />
          </div>
        </Reveal>
      </div>

      {/* Artist block, linking through to the full profile. */}
      {artist ? (
        <Reveal
          as="section"
          className="relative mt-[clamp(64px,8vw,128px)] pt-[clamp(40px,5vw,72px)]"
        >
          <span
            aria-hidden
            className="rv-rule absolute inset-x-0 top-0 h-px bg-brass/30"
          />
          <div className="pb-8 font-mono text-label tracking-wide text-slate uppercase">
            <span className="rv-type inline-block [--rv-offset:300ms]">
              About the artist
            </span>
          </div>
          <div className="flex flex-wrap items-start gap-(--spacing-gap-col)">
            {artist.photo ? (
              <div className="rv-pop relative size-24 shrink-0 overflow-hidden rounded-pill bg-ink-raised [--rv-offset:300ms]">
                <Media src={artist.photo} alt={artist.name} sizes="96px" />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 basis-[280px]">
              <div className="mask-line font-display text-card-title">
                <span className="rv-line [--rv-offset:420ms]">
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="text-cream transition-colors hover:text-brass"
                  >
                    {artist.name}
                  </Link>
                </span>
              </div>
              <div className="pt-2 font-mono text-label-sm tracking-rail text-brass uppercase">
                <span className="rv-type inline-block [--rv-offset:560ms]">
                  {artist.craftType} · {artist.region}
                </span>
              </div>
              <p className="rv-unroll m-0 line-clamp-4 max-w-[60ch] pt-4 text-body-sm leading-[1.7] text-bone-muted [--rv-offset:680ms]">
                {artist.story}
              </p>
              <div className="rv-wipe [--rv-offset:1000ms]">
                <Link
                  href={`/artists/${artist.slug}`}
                  className="mt-5 inline-block border-b border-brass/50 pb-[5px] font-mono text-label tracking-nav text-brass uppercase transition-colors hover:text-cream"
                >
                  See the full profile →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      ) : null}
    </article>
  );
}
