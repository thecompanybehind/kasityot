import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ArtworkRow } from "@/components/ArtworkRow";
import { ArtworkSearch } from "@/components/ArtworkSearch";
import { ButtonLink, Empty, PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts, getArtistOptions, getArtworks } from "@/lib/queries";

export default async function ArtworksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; artist?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  const sp = await searchParams;
  const [artworks, artists] = await Promise.all([
    getArtworks({
      search: sp.q || undefined,
      status: sp.status || undefined,
      artistId: sp.artist || undefined,
    }),
    getArtistOptions(),
  ]);

  const filtered = Boolean(sp.q || sp.status || sp.artist);

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading
        eyebrow={`${artworks.length} ${artworks.length === 1 ? "piece" : "pieces"}`}
        title="Artworks"
        action={<ButtonLink href="/artworks/new">Add artwork</ButtonLink>}
      />
      <Rule />

      <ArtworkSearch
        artists={artists}
        current={{
          q: sp.q ?? "",
          status: sp.status ?? "",
          artist: sp.artist ?? "",
        }}
      />

      {artworks.length ? (
        <div className="flex flex-col pt-4">
          {artworks.map((artwork) => (
            <ArtworkRow key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <Empty
          title={filtered ? "Nothing matches" : "No artworks yet"}
          body={
            filtered
              ? "Try a different search or clear the filters."
              : "Add your first piece to see it on the public site."
          }
        />
      )}

      {artists.length === 0 ? (
        <p className="pt-8 text-body-sm text-bone-muted">
          You need an artist before you can add artwork.{" "}
          <Link href="/artists/new" className="text-brass hover:underline">
            Add an artist first →
          </Link>
        </p>
      ) : null}
    </AdminShell>
  );
}
