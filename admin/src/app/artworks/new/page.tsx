import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ArtworkForm } from "@/components/ArtworkForm";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts, getArtistOptions } from "@/lib/queries";

export default async function NewArtworkPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  const artists = await getArtistOptions();

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading eyebrow="Artworks" title="Add a piece" />
      <Rule />
      <div className="pt-8">
        <ArtworkForm artwork={null} artists={artists} />
      </div>
    </AdminShell>
  );
}
