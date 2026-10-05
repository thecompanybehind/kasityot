import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { Empty, PageHeading, Rule, StatusPill } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { formatDateTime, formatPrice, timeAgo } from "@/lib/format";
import { getCustomers, getQueueCounts } from "@/lib/queries";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [queues, customers] = await Promise.all([
    getQueueCounts(),
    getCustomers(),
  ]);

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading
        eyebrow={`${customers.length} ${customers.length === 1 ? "customer" : "customers"}`}
        title="Customers"
      />
      <Rule />

      {customers.length ? (
        /* One card per buyer, however many pieces they ordered. */
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,420px),1fr))] gap-5 pt-8">
          {customers.map((c) => (
            <article key={c.email} className="border border-brass/22 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="m-0 font-display text-[26px] leading-tight text-cream">
                    {c.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 pt-2 font-mono text-label-sm tracking-rail text-slate uppercase">
                    <a
                      href={`tel:${c.phone.replace(/\s/g, "")}`}
                      className="text-brass transition-colors hover:text-cream"
                    >
                      {c.phone}
                    </a>
                    <time dateTime={c.lastOrderAt} title={formatDateTime(c.lastOrderAt)}>
                      {timeAgo(c.lastOrderAt)}
                    </time>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-[26px] leading-tight text-cream">
                    {formatPrice(c.totalAmount)}
                  </div>
                  <div className="pt-2 font-mono text-label-sm tracking-rail text-slate uppercase">
                    {c.orders.length} {c.orders.length === 1 ? "order" : "orders"}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href={`mailto:${c.email}`}
                  className="text-body-sm break-all text-brass transition-colors hover:text-cream"
                >
                  {c.email}
                </a>
                <p className="m-0 pt-2 text-body-sm leading-[1.7] whitespace-pre-line text-bone-soft">
                  {c.address}
                </p>
              </div>

              <div className="mt-5 border-t border-bone/12">
                {c.orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-bone/12 py-3.5 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      {o.artworkId ? (
                        <Link
                          href={`/artworks/${o.artworkId}`}
                          className="font-mono text-label-sm tracking-rail text-brass uppercase transition-colors hover:text-cream"
                        >
                          {o.artworkTitle}
                        </Link>
                      ) : (
                        <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
                          Artwork removed
                        </span>
                      )}
                      <div className="pt-1.5 font-mono text-label-sm tracking-rail text-slate uppercase">
                        {formatPrice(o.amount)} · {formatDateTime(o.createdAt)}
                      </div>
                    </div>
                    <StatusPill status={o.status} />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="No customers yet"
          body="When a buyer orders a piece from the public site, their details and the order appear here."
        />
      )}
    </AdminShell>
  );
}
