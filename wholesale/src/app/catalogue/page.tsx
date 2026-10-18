import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountStatus } from "@/components/AccountStatus";
import { WholesaleShell } from "@/components/WholesaleShell";
import { Empty, PageHeading, Rule } from "@/components/ui";
import { getWholesaler } from "@/lib/auth";
import { formatTradePrice } from "@/lib/format";
import { getCatalogue, getCategories } from "@/lib/queries";

/**
 * The trade catalogue. Approval is checked here, before anything is read:
 * an account that is pending or refused gets its status page and no data.
 */
export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const me = await getWholesaler();
  if (!me) redirect("/login");
  if (me.status !== "approved") return <AccountStatus me={me} />;

  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    getCatalogue(category || undefined),
    getCategories(),
  ]);

  return (
    <WholesaleShell name={me.businessName}>
      <PageHeading
        eyebrow={`${products.length} ${products.length === 1 ? "product" : "products"}`}
        title="Trade catalogue"
      />
      <Rule />

      {categories.length > 1 ? (
        <nav className="flex flex-wrap gap-x-6 gap-y-3 pt-6 font-mono text-label tracking-nav uppercase">
          <Link
            href="/catalogue"
            className={!category ? "text-brass" : "text-slate transition-colors hover:text-bone"}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/catalogue?category=${encodeURIComponent(c)}`}
              className={
                c === category ? "text-brass" : "text-slate transition-colors hover:text-bone"
              }
            >
              {c}
            </Link>
          ))}
        </nav>
      ) : null}

      {products.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-(--spacing-gap-col) pt-8">
          {products.map((p) => (
            <Link key={p.id} href={`/catalogue/${p.id}`} className="group flex flex-col gap-4">
              <div className="relative aspect-4/5 overflow-hidden bg-ink-raised">
                {p.images[0] ? (
                  <Image
                    src={p.images[0]}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 320px"
                    className="object-cover transition-transform duration-(--duration-image-slow) ease-kasityot group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="grid h-full place-items-center font-mono text-label-sm tracking-rail text-slate uppercase">
                    No photograph
                  </div>
                )}
              </div>
              <div>
                {p.category ? (
                  <div className="pb-1.5 font-mono text-label-sm tracking-rail text-slate uppercase">
                    {p.category}
                  </div>
                ) : null}
                <div className="font-display text-card-title-sm leading-tight text-cream transition-colors group-hover:text-brass">
                  {p.title}
                </div>
                <div className="flex flex-wrap gap-x-4 pt-2 font-mono text-label tracking-rail uppercase">
                  <span className="text-brass">{formatTradePrice(p.price)}</span>
                  {p.minOrderQty ? (
                    <span className="text-slate">Min. {p.minOrderQty} units</span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title={category ? "Nothing in this category" : "The catalogue is being prepared"}
          body={
            category
              ? "Try another category, or see everything."
              : "We are adding trade products now. Check back shortly."
          }
        />
      )}
    </WholesaleShell>
  );
}
