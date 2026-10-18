/**
 * The About page's wording, and the design's own copy it falls back to.
 *
 * The owner edits the page from the panel, but every field is optional: one
 * left blank shows the text below. Kept here, beside the model, so the public
 * page and the panel's placeholders can never disagree on what "blank" means.
 *
 * Pure — no Mongoose — so client components may import it through
 * "@kasityot/core/about".
 */

export type AboutPrinciple = { title: string; body: string };

export type AboutContent = {
  heroImage: string;
  heroAlt: string;
  heading: string;
  /** Rendered italic in brass, on its own line under the heading. */
  headingAccent: string;
  premiseEyebrow: string;
  premiseTitle: string;
  /** Paragraphs separated by a blank line. */
  premiseBody: string;
  principlesEyebrow: string;
  principlesTitle: string;
  principles: AboutPrinciple[];
};

export const ABOUT_DEFAULTS: AboutContent = {
  heroImage: "/design/279965af-0eed-4455-805c-d10ab40a07ed.jpg",
  heroAlt: "An artist at work",
  heading: "Made by hand,",
  headingAccent: "signed by name.",
  premiseEyebrow: "Why we exist",
  premiseTitle: "The premise",
  premiseBody:
    "India’s handicraft traditions are held by people, not factories — a Madhubani line learned at six, a lac colour pressed onto wood on a foot-turned lathe, a kani shawl that takes two years on the loom. Most of that work reaches buyers stripped of the name of whoever made it.\n\nKasityot exists to put the artist back in front of the object. You see the work, you see who made it and where, and you can reach them through us. Nothing is mass-produced, nothing is restocked.",
  principlesEyebrow: "How we work",
  principlesTitle: "Three principles",
  principles: [
    {
      title: "Every piece is one of a kind",
      body: "Nothing here is produced in a series. When a work is sold, it is gone — we do not make another.",
    },
    {
      title: "The artist is named",
      body: "Each work carries the name, craft and region of the person who made it. No anonymous inventory.",
    },
    {
      title: "The price reaches the maker",
      body: "We settle directly with the artist. There is no chain of intermediaries between their hands and yours.",
    },
  ],
};

/** Splits the premise into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
