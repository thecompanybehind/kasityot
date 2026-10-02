"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { INTRO_END_EVENT } from "@/components/Preloader";
import type { HeroSlideView } from "@/lib/queries";

const INTERVAL_MS = 5000;

export function HeroCarousel({
  slides,
  artistCount,
}: {
  slides: HeroSlideView[];
  artistCount: number;
}) {
  // The slide before the current one stays underneath while the new one is
  // drawn across it; -1 until the first change, so nothing plays on load.
  const [{ index, prev }, setView] = useState({ index: 0, prev: -1 });
  const [paused, setPaused] = useState(false);
  const [introOver, setIntroOver] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const many = slides.length > 1;

  const show = useCallback(
    (to: (current: number) => number) =>
      setView((view) => {
        const index = to(view.index);
        return index === view.index ? view : { index, prev: view.index };
      }),
    [],
  );

  const next = useCallback(() => {
    show((i) => (i + 1) % slides.length);
  }, [show, slides.length]);

  useEffect(() => {
    if (!many || paused) return;

    // Someone who has asked for less motion should not have the page
    // moving underneath them; they get the first slide and the dots.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    // While the preloader is covering the page the banner should not be
    // using up its first slide's time.
    if (document.documentElement.getAttribute("data-intro") === "play") return;

    timer.current = setTimeout(next, INTERVAL_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, paused, many, next, introOver]);

  // Re-runs the timer effect above once the preloader starts to lift.
  useEffect(() => {
    const release = () => setIntroOver(true);
    window.addEventListener(INTRO_END_EVENT, release, { once: true });
    return () => window.removeEventListener(INTRO_END_EVENT, release);
  }, []);

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
      className="k-hold relative grid min-h-[min(92vh,900px)] items-end overflow-hidden bg-ink-raised"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription={many ? "carousel" : undefined}
      aria-label={many ? "Featured banners" : undefined}
    >
      {/* All slides stay mounted, so switching never reflows the page and
          the images are already decoded. The incoming slide is drawn across
          the outgoing one from the right; the rest wait out of sight. */}
      <div className="absolute inset-0 isolate">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 ${
              i === index
                ? `z-2 ${prev >= 0 ? "animate-slide" : ""}`
                : i === prev
                  ? "z-1"
                  : "invisible"
            }`}
            data-active={i === index}
            aria-hidden={i !== index}
          >
            <div className="k-zoom absolute inset-0">
              <Media
                src={slide.image}
                alt={slide.alt}
                sizes="100vw"
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-ink-overlay/92 via-ink-overlay/55 via-36% to-ink-overlay/45" />
      <div className="absolute inset-0 opacity-22 [background:repeating-linear-gradient(112deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_4px)]" />

      <div className="relative flex flex-col gap-[clamp(30px,4vw,56px)] px-(--spacing-section-x) pt-[clamp(44px,6vw,96px)] pb-[clamp(30px,3vw,48px)]">
        {/* A slide's copy is display:none until its turn, so its entrance
            animations restart from the top every time it comes round. */}
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            hidden={i !== index}
            className="flex max-w-[min(100%,1060px)] flex-col gap-6.5"
          >
            <div className="flex items-center gap-4 font-mono text-label tracking-wider text-brass uppercase">
              <span className="block h-px w-[34px] animate-rule bg-brass" />
              <span className="mask-line">
                <span className="animate-line">{slide.eyebrow}</span>
              </span>
            </div>
            <h1 className="m-0 font-display text-hero leading-[0.82] font-light tracking-hero text-balance text-cream [--mask-pad:0.24em]">
              <span className="mask-line">
                <span className="animate-line [--anim-delay:100ms]">
                  {slide.heading}
                </span>
              </span>
              {slide.headingAccent ? (
                <span className="mask-line">
                  <em className="animate-line italic text-brass-light [--anim-delay:240ms]">
                    {slide.headingAccent}
                  </em>
                </span>
              ) : null}
            </h1>
            <p className="m-0 max-w-[44ch] text-lede leading-[1.75] text-pretty text-bone-soft">
              <span className="mask-line">
                <span className="animate-line [--anim-delay:420ms]">
                  {slide.subtext}
                </span>
              </span>
            </p>
            <div className="flex animate-wipe flex-wrap gap-3.5 pt-2.5 [--anim-delay:640ms]">
              <Button href="/artworks">View the full collection</Button>
              <Button href="/artists" variant="secondary">
                Meet the artists
              </Button>
            </div>
          </div>
        ))}

        {/* The rail's rule draws across first; its two ends then slide up
            from behind it. */}
        <div className="relative flex flex-wrap items-end justify-between gap-[clamp(18px,4vw,60px)] pt-5.5 font-mono text-label tracking-rail text-stone uppercase [--anim-delay:700ms]">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px animate-rule bg-brass/42"
          />
          <span className="mask-line">
            <span className="animate-line [--anim-delay:900ms]">
              Every piece one of a kind
            </span>
          </span>

          {/* With several slides the dots take the rail's right-hand slot;
              with one, it keeps the design's original stat pair. */}
          {many ? (
            <div
              className="flex animate-wipe items-center gap-3 [--anim-delay:1000ms]"
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
                  onClick={() => show(() => i)}
                  className={`relative h-1.5 cursor-pointer overflow-hidden rounded-pill transition-all duration-300 ${
                    i === index
                      ? "w-8 bg-bone/30"
                      : "w-1.5 bg-bone/40 hover:bg-bone/70"
                  }`}
                >
                  {/* The current dot fills as its slide's time runs out;
                      while paused it simply sits full. */}
                  {i === index ? (
                    <span
                      className={`absolute inset-0 bg-brass ${
                        paused ? "" : "animate-progress"
                      }`}
                      style={{ animationDuration: `${INTERVAL_MS}ms` }}
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <div className="mask-line">
              <div className="flex animate-line flex-wrap gap-[clamp(18px,3vw,44px)] text-brass [--anim-delay:1000ms]">
                <span>{artistCount} artists</span>
                <span>Never a series</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
