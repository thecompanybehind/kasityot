"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { label: "My work", href: "/studio/artworks" },
  { label: "My profile", href: "/studio/profile" },
];

/**
 * The signed-in artist's frame. Deliberately plainer than the owner panel:
 * an artist has two places to be, and a nav that implies more would only
 * invite hunting for features that are not there.
 */
export function StudioShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-60 border-b border-brass/28 bg-ink/92 backdrop-blur-lg">
        <div className="flex flex-wrap items-center justify-between gap-5 px-[clamp(20px,4vw,44px)] py-5">
          <Link href="/studio" className="flex items-center gap-3.5">
            <Image
              src="/logo-mark.png"
              alt=""
              width={176}
              height={207}
              className="h-8.5 w-auto"
            />
            <span className="flex flex-col gap-0.75">
              <span className="font-sans text-[12px] tracking-logo uppercase">
                Kasityot
              </span>
              <span className="font-mono text-label-xs tracking-widest text-slate uppercase">
                Artist studio
              </span>
            </span>
          </Link>

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
              {name}
            </span>
            <form action="/api/logout" method="post">
              <button
                type="submit"
                className="cursor-pointer rounded-pill border border-brass/55 px-4.5 py-2.5 font-mono text-label tracking-nav text-brass uppercase transition-colors hover:bg-brass hover:text-ink"
              >
                Sign out
              </button>
            </form>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex size-6 flex-col justify-center gap-1.25 md:hidden"
            >
              <span
                className={`h-px w-full bg-bone transition-transform duration-300 ${open ? "translate-y-1.5 rotate-45" : ""}`}
              />
              <span
                className={`h-px w-full bg-bone transition-opacity ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-px w-full bg-bone transition-transform duration-300 ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
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
