import Link from "next/link";
import { redirect } from "next/navigation";
import { StudioShell } from "@/components/StudioShell";
import { PageHeading, Rule } from "@/components/ui";
import { getArtistSession } from "@/lib/auth";
import { getMyCounts, getMyProfile } from "@/lib/queries";

export default async function StudioPage() {
  const session = await getArtistSession();
  if (!session) redirect("/login");

  const [me, counts] = await Promise.all([
    getMyProfile(session.artistId),
    getMyCounts(session.artistId),
  ]);
  if (!me) redirect("/login");

  const needsAttention = counts.rejected > 0 || counts.drafts > 0;

  return (
    <StudioShell name={me.name}>
      <PageHeading
        eyebrow="Your studio"
        title={me.name}
        action={
          <Link
            href="/studio/artworks/new"
            className="inline-block cursor-pointer border border-brass bg-brass px-[26px] py-[14px] font-mono text-label tracking-label text-ink uppercase"
          >
            Add a piece
          </Link>
        }
      />
      <Rule />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-5 pt-8">
        <Stat label="On the site" value={counts.live} />
        <Stat label="With Kasityot" value={counts.pending} accent={counts.pending > 0} />
        <Stat label="Drafts" value={counts.drafts} />
        <Stat label="Sent back" value={counts.rejected} accent={counts.rejected > 0} />
      </div>

      <div className="max-w-[58ch] pt-10 text-body leading-[1.8] text-bone-muted">
        {needsAttention ? (
          <p className="m-0">
            You have work waiting on you.{" "}
            <Link
              href="/studio/artworks"
              className="text-brass underline underline-offset-4 hover:text-cream"
            >
              Open your work
            </Link>{" "}
            to finish a draft or read what we sent back.
          </p>
        ) : counts.pending > 0 ? (
          <p className="m-0">
            {counts.pending === 1 ? "A piece is" : `${counts.pending} pieces are`}{" "}
            with us for review. We will write when we have looked properly.
          </p>
        ) : (
          <p className="m-0">
            Everything of yours is on the site. When you finish something new,
            add it here and we will take a look.
          </p>
        )}

        {/* The video lives on the profile page, where it is easy to miss. */}
        {me.videoReviewStatus === "rejected" ? (
          <p className="m-0 pt-5">
            We sent your video back.{" "}
            <Link
              href="/studio/profile"
              className="text-brass underline underline-offset-4 hover:text-cream"
            >
              Read why and send another
            </Link>
            .
          </p>
        ) : !me.videoUrl && me.videoReviewStatus === "none" ? (
          <p className="m-0 pt-5">
            Buyers like to see the hand at work.{" "}
            <Link
              href="/studio/profile"
              className="text-brass underline underline-offset-4 hover:text-cream"
            >
              Add a short video of you making something
            </Link>
            .
          </p>
        ) : null}
      </div>
    </StudioShell>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`border px-5 py-6 ${accent ? "border-brass/50" : "border-bone/15"}`}
    >
      <div
        className={`font-display text-[40px] leading-none ${accent ? "text-brass" : "text-cream"}`}
      >
        {value}
      </div>
      <div className="pt-3 font-mono text-label-sm tracking-rail text-slate uppercase">
        {label}
      </div>
    </div>
  );
}
