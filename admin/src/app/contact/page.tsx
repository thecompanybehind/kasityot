import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ContactForm } from "@/components/ContactForm";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getContactSettings, getQueueCounts } from "@/lib/queries";

export default async function ContactAdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [queues, content] = await Promise.all([
    getQueueCounts(),
    getContactSettings(),
  ]);

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading eyebrow="Site pages" title="Contact details" />
      <Rule />
      <p className="m-0 max-w-[62ch] pt-6 text-body-sm leading-[1.7] text-bone-muted">
        The phone number, email and address on the site&rsquo;s Contact page.
        Every field is optional: leave one blank and the site uses what is
        shown faintly in the box.
      </p>
      <div className="pt-8">
        <ContactForm content={content} />
      </div>
    </AdminShell>
  );
}
