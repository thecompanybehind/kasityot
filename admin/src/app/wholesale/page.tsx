import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { WholesaleProductRow } from "@/components/WholesaleProductRow";
import { WholesaleTabs } from "@/components/WholesaleTabs";
import { ButtonLink, Empty, PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts } from "@/lib/queries";
import {
  getWholesaleCounts,
  getWholesaleProducts,
} from "@/lib/wholesale-queries";

/**
 * Wholesale products. Kept apart from Artworks on purpose: these are shown
 * only on the wholesaler panel, never on the public shop.
 */
export default async function WholesaleProductsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [queues, counts, products] = await Promise.all([
    getQueueCounts(),
    getWholesaleCounts(),
    getWholesaleProducts(),
  ]);

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading
        eyebrow={`Wholesale · ${products.length} ${products.length === 1 ? "product" : "products"}`}
        title="Trade catalogue"
        action={<ButtonLink href="/wholesale/products/new">Add product</ButtonLink>}
      />
      <Rule />
      <WholesaleTabs active="products" counts={counts} />

      {products.length ? (
        <div className="flex flex-col pt-2">
          {products.map((p) => (
            <WholesaleProductRow key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <Empty
          title="No wholesale products yet"
          body="Products you add here are shown only to approved wholesalers on the wholesaler panel. They never appear on the public shop."
        />
      )}
    </AdminShell>
  );
}
