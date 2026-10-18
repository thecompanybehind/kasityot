import Link from "next/link";

/**
 * The wholesale section's own sub-navigation. Wholesale is one item in the
 * panel's main nav; its three parts sit under it here rather than crowding
 * the main nav with three more entries.
 */
export function WholesaleTabs({
  active,
  counts,
}: {
  active: "products" | "wholesalers" | "enquiries";
  counts: { pendingWholesalers: number; newEnquiries: number };
}) {
  const TABS = [
    { key: "products", label: "Products", href: "/wholesale", count: 0 },
    {
      key: "wholesalers",
      label: "Wholesalers",
      href: "/wholesale/wholesalers",
      count: counts.pendingWholesalers,
    },
    {
      key: "enquiries",
      label: "Enquiries",
      href: "/wholesale/enquiries",
      count: counts.newEnquiries,
    },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-6 pt-6 pb-2 font-mono text-label tracking-nav uppercase">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`flex items-center gap-2 ${
            t.key === active
              ? "text-brass"
              : "text-slate transition-colors hover:text-bone"
          }`}
        >
          {t.label}
          {t.count > 0 ? (
            <span className="grid min-w-4.5 place-items-center rounded-pill bg-brass px-1.5 py-0.5 text-label leading-none text-ink">
              {t.count}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
