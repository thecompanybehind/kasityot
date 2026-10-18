import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectDB } from "@kasityot/core";
import { Wholesaler } from "@kasityot/core/wholesale";

/**
 * Wholesaler sessions.
 *
 * Mirrors the studio's auth (artist/src/lib/auth.ts) with its own cookie and
 * its own secret, for the same reason: a token minted here must never verify
 * in the owner panel or the studio.
 *
 * The cookie is set without a Domain, so it stays on wholesaler.kasityot.com
 * and is never sent to the shop on kasityot.com.
 *
 * Signing in works whatever the account's status, so a waiting or refused
 * wholesaler can see where they stand. Seeing products and prices is gated
 * separately, by status, on every page and action that shows or uses them.
 */

const COOKIE = "kasityot_wholesale_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // two weeks

/**
 * A real cost-12 bcrypt hash of a random string nobody knows, compared
 * against when no account matches, so that path costs a full compare too.
 */
const DUMMY_HASH =
  "$2b$12$KmIHrJOg4Aily/BqOQZCkOEkdFpnh6mRRioWvqce.rqOvu4/P/4ti";

function secretKey(): Uint8Array {
  const secret = process.env.WHOLESALE_SESSION_SECRET;
  if (!secret) throw new Error("WHOLESALE_SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type WholesalerSession = {
  wholesalerId: string;
  email: string;
  businessName: string;
  contactName: string;
  status: "pending" | "approved" | "rejected";
  reviewNote: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Checks credentials and returns the wholesaler's id, or null. */
export async function verifyWholesaler(
  email: string,
  password: string,
): Promise<string | null> {
  await connectDB();

  const user = await Wholesaler.findOne({ email: email.toLowerCase().trim() })
    .select("+passwordHash")
    .lean();

  // Compare even when there is no such account, so a wrong email is not
  // measurably faster to reject than a wrong password.
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return null;

  await Wholesaler.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
  return String(user._id);
}

export async function createWholesalerSession(
  wholesalerId: string,
): Promise<void> {
  const token = await new SignJWT({ wholesalerId, role: "wholesaler" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyWholesalerSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/**
 * The signed-in wholesaler, or null.
 *
 * The status is read from the database on every call rather than carried in
 * the token, so an approval opens the catalogue on the next click, and a
 * revoked account loses it the same way.
 */
export async function getWholesaler(): Promise<WholesalerSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const id = String(payload.wholesalerId ?? "");
    if (!id) return null;

    await connectDB();
    const w = await Wholesaler.findById(id)
      .select("email businessName contactName status reviewNote")
      .lean();
    if (!w) return null;

    return {
      wholesalerId: id,
      email: w.email as string,
      businessName: w.businessName as string,
      contactName: w.contactName as string,
      status: w.status as WholesalerSession["status"],
      reviewNote: (w.reviewNote as string) ?? "",
    };
  } catch {
    return null;
  }
}

export const WHOLESALE_SESSION_COOKIE = COOKIE;
