"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import type { HeroSlideView } from "@/lib/queries";

const INTERVAL_MS = 5000;

export function HeroCarousel({
  slides,
  artistCount,
}: {
  slides: HeroSlideView[];
  artistCount: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const many = slides.length > 1;

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!many || paused) return;

    // Someone who has asked for less motion should not have the page
    // moving underneath them; they get the first slide and the dots.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    timer.current = setTimeout(next, INTERVAL_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, paused, many, next]);

  // Pause while the tab is in the background, so a viewer coming back does
  // not find the banner several slides along.
  useEffect(() => {
    if (!many) return;
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [many]);

  return (
    <section
      id="top"
      className="relative grid min-h-[min(92vh,900px)] items-end overflow-hidden bg-ink-raised"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription={many ? "carousel" : undefined}
      aria-label={many ? "Featured banners" : undefined}
    >
      {/* All slides stay mounted and cross-fade, so switching never
          reflows the page and the images are already decoded. */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-kasityot ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Media
            src={slide.image}
            alt={slide.alt}
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-linear-to-t from-ink-overlay/92 via-ink-overlay/55 via-36% to-ink-overlay/45" />
      <div className="absolute inset-0 opacity-22 [background:repeating-linear-gradient(112deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_4px)]" />

      <div className="relative flex animate-rise flex-col gap-[clamp(30px,4vw,56px)] px-(--spacing-section-x) pt-[clamp(44px,6vw,96px)] pb-[clamp(30px,3vw,48px)]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            hidden={i !== index}
            className="flex max-w-[min(100%,1060px)] flex-col gap-6.5"
          >
            <div className="flex items-center gap-4 font-mono text-label tracking-wider text-brass uppercase">
              <span className="block h-px w-[34px] bg-brass" />
              <span>{slide.eyebrow}</span>
            </div>
            <h1 className="m-0 font-display text-hero leading-[0.82] font-light tracking-hero text-balance text-cream">
              {slide.heading}
              {slide.headingAccent ? (
                <>
                  <br />
                  <em className="italic text-brass-light">
                    {slide.headingAccent}
                  </em>
                </>
              ) : null}
            </h1>
            <p className="m-0 max-w-[44ch] text-lede leading-[1.75] text-pretty text-bone-soft">
              {slide.subtext}
            </p>
            <div className="flex flex-wrap gap-3.5 pt-2.5">
              <Button href="/artworks">View the full collection</Button>
              <Button href="/artists" variant="secondary">
                Meet the artists
              </Button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-end justify-between gap-[clamp(18px,4vw,60px)] border-t border-brass/42 pt-5.5 font-mono text-label tracking-rail text-stone uppercase">
          <span>Every piece one of a kind</span>

          {/* With several slides the dots take the rail's right-hand slot;
              with one, it keeps the design's original stat pair. */}
          {many ? (
            <div
              className="flex items-center gap-3"
              role="tablist"
              aria-label="Choose a banner"
            >
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Banner ${i + 1} of ${slides.length}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 cursor-pointer rounded-pill transition-all duration-300 ${
                    i === index
                      ? "w-8 bg-brass"
                      : "w-1.5 bg-bone/40 hover:bg-bone/70"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-[clamp(18px,3vw,44px)] text-brass">
              <span>{artistCount} artists</span>
              <span>Never a series</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
