"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const NAME = "Kasityot";

/** The counter never finishes sooner than this, so the opening can be read. */
const MIN_MS = 3200;
/** Past this, the page is shown whatever is still loading. */
const MAX_MS = 9000;
/** How long the sheet takes to leave (matches kSheetExit plus its delay). */
const EXIT_MS = 1650;

/** Fired on window when the sheet starts to lift, for the hero carousel. */
export const INTRO_END_EVENT = "kasityot:intro-end";

const SPOKES = 72;

/** Resolves when the hero's first image has loaded (or failed). */
function heroImage(): Promise<void> {
  return new Promise((resolve) => {
    const img = document.querySelector<HTMLImageElement>("#top img");
    if (!img || img.complete) return resolve();
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

function pageLoad(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === "complete") return resolve();
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

/**
 * Warp threads on a loom, swaying like cloth in a draught: the moving
 * ground behind the preloader. Returns a function that stops it.
 */
function weave(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let width = 0;
  let height = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  let frame = 0;
  const draw = (t: number) => {
    ctx.clearRect(0, 0, width, height);

    // A warm pool of light behind the mark.
    const glow = ctx.createRadialGradient(
      width / 2,
      height * 0.45,
      0,
      width / 2,
      height * 0.45,
      Math.max(width, height) * 0.65,
    );
    glow.addColorStop(0, "rgba(199,158,104,0.2)");
    glow.addColorStop(1, "rgba(16,14,12,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const threads = Math.round(width / 13);
    const rows = 36;
    for (let i = 0; i < threads; i++) {
      const x = (i / (threads - 1)) * width;
      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        const k = r / rows;
        // Pinned at top and bottom like a warp, free to billow between.
        const billow =
          Math.sin(k * 3.1 + t * 0.0007 + i * 0.19) * 30 * Math.sin(k * Math.PI);
        const drift = Math.sin(t * 0.00045 + i * 0.045) * 16;
        const px = x + billow + drift;
        const py = k * height;
        if (r === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      const shimmer = 0.5 + 0.5 * Math.sin(i * 0.37 + t * 0.0011);
      ctx.strokeStyle = `rgba(199,158,104,${0.07 + 0.2 * shimmer})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // The shuttle: a band of light passing down through the warp.
    const band = ((t * 0.00011) % 1.4) * height - height * 0.2;
    const pass = ctx.createLinearGradient(0, band - 90, 0, band + 90);
    pass.addColorStop(0, "rgba(217,182,137,0)");
    pass.addColorStop(0.5, "rgba(217,182,137,0.07)");
    pass.addColorStop(1, "rgba(217,182,137,0)");
    ctx.fillStyle = pass;
    ctx.fillRect(0, band - 90, width, 180);

    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
  };
}

/**
 * The home page's opening: a full-screen sheet with threads moving on a
 * loom behind it, the wheel mark drawn and the name set, and a counter
 * that runs to 100 as the page actually loads. Then the sheet lifts away
 * on a tilt and the hero starts its own entrance underneath.
 *
 * The sheet is raised by the inline reveal script before first paint and
 * styled by .k-intro in globals.css; it is display:none on every other
 * visit, page and preference.
 */
export function Preloader() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-intro") !== "play") return;

    const stopWeave = canvas.current ? weave(canvas.current) : () => {};

    // Real progress: each of these is a third of the way.
    let loaded = 0.1;
    const step = () => {
      loaded = Math.min(loaded + 0.3, 1);
    };
    document.fonts?.ready.then(step);
    heroImage().then(step);
    pageLoad().then(step);

    const start = performance.now();
    let shown = 0;
    let frame = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const finish = () => {
      root.setAttribute("data-intro", "leaving");
      window.dispatchEvent(new Event(INTRO_END_EVENT));
      timers.push(
        setTimeout(() => {
          root.setAttribute("data-intro", "done");
          stopWeave();
        }, EXIT_MS),
      );
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      // The counter may not outrun the page, nor finish before MIN_MS.
      const target =
        elapsed > MAX_MS ? 1 : Math.min(loaded, elapsed / MIN_MS);
      shown += (target - shown) * 0.06;
      if (target === 1 && shown > 0.995) shown = 1;

      const value = Math.round(shown * 100);
      if (count.current) count.current.textContent = String(value).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${shown})`;

      if (shown < 1) frame = requestAnimationFrame(tick);
      else timers.push(setTimeout(finish, 400));
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      stopWeave();
    };
  }, []);

  return (
    <div className="k-intro overflow-hidden" aria-hidden>
      <canvas ref={canvas} className="absolute inset-0 size-full" />

      <div className="k-intro-stage relative grid h-full grid-rows-[1fr_auto] px-(--spacing-section-x)">
        <div className="grid place-content-center justify-items-center gap-[clamp(18px,2.6vw,30px)] text-center">
          {/* The mark: a potter's wheel, its rings and spokes drawn in. */}
          <svg
            viewBox="0 0 120 120"
            className="size-[clamp(78px,8vw,104px)] text-brass"
            fill="none"
            stroke="currentColor"
          >
            <g className="k-intro-wheel">
              {Array.from({ length: SPOKES }, (_, i) => {
                const a = (i / SPOKES) * Math.PI * 2;
                const inner = i % 2 ? 30 : 26;
                // Fixed precision, so server and browser agree on the markup.
                const at = (r: number, f: (a: number) => number) =>
                  (60 + f(a) * r).toFixed(2);
                return (
                  <line
                    key={i}
                    className="k-intro-spoke"
                    pathLength={1}
                    x1={at(inner, Math.cos)}
                    y1={at(inner, Math.sin)}
                    x2={at(57, Math.cos)}
                    y2={at(57, Math.sin)}
                    strokeWidth={0.7}
                    style={{ "--i": i } as CSSProperties}
                  />
                );
              })}
            </g>
            <circle
              className="k-intro-ring"
              pathLength={1}
              cx={60}
              cy={60}
              r={20}
              strokeWidth={0.9}
            />
            <circle
              className="k-intro-ring"
              pathLength={1}
              cx={60}
              cy={60}
              r={6}
              strokeWidth={0.9}
            />
          </svg>

          <div className="overflow-hidden py-[0.12em] pl-[0.3em] font-display text-[clamp(44px,7.4vw,112px)] leading-none font-light tracking-[0.3em] text-cream uppercase">
            {[...NAME].map((letter, i) => (
              <span
                key={i}
                className="k-intro-letter"
                style={{ "--i": i } as CSSProperties}
              >
                {letter}
              </span>
            ))}
          </div>

          <div className="k-intro-sub flex items-center gap-4 font-mono text-[clamp(10px,0.85vw,12px)] tracking-widest text-bone-soft uppercase">
            <span>Handmade in India</span>
            <span className="h-3.5 w-px bg-brass/60" />
            <span>One of a kind</span>
          </div>

          <div className="overflow-hidden pt-[clamp(14px,2.4vw,34px)] pb-[0.12em] font-display text-[clamp(28px,3.4vw,52px)] leading-[1.1] font-light text-cream uppercase">
            <span className="k-intro-tagline block">
              The hand,{" "}
              <em className="font-normal text-brass-light normal-case italic">
                unhurried
              </em>
            </span>
          </div>
        </div>

        {/* The counter and its rule, running as the page loads. */}
        <div className="overflow-hidden pb-[clamp(22px,3.4vw,44px)]">
          <div className="k-intro-rail flex items-center gap-[clamp(16px,2.4vw,36px)]">
            <span
              ref={count}
              className="w-[3ch] font-display text-[clamp(30px,3vw,44px)] leading-none text-cream tabular-nums"
            >
              000
            </span>
            <span className="relative h-px flex-1 bg-bone/15">
              <span
                ref={bar}
                className="absolute inset-0 origin-left bg-cream"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            <span className="hidden font-mono text-label tracking-widest text-bone-soft uppercase sm:block">
              Kasityot · India
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
