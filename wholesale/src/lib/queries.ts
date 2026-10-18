import { isValidObjectId } from "mongoose";
import { connectDB } from "@kasityot/core";
import { WholesaleEnquiry, WholesaleProduct } from "@kasityot/core/wholesale";

/**
 * Reads for the wholesaler panel. Callers must have checked that the
 * wholesaler is approved first: these return trade prices.
 *
 * Only visible products are ever returned, and everything leaves as a plain
 * object built field by field.
 */

export type ProductView = {
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
};

export type MyEnquiryView = {
  id: string;
  productId: string | null;
  productTitle: string | null;
  quantity: number | null;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
};

type Raw = Record<string, unknown>;

function toProduct(doc: Raw): ProductView {
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
  };
}

export async function getCatalogue(category?: string): Promise<ProductView[]> {
  await connectDB();
  const query: Record<string, unknown> = { status: "visible" };
  if (category) query.category = category;
  const docs = await WholesaleProduct.find(query).sort({ createdAt: -1 }).lean();
  return docs.map(toProduct);
}

/** The categories that have something visible in them, for the filter. */
export async function getCategories(): Promise<string[]> {
  await connectDB();
  const values = await WholesaleProduct.distinct("category", {
    status: "visible",
  });
  return (values as string[])
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

/** One visible product. A hidden one reads as not found, like a bad id. */
export async function getProduct(id: string): Promise<ProductView | null> {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await WholesaleProduct.findOne({ _id: id, status: "visible" }).lean();
  return doc ? toProduct(doc) : null;
}

/** The wholesaler's own enquiries, filtered on their id inside the query. */
export async function getMyEnquiries(
  wholesalerId: string,
): Promise<MyEnquiryView[]> {
  await connectDB();
  const docs = await WholesaleEnquiry.find({ wholesalerId })
    .populate("productId", "title status")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((d) => {
    const p = d.productId as unknown as Raw | null;
    // A product the owner has since hidden is named but not linked.
    const product = p && typeof p === "object" && "title" in p ? p : null;
    return {
      id: String(d._id),
      productId: product && product.status === "visible" ? String(product._id) : null,
      productTitle: product ? (product.title as string) : null,
      quantity: (d.quantity as number) ?? null,
      message: d.message as string,
      status: d.status as MyEnquiryView["status"],
      createdAt: new Date(d.createdAt as unknown as string).toISOString(),
    };
  });
}
