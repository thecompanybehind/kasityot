import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ArtistForm } from "@/components/ArtistForm";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts } from "@/lib/queries";

export default async function NewArtistPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading eyebrow="Artists" title="Add an artist" />
      <Rule />
      <div className="pt-8">
        <ArtistForm artist={null} />
      </div>
    </AdminShell>
  );
}
