import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { StudioShell } from "@/components/StudioShell";
import { PageHeading, Rule } from "@/components/ui";
import { VideoField } from "@/components/VideoField";
import { getArtistSession } from "@/lib/auth";
import { getMyProfile } from "@/lib/queries";

export default async function ProfilePage() {
  const session = await getArtistSession();
  if (!session) redirect("/login");

  const me = await getMyProfile(session.artistId);
  if (!me) redirect("/login");

  return (
    <StudioShell name={me.name}>
      <PageHeading eyebrow="Your profile" title={me.name} />
      <Rule />

      {me.status === "hidden" ? (
        <p className="mt-6 max-w-[62ch] border border-bone/20 px-5 py-4 text-body-sm leading-[1.7] text-bone-muted">
          Your page is not on the site yet. That is normal while we are getting
          your first pieces ready — it goes up when your work does.
        </p>
      ) : null}

      <div className="pt-8">
        <ProfileForm artist={me} />
      </div>

      <div className="mt-12 border-t border-bone/12 pt-10">
        <VideoField artist={me} />
      </div>
    </StudioShell>
  );
}
