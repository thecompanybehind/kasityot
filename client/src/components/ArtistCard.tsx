import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import type { ArtistView } from "@/lib/queries";

/** Milliseconds between one card in a row arriving and the next. */
const STAGGER_MS = 120;

type Props = {
  artist: ArtistView;
  /** Parchment sections invert the text colours. */
  tone?: "light" | "dark";
  /** Position within its row, so neighbours arrive one after another. */
  stagger?: number;
};

export function ArtistCard({ artist, tone = "light", stagger = 0 }: Props) {
  const nameTone = tone === "light" ? "text-espresso" : "text-cream";
  const lineTone = tone === "light" ? "text-brass-deep" : "text-brass";
  const noteTone = tone === "light" ? "text-espresso-muted" : "text-bone-muted";
  const wellTone = tone === "light" ? "bg-parchment-deep" : "bg-ink-raised";

  return (
    <Reveal delay={stagger * STAGGER_MS}>
      <Link
        href={`/artists/${artist.slug}`}
        className={`flex flex-col gap-4 transition-opacity duration-200 hover:opacity-70 ${nameTone}`}
      >
        {/* The portrait grows out of a point, like a seal being pressed. */}
        <div
          className={`rv-pop relative size-16 overflow-hidden rounded-pill ${wellTone}`}
        >
          {artist.photo ? (
            <Media src={artist.photo} alt={artist.name} sizes="64px" />
          ) : null}
        </div>
        <div className="font-display text-[25px] leading-[1.1]">
          <span className="mask-line">
            <span className="rv-line [--rv-offset:160ms]">{artist.name}</span>
          </span>
        </div>
        <div
          className={`rv-type font-mono text-label-sm tracking-rail uppercase [--rv-offset:300ms] ${lineTone}`}
        >
          {artist.craftType} · {artist.region}
        </div>
        <div
          className={`rv-unroll line-clamp-3 text-body-sm leading-[1.65] [--rv-offset:420ms] ${noteTone}`}
        >
          {artist.story}
        </div>
      </Link>
    </Reveal>
  );
}
