"use client";

import { useState } from "react";
import { Media } from "@/components/ui/Media";

type Props = {
  images: string[];
  title: string;
  sold?: boolean;
};

export function ArtworkGallery({ images, title, sold = false }: Props) {
  // The image shown before the current one stays underneath while the new
  // one is drawn across it; -1 until the viewer first picks a thumbnail, so
  // the opening image, which is the page's largest paint, is never animated.
  const [{ active, prev }, setView] = useState({ active: 0, prev: -1 });

  if (!images.length) {
    return (
      <div className="grid aspect-4/5 place-items-center bg-ink-raised font-mono text-label-sm tracking-rail text-slate uppercase">
        No image
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <div className="rv-curtain-x relative aspect-4/5 overflow-hidden bg-ink-raised">
        {images.map((src, i) =>
          i === active || i === prev ? (
            <div
              key={src + i}
              className={`absolute inset-0 ${
                i === active ? `z-1 ${prev >= 0 ? "animate-swap" : ""}` : ""
              }`}
            >
              <Media
                src={src}
                alt={i === active ? `${title} — view ${i + 1}` : ""}
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
            </div>
          ) : null,
        )}
        {sold ? (
          <div className="absolute top-0 right-0 z-2 m-4 bg-ink px-3 py-1.5 font-mono text-label-sm tracking-rail text-brass uppercase">
            Sold
          </div>
        ) : null}
      </div>

      {/* Thumbnails only earn their space when there is more than one image. */}
      {images.length > 1 ? (
        <div className="rv-wipe grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-3 [--rv-offset:700ms]">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() =>
                setView((view) =>
                  i === view.active ? view : { active: i, prev: view.active },
                )
              }
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square overflow-hidden bg-ink-raised transition-opacity ${
                i === active ? "opacity-100" : "opacity-55 hover:opacity-85"
              }`}
            >
              <Media src={src} alt="" sizes="72px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
