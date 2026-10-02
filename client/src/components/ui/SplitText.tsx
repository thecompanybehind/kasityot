import { Fragment, type CSSProperties } from "react";

const at = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Text set one word at a time: each word slides up from behind its own
 * mask once the surrounding <Reveal> is shown.
 */
export function Words({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      <span className="mask-word">
        <span className="rv-word" style={at(i)}>
          {word}
        </span>
      </span>{" "}
    </Fragment>
  ));
}

/**
 * Text set one letter at a time. Words stay whole so a line never breaks
 * mid-word. Screen readers get the plain string; the split letters are
 * decoration.
 */
export function Chars({ text }: { text: string }) {
  const words = text.split(" ");
  // Each word's first letter continues the count from the word before it.
  const starts = words.map((_, w) => words.slice(0, w).join("").length);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, w) => (
          <Fragment key={w}>
            <span className="mask-word whitespace-nowrap">
              {[...word].map((char, c) => (
                <span key={c} className="rv-char" style={at(starts[w] + c)}>
                  {char}
                </span>
              ))}
            </span>{" "}
          </Fragment>
        ))}
      </span>
    </>
  );
}
