import { WholesaleShell } from "@/components/WholesaleShell";
import { PageHeading, Rule } from "@/components/ui";
import type { WholesalerSession } from "@/lib/auth";

/**
 * What a signed-in wholesaler sees in place of the catalogue until the owner
 * has approved them, or after a refusal. It shows no products and no prices.
 */
export function AccountStatus({ me }: { me: WholesalerSession }) {
  const rejected = me.status === "rejected";

  return (
    <WholesaleShell name={me.businessName} showNav={false}>
      <div className="mx-auto max-w-[760px]">
        <PageHeading
          eyebrow={me.businessName}
          title={rejected ? "We could not open your account" : "Your account is being reviewed"}
        />
        <Rule />

        <div className="max-w-[60ch] space-y-5 pt-8 text-body leading-[1.8] text-bone-muted">
          {rejected ? (
            <>
              <p className="m-0">
                Thank you for registering, {me.contactName}. We are not able to
                open a trade account for you at the moment.
              </p>
              {me.reviewNote ? (
                <blockquote className="m-0 border-l-2 border-brass py-1 pl-5 text-bone-soft">
                  {me.reviewNote}
                </blockquote>
              ) : null}
              <p className="m-0">
                If something here is not right, reply to our email and tell us.
              </p>
            </>
          ) : (
            <>
              <p className="m-0">
                Thank you, {me.contactName}. We check every trade account by
                hand before opening the catalogue, usually within two working
                days.
              </p>
              <p className="m-0">
                We will email {me.email} as soon as it is open. You do not need
                to register again: just sign in with the same details.
              </p>
            </>
          )}
        </div>
      </div>
    </WholesaleShell>
  );
}
