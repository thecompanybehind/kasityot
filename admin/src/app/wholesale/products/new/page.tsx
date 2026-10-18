import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { WholesaleProductForm } from "@/components/WholesaleProductForm";
import { PageHeading, Rule } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getQueueCounts } from "@/lib/queries";

export default async function NewWholesaleProductPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const queues = await getQueueCounts();

  return (
    <AdminShell email={session.email} queues={queues}>
      <PageHeading eyebrow="Wholesale" title="Add a product" />
      <Rule />
      <div className="pt-8">
        <WholesaleProductForm product={null} />
      </div>
    </AdminShell>
  );
}
