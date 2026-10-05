import { NextResponse } from "next/server";
// import Razorpay from "razorpay";
import { connectDB, Artwork, Order } from "@kasityot/core";
import { notifyOrderRequest } from "@/lib/notify";
import { isArtworkPubliclyVisible } from "@/lib/queries";

/**
 * Records an order request. No money moves here: the buyer leaves their
 * details, the request lands in the owner panel under Customers, and the
 * owner arranges payment and delivery by hand.
 *
 * Online payment through Razorpay is switched off for now. Its code is kept
 * below, commented out, and marked RAZORPAY so it can be restored in one pass
 * (here, and in src/components/ArtworkActions.tsx).
 *
 * The amount is read from the database, never from the request body — a
 * client-supplied price would let a buyer claim ₹1 for anything.
 */
export async function POST(request: Request) {
  /* RAZORPAY — restore when online payment goes live.
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Online payment is not configured yet." },
      { status: 503 },
    );
  }
  */

  let body: {
    artworkId?: string;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const artworkId = String(body.artworkId ?? "");
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const address = String(body.address ?? "").trim();

  if (!artworkId || !name || !phone || !email || !address) {
    return NextResponse.json(
      { error: "Please fill in every field." },
      { status: 400 },
    );
  }

  await connectDB();
  const artwork = await Artwork.findById(artworkId).lean();

  if (!artwork) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }
  // The id arrives in the request body, so approval is re-checked here: a
  // piece awaiting review must not be purchasable by its id alone. Reported
  // as "not found" rather than "not approved", which would confirm the id
  // exists to someone probing.
  if (!(await isArtworkPubliclyVisible(artworkId))) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }
  if (artwork.status !== "available") {
    return NextResponse.json(
      { error: "This piece has already been sold." },
      { status: 409 },
    );
  }
  if (artwork.priceOnRequest || artwork.price == null) {
    return NextResponse.json(
      { error: "This piece is priced on request — please send an enquiry." },
      { status: 409 },
    );
  }

  const amount = artwork.price as number; // already in paise

  try {
    // A double click or a resubmitted form must not file the same request
    // twice, nor email the owner twice.
    const existing = await Order.exists({
      artworkId,
      email,
      status: "requested",
    });
    if (existing) return NextResponse.json({ ok: true });

    // The piece stays available: nothing has been paid, so the owner marks it
    // sold from the panel once the sale is actually agreed.
    await Order.create({
      artworkId,
      name,
      phone,
      email,
      address,
      amount,
      status: "requested",
    });

    await notifyOrderRequest({
      name,
      phone,
      email,
      address,
      amount,
      artworkTitle: artwork.title as string,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[checkout] order request failed:", err);
    return NextResponse.json(
      { error: "Could not place your order. Please try again." },
      { status: 502 },
    );
  }

  /* RAZORPAY — restore when online payment goes live, in place of the
     try block above.
  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const rzpOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      // Razorpay caps receipt at 40 characters.
      receipt: `art_${String(artwork._id)}`.slice(0, 40),
      notes: { artwork: artwork.title as string, buyer: name },
    });

    await Order.create({
      artworkId,
      name,
      phone,
      email,
      address,
      amount,
      razorpayOrderId: rzpOrder.id,
      status: "created",
    });

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount,
      currency: "INR",
      keyId,
      artworkTitle: artwork.title,
    });
  } catch (err) {
    console.error("[checkout] razorpay order failed:", err);
    return NextResponse.json(
      { error: "Could not start the payment. Please try again." },
      { status: 502 },
    );
  }
  */
}
