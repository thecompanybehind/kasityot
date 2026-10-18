import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * The About page's wording. There is only ever one document.
 *
 * Every field is an optional override: an empty string, or an empty list of
 * principles, means "use the design's own copy" (ABOUT_DEFAULTS in
 * ../about.ts). So the page is never blank, and the owner can change one line
 * without retyping the rest.
 */
const PrincipleSchema = new Schema(
  {
    title: { type: String, default: "", trim: true },
    body: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const AboutPageSchema = new Schema(
  {
    heroImage: { type: String, default: "", trim: true },
    heroAlt: { type: String, default: "", trim: true },
    heading: { type: String, default: "", trim: true },
    headingAccent: { type: String, default: "", trim: true },
    premiseEyebrow: { type: String, default: "", trim: true },
    premiseTitle: { type: String, default: "", trim: true },
    premiseBody: { type: String, default: "", trim: true },
    principlesEyebrow: { type: String, default: "", trim: true },
    principlesTitle: { type: String, default: "", trim: true },
    principles: { type: [PrincipleSchema], default: [] },
  },
  { timestamps: true },
);

export type AboutPageDoc = InferSchemaType<typeof AboutPageSchema> & {
  _id: string;
};

export const AboutPage: Model<AboutPageDoc> =
  (models.AboutPage as Model<AboutPageDoc>) ??
  model<AboutPageDoc>("AboutPage", AboutPageSchema);
