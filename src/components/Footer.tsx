import Link from "next/link";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "New arrivals", href: "#pieces" },
      { label: "Collections", href: "#collections" },
      { label: "Vessels", href: "#pieces" },
      { label: "Textiles", href: "#pieces" },
    ],
  },
  {
    heading: "Makers",
    links: [
      { label: "Directory", href: "#maker" },
      { label: "Apply to sell", href: "#maker" },
      { label: "Commissions", href: "#commission" },
      { label: "Residencies", href: "#maker" },
    ],
  },
  {
    heading: "House",
    links: [
      { label: "Provenance", href: "#top" },
      { label: "Repairs", href: "#top" },
      { label: "Shipping", href: "#top" },
      { label: "Contact", href: "#top" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="flex flex-col gap-[clamp(44px,5vw,76px)] border-t border-brass/30 px-(--spacing-section-x) pt-[clamp(52px,7vw,100px)] pb-[34px]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-10">
        <div className="flex min-w-0 max-w-[34ch] flex-col gap-4.5">
          <span className="grid size-[34px] place-items-center border border-brass font-display text-[19px] text-brass">
            K
          </span>
          <div className="font-sans text-[12px] tracking-logo uppercase">
            Käsityöt
          </div>
          <p className="m-0 text-body-sm leading-[1.7] text-bone-muted">
            A marketplace for the slow trades. Founded in Helsinki, shipping
            worldwide, insured to the door.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading} className="flex min-w-0 flex-col gap-3 text-body-sm">
            <div className="pb-1.5 font-mono text-label-sm tracking-nav text-slate uppercase">
              {col.heading}
            </div>
            {col.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors duration-200 hover:text-brass"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-bone/14 pt-6.5 font-mono text-label-sm tracking-rail text-slate-dim uppercase">
        <span>© 2026 Käsityöt Oy</span>
        <span>Helsinki · Kyoto · Lisbon</span>
        <span>Terms · Privacy</span>
      </div>
    </footer>
  );
}
