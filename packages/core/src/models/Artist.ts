import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ArtistSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    photo: { type: String, default: null },
    craftType: { type: String, required: true, index: true, trim: true },
    region: { type: String, required: true, index: true, trim: true },
    story: { type: String, required: true },
    /**
     * Optional. When null the public profile must not render a video block at
     * all — no empty frame, no reserved space. Hard client requirement, so the
     * default is null rather than "" to keep the falsy check unambiguous.
     */
    videoUrl: { type: String, default: null },

    /**
     * A video the artist has uploaded from their studio, awaiting the owner.
     *
     * Kept apart from videoUrl so the public site never has to know about
     * review: it reads videoUrl and nothing else. Approving copies this
     * across; until then a video already on the site stays up, so replacing
     * one never leaves the profile without any.
     */
    pendingVideoUrl: { type: String, default: null },
    videoReviewStatus: {
      type: String,
      enum: ["none", "pending", "rejected"],
      default: "none",
      index: true,
    },
    /** Shown back to the artist when a video is sent back. */
    videoReviewNote: { type: String, default: "" },
    videoSubmittedAt: { type: Date, default: null },

    /**
     * The owner's display choice, not a review state: an approved artist may
     * still be deliberately hidden. Kept separate from applicationStatus so
     * "approved but hidden" and "not yet approved" never collapse into one
     * value.
     */
    status: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
      index: true,
    },

    /**
     * Onboarding gate. An artist reaches "approved" only when the owner says
     * so, and cannot sign in before then.
     *
     * The default is "approved" because artists the owner adds by hand in the
     * panel never apply — they are approved by the act of being created.
     * Applications from the public form set "pending" explicitly.
     *
     * Rows created before this field existed have no value at all: Mongoose
     * applies a default on write, not on read. They are backfilled by
     * scripts/backfill-status.ts, and the public queries additionally treat a
     * missing value as approved so the live site cannot go dark if that
     * script has not been run.
     */
    applicationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },

    /**
     * Login identity, and how the owner reaches an applicant.
     *
     * sparse is required alongside unique: without it Mongo treats every null
     * as the same key, so the second owner-created artist (who has no email)
     * would collide with the first.
     */
    email: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: null, trim: true },

    /** Shown back to the artist, so a rejection is actionable. */
    reviewNote: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type ArtistDoc = InferSchemaType<typeof ArtistSchema> & { _id: string };

export const Artist: Model<ArtistDoc> =
  (models.Artist as Model<ArtistDoc>) ?? model<ArtistDoc>("Artist", ArtistSchema);
