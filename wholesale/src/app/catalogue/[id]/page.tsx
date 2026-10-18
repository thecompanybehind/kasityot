import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountStatus } from "@/components/AccountStatus";
import { EnquiryForm } from "@/components/EnquiryForm";
import { WholesaleShell } from "@/components/WholesaleShell";
import { Rule } from "@/components/ui";
import { getWholesaler } from "@/lib/auth";
import { formatTradePrice } from "@/lib/format";
import { getProduct } from "@/lib/queries";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getWholesaler();
  if (!me) redirect("/login");
  if (me.status !== "approved") return <AccountStatus me={me} />;

  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const specs = [
    ["Category", product.category],
    ["Material", product.material],
    ["Dimensions", product.dimensions],
    ["Minimum order", product.minOrderQty ? `${product.minOrderQty} units` : ""],
  ].filter(([, v]) => v);

  return (
    <WholesaleShell name={me.businessName}>
      <Link
        href="/catalogue"
        className="font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-brass"
      >
        ← Catalogue
      </Link>

      <div className="grid gap-(--spacing-gap-wide) pt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="grid gap-4">
          {product.images.length ? (
            product.images.map((src, i) => (
              <div key={src + i} className="relative aspect-4/5 overflow-hidden bg-ink-raised">
                <Image
                  src={src}
                  alt={i === 0 ? product.title : ""}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            <div className="grid aspect-4/5 place-items-center bg-ink-raised font-mono text-label-sm tracking-rail text-slate uppercase">
              No photograph
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <h1 className="m-0 font-display text-section-sm leading-none font-light tracking-quote text-cream">
            {product.title}
          </h1>
          <div className="pt-5 font-display text-[clamp(24px,2.2vw,32px)] text-brass">
            {formatTradePrice(product.price)}
          </div>

          <p className="m-0 pt-6 text-body leading-[1.8] whitespace-pre-line text-bone-muted">
            {product.description}
          </p>

          {specs.length ? (
            <dl className="mt-8 border-t border-bone/12">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-6 border-b border-bone/12 py-3.5"
                >
                  <dt className="font-mono text-label-sm tracking-rail text-slate uppercase">
                    {label}
                  </dt>
                  <dd className="m-0 text-right text-body-sm text-bone-soft">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="pt-10">
            <h2 className="m-0 pb-4 font-display text-card-title text-cream">
              {product.price === null ? "Ask for a price" : "Send an enquiry"}
            </h2>
            <Rule />
            <div className="pt-6">
              <EnquiryForm
                productId={product.id}
                minOrderQty={product.minOrderQty}
                hasPrice={product.price !== null}
              />
            </div>
          </div>
        </div>
      </div>
    </WholesaleShell>
  );
}
