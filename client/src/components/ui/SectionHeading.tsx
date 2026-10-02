import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Chars, Words } from "@/components/ui/SplitText";

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
  /**
   * How the title arrives: as one line, word by word or letter by letter.
   * The split settings need a plain string title.
   */
  setting?: "line" | "words" | "chars";
  className?: string;
};

export function SectionHeading({
  numeral,
  eyebrow,
  title,
  action,
  tone = "dark",
  setting = "line",
  className = "",
}: Props) {
  const numeralTone = tone === "dark" ? "text-brass" : "text-brass-deep";
  const eyebrowTone = tone === "dark" ? "text-slate" : "text-clay";
  const titleTone = tone === "dark" ? "text-cream" : "text-espresso";

  const split = typeof title === "string" && setting !== "line";

  return (
    <Reveal
      className={`flex flex-wrap items-end justify-between gap-8 ${className}`}
    >
      <div className="flex min-w-0 items-start gap-(--spacing-gap-numeral)">
        {numeral ? (
          <div
            className={`font-display text-numeral leading-none italic ${numeralTone}`}
          >
            <span className="mask-line">
              <span className="rv-line">{numeral}</span>
            </span>
          </div>
        ) : null}
        <div className="min-w-0">
          <div
            className={`pb-4 font-mono text-label tracking-wide uppercase ${eyebrowTone}`}
          >
            <span className="rv-type inline-block [--rv-offset:100ms]">
              {eyebrow}
            </span>
          </div>
          <h2
            className={`m-0 font-display text-section leading-[0.98] font-light tracking-section [--rv-base:180ms] ${titleTone}`}
          >
            {split ? (
              setting === "chars" ? (
                <Chars text={title} />
              ) : (
                <Words text={title} />
              )
            ) : (
              <span className="mask-line">
                <span className="rv-line [--rv-offset:180ms]">{title}</span>
              </span>
            )}
          </h2>
        </div>
      </div>
      {action ? (
        <div className="rv-wipe flex [--rv-offset:500ms]">{action}</div>
      ) : null}
    </Reveal>
  );
}
