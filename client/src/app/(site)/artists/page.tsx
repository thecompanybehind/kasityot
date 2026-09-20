import type { Metadata } from "next";
import { ArtistDirectory } from "@/components/ArtistDirectory";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getArtists } from "@/lib/queries";

/** Cached for a minute: the directory hits the database on every request otherwise. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Artists — Kasityot",
  description:
    "The artists behind the work: Madhubani painters, blue potters, pashmina weavers and more, across India.",
};

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ craft?: string; region?: string }>;
}) {
  const sp = await searchParams;
  const artists = await getArtists({
    craftType: sp.craft || undefined,
    region: sp.region || undefined,
  });

  // Options come from the full visible set, not the filtered one, so the
  // dropdowns don't collapse to a single choice after one selection.
  const all = await getArtists();
  const craftTypes = [...new Set(all.map((a) => a.craftType))].sort();
  const regions = [...new Set(all.map((a) => a.region))].sort();

  return (
    <section className="px-(--spacing-section-x) py-(--spacing-section-y)">
      <SectionHeading
        eyebrow={`${artists.length} ${artists.length === 1 ? "artist" : "artists"}`}
        title="The artists"
      />
      <div className="mt-(--spacing-rule-mt) h-px bg-brass/30" />

      <ArtistDirectory
        artists={artists}
        craftTypes={craftTypes}
        regions={regions}
        current={{ craft: sp.craft ?? "", region: sp.region ?? "" }}
      />
    </section>
  );
}
