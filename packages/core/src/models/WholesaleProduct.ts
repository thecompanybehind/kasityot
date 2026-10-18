import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * A product offered to trade buyers only.
 *
 * Its own collection rather than a flag on Artwork, on purpose. The public
 * site keeps out unreviewed artwork with a filter spread into every read, and
 * a forgotten filter leaks. Wholesale products are not in that collection at
 * all, so no public query, however careless, can return one; reaching them
 * takes importing "@kasityot/core/wholesale", which the public site's lint
 * config forbids.
 */
const WholesaleProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    /** Free text, e.g. "Blue pottery". Groups the catalogue. */
    category: { type: String, default: "", trim: true },
    material: { type: String, default: "", trim: true },
    dimensions: { type: String, default: "", trim: true },
    /** Ordered. images[0] is the cover. */
    images: { type: [String], default: [] },

    /**
     * Price per unit in paise, like Artwork. Optional: most trade prices
     * depend on quantity, so null — shown as "Price on enquiry" — is the
     * usual case rather than the exception.
     */
    price: { type: Number, default: null, min: 0 },

    /** Smallest order accepted, in units. Null when there is no minimum. */
    minOrderQty: { type: Number, default: null, min: 1 },

    /** Hidden takes a product out of the wholesaler panel without deleting it. */
    status: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
      index: true,
    },
  },
  { timestamps: true },
);

WholesaleProductSchema.index({ createdAt: -1 });

export type WholesaleProductDoc = InferSchemaType<
  typeof WholesaleProductSchema
> & { _id: string };

export const WholesaleProduct: Model<WholesaleProductDoc> =
  (models.WholesaleProduct as Model<WholesaleProductDoc>) ??
  model<WholesaleProductDoc>("WholesaleProduct", WholesaleProductSchema);
