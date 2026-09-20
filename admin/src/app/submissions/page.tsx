import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { SubmissionRow } from "@/components/SubmissionRow";
import { Empty, PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts, getSubmissions } from "@/lib/queries";

/**
 * The artwork review queue.
 *
 * Defaults to pending, because that is the only state needing the owner's
 * attention — an approved piece is already on the site and a rejected one is
 * with the artist.
 */
export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  const { status } = await searchParams;
  const filter =
    status === "approved" || status === "rejected" ? status : "pending";

  const submissions = await getSubmissions(filter);
  const pendingCount =
    filter === "pending"
      ? submissions.length
      : (await getSubmissions("pending")).length;

  const TABS = [
    {
      label: `Pending${pendingCount ? ` (${pendingCount})` : ""}`,
      href: "/submissions",
      active: filter === "pending",
    },
    {
      label: "Approved",
      href: "/submissions?status=approved",
      active: filter === "approved",
    },
    {
      label: "Rejected",
      href: "/submissions?status=rejected",
      active: filter === "rejected",
    },
  ];

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading
        eyebrow="Submissions"
        title="Work awaiting review"
        action={
          <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
            {pendingCount
              ? `${pendingCount} waiting on you`
              : "Nothing waiting on you"}
          </span>
        }
      />
      <Rule />

      <nav className="flex flex-wrap gap-6 pt-6 font-mono text-label tracking-nav uppercase">
        {TABS.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className={
              t.active
                ? "text-brass"
                : "text-slate transition-colors hover:text-bone"
            }
          >
            {t.label}
          </a>
        ))}
      </nav>

      <div className="pt-4">
        {submissions.length === 0 ? (
          <Empty
            title="Nothing here"
            body={
              filter === "pending"
                ? "When an artist submits a piece from their studio, it waits here until you approve it."
                : "No pieces in this state."
            }
          />
        ) : (
          submissions.map((a) => <SubmissionRow key={a.id} artwork={a} />)
        )}
      </div>
    </AdminShell>
  );
}
