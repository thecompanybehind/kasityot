import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * Banner slides for the home page hero.
 *
 * The text fields are all optional overrides: left blank, the public hero
 * falls back to the approved design's own copy, so the owner can add a
 * photograph without having to write anything.
 */
const HeroSlideSchema = new Schema(
  {
    image: { type: String, required: true },
    /** Shown for screen readers and when the image fails to load. */
    alt: { type: String, default: "", trim: true },

    // Optional copy. Empty string means "use the default".
    eyebrow: { type: String, default: "", trim: true },
    heading: { type: String, default: "", trim: true },
    /** Rendered italic in brass, on its own line under the heading. */
    headingAccent: { type: String, default: "", trim: true },
    subtext: { type: String, default: "", trim: true },

    /** Lower number sorts first. */
    order: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
      index: true,
    },
  },
  { timestamps: true },
);

export type HeroSlideDoc = InferSchemaType<typeof HeroSlideSchema> & {
  _id: string;
};

export const HeroSlide: Model<HeroSlideDoc> =
  (models.HeroSlide as Model<HeroSlideDoc>) ??
  model<HeroSlideDoc>("HeroSlide", HeroSlideSchema);
