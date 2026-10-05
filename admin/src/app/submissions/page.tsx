import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { SubmissionRow } from "@/components/SubmissionRow";
import { Empty, PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { VideoSubmissionRow } from "@/components/VideoSubmissionRow";
import {
  getQueueCounts,
  getSubmissions,
  getVideoSubmissions,
} from "@/lib/queries";

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
  // Videos have no approved or rejected tab of their own: an approved one is
  // simply the artist's video, and a rejected one is back with the artist.
  const videos = filter === "pending" ? await getVideoSubmissions() : [];
  // The nav badge already counts both kinds of pending work.
  const pendingCount = queues.submissions;

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
        {videos.length ? (
          <section className="pb-6">
            <h2 className="m-0 pt-4 font-mono text-label tracking-wide text-slate uppercase">
              Artist videos
            </h2>
            {videos.map((a) => (
              <VideoSubmissionRow key={a.id} artist={a} />
            ))}
            {submissions.length ? (
              <h2 className="m-0 pt-8 font-mono text-label tracking-wide text-slate uppercase">
                Pieces
              </h2>
            ) : null}
          </section>
        ) : null}

        {submissions.length === 0 && videos.length === 0 ? (
          <Empty
            title="Nothing here"
            body={
              filter === "pending"
                ? "When an artist submits a piece or a video from their studio, it waits here until you approve it."
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
