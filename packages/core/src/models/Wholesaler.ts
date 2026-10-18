import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * A trade buyer's account on the wholesaler panel.
 *
 * Wholesalers register themselves and choose a password at once. Unlike an
 * artist there is no invite step, because there is nothing they can publish.
 * What they can do is see trade prices, so an account sees nothing until the
 * owner approves it.
 *
 * The password hash lives on this document, unlike Artist and ArtistUser, so
 * it is `select: false`: no query returns it unless it asks for it by name,
 * and only the sign-in check does.
 */
const WholesalerSchema = new Schema(
  {
    businessName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    /** Optional, but it helps the owner tell a real trade buyer from a retail one. */
    gstin: { type: String, default: "", trim: true, uppercase: true },
    /** What they buy and sell, in their own words, for the owner's decision. */
    about: { type: String, default: "" },

    passwordHash: { type: String, required: true, select: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    /** Shown to the wholesaler when they sign in, so a refusal says why. */
    reviewNote: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },

    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type WholesalerDoc = InferSchemaType<typeof WholesalerSchema> & {
  _id: string;
};

export const Wholesaler: Model<WholesalerDoc> =
  (models.Wholesaler as Model<WholesalerDoc>) ??
  model<WholesalerDoc>("Wholesaler", WholesalerSchema);
