import Link from "next/link";
import { redirect } from "next/navigation";
import { ArtworkForm } from "@/components/ArtworkForm";
import { StudioShell } from "@/components/StudioShell";
import { PageHeading, Rule } from "@/components/ui";
import { getArtistSession } from "@/lib/auth";
import { getMyProfile } from "@/lib/queries";

export default async function NewArtworkPage() {
  const session = await getArtistSession();
  if (!session) redirect("/login");

  const me = await getMyProfile(session.artistId);
  if (!me) redirect("/login");

  return (
    <StudioShell name={me.name}>
      <PageHeading
        eyebrow="Your work"
        title="Add a piece"
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
      <div className="pt-8">
        <ArtworkForm artwork={null} />
      </div>
    </StudioShell>
  );
}
