"use server";

import { headers } from "next/headers";
import { connectDB, Artwork, Enquiry } from "@kasityot/core";
import { isArtworkPubliclyVisible } from "@/lib/queries";
import { notifyNewEnquiry } from "@/lib/notify";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export type EnquiryResult = {
  ok: boolean;
  error?: string;
  /** Per-field messages so the form can mark the offending input. */
  fieldErrors?: Partial<Record<"name" | "phone" | "city" | "message", string>>;
};

/** Indian mobile numbers, tolerant of +91, spaces and hyphens. */
const PHONE = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/;

function clean(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

/**
 * Records a buyer enquiry. No login required.
 *
 * Validation happens here, on the server, regardless of what the browser
 * checked — the action is a public POST endpoint and anyone can call it
 * directly.
 */
export async function submitEnquiry(
  artworkId: string,
  form: FormData,
): Promise<EnquiryResult> {
  // Honeypot: a real person never sees or fills this field, so anything
  // in it is a bot. Return success so the bot does not learn it failed.
  if (clean(form.get("company"))) {
    return { ok: true };
  }

  const ip = clientIp(await headers());
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);
    return {
      ok: false,
      error: `Too many enquiries from this connection. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}, or call us instead.`,
    };
  }

  const name = clean(form.get("name"));
  const phone = clean(form.get("phone"));
  const city = clean(form.get("city"));
  const message = clean(form.get("message"));

  const fieldErrors: EnquiryResult["fieldErrors"] = {};
  if (name.length < 2) fieldErrors.name = "Please give your name.";
  if (name.length > 100) fieldErrors.name = "That name is too long.";
  if (!PHONE.test(phone.replace(/[\s-]/g, "")))
    fieldErrors.phone = "Enter a 10-digit Indian mobile number.";
  if (city.length < 2) fieldErrors.city = "Which city are you in?";
  if (city.length > 80) fieldErrors.city = "That city name is too long.";
  if (message.length < 10)
    fieldErrors.message = "Tell us a little more — at least a sentence.";
  if (message.length > 2000)
    fieldErrors.message = "Please keep it under 2000 characters.";

  if (Object.keys(fieldErrors).length) {
    return { ok: false, fieldErrors };
  }

  await connectDB();

  // Re-check availability at write time: the owner may have marked the
  // piece sold while this form sat open.
  const artwork = await Artwork.findById(artworkId).lean();
  if (!artwork) {
    return { ok: false, error: "That artwork is no longer listed." };
  }
  // Same reasoning as the checkout route: the id comes from the form, so a
  // piece awaiting review must not accept enquiries by its id alone.
  if (!(await isArtworkPubliclyVisible(artworkId))) {
    return { ok: false, error: "That artwork is no longer listed." };
  }
  if (artwork.status !== "available") {
    return {
      ok: false,
      error: "This piece has just been sold, so we can no longer take enquiries on it.",
    };
  }

  await Enquiry.create({ artworkId, name, phone, city, message });

  // Notification is best-effort — the enquiry is already saved.
  await notifyNewEnquiry({
    name,
    phone,
    city,
    message,
    artworkTitle: artwork.title as string,
  });

  return { ok: true };
}
