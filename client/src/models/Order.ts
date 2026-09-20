import {
  Schema,
  Types,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const OrderSchema = new Schema(
  {
    artworkId: {
      type: Schema.Types.ObjectId,
      ref: "Artwork",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, required: true },
    /** Paise, matching Razorpay's smallest-unit convention. */
    amount: { type: Number, required: true, min: 0 },
    /** Sparse: unset until the Razorpay order is created in Phase 4. */
    razorpayOrderId: { type: String, default: null, unique: true, sparse: true },
    razorpayPaymentId: { type: String, default: null },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },
  },
  { timestamps: true },
);

export type OrderDoc = InferSchemaType<typeof OrderSchema> & {
  _id: string;
  artworkId: Types.ObjectId;
};

export const Order: Model<OrderDoc> =
  (models.Order as Model<OrderDoc>) ?? model<OrderDoc>("Order", OrderSchema);
