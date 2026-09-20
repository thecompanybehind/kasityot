import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ArtistForm } from "@/components/ArtistForm";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";

export default async function NewArtistPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <AdminShell email={session.email}>
      <PageHeading eyebrow="Artists" title="Add an artist" />
      <Rule />
      <div className="pt-8">
        <ArtistForm artist={null} />
      </div>
    </AdminShell>
  );
}
