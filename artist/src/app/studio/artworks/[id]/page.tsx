import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArtworkForm } from "@/components/ArtworkForm";
import { StudioShell } from "@/components/StudioShell";
import { PageHeading, Rule, StatusPill } from "@/components/ui";
import { getArtistSession } from "@/lib/auth";
import { getMyArtwork, getMyProfile } from "@/lib/queries";

export default async function EditArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getArtistSession();
  if (!session) redirect("/login");

  const { id } = await params;
  // Scoped to the session's artist, so another artist's id is simply absent.
  const [me, artwork] = await Promise.all([
    getMyProfile(session.artistId),
    getMyArtwork(session.artistId, id),
  ]);
  if (!me) redirect("/login");
  if (!artwork) notFound();

  return (
    <StudioShell name={me.name}>
      <PageHeading
        eyebrow="Your work"
        title={artwork.title}
        action={
          <Link
            href="/studio/artworks"
            className="font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-brass"
          >
            ← All your work
          </Link>
        }
      />
      <Rule />

      <div className="flex flex-wrap items-center gap-4 pt-6">
        <StatusPill status={artwork.reviewStatus} />
        {artwork.status === "sold" ? <StatusPill status="sold" /> : null}
      </div>

      {artwork.reviewStatus === "rejected" && artwork.reviewNote ? (
        <div className="mt-6 max-w-[62ch] border border-brass/40 bg-brass/5 px-5 py-4">
          <div className="pb-2 font-mono text-label-sm tracking-rail text-brass uppercase">
            What we said
          </div>
          <p className="m-0 text-body leading-[1.7] text-bone-muted">
            {artwork.reviewNote}
          </p>
        </div>
      ) : null}

      <div className="pt-8">
        <ArtworkForm artwork={artwork} />
      </div>
    </StudioShell>
  );
}
