import { connectDB } from "@kasityot/core";
import {
  WholesaleEnquiry,
  WholesaleProduct,
  Wholesaler,
} from "@kasityot/core/wholesale";

/**
 * Owner-panel reads for the wholesale section. Like the rest of the panel
 * these include hidden records, and everything leaves as a plain object.
 *
 * Wholesaler views are built field by field, never spread from the document,
 * so the password hash cannot reach a client component even if a query were
 * to ask for it.
 */

export type WholesaleProductView = {
  id: string;
  title: string;
  description: string;
  category: string;
  material: string;
  dimensions: string;
  images: string[];
  /** Paise per unit; null means price on enquiry. */
  price: number | null;
  minOrderQty: number | null;
  status: "visible" | "hidden";
  createdAt: string | null;
  enquiryCount?: number;
};

export type WholesalerView = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  gstin: string;
  about: string;
  status: "pending" | "approved" | "rejected";
  reviewNote: string;
  reviewedAt: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
};

export type WholesaleEnquiryView = {
  id: string;
  quantity: number | null;
  message: string;
  status: "new" | "contacted" | "closed";
  ownerNotes: string;
  createdAt: string;
  productId: string | null;
  productTitle: string | null;
  businessName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
};

type Raw = Record<string, unknown>;

function iso(v: unknown): string | null {
  return v ? new Date(v as string).toISOString() : null;
}

function toProduct(doc: Raw): WholesaleProductView {
  return {
    id: String(doc._id),
    title: doc.title as string,
    description: doc.description as string,
    category: (doc.category as string) ?? "",
    material: (doc.material as string) ?? "",
    dimensions: (doc.dimensions as string) ?? "",
    images: (doc.images as string[]) ?? [],
    price: (doc.price as number) ?? null,
    minOrderQty: (doc.minOrderQty as number) ?? null,
    status: doc.status as WholesaleProductView["status"],
    createdAt: iso(doc.createdAt),
  };
}

function toWholesaler(doc: Raw): WholesalerView {
  return {
    id: String(doc._id),
    businessName: doc.businessName as string,
    contactName: doc.contactName as string,
    email: doc.email as string,
    phone: doc.phone as string,
    city: doc.city as string,
    gstin: (doc.gstin as string) ?? "",
    about: (doc.about as string) ?? "",
    status: doc.status as WholesalerView["status"],
    reviewNote: (doc.reviewNote as string) ?? "",
    reviewedAt: iso(doc.reviewedAt),
    createdAt: iso(doc.createdAt),
    lastLoginAt: iso(doc.lastLoginAt),
  };
}

function toEnquiry(doc: Raw): WholesaleEnquiryView {
  const p = doc.productId as Raw | null;
  const w = doc.wholesalerId as Raw | null;
  const product = p && typeof p === "object" && "title" in p ? p : null;
  const buyer = w && typeof w === "object" && "businessName" in w ? w : null;
  return {
    id: String(doc._id),
    quantity: (doc.quantity as number) ?? null,
    message: doc.message as string,
    status: doc.status as WholesaleEnquiryView["status"],
    ownerNotes: (doc.ownerNotes as string) ?? "",
    createdAt: new Date(doc.createdAt as string).toISOString(),
    productId: product ? String(product._id) : null,
    productTitle: product ? (product.title as string) : null,
    businessName: buyer ? (buyer.businessName as string) : null,
    contactName: buyer ? (buyer.contactName as string) : null,
    email: buyer ? (buyer.email as string) : null,
    phone: buyer ? (buyer.phone as string) : null,
    city: buyer ? (buyer.city as string) : null,
  };
}

/* ---------------------------------------------------------------- */

/** What the wholesale nav badge counts: registrations and enquiries to act on. */
export async function getWholesaleCounts(): Promise<{
  pendingWholesalers: number;
  newEnquiries: number;
  products: number;
}> {
  await connectDB();
  const [pendingWholesalers, newEnquiries, products] = await Promise.all([
    Wholesaler.countDocuments({ status: "pending" }),
    WholesaleEnquiry.countDocuments({ status: "new" }),
    WholesaleProduct.countDocuments(),
  ]);
  return { pendingWholesalers, newEnquiries, products };
}

export async function getWholesaleProducts(filters?: {
  search?: string;
  status?: string;
}): Promise<WholesaleProductView[]> {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters?.search) {
    // Escaped: the owner is typing a product name, not a pattern.
    const safe = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.title = { $regex: safe, $options: "i" };
  }
  if (filters?.status) query.status = filters.status;

  const docs = await WholesaleProduct.find(query).sort({ createdAt: -1 }).lean();
  const counts = await WholesaleEnquiry.aggregate<{ _id: unknown; n: number }>([
    { $group: { _id: "$productId", n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  return docs.map((d) => {
    const view = toProduct(d);
    return { ...view, enquiryCount: byId.get(view.id) ?? 0 };
  });
}

export async function getWholesaleProduct(
  id: string,
): Promise<WholesaleProductView | null> {
  await connectDB();
  const doc = await WholesaleProduct.findById(id).lean().catch(() => null);
  return doc ? toProduct(doc) : null;
}

/** Pending first, so a registration waiting on the owner is never buried. */
export async function getWholesalers(
  status?: WholesalerView["status"],
): Promise<WholesalerView[]> {
  await connectDB();
  const query = status ? { status } : {};
  const docs = await Wholesaler.find(query).sort({ createdAt: -1 }).lean();
  // Newest first within each status; the sort is stable.
  const rank = { pending: 0, approved: 1, rejected: 2 } as const;
  return docs
    .map(toWholesaler)
    .sort((a, b) => rank[a.status] - rank[b.status]);
}

export async function getWholesaleEnquiries(filters?: {
  status?: string;
}): Promise<WholesaleEnquiryView[]> {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters?.status) query.status = filters.status;
  const docs = await WholesaleEnquiry.find(query)
    .populate("productId", "title")
    .populate("wholesalerId", "businessName contactName email phone city")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toEnquiry);
}
