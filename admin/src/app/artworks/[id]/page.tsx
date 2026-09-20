import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ArtworkForm } from "@/components/ArtworkForm";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts, getArtistOptions, getArtwork } from "@/lib/queries";

export default async function EditArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  const { id } = await params;
  const [artwork, artists] = await Promise.all([
    getArtwork(id),
    getArtistOptions(),
  ]);
  if (!artwork) notFound();

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading eyebrow="Editing" title={artwork.title} />
      <Rule />
      <div className="pt-8">
        <ArtworkForm artwork={artwork} artists={artists} />
      </div>
    </AdminShell>
  );
}
