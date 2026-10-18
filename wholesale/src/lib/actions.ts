"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { connectDB } from "@kasityot/core";
import { WholesaleEnquiry, Wholesaler } from "@kasityot/core/wholesale";
import {
  createWholesalerSession,
  getWholesaler,
  hashPassword,
  verifyWholesaler,
} from "@/lib/auth";
import { notifyNewTradeEnquiry, notifyNewWholesaler } from "@/lib/notify";
import { getProduct } from "@/lib/queries";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Everything a wholesaler can do. A server action is its own POST endpoint,
 * so each one checks for itself rather than relying on the page that shows
 * the form.
 */

export type ActionResult = { ok: boolean; error?: string };

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function tooMany(retryAfterSeconds: number, what: string): ActionResult {
  const mins = Math.ceil(retryAfterSeconds / 60);
  return {
    ok: false,
    error: `Too many ${what} from here. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
  };
}

/* ---------------------------------------------------------------- *
 * Registering and signing in
 * ---------------------------------------------------------------- */

/**
 * Opens a pending account and signs the new wholesaler straight in. They see
 * a "being reviewed" page, not the catalogue, until the owner approves them.
 */
export async function register(form: FormData): Promise<ActionResult> {
  const limit = checkRateLimit(`register:${clientIp(await headers())}`);
  if (!limit.allowed) return tooMany(limit.retryAfterSeconds, "registrations");

  const businessName = str(form, "businessName");
  const contactName = str(form, "contactName");
  const email = str(form, "email").toLowerCase();
  const phone = str(form, "phone");
  const city = str(form, "city");
  const gstin = str(form, "gstin").toUpperCase();
  const about = str(form, "about");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (!businessName || !contactName || !email || !phone || !city) {
    return {
      ok: false,
      error: "Business name, your name, email, phone and city are all needed.",
    };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "That email address does not look right." };
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return { ok: false, error: "Enter a phone number we can call, with its area code." };
  }
  // The standard 15-character GSTIN shape. Optional, but a typo would only
  // slow the owner's check down, so it is caught here.
  if (gstin && !/^[0-9]{2}[A-Z0-9]{10}[0-9A-Z]{3}$/.test(gstin)) {
    return { ok: false, error: "That GSTIN does not look right. It has 15 characters." };
  }
  if (password.length < 10) {
    return { ok: false, error: "Choose a password of at least 10 characters." };
  }
  if (password !== confirm) {
    return { ok: false, error: "The two passwords do not match." };
  }

  await connectDB();

  let id: string;
  try {
    const created = await Wholesaler.create({
      businessName,
      contactName,
      email,
      phone,
      city,
      gstin,
      about,
      passwordHash: await hashPassword(password),
    });
    id = String(created._id);
  } catch (err) {
    // email is unique on the collection; this is what holds that line.
    if ((err as Error).message.includes("duplicate key")) {
      return {
        ok: false,
        error: "There is already an account with that email. Sign in instead.",
      };
    }
    return { ok: false, error: "Your registration could not be saved. Please try again." };
  }

  await notifyNewWholesaler({ businessName, contactName, email, phone, city, gstin, about });
  await createWholesalerSession(id);
  return { ok: true };
}

export async function signIn(form: FormData): Promise<ActionResult> {
  const email = str(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  // Per address as well as per IP, so guessing one account's password is slow
  // even when spread across addresses.
  const ip = clientIp(await headers());
  const byIp = checkRateLimit(`login-ip:${ip}`, 20);
  const byEmail = checkRateLimit(`login-email:${email}`, 8);
  if (!byIp.allowed || !byEmail.allowed) {
    return tooMany(
      Math.max(byIp.retryAfterSeconds, byEmail.retryAfterSeconds),
      "sign-in attempts",
    );
  }

  const id = await verifyWholesaler(email, password);
  if (!id) {
    // One message for both mistakes: telling them apart would say which
    // businesses hold accounts.
    return { ok: false, error: "Those details did not work." };
  }

  await createWholesalerSession(id);
  return { ok: true };
}

/* ---------------------------------------------------------------- *
 * Enquiries
 * ---------------------------------------------------------------- */

/** Asks about a product, usually for a price for a given quantity. */
export async function sendEnquiry(
  productId: string,
  form: FormData,
): Promise<ActionResult> {
  const me = await getWholesaler();
  if (!me || me.status !== "approved") {
    return { ok: false, error: "Your account cannot send enquiries yet." };
  }

  const limit = checkRateLimit(`enquiry:${me.wholesalerId}`, 20);
  if (!limit.allowed) return tooMany(limit.retryAfterSeconds, "enquiries");

  const message = str(form, "message");
  if (!message) {
    return { ok: false, error: "Tell us what you would like to know." };
  }

  const rawQty = str(form, "quantity");
  const quantity = rawQty ? Number(rawQty) : null;
  if (quantity !== null && (!Number.isInteger(quantity) || quantity < 1)) {
    return { ok: false, error: "Quantity must be a whole number, or blank." };
  }

  // Through the same read as the page, so a hidden product cannot be
  // enquired about by posting its id directly.
  const product = await getProduct(productId);
  if (!product) return { ok: false, error: "That product is no longer listed." };

  if (quantity !== null && product.minOrderQty && quantity < product.minOrderQty) {
    return {
      ok: false,
      error: `The minimum order for this product is ${product.minOrderQty} units.`,
    };
  }

  await connectDB();
  await WholesaleEnquiry.create({
    wholesalerId: me.wholesalerId,
    productId: product.id,
    quantity,
    message,
  });

  await notifyNewTradeEnquiry({
    businessName: me.businessName,
    contactName: me.contactName,
    email: me.email,
    productTitle: product.title,
    quantity,
    message,
  });

  revalidatePath("/enquiries");
  return { ok: true };
}
