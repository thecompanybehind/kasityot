import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ApplicationRow } from "@/components/ApplicationRow";
import { Empty, PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts, getApplications } from "@/lib/queries";

/**
 * The artist application queue.
 *
 * Nobody reaches the studio without a decision here, so pending applications
 * lead and the filter defaults to them.
 */
export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  const { status } = await searchParams;
  const filter =
    status === "approved" || status === "rejected" || status === "pending"
      ? status
      : undefined;

  const applications = await getApplications(filter);
  const pendingCount = (await getApplications("pending")).length;

  const TABS = [
    { label: "All", href: "/applications", active: !filter },
    {
      label: `Pending${pendingCount ? ` (${pendingCount})` : ""}`,
      href: "/applications?status=pending",
      active: filter === "pending",
    },
    {
      label: "Approved",
      href: "/applications?status=approved",
      active: filter === "approved",
    },
    {
      label: "Rejected",
      href: "/applications?status=rejected",
      active: filter === "rejected",
    },
  ];

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading
        eyebrow="Applications"
        title="Artists asking to join"
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
              t.active ? "text-brass" : "text-slate transition-colors hover:text-bone"
            }
          >
            {t.label}
          </a>
        ))}
      </nav>

      <div className="pt-4">
        {applications.length === 0 ? (
          <Empty
            title="No applications"
            body={
              filter
                ? "Nothing in this state yet."
                : "When an artist fills in the join form, they appear here for your decision."
            }
          />
        ) : (
          applications.map((a) => <ApplicationRow key={a.id} artist={a} />)
        )}
      </div>
    </AdminShell>
  );
}
