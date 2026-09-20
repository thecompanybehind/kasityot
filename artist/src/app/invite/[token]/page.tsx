import Link from "next/link";
import { InviteForm } from "@/components/InviteForm";
import { PageHeading, Rule } from "@/components/ui";
import { findInvite } from "@/lib/auth";

/**
 * Redeeming an invite.
 *
 * An unknown, expired or already-used token all produce the same message:
 * distinguishing them would let someone probing learn which tokens once
 * existed.
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await findInvite(token);

  if (!invite) {
    return (
      <div className="mx-auto max-w-[460px] px-[clamp(20px,4vw,44px)] py-[clamp(48px,8vw,120px)]">
        <PageHeading eyebrow="Invite" title="This link no longer works" />
        <Rule />
        <p className="max-w-[46ch] pt-8 text-body leading-[1.8] text-bone-muted">
          Invite links last two weeks and can only be used once. Ask us for a
          new one and we will send it over.
        </p>
        <p className="pt-6 text-body-sm text-slate">
          Already set your password?{" "}
          <Link
            href="/login"
            className="text-brass underline underline-offset-4 hover:text-cream"
          >
            Sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[460px] px-[clamp(20px,4vw,44px)] py-[clamp(48px,8vw,120px)]">
      <PageHeading eyebrow="Welcome" title={invite.name} />
      <Rule />

      <p className="max-w-[46ch] pt-8 pb-8 text-body leading-[1.8] text-bone-muted">
        Your application has been accepted. Choose a password and your studio
        is ready — that is where you will send us photographs of your work.
      </p>

      <InviteForm token={token} />

      <p className="pt-6 font-mono text-label-sm tracking-rail text-slate-dim uppercase">
        Signing in as {invite.email}
      </p>
    </div>
  );
}
