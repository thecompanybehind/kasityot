import Link from "next/link";
import { redirect } from "next/navigation";
import { StudioArtworkRow } from "@/components/StudioArtworkRow";
import { StudioShell } from "@/components/StudioShell";
import { Empty, PageHeading, Rule } from "@/components/ui";
import { getArtistSession } from "@/lib/auth";
import { getMyArtworks, getMyProfile } from "@/lib/queries";

export default async function MyArtworksPage() {
  const session = await getArtistSession();
  if (!session) redirect("/login");

  const [me, artworks] = await Promise.all([
    getMyProfile(session.artistId),
    getMyArtworks(session.artistId),
  ]);
  if (!me) redirect("/login");

  return (
    <StudioShell name={me.name}>
      <PageHeading
        eyebrow="Your work"
        title="Everything you have sent us"
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

      <div className="pt-4">
        {artworks.length === 0 ? (
          <Empty
            title="Nothing here yet"
            body="Add your first piece and send it to us. We will look at it and write back."
          />
        ) : (
          artworks.map((a) => <StudioArtworkRow key={a.id} artwork={a} />)
        )}
      </div>
    </StudioShell>
  );
}
