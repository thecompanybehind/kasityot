"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@kasityot/core";
import {
  WholesaleEnquiry,
  WholesaleProduct,
  Wholesaler,
} from "@kasityot/core/wholesale";
import { getSession } from "@/lib/auth";
import { emailWholesalerApproved, emailWholesalerRejected } from "@/lib/notify";
import type { ActionResult } from "@/lib/actions";

/**
 * The owner's wholesale mutations. As in actions.ts, every action re-checks
 * the session itself: a server action is its own POST endpoint.
 */

async function requireOwner() {
  if (!(await getSession())) redirect("/login");
}

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/* ---------------------------------------------------------------- *
 * Products
 * ---------------------------------------------------------------- */

export async function saveWholesaleProduct(
  id: string | null,
  form: FormData,
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();

  const title = str(form, "title");
  const description = str(form, "description");
  if (!title) return { ok: false, error: "Title is required." };
  if (!description) return { ok: false, error: "Add a description." };

  // Both optional. Blank price is the usual "price on enquiry".
  const rawPrice = str(form, "price");
  const price = rawPrice ? Math.round(Number(rawPrice) * 100) : null;
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { ok: false, error: "Price must be a positive number, or blank." };
  }

  const rawMin = str(form, "minOrderQty");
  const minOrderQty = rawMin ? Number(rawMin) : null;
  if (minOrderQty !== null && (!Number.isInteger(minOrderQty) || minOrderQty < 1)) {
    return { ok: false, error: "Minimum order must be a whole number, or blank." };
  }

  const images = (form.getAll("images") as string[])
    .map((s) => s.trim())
    .filter(Boolean);

  const data = {
    title,
    description,
    category: str(form, "category"),
    material: str(form, "material"),
    dimensions: str(form, "dimensions"),
    images,
    price,
    minOrderQty,
    status: (str(form, "status") === "hidden" ? "hidden" : "visible") as
      | "visible"
      | "hidden",
  };

  try {
    if (id) {
      await WholesaleProduct.findByIdAndUpdate(id, data, { runValidators: true });
    } else {
      await WholesaleProduct.create(data);
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  revalidatePath("/wholesale");
  return { ok: true };
}

/** Enquiries reference the product, so they go with it, as with artwork. */
export async function deleteWholesaleProduct(id: string): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await WholesaleEnquiry.deleteMany({ productId: id });
  await WholesaleProduct.findByIdAndDelete(id);
  revalidatePath("/wholesale");
  revalidatePath("/wholesale/enquiries");
  return { ok: true };
}

export async function setWholesaleProductStatus(
  id: string,
  status: "visible" | "hidden",
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await WholesaleProduct.findByIdAndUpdate(id, { status });
  revalidatePath("/wholesale");
  return { ok: true };
}

/* ---------------------------------------------------------------- *
 * Wholesaler accounts
 * ---------------------------------------------------------------- */

/**
 * Lets a wholesaler in. Their panel re-reads this status on every request,
 * so it takes effect on their next click, with no need to sign in again.
 */
export async function approveWholesaler(
  id: string,
): Promise<ActionResult & { emailed?: boolean }> {
  await requireOwner();
  await connectDB();

  const w = await Wholesaler.findByIdAndUpdate(id, {
    status: "approved",
    reviewNote: "",
    reviewedAt: new Date(),
  })
    .select("email contactName businessName")
    .lean();
  if (!w) return { ok: false, error: "That account no longer exists." };

  const base = process.env.NEXT_PUBLIC_WHOLESALE_URL?.replace(/\/$/, "");
  const mail = await emailWholesalerApproved({
    to: w.email as string,
    name: w.contactName as string,
    business: w.businessName as string,
    url: base ? `${base}/login` : undefined,
  });

  revalidatePath("/wholesale/wholesalers");
  return { ok: true, emailed: mail.sent };
}

/**
 * Turns a registration down, or takes away access already given. Either way
 * the wholesaler is shown the reason when they next sign in, and their
 * current session stops working on its next request.
 */
export async function rejectWholesaler(
  id: string,
  note: string,
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();

  const trimmed = note.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: "Give a reason. The wholesaler is shown this, so make it useful.",
    };
  }

  const w = await Wholesaler.findByIdAndUpdate(id, {
    status: "rejected",
    reviewNote: trimmed,
    reviewedAt: new Date(),
  })
    .select("email contactName")
    .lean();
  if (!w) return { ok: false, error: "That account no longer exists." };

  await emailWholesalerRejected({
    to: w.email as string,
    name: w.contactName as string,
    reason: trimmed,
  });

  revalidatePath("/wholesale/wholesalers");
  return { ok: true };
}

/* ---------------------------------------------------------------- *
 * Enquiries
 * ---------------------------------------------------------------- */

export async function setWholesaleEnquiryStatus(
  id: string,
  status: "new" | "contacted" | "closed",
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await WholesaleEnquiry.findByIdAndUpdate(id, { status });
  revalidatePath("/wholesale/enquiries");
  return { ok: true };
}

export async function saveWholesaleEnquiryNotes(
  id: string,
  notes: string,
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await WholesaleEnquiry.findByIdAndUpdate(id, { ownerNotes: notes });
  revalidatePath("/wholesale/enquiries");
  return { ok: true };
}
