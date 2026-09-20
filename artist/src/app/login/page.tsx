import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { PageHeading, Rule } from "@/components/ui";
import { getArtistSession } from "@/lib/auth";

/**
 * There is no signup here: an artist reaches this page only after the owner
 * has approved their application and sent them an invite. The link to /join
 * is for anyone who arrives before that.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  if (await getArtistSession()) redirect("/studio");

  const { from } = await searchParams;
  // Only same-app paths, so the parameter cannot bounce someone off-site.
  const next = from && from.startsWith("/") ? from : "/studio";

  return (
    <div className="mx-auto max-w-[460px] px-[clamp(20px,4vw,44px)] py-[clamp(48px,8vw,120px)]">
      <PageHeading eyebrow="Artist studio" title="Sign in" />
      <Rule />

      <div className="pt-8">
        <LoginForm next={next} />
      </div>

      <p className="pt-8 text-body-sm leading-[1.7] text-slate">
        Not with us yet?{" "}
        <Link
          href="/join"
          className="text-brass underline underline-offset-4 hover:text-cream"
        >
          Tell us about your work
        </Link>
        .
      </p>
    </div>
  );
}
