import Image from "next/image";
import Link from "next/link";

/* No "Apply to sell" or newsletter: artists never self-register in this
   version, and the owner adds them by hand. */
const COLUMNS = [
  {
    heading: "Browse",
    links: [
      { label: "All artworks", href: "/artworks" },
      { label: "All artists", href: "/artists" },
    ],
  },
  {
    heading: "House",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="flex flex-col gap-[clamp(44px,5vw,76px)] border-t border-brass/30 px-(--spacing-section-x) pt-[clamp(52px,7vw,100px)] pb-[34px]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-10">
        <div className="flex min-w-0 max-w-[34ch] flex-col gap-4.5">
          <Image
            src="/logo-mark.png"
            alt=""
            width={176}
            height={207}
            className="h-[44px] w-auto self-start"
          />
          <div className="font-sans text-[12px] tracking-logo uppercase">
            Kasityot
          </div>
          <p className="m-0 text-body-sm leading-[1.7] text-bone-muted">
            A marketplace for Indian handicraft. Every piece is one of a kind,
            made by hand, and signed by the artist who made it.
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
        <span>© {new Date().getFullYear()} Kasityot</span>
        <span>Handmade in India</span>
      </div>
    </footer>
  );
}
