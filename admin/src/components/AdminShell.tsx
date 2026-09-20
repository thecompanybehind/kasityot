"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { label: "Dashboard", href: "/" },
  { label: "Artworks", href: "/artworks" },
  { label: "Artists", href: "/artists" },
  { label: "Banner", href: "/hero" },
  { label: "Enquiries", href: "/enquiries" },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-60 border-b border-brass/28 bg-ink/92 backdrop-blur-[16px]">
        <div className="flex flex-wrap items-center justify-between gap-5 px-[clamp(20px,4vw,44px)] py-5">
          <div className="flex items-center gap-3.5">
            <span className="grid size-[30px] place-items-center border border-brass font-display text-[17px] text-brass">
              K
            </span>
            <span className="flex flex-col gap-[3px]">
              <span className="font-sans text-[12px] tracking-logo uppercase">
                Kasityot
              </span>
              <span className="font-mono text-label-xs tracking-widest text-slate uppercase">
                Owner panel
              </span>
            </span>
          </div>

          <nav className="hidden flex-wrap gap-7 font-mono text-label tracking-nav uppercase md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors duration-200 ${
                  isActive(item.href)
                    ? "text-brass"
                    : "text-bone hover:text-brass"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-label-sm tracking-rail text-slate uppercase lg:inline">
              {email}
            </span>
            <form action="/api/logout" method="post">
              <button
                type="submit"
                className="cursor-pointer rounded-pill border border-brass/55 px-[18px] py-2.5 font-mono text-label tracking-nav text-brass uppercase transition-colors hover:bg-brass hover:text-ink"
              >
                Sign out
              </button>
            </form>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex size-6 flex-col justify-center gap-[5px] md:hidden"
            >
              <span
                className={`h-px w-full bg-bone transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`}
              />
              <span
                className={`h-px w-full bg-bone transition-opacity ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-px w-full bg-bone transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>

        <nav hidden={!open} className="border-t border-brass/20 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block border-b border-bone/12 px-[clamp(20px,4vw,44px)] py-4 font-display text-[24px] leading-none last:border-b-0 ${
                isActive(item.href) ? "text-brass" : "text-cream"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="px-[clamp(20px,4vw,44px)] py-[clamp(32px,5vw,64px)]">
        {children}
      </main>
    </div>
  );
}
