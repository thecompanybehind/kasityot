import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ApplicationRow } from "@/components/ApplicationRow";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts, getApplication } from "@/lib/queries";

/**
 * One application in full.
 *
 * The listing carries the same decision controls, so this page exists for the
 * part that does not fit in a row: the artist's story, which is the substance
 * of what the owner is judging.
 */
export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  const { id } = await params;
  const artist = await getApplication(id);
  if (!artist) notFound();

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading
        eyebrow="Application"
        title={artist.name}
        action={
          <Link
            href="/applications"
            className="font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-brass"
          >
            ← All applications
          </Link>
        }
      />
      <Rule />

      {/* The row carries approve, reject and the invite link. */}
      <ApplicationRow artist={artist} />

      <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <h2 className="m-0 pb-4 font-mono text-label tracking-rail text-slate uppercase">
            Their story
          </h2>
          <div className="max-w-[68ch] space-y-4 text-body leading-[1.8] text-bone-muted">
            {artist.story.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="m-0">
                {para}
              </p>
            ))}
          </div>

          {artist.videoUrl ? (
            <p className="pt-6 text-body-sm text-slate">
              Video:{" "}
              <a
                href={artist.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brass underline underline-offset-4"
              >
                {artist.videoUrl}
              </a>
            </p>
          ) : null}
        </div>

        <aside className="min-w-0">
          {artist.photo ? (
            <div className="relative mb-6 aspect-[4/5] w-full overflow-hidden bg-ink-raised">
              <Image
                src={artist.photo}
                alt={artist.name}
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          ) : null}

          <dl className="m-0 space-y-4 font-mono text-label-sm tracking-rail uppercase">
            <Detail label="Craft" value={artist.craftType} />
            <Detail label="Region" value={artist.region} />
            <Detail label="Email" value={artist.email ?? "—"} />
            <Detail label="Phone" value={artist.phone ?? "—"} />
            <Detail
              label="Applied"
              value={
                artist.createdAt
                  ? new Date(artist.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            {artist.reviewedAt ? (
              <Detail
                label="Decided"
                value={new Date(artist.reviewedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            ) : null}
          </dl>
        </aside>
      </div>
    </AdminShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate">{label}</dt>
      <dd className="m-0 pt-1 text-bone normal-case">{value}</dd>
    </div>
  );
}
