import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { HeroSlideForm } from "@/components/HeroSlideForm";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts } from "@/lib/queries";

export default async function NewHeroSlidePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading eyebrow="Home banner" title="Add a banner" />
      <Rule />
      <div className="pt-8">
        <HeroSlideForm slide={null} />
      </div>
    </AdminShell>
  );
}
