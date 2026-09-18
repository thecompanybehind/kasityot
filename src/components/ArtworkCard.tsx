import Link from "next/link";
import { Frame } from "@/components/ui/Media";
import { formatPrice, type Piece } from "@/lib/fixtures";

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
  piece: Piece;
  href?: string;
  showPrice?: boolean;
  priority?: boolean;
};

export function ArtworkCard({
  piece,
  href = "#pieces",
  showPrice = true,
  priority = false,
}: Props) {
  return (
    <Link href={href} className="flex flex-col gap-5">
      <div className="relative aspect-4/5 overflow-hidden bg-ink-raised">
        <Frame
          src={piece.image}
          detail={piece.detail}
          alt={piece.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
      </div>
      <div className="flex flex-col">
        <div className="pb-3 font-mono text-label-sm tracking-wide text-brass uppercase">
          {piece.craft} — {piece.no}
        </div>
        <div className="pb-3.5 font-display text-card-title leading-[1.14] tracking-card text-cream">
          {piece.title}
        </div>
        <SpecRow label="Maker" value={`${piece.maker}, ${piece.city}`} />
        <SpecRow label="Material" value={piece.material} />
        <SpecRow label="Hours" value={piece.hours} />
        {showPrice ? (
          <div className="flex justify-between gap-3.5 border-t border-brass/40 pt-3.5 font-mono text-[12px] tracking-price text-brass">
            <span className="text-label-sm tracking-rail text-slate uppercase">
              Price
            </span>
            <span>{formatPrice(piece.price)}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
