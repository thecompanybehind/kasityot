import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { Empty, PageHeading, Rule, StatusPill } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { getQueueCounts, getDashboardStats, getRecentEnquiries } from "@/lib/queries";

function Stat({
  label,
  value,
  href,
  accent = false,
}: {
  label: string;
  value: number;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col gap-3 border border-brass/25 p-6 transition-colors hover:border-brass/60"
    >
      <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
        {label}
      </span>
      <span
        className={`font-display text-[clamp(40px,5vw,64px)] leading-none ${
          accent && value > 0 ? "text-brass" : "text-cream"
        }`}
      >
        {value}
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    getRecentEnquiries(5),
  ]);

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading eyebrow="Overview" title="Dashboard" />
      <Rule />

      {/* The two review queues lead: nothing an artist does reaches the site
          until the owner acts on them. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-5 pt-8">
        <Stat
          label="Applications"
          value={stats.pendingApplications}
          href="/applications?status=pending"
          accent={stats.pendingApplications > 0}
        />
        <Stat
          label="To review"
          value={stats.pendingSubmissions}
          href="/submissions"
          accent={stats.pendingSubmissions > 0}
        />
        <Stat
          label="New enquiries"
          value={stats.newEnquiries}
          href="/enquiries?status=new"
          accent={stats.newEnquiries > 0}
        />
        <Stat label="Paid orders" value={stats.paidOrders} href="/artworks" />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-5 pt-5">
        <Stat label="Artworks" value={stats.artworks} href="/artworks" />
        <Stat label="Artists" value={stats.artists} href="/artists" />
      </div>

      <div className="flex flex-wrap gap-6 pt-6 font-mono text-label-sm tracking-rail text-slate uppercase">
        <span>{stats.available} available</span>
        <span>{stats.sold} sold</span>
      </div>

      <section className="pt-[clamp(40px,5vw,72px)]">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <h2 className="m-0 font-display text-card-title text-cream">
            Latest enquiries
          </h2>
          <Link
            href="/enquiries"
            className="border-b border-brass/50 pb-[4px] font-mono text-label tracking-nav text-brass uppercase transition-colors hover:text-cream"
          >
            Open inbox →
          </Link>
        </div>
        <Rule />

        {recent.length ? (
          <div className="flex flex-col">
            {recent.map((e) => (
              <Link
                key={e.id}
                href={`/enquiries?status=${e.status}`}
                className="flex flex-wrap items-baseline justify-between gap-4 border-b border-bone/12 py-5 transition-colors hover:bg-bone/3"
              >
                <div className="min-w-0">
                  <div className="font-display text-[22px] leading-tight text-cream">
                    {e.name}
                    <span className="pl-3 font-mono text-label-sm tracking-rail text-slate uppercase">
                      {e.city}
                    </span>
                  </div>
                  <div className="pt-2 font-mono text-label-sm tracking-rail text-brass uppercase">
                    {e.artworkTitle ?? "Artwork removed"}
                  </div>
                  <p className="m-0 line-clamp-1 max-w-[60ch] pt-2 text-body-sm text-bone-muted">
                    {e.message}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <StatusPill status={e.status} />
                  <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
                    {timeAgo(e.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty
            title="No enquiries yet"
            body="When a buyer sends an enquiry from the public site, it will appear here."
          />
        )}
      </section>
    </AdminShell>
  );
}
