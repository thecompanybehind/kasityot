import type { Metadata } from "next";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ArtworkFilters } from "@/components/ArtworkFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getArtists, getArtworks, type ArtworkFilters as Filters } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Artworks — Kasityot",
  description:
    "One-of-a-kind handmade pieces by Indian artists. Every work is signed, traceable and made by hand.",
};

type Search = {
  craft?: string;
  artist?: string;
  min?: string;
  max?: string;
  sort?: string;
};

const SORTS = new Set(["newest", "price-asc", "price-desc", "title"]);

export default async function ArtworksPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  // searchParams is a Promise in this version of Next.
  const sp = await searchParams;

  const filters: Filters = {
    craftType: sp.craft || undefined,
    artistSlug: sp.artist || undefined,
    // Prices come in as rupees from the UI but are stored in paise.
    minPrice: sp.min ? Number(sp.min) * 100 : undefined,
    maxPrice: sp.max ? Number(sp.max) * 100 : undefined,
    sort: SORTS.has(sp.sort ?? "") ? (sp.sort as Filters["sort"]) : "newest",
  };

  const [artworks, artists] = await Promise.all([
    getArtworks(filters),
    getArtists(),
  ]);

  const craftTypes = [...new Set(artists.map((a) => a.craftType))].sort();
  const hasFilters = Boolean(sp.craft || sp.artist || sp.min || sp.max);

  return (
    <section className="px-(--spacing-section-x) py-(--spacing-section-y)">
      <SectionHeading
        eyebrow={`${artworks.length} ${artworks.length === 1 ? "piece" : "pieces"}`}
        title="Every artwork"
      />
      <div className="mt-(--spacing-rule-mt) h-px bg-brass/30" />

      <ArtworkFilters
        craftTypes={craftTypes}
        artists={artists.map((a) => ({ slug: a.slug, name: a.name }))}
        current={{
          craft: sp.craft ?? "",
          artist: sp.artist ?? "",
          min: sp.min ?? "",
          max: sp.max ?? "",
          sort: sp.sort ?? "newest",
        }}
      />

      {artworks.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-(--spacing-gap-grid) pt-(--spacing-rule-mt)">
          {artworks.map((artwork, i) => (
            <ArtworkCard key={artwork.id} artwork={artwork} priority={i < 3} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={hasFilters ? "Nothing matches those filters" : "No artworks yet"}
          body={
            hasFilters
              ? "Try widening the price range, or clear the filters to see everything."
              : "The first pieces are being photographed. Check back shortly."
          }
        />
      )}
    </section>
  );
}
