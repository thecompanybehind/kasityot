import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountStatus } from "@/components/AccountStatus";
import { WholesaleShell } from "@/components/WholesaleShell";
import { Empty, PageHeading, Rule, StatusPill } from "@/components/ui";
import { getWholesaler } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getMyEnquiries } from "@/lib/queries";

/** The wholesaler's own enquiries and where each one stands. */
export default async function MyEnquiriesPage() {
  const me = await getWholesaler();
  if (!me) redirect("/login");
  if (me.status !== "approved") return <AccountStatus me={me} />;

  const enquiries = await getMyEnquiries(me.wholesalerId);

  return (
    <WholesaleShell name={me.businessName}>
      <PageHeading
        eyebrow={`${enquiries.length} ${enquiries.length === 1 ? "enquiry" : "enquiries"}`}
        title="My enquiries"
      />
      <Rule />

      {enquiries.length ? (
        <div className="flex flex-col">
          {enquiries.map((e) => (
            <div key={e.id} className="border-b border-bone/12 py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  {e.productId ? (
                    <Link
                      href={`/catalogue/${e.productId}`}
                      className="font-display text-[23px] leading-tight text-cream transition-colors hover:text-brass"
                    >
                      {e.productTitle}
                    </Link>
                  ) : (
                    <span className="font-display text-[23px] leading-tight text-cream">
                      {e.productTitle ?? "Product no longer listed"}
                    </span>
                  )}
                  <div className="pt-1.5 font-mono text-label-sm tracking-rail text-slate uppercase">
                    {formatDate(e.createdAt)}
                    {e.quantity ? ` · ${e.quantity} units` : ""}
                  </div>
                </div>
                {/* "closed" reads oddly to the buyer; for them it is answered. */}
                <StatusPill
                  status={
                    e.status === "new" ? "sent" : e.status === "contacted" ? "in touch" : "answered"
                  }
                />
              </div>
              <p className="m-0 max-w-[70ch] pt-3 text-body-sm leading-[1.7] whitespace-pre-line text-bone-muted">
                {e.message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="No enquiries yet"
          body="Open any product in the catalogue to ask for a price or send us a question."
        />
      )}
    </WholesaleShell>
  );
}
