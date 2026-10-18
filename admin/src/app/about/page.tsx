import { redirect } from "next/navigation";
import { AboutForm } from "@/components/AboutForm";
import { AdminShell } from "@/components/AdminShell";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getAboutContent, getQueueCounts } from "@/lib/queries";

export default async function AboutAdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [queues, content] = await Promise.all([
    getQueueCounts(),
    getAboutContent(),
  ]);

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading eyebrow="Site pages" title="About page" />
      <Rule />
      <p className="m-0 max-w-[62ch] pt-6 text-body-sm leading-[1.7] text-bone-muted">
        Every field is optional. Leave one blank and the page uses its normal
        wording, shown faintly in the box. Changes reach the site within a
        minute of saving.
      </p>
      <div className="pt-8">
        <AboutForm content={content} />
      </div>
    </AdminShell>
  );
}
