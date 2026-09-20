"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/ui";
import {
  deleteHeroSlide,
  moveHeroSlide,
  setHeroSlideStatus,
} from "@/lib/actions";
import type { HeroSlideView } from "@/lib/queries";

export function HeroSlideRow({
  slide,
  position,
  total,
}: {
  slide: HeroSlideView;
  position: number;
  total: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function act(fn: () => Promise<unknown>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  const usesDefaults = !slide.heading && !slide.eyebrow && !slide.subtext;

  return (
    <div
      className={`flex flex-wrap items-center gap-5 border-b border-bone/12 py-5 ${pending ? "opacity-60" : ""}`}
    >
      <div className="relative h-[68px] w-[120px] shrink-0 overflow-hidden bg-ink-raised">
        <Image
          src={slide.image}
          alt=""
          fill
          sizes="120px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1 basis-[240px]">
        <Link
          href={`/hero/${slide.id}`}
          className="font-display text-[21px] leading-tight text-cream transition-colors hover:text-brass"
        >
          {slide.heading || "Default heading"}
          {slide.headingAccent ? (
            <span className="text-brass"> {slide.headingAccent}</span>
          ) : null}
        </Link>
        <div className="pt-1.5 font-mono text-label-sm tracking-rail text-slate uppercase">
          {usesDefaults ? "Using the design's own copy" : slide.eyebrow || "—"}
        </div>
      </div>

      <StatusPill status={slide.status} />

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending || position === 0}
          onClick={() => act(() => moveHeroSlide(slide.id, "up"))}
          aria-label="Move earlier"
          className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm text-bone-muted transition-colors hover:border-brass hover:text-brass disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={pending || position === total - 1}
          onClick={() => act(() => moveHeroSlide(slide.id, "down"))}
          aria-label="Move later"
          className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm text-bone-muted transition-colors hover:border-brass hover:text-brass disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            act(() =>
              setHeroSlideStatus(
                slide.id,
                slide.status === "visible" ? "hidden" : "visible",
              ),
            )
          }
          className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass disabled:cursor-wait"
        >
          {slide.status === "visible" ? "Hide" : "Show"}
        </button>
        <Link
          href={`/hero/${slide.id}`}
          className="border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
        >
          Edit
        </Link>
        {confirming ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => deleteHeroSlide(slide.id))}
              className="cursor-pointer border border-brass bg-brass px-3 py-1.5 font-mono text-label-sm tracking-rail text-ink uppercase"
            >
              Delete for good
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="cursor-pointer px-2 font-mono text-label-sm tracking-rail text-slate uppercase hover:text-bone"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
