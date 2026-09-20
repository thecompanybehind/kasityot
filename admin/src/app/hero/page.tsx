import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { HeroSlideRow } from "@/components/HeroSlideRow";
import { ButtonLink, Empty, PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts, getHeroSlides } from "@/lib/queries";

export default async function HeroPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  const slides = await getHeroSlides();
  const visible = slides.filter((s) => s.status === "visible").length;

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading
        eyebrow={`${visible} showing on the site`}
        title="Home banner"
        action={<ButtonLink href="/hero/new">Add banner</ButtonLink>}
      />
      <Rule />

      <p className="max-w-[62ch] pt-6 text-body-sm leading-[1.7] text-bone-muted">
        {visible > 1
          ? "These rotate automatically every 5 seconds, in the order below. Visitors can also tap the dots to move between them."
          : visible === 1
            ? "One banner is showing, so it stays put. Add a second and they will rotate every 5 seconds."
            : "No banners are showing, so the site falls back to its original photograph and wording."}
      </p>

      {slides.length ? (
        <div className="flex flex-col pt-6">
          {slides.map((slide, i) => (
            <HeroSlideRow
              key={slide.id}
              slide={slide}
              position={i}
              total={slides.length}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="No banners yet"
          body="The home page is showing its original photograph. Add a banner to replace it."
        />
      )}
    </AdminShell>
  );
}
