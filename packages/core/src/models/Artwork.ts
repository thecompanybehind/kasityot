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
    /**
     * Commercial state, independent of review state below. A piece may be
     * approved and sold, or pending and available — two orthogonal axes, so
     * neither field is overloaded to carry the other's meaning.
     */
    status: {
      type: String,
      enum: ["available", "sold", "hidden"],
      default: "available",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },

    /**
     * Review gate. Only "approved" is publicly visible.
     *
     * "draft" lets an artist save an unfinished piece without it entering the
     * owner's queue; only "pending" appears there.
     *
     * Defaults to "approved" for the same reason as Artist.applicationStatus:
     * pieces the owner creates in the panel are approved by that act. See the
     * note there about pre-existing rows and the backfill.
     */
    reviewStatus: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },

    /** False for owner-created pieces, true when it came from the studio. */
    submittedByArtist: { type: Boolean, default: false },
    submittedAt: { type: Date, default: null },

    /** Shown back to the artist, so a rejection is actionable. */
    reviewNote: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },

    /**
     * Set when an artist edits a piece that was already approved, which sends
     * it back for review. Lets the queue distinguish "was live, now edited"
     * from a first-time submission, since the two deserve different urgency.
     */
    wasApproved: { type: Boolean, default: false },

    /**
     * What the artist asked for, in paise, kept even after the owner edits
     * `price`. The owner may price a piece differently from the proposal, and
     * losing the original would erase what was actually agreed.
     */
    proposedPrice: { type: Number, default: null, min: 0 },
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
