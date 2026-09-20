import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ArtistForm } from "@/components/ArtistForm";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getArtist } from "@/lib/queries";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) notFound();

  return (
    <AdminShell email={session.email}>
      <PageHeading eyebrow="Editing" title={artist.name} />
      <Rule />
      <div className="pt-8">
        <ArtistForm artist={artist} />
      </div>
    </AdminShell>
  );
}
