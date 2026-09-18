"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Pieces", href: "#pieces" },
  { label: "Makers", href: "#maker" },
  { label: "Collections", href: "#collections" },
  { label: "Commission", href: "#commission" },
  { label: "Journal", href: "#journal" },
];

function Monogram({ size = "size-[30px]", text = "text-[17px]" }) {
  return (
    <span
      className={`grid ${size} place-items-center border border-brass font-display ${text} text-brass`}
    >
      K
    </span>
  );
}

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
      <Link href="#top" className="flex items-center gap-3.5">
        <Monogram />
        <span className="flex flex-col gap-[3px]">
          <span className="font-sans text-[12px] tracking-logo uppercase">
            Käsityöt
          </span>
          <span className="font-mono text-label-xs tracking-widest text-slate uppercase">
            Helsinki · MMXXVI
          </span>
        </span>
      </Link>

      {/* Desktop navigation */}
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
          href="#pieces"
          className="hidden transition-colors duration-200 hover:text-brass sm:inline"
        >
          Search
        </Link>
        <Link
          href="#pieces"
          className="rounded-pill border border-brass/55 px-[18px] py-2.5 text-brass transition-colors duration-200 hover:border-brass hover:bg-brass hover:text-ink"
        >
          Cart (0)
        </Link>

        {/* Mobile trigger — three rules that fold into a cross. */}
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

      {/* Mobile sheet — same ground, rules and mono type as the rest of the site. */}
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
          <Link
            href="#pieces"
            onClick={() => setOpen(false)}
            className="py-5 font-mono text-label tracking-nav text-slate uppercase"
          >
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
