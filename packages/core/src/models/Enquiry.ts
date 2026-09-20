import {
  Schema,
  Types,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const EnquirySchema = new Schema(
  {
    artworkId: {
      type: Schema.Types.ObjectId,
      ref: "Artwork",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
      index: true,
    },
    /** Free-text scratchpad for the owner. Never exposed publicly. */
    ownerNotes: { type: String, default: "" },
  },
  { timestamps: true },
);

/*
 * Artwork is one-of-a-kind, so many enquiries may exist against the same
 * piece. They are never collapsed into one and older ones are never
 * auto-closed — hence no unique index on artworkId.
 */
EnquirySchema.index({ createdAt: -1 });

export type EnquiryDoc = InferSchemaType<typeof EnquirySchema> & {
  _id: string;
  artworkId: Types.ObjectId;
};

export const Enquiry: Model<EnquiryDoc> =
  (models.Enquiry as Model<EnquiryDoc>) ??
  model<EnquiryDoc>("Enquiry", EnquirySchema);
