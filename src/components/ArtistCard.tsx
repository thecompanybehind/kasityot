import Link from "next/link";
import { Media } from "@/components/ui/Media";
import type { Maker } from "@/lib/fixtures";

type Props = {
  maker: Maker;
  href?: string;
};

export function ArtistCard({ maker, href = "#maker" }: Props) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-4 text-espresso transition-opacity duration-200 hover:opacity-70"
    >
      <div className="relative size-16 overflow-hidden rounded-pill bg-parchment-deep">
        <Media src={maker.image} alt={maker.name} sizes="64px" />
      </div>
      <div className="font-display text-[25px] leading-[1.1]">{maker.name}</div>
      <div className="font-mono text-label-sm tracking-rail text-brass-deep uppercase">
        {maker.line}
      </div>
      <div className="text-body-sm leading-[1.65] text-espresso-muted">
        {maker.note}
      </div>
    </Link>
  );
}
