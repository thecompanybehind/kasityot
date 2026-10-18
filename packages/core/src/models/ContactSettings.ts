import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * The shop's contact details. There is only ever one document.
 *
 * Every field is an optional override: an empty string means "use the
 * default" (CONTACT_DEFAULTS in ../contact.ts), so the contact page never
 * shows a blank line.
 */
const ContactSettingsSchema = new Schema(
  {
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export type ContactSettingsDoc = InferSchemaType<typeof ContactSettingsSchema> & {
  _id: string;
};

export const ContactSettings: Model<ContactSettingsDoc> =
  (models.ContactSettings as Model<ContactSettingsDoc>) ??
  model<ContactSettingsDoc>("ContactSettings", ContactSettingsSchema);
