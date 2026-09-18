"use client";

import Image from "next/image";
import { useState } from "react";

type MediaProps = {
  src: string;
  alt: string;
  /** Sizes hint for the responsive srcset. */
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * A single image that fades in once decoded, over a ground-coloured well.
 * The well means no flash of empty page and no layout shift — the parent
 * owns the aspect ratio, this only fills it.
 */
export function Media({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className = "",
}: MediaProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onLoad={() => setLoaded(true)}
      className={`object-cover transition-opacity duration-(--duration-image) ease-kasityot ${
        loaded ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );
}

type FrameProps = {
  src: string;
  /** Detail shot revealed on hover; omit for a still image. */
  detail?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * The design's two-image frame: the primary shot cross-fades to a detail
 * shot on hover, both easing up in scale. Falls back to a plain Media
 * when no detail image exists.
 */
export function Frame({ src, detail, alt, sizes, priority }: FrameProps) {
  const [hover, setHover] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const shared =
    "object-cover transition-[opacity,transform] ease-kasityot duration-(--duration-image)";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {detail ? (
        <Image
          src={detail}
          alt={`${alt} — detail`}
          fill
          sizes={sizes}
          className={`${shared} duration-(--duration-image-slow) ${
            hover ? "scale-[1.04]" : "scale-100"
          }`}
        />
      ) : null}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`${shared} ${
          detail && hover ? "opacity-0" : loaded ? "opacity-100" : "opacity-0"
        } ${hover ? "scale-[1.03]" : "scale-100"}`}
      />
    </div>
  );
}
