import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { notifyPaidOrder } from "@/lib/notify";
import { Artwork } from "@/models/Artwork";
import { Order } from "@/models/Order";

/**
 * Verifies a Razorpay payment signature and, only if it is genuine, marks
 * the order paid and the artwork sold.
 *
 * The browser cannot be trusted to report a successful payment: the
 * signature is an HMAC of "<order_id>|<payment_id>" keyed with our secret,
 * which only Razorpay and this server can produce.
 */
export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Incomplete payment." }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // timingSafeEqual needs equal lengths, and throws otherwise.
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  const genuine = a.length === b.length && crypto.timingSafeEqual(a, b);

  await connectDB();
  const order = await Order.findOne({ razorpayOrderId: orderId });

  if (!order) {
    return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  }

  if (!genuine) {
    order.status = "failed";
    await order.save();
    console.warn("[verify] signature mismatch for order", orderId);
    return NextResponse.json(
      { error: "Payment could not be verified." },
      { status: 400 },
    );
  }

  // Idempotent: Razorpay may deliver the same success twice, and we must
  // not double-notify or re-mark.
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, alreadyRecorded: true });
  }

  order.status = "paid";
  order.razorpayPaymentId = paymentId;
  await order.save();

  // On successful payment the piece is sold and no longer purchasable.
  const artwork = await Artwork.findByIdAndUpdate(
    order.artworkId,
    { status: "sold" },
    { new: true },
  ).lean();

  await notifyPaidOrder({
    name: order.name,
    phone: order.phone,
    email: order.email,
    address: order.address,
    amount: order.amount,
    artworkTitle: (artwork?.title as string) ?? "Artwork",
    paymentId,
  });

  return NextResponse.json({ ok: true });
}
