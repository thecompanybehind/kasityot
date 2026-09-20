import {
  Schema,
  Types,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const ArtworkSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    artistId: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    /**
     * Paise (smallest unit) to avoid float rounding on money, matching
     * Razorpay's own convention. Null when priceOnRequest is true.
     */
    price: { type: Number, default: null, min: 0 },
    priceOnRequest: { type: Boolean, default: false },
    material: { type: String, required: true, trim: true },
    dimensions: { type: String, required: true, trim: true },
    /** Ordered. images[0] is the cover the owner picks in the admin panel. */
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["available", "sold", "hidden"],
      default: "available",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

/**
 * Mongo will not enforce this for us: a piece must carry either a real price
 * or the price-on-request flag, never neither.
 */
ArtworkSchema.pre("validate", function (this: ArtworkDoc) {
  if (!this.priceOnRequest && (this.price === null || this.price === undefined)) {
    throw new Error("Set a price, or mark the artwork as price on request.");
  }
  if (this.priceOnRequest) this.price = null;
});

export type ArtworkDoc = InferSchemaType<typeof ArtworkSchema> & {
  _id: string;
  artistId: Types.ObjectId;
};

export const Artwork: Model<ArtworkDoc> =
  (models.Artwork as Model<ArtworkDoc>) ??
  model<ArtworkDoc>("Artwork", ArtworkSchema);
