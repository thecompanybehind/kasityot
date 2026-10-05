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
    /**
     * Sparse, and deliberately without a default: a sparse index still indexes
     * an explicit null, so a default of null would let only one order request
     * exist. Left unset, any number of requests can carry no Razorpay id.
     */
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, default: null },
    /**
     * "requested" is an order placed without payment, which the owner follows
     * up by hand. "created" → "paid" / "failed" is the Razorpay flow.
     */
    status: {
      type: String,
      enum: ["requested", "created", "paid", "failed"],
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
