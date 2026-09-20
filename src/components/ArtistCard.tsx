import Link from "next/link";
import { Media } from "@/components/ui/Media";
import type { ArtistView } from "@/lib/queries";

type Props = {
  artist: ArtistView;
  /** Parchment sections invert the text colours. */
  tone?: "light" | "dark";
};

export function ArtistCard({ artist, tone = "light" }: Props) {
  const nameTone = tone === "light" ? "text-espresso" : "text-cream";
  const lineTone = tone === "light" ? "text-brass-deep" : "text-brass";
  const noteTone = tone === "light" ? "text-espresso-muted" : "text-bone-muted";
  const wellTone = tone === "light" ? "bg-parchment-deep" : "bg-ink-raised";

  return (
    <Link
      href={`/artists/${artist.slug}`}
      className={`flex flex-col gap-4 transition-opacity duration-200 hover:opacity-70 ${nameTone}`}
    >
      <div className={`relative size-16 overflow-hidden rounded-pill ${wellTone}`}>
        {artist.photo ? (
          <Media src={artist.photo} alt={artist.name} sizes="64px" />
        ) : null}
      </div>
      <div className="font-display text-[25px] leading-[1.1]">{artist.name}</div>
      <div
        className={`font-mono text-label-sm tracking-rail uppercase ${lineTone}`}
      >
        {artist.craftType} · {artist.region}
      </div>
      <div className={`line-clamp-3 text-body-sm leading-[1.65] ${noteTone}`}>
        {artist.story}
      </div>
    </Link>
  );
}
