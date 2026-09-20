import Link from "next/link";
import { Frame } from "@/components/ui/Media";
import { formatPrice } from "@/lib/format";
import type { ArtworkView } from "@/lib/queries";

/** One spec row of the card's ruled table. */
function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3.5 border-t border-bone/16 py-[11px] text-meta">
      <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
        {label}
      </span>
      <span className="text-right text-bone-soft">{value}</span>
    </div>
  );
}

type Props = {
  artwork: ArtworkView;
  priority?: boolean;
};

export function ArtworkCard({ artwork, priority = false }: Props) {
  const sold = artwork.status === "sold";
  const [cover, detail] = artwork.images;

  return (
    <Link href={`/artworks/${artwork.slug}`} className="group flex flex-col gap-5">
      <div className="relative aspect-4/5 overflow-hidden bg-ink-raised">
        {cover ? (
          <Frame
            src={cover}
            detail={detail}
            alt={artwork.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="grid h-full place-items-center font-mono text-label-sm tracking-rail text-slate uppercase">
            No image
          </div>
        )}
        {/* Sold pieces stay visible but are unmistakably marked. */}
        {sold ? (
          <div className="absolute inset-0 flex items-start justify-end bg-ink/45 p-4">
            <span className="bg-ink px-3 py-1.5 font-mono text-label-sm tracking-rail text-brass uppercase">
              Sold
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col">
        <div className="pb-3 font-mono text-label-sm tracking-wide text-brass uppercase">
          {artwork.artist?.craftType ?? "Handicraft"}
        </div>
        <div className="pb-3.5 font-display text-card-title leading-[1.14] tracking-card text-cream">
          {artwork.title}
        </div>
        {artwork.artist ? (
          <SpecRow
            label="Artist"
            value={`${artwork.artist.name}, ${artwork.artist.region}`}
          />
        ) : null}
        <SpecRow label="Material" value={artwork.material} />
        <SpecRow label="Size" value={artwork.dimensions} />
        <div className="flex justify-between gap-3.5 border-t border-brass/40 pt-3.5 font-mono text-[12px] tracking-price text-brass">
          <span className="text-label-sm tracking-rail text-slate uppercase">
            {artwork.priceOnRequest ? "Enquire" : "Price"}
          </span>
          <span>{formatPrice(artwork.price)}</span>
        </div>
      </div>
    </Link>
  );
}
