"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

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
        <Image
          src="/logo-mark.png"
          alt=""
          width={176}
          height={207}
          className="h-[34px] w-auto"
        />
        <span className="flex flex-col gap-[3px]">
          <span className="font-sans text-[12px] tracking-logo uppercase">
            Kasityot
          </span>
          <span className="font-mono text-label-xs tracking-widest text-slate uppercase">
            Handmade in India
          </span>
        </span>
      </Link>

      {/* Centred on the header itself, not in the space left between the
          logo and the Browse pill, which are different widths. */}
      <nav className="absolute left-1/2 hidden -translate-x-1/2 gap-7 font-mono text-label tracking-nav uppercase lg:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="link-draw transition-colors duration-200 hover:text-brass"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* ml-auto keeps this group against the right edge even if the row
          ever wraps. On a phone the Browse pill would not fit beside the
          logo, and the menu already leads with Artworks, so it is dropped
          there and the menu button sits alone on the right. */}
      <div className="ml-auto flex items-center gap-5 font-mono text-label tracking-nav uppercase">
        <Link
          href="/artworks"
          className="hidden rounded-pill border border-brass/55 px-[18px] py-2.5 text-brass transition-colors duration-200 hover:border-brass hover:bg-brass hover:text-ink sm:block"
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
          {/* The sheet is display:none while closed, so the links slide up
              afresh each time it opens. */}
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-bone/12 py-5 font-display text-[28px] leading-none text-cream transition-colors duration-200 [--anim-duration:700ms] last:border-b-0 hover:text-brass"
              style={{ "--anim-delay": `${i * 70}ms` } as CSSProperties}
            >
              <span className="mask-line">
                <span className="animate-line">{item.label}</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* How far down the page the reader is. */}
      <span
        aria-hidden
        className="k-progress absolute inset-x-0 -bottom-px h-px bg-brass"
      />
    </header>
  );
}
