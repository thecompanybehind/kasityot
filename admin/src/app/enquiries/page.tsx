import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { EnquiryCard } from "@/components/EnquiryCard";
import { EnquiryFilters } from "@/components/EnquiryFilters";
import { Empty, PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getArtworkOptions, getEnquiries } from "@/lib/queries";

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; artwork?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const [enquiries, artworks] = await Promise.all([
    getEnquiries({
      status: sp.status || undefined,
      artworkId: sp.artwork || undefined,
    }),
    getArtworkOptions(),
  ]);

  const filtered = Boolean(sp.status || sp.artwork);

  return (
    <AdminShell email={session.email}>
      <PageHeading
        eyebrow={`${enquiries.length} ${enquiries.length === 1 ? "enquiry" : "enquiries"}`}
        title="Enquiry inbox"
      />
      <Rule />

      <EnquiryFilters
        artworks={artworks}
        current={{ status: sp.status ?? "", artwork: sp.artwork ?? "" }}
      />

      {enquiries.length ? (
        /* Every enquiry is its own card. Several against the same artwork
           all appear separately — they are never collapsed or auto-closed. */
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,420px),1fr))] gap-5">
          {enquiries.map((enquiry) => (
            <EnquiryCard key={enquiry.id} enquiry={enquiry} />
          ))}
        </div>
      ) : (
        <Empty
          title={filtered ? "Nothing matches" : "No enquiries yet"}
          body={
            filtered
              ? "Try a different status or artwork, or clear the filters."
              : "When a buyer sends an enquiry from the public site, it lands here."
          }
        />
      )}
    </AdminShell>
  );
}
