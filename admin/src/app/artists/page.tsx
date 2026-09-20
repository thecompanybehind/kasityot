import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ArtistRow } from "@/components/ArtistRow";
import { ButtonLink, Empty, PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getArtists } from "@/lib/queries";

export default async function ArtistsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const artists = await getArtists();

  return (
    <AdminShell email={session.email}>
      <PageHeading
        eyebrow={`${artists.length} ${artists.length === 1 ? "artist" : "artists"}`}
        title="Artists"
        action={<ButtonLink href="/artists/new">Add artist</ButtonLink>}
      />
      <Rule />

      {artists.length ? (
        <div className="flex flex-col pt-4">
          {artists.map((artist) => (
            <ArtistRow key={artist.id} artist={artist} />
          ))}
        </div>
      ) : (
        <Empty
          title="No artists yet"
          body="Add an artist before you add their work — every artwork belongs to one."
        />
      )}
    </AdminShell>
  );
}
