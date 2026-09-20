"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* Cart, Commission and Journal are deliberately absent: the README rules out
   carts, multi-item checkout and a blog. One artwork, one purchase. */
const NAV = [
  { label: "Artworks", href: "/artworks" },
  { label: "Artists", href: "/artists" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  /* Lock the page behind the mobile sheet so the body doesn't scroll under it. */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-60 flex flex-wrap items-center justify-between gap-6 border-b border-brass/28 bg-ink/82 px-[30px] py-5 backdrop-blur-[16px]">
      <Link href="/" className="flex items-center gap-3.5">
        <span className="grid size-[30px] place-items-center border border-brass font-display text-[17px] text-brass">
          K
        </span>
        <span className="flex flex-col gap-[3px]">
          <span className="font-sans text-[12px] tracking-logo uppercase">
            Kasityot
          </span>
          <span className="font-mono text-label-xs tracking-widest text-slate uppercase">
            Handmade in India
          </span>
        </span>
      </Link>

      <nav className="hidden flex-wrap gap-7 font-mono text-label tracking-nav uppercase lg:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition-colors duration-200 hover:text-brass"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-5 font-mono text-label tracking-nav uppercase">
        <Link
          href="/artworks"
          className="rounded-pill border border-brass/55 px-[18px] py-2.5 text-brass transition-colors duration-200 hover:border-brass hover:bg-brass hover:text-ink"
        >
          Browse
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex size-6 flex-col justify-center gap-[5px] lg:hidden"
        >
          <span
            className={`h-px w-full bg-bone transition-transform duration-300 ease-kasityot ${
              open ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-full bg-bone transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-px w-full bg-bone transition-transform duration-300 ease-kasityot ${
              open ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-brass/28 bg-ink lg:hidden"
      >
        <nav className="flex flex-col px-[30px] py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-bone/12 py-5 font-display text-[28px] leading-none text-cream transition-colors duration-200 last:border-b-0 hover:text-brass"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
