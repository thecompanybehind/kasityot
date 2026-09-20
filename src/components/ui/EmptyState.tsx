type Props = {
  title: string;
  body: string;
  /** Parchment sections invert the colours. */
  tone?: "dark" | "light";
};

/**
 * Shown wherever a list can legitimately be empty: no artworks yet, no
 * artists yet, or filters that match nothing. Never an error — just a
 * quiet, in-language explanation.
 */
export function EmptyState({ title, body, tone = "dark" }: Props) {
  const border = tone === "dark" ? "border-brass/30" : "border-espresso/22";
  const heading = tone === "dark" ? "text-cream" : "text-espresso";
  const text = tone === "dark" ? "text-bone-muted" : "text-espresso-muted";

  return (
    <div
      className={`mt-(--spacing-rule-mt) flex flex-col items-center gap-4 border ${border} px-6 py-[clamp(48px,7vw,96px)] text-center`}
    >
      <div className={`font-display text-card-title ${heading}`}>{title}</div>
      <p className={`m-0 max-w-[42ch] text-body-sm leading-[1.7] ${text}`}>
        {body}
      </p>
    </div>
  );
}
