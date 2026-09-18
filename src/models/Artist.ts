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
    status: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
      index: true,
    },
  },
  { timestamps: true },
);

export type ArtistDoc = InferSchemaType<typeof ArtistSchema> & { _id: string };

export const Artist: Model<ArtistDoc> =
  (models.Artist as Model<ArtistDoc>) ?? model<ArtistDoc>("Artist", ArtistSchema);
