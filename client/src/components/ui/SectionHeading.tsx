import type { ReactNode } from "react";

type Props = {
  /** Roman numeral shown alongside the heading, e.g. "I." — omit to hide it. */
  numeral?: string;
  /** Small mono label above the title. */
  eyebrow: string;
  title: ReactNode;
  /** Optional link rendered opposite the heading, e.g. "All 618 works →". */
  action?: ReactNode;
  /** Parchment sections invert the numeral and eyebrow colours. */
  tone?: "dark" | "light";
  className?: string;
};

export function SectionHeading({
  numeral,
  eyebrow,
  title,
  action,
  tone = "dark",
  className = "",
}: Props) {
  const numeralTone = tone === "dark" ? "text-brass" : "text-brass-deep";
  const eyebrowTone = tone === "dark" ? "text-slate" : "text-clay";
  const titleTone = tone === "dark" ? "text-cream" : "text-espresso";

  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-8 ${className}`}
    >
      <div className="flex min-w-0 items-start gap-(--spacing-gap-numeral)">
        {numeral ? (
          <div
            className={`font-display text-numeral leading-none italic ${numeralTone}`}
          >
            {numeral}
          </div>
        ) : null}
        <div className="min-w-0">
          <div
            className={`pb-4 font-mono text-label tracking-wide uppercase ${eyebrowTone}`}
          >
            {eyebrow}
          </div>
          <h2
            className={`m-0 font-display text-section leading-[0.98] font-light tracking-section ${titleTone}`}
          >
            {title}
          </h2>
        </div>
      </div>
      {action}
    </div>
  );
}
