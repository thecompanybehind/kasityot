import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { WholesaleTabs } from "@/components/WholesaleTabs";
import { WholesalerRow } from "@/components/WholesalerRow";
import { Empty, PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts } from "@/lib/queries";
import { getWholesaleCounts, getWholesalers } from "@/lib/wholesale-queries";

/**
 * Wholesaler accounts. Anyone can register on the wholesaler panel, but they
 * see no products or prices until the owner approves them here.
 */
export default async function WholesalersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { status } = await searchParams;
  const filter =
    status === "pending" || status === "approved" || status === "rejected"
      ? status
      : undefined;

  const [queues, counts, wholesalers] = await Promise.all([
    getQueueCounts(),
    getWholesaleCounts(),
    getWholesalers(filter),
  ]);

  const FILTERS = [
    { label: "All", href: "/wholesale/wholesalers", active: !filter },
    {
      label: `Pending${counts.pendingWholesalers ? ` (${counts.pendingWholesalers})` : ""}`,
      href: "/wholesale/wholesalers?status=pending",
      active: filter === "pending",
    },
    {
      label: "Approved",
      href: "/wholesale/wholesalers?status=approved",
      active: filter === "approved",
    },
    {
      label: "Rejected",
      href: "/wholesale/wholesalers?status=rejected",
      active: filter === "rejected",
    },
  ];

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading
        eyebrow="Wholesale"
        title="Wholesalers"
        action={
          <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
            {counts.pendingWholesalers
              ? `${counts.pendingWholesalers} waiting on you`
              : "Nothing waiting on you"}
          </span>
        }
      />
      <Rule />
      <WholesaleTabs active="wholesalers" counts={counts} />

      <nav className="flex flex-wrap gap-5 pt-2 font-mono text-label-sm tracking-rail uppercase">
        {FILTERS.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={
              f.active ? "text-brass" : "text-slate transition-colors hover:text-bone"
            }
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <div className="pt-2">
        {wholesalers.length ? (
          wholesalers.map((w) => <WholesalerRow key={w.id} wholesaler={w} />)
        ) : (
          <Empty
            title="No wholesalers"
            body={
              filter
                ? "Nothing in this state yet."
                : "When a business registers on the wholesaler panel, it appears here for your decision."
            }
          />
        )}
      </div>
    </AdminShell>
  );
}
