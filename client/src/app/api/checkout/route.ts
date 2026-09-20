import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB, Artwork, Order } from "@kasityot/core";
import { isArtworkPubliclyVisible } from "@/lib/queries";

/**
 * Creates a Razorpay order server side and records our own Order row.
 *
 * The amount is read from the database, never from the request body — a
 * client-supplied price would let a buyer pay ₹1 for anything.
 */
export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Online payment is not configured yet." },
      { status: 503 },
    );
  }

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
  const email = String(body.email ?? "").trim();
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
}
