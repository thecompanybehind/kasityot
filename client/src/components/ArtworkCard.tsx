import type { CSSProperties } from "react";
import Link from "next/link";
import { Frame } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Chars } from "@/components/ui/SplitText";
import { formatPrice } from "@/lib/format";
import type { ArtworkView } from "@/lib/queries";

/** Milliseconds between one card in a row unveiling and the next. */
const STAGGER_MS = 110;

/** When the first ruled row starts, and the gap to each one after it. */
const ROWS_START_MS = 380;
const ROW_STEP_MS = 90;

const rowDelay = (n: number) =>
  ({ "--rv-offset": `${ROWS_START_MS + n * ROW_STEP_MS}ms` }) as CSSProperties;

/** One spec row of the card's ruled table: the rule draws, the row follows. */
function SpecRow({
  label,
  value,
  n,
}: {
  label: string;
  value: string;
  n: number;
}) {
  return (
    <div className="relative overflow-hidden text-meta" style={rowDelay(n)}>
      <span
        aria-hidden
        className="rv-rule absolute inset-x-0 top-0 h-px bg-bone/16"
      />
      <div className="rv-line flex items-baseline justify-between gap-3.5 py-3">
        <span className="font-mono text-spec-label tracking-rail text-slate uppercase">
          {label}
        </span>
        <span className="text-right text-bone-soft">{value}</span>
      </div>
    </div>
  );
}

/* How the image is uncovered. Each page that lists artworks uses its own. */
const UNVEIL = {
  lift: "rv-curtain", // the cover lifts away
  doors: "rv-doors", // the cover parts in the middle
  aside: "rv-curtain-x", // the cover draws to one side
} as const;

type Props = {
  artwork: ArtworkView;
  priority?: boolean;
  /** Position within its row, so neighbours unveil one after another. */
  stagger?: number;
  unveil?: keyof typeof UNVEIL;
};

export function ArtworkCard({
  artwork,
  priority = false,
  stagger = 0,
  unveil = "lift",
}: Props) {
  const sold = artwork.status === "sold";
  const [cover, detail] = artwork.images;

  const specs: [string, string][] = [
    ...(artwork.artist
      ? ([["Artist", `${artwork.artist.name}, ${artwork.artist.region}`]] as [
          string,
          string,
        ][])
      : []),
    ["Material", artwork.material],
    ["Size", artwork.dimensions],
  ];

  return (
    <Reveal delay={stagger * STAGGER_MS}>
      <Link href={`/artworks/${artwork.slug}`} className="group flex flex-col gap-5">
        <div
          className={`${UNVEIL[unveil]} relative aspect-4/5 overflow-hidden bg-ink-raised`}
        >
          {cover ? (
            <div className="rv-zoom absolute inset-0">
              <Frame
                src={cover}
                detail={detail}
                alt={artwork.title}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
              />
            </div>
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
          <span
            aria-hidden
            className="absolute bottom-0 left-0 translate-y-full bg-ink px-3.5 py-2 font-mono text-label tracking-rail text-brass uppercase transition-transform duration-500 ease-kasityot group-hover:translate-y-0 group-focus-visible:translate-y-0"
          >
            View piece →
          </span>
        </div>

        <div className="flex flex-col">
          <div className="pb-3 font-mono text-spec-label tracking-wide text-brass uppercase">
            <span className="rv-type inline-block [--rv-offset:200ms]">
              {artwork.artist?.craftType ?? "Handicraft"}
            </span>
          </div>
          <div className="pb-3.5 font-display text-card-title leading-[1.14] tracking-card text-cream transition-colors duration-500 group-hover:text-brass-light">
            <span className="mask-line">
              <span className="rv-line [--rv-offset:260ms]">{artwork.title}</span>
            </span>
          </div>
          {specs.map(([label, value], n) => (
            <SpecRow key={label} label={label} value={value} n={n} />
          ))}
          <div
            className="relative flex flex-wrap items-baseline justify-between gap-x-3.5 gap-y-1 overflow-hidden pt-4 font-mono text-price tracking-price text-brass"
            style={rowDelay(specs.length)}
          >
            <span
              aria-hidden
              className="rv-rule absolute inset-x-0 top-0 h-px bg-brass/40"
            />
            {/* The price rule firms up to full brass on hover. */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-brass transition-transform duration-700 ease-kasityot group-hover:scale-x-100"
            />
            <span className="mask-line text-spec-label tracking-rail text-slate uppercase">
              <span className="rv-line">
                {artwork.priceOnRequest ? "Enquire" : "Price"}
              </span>
            </span>
            {/* The figure is set a digit at a time, after its rule. */}
            <span
              style={
                {
                  "--rv-base": `${ROWS_START_MS + (specs.length + 1) * ROW_STEP_MS}ms`,
                } as CSSProperties
              }
            >
              <Chars text={formatPrice(artwork.price)} />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
