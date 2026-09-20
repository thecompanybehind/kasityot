import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { HeroSlideForm } from "@/components/HeroSlideForm";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts, getHeroSlide } from "@/lib/queries";

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  const { id } = await params;
  const slide = await getHeroSlide(id);
  if (!slide) notFound();

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading eyebrow="Editing banner" title={slide.heading || "Banner"} />
      <Rule />
      <div className="pt-8">
        <HeroSlideForm slide={slide} />
      </div>
    </AdminShell>
  );
}
