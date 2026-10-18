import {
  Schema,
  Types,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * A wholesaler asking about a product: usually for a price, since most trade
 * prices are on enquiry.
 *
 * Kept apart from the public Enquiry collection so the two inboxes never mix:
 * a retail buyer's details and a trade buyer's are different things, handled
 * differently.
 */
const WholesaleEnquirySchema = new Schema(
  {
    wholesalerId: {
      type: Schema.Types.ObjectId,
      ref: "Wholesaler",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "WholesaleProduct",
      required: true,
      index: true,
    },
    /** Units they are thinking of. Optional: some ask before they know. */
    quantity: { type: Number, default: null, min: 1 },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
      index: true,
    },
    /** The owner's scratchpad. Never shown to the wholesaler. */
    ownerNotes: { type: String, default: "" },
  },
  { timestamps: true },
);

WholesaleEnquirySchema.index({ createdAt: -1 });

export type WholesaleEnquiryDoc = InferSchemaType<
  typeof WholesaleEnquirySchema
> & {
  _id: string;
  wholesalerId: Types.ObjectId;
  productId: Types.ObjectId;
};

export const WholesaleEnquiry: Model<WholesaleEnquiryDoc> =
  (models.WholesaleEnquiry as Model<WholesaleEnquiryDoc>) ??
  model<WholesaleEnquiryDoc>("WholesaleEnquiry", WholesaleEnquirySchema);
