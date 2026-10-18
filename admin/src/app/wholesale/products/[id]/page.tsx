import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { WholesaleProductForm } from "@/components/WholesaleProductForm";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts } from "@/lib/queries";
import { getWholesaleProduct } from "@/lib/wholesale-queries";

export default async function EditWholesaleProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const [queues, product] = await Promise.all([
    getQueueCounts(),
    getWholesaleProduct(id),
  ]);
  if (!product) notFound();

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading eyebrow="Wholesale · editing" title={product.title} />
      <Rule />
      <div className="pt-8">
        <WholesaleProductForm product={product} />
      </div>
    </AdminShell>
  );
}
