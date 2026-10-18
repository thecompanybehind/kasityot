import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { WholesaleEnquiryCard } from "@/components/WholesaleEnquiryCard";
import { WholesaleTabs } from "@/components/WholesaleTabs";
import { Empty, PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts } from "@/lib/queries";
import {
  getWholesaleCounts,
  getWholesaleEnquiries,
} from "@/lib/wholesale-queries";

/** Trade enquiries, separate from the retail inbox. */
export default async function WholesaleEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { status } = await searchParams;
  const filter =
    status === "new" || status === "contacted" || status === "closed"
      ? status
      : undefined;

  const [queues, counts, enquiries] = await Promise.all([
    getQueueCounts(),
    getWholesaleCounts(),
    getWholesaleEnquiries({ status: filter }),
  ]);

  const FILTERS = [
    { label: "All", value: undefined },
    { label: "New", value: "new" },
    { label: "Contacted", value: "contacted" },
    { label: "Closed", value: "closed" },
  ] as const;

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading
        eyebrow={`Wholesale · ${enquiries.length} ${enquiries.length === 1 ? "enquiry" : "enquiries"}`}
        title="Trade enquiries"
      />
      <Rule />
      <WholesaleTabs active="enquiries" counts={counts} />

      <nav className="flex flex-wrap gap-5 pt-2 pb-6 font-mono text-label-sm tracking-rail uppercase">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/wholesale/enquiries?status=${f.value}` : "/wholesale/enquiries"}
            className={
              f.value === filter
                ? "text-brass"
                : "text-slate transition-colors hover:text-bone"
            }
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {enquiries.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,420px),1fr))] gap-5">
          {enquiries.map((e) => (
            <WholesaleEnquiryCard key={e.id} enquiry={e} />
          ))}
        </div>
      ) : (
        <Empty
          title={filter ? "Nothing matches" : "No trade enquiries yet"}
          body={
            filter
              ? "Try a different status."
              : "When an approved wholesaler asks about a product, it lands here."
          }
        />
      )}
    </AdminShell>
  );
}
