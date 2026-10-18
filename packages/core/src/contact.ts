/**
 * The shop's contact details, and the values they fall back to.
 *
 * The owner edits these from the panel, but every field is optional: one left
 * blank shows the default below. Kept beside the model, as about.ts is, so the
 * public page and the panel's placeholders can never disagree.
 *
 * Pure — no Mongoose — so client components may import it through
 * "@kasityot/core/contact".
 */

export type ContactInfo = {
  email: string;
  /** As it should read, e.g. "+91 99200 22433". The dialling link is derived. */
  phone: string;
  /** The studio card's address, one line per line. */
  address: string;
};

export const CONTACT_DEFAULTS: ContactInfo = {
  email: "hello@kasityot.com",
  phone: "+91 99200 22433",
  address: "Kasityot\nHandmade in India",
};

/**
 * A tel: link from a number written for people: spaces, hyphens and brackets
 * go, a leading + stays. A ten-digit Indian mobile gains +91, so the link
 * works from abroad as well.
 */
export function telHref(phone: string): string {
  const plus = phone.trim().startsWith("+");
  const digits = phone.replace(/\D/g, "");
  if (!plus && digits.length === 10) return `tel:+91${digits}`;
  return `tel:${plus ? "+" : ""}${digits}`;
}
