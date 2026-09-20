import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { connectDB, Artist, ArtistUser } from "@kasityot/core";

/**
 * Artist sessions.
 *
 * Mirrors the owner's auth in admin/src/lib/auth.ts, with two deliberate
 * differences:
 *
 *   - A different cookie name, so the two sessions cannot overwrite each
 *     other when both apps are served from one domain.
 *   - A different signing secret. Were they to share one, a token minted
 *     here would verify inside the owner panel and only the `role` claim
 *     would stand between an artist and the whole admin surface. A separate
 *     secret makes that forgery impossible rather than merely checked for.
 *
 * The payload carries artistId, and every artist-scoped query filters on it.
 * Nothing trusts an id supplied by a form.
 */

const COOKIE = "kasityot_artist_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // two weeks

function secretKey(): Uint8Array {
  const secret = process.env.ARTIST_SESSION_SECRET;
  if (!secret) throw new Error("ARTIST_SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type ArtistSession = { artistId: string; email: string };

/**
 * Checks credentials and returns the artist, or null.
 *
 * Approval is re-checked here rather than only at the page: an artist whose
 * application is later rejected must stop being able to sign in, and their
 * existing session must stop working too (see getArtistSession).
 */
export async function verifyArtist(
  email: string,
  password: string,
): Promise<ArtistSession | null> {
  await connectDB();

  const user = await ArtistUser.findOne({ email: email.toLowerCase().trim() })
    .select("artistId passwordHash")
    .lean();

  // Run a compare even when there is no such user, so a wrong email is not
  // measurably faster to reject than a wrong password.
  const hash =
    user?.passwordHash ??
    "$2b$12$0000000000000000000000000000000000000000000000000000";
  const passwordOk = await bcrypt.compare(password, hash);
  if (!user || !user.passwordHash || !passwordOk) return null;

  const artist = await Artist.findById(user.artistId)
    .select("applicationStatus")
    .lean();
  if (!artist || artist.applicationStatus !== "approved") return null;

  await ArtistUser.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
  return { artistId: String(user.artistId), email: email.toLowerCase().trim() };
}

export async function createArtistSession(
  session: ArtistSession,
): Promise<void> {
  const token = await new SignJWT({ ...session, role: "artist" })
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

export async function destroyArtistSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/**
 * The current artist, or null.
 *
 * A valid token is not enough: approval is re-read from the database on every
 * call, so an artist rejected or suspended after signing in loses access at
 * once rather than when their two-week token happens to expire.
 */
export async function getArtistSession(): Promise<ArtistSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const artistId = String(payload.artistId ?? "");
    if (!artistId) return null;

    await connectDB();
    const artist = await Artist.findById(artistId)
      .select("applicationStatus")
      .lean();
    if (!artist || artist.applicationStatus !== "approved") return null;

    return { artistId, email: String(payload.email) };
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- *
 * Invites
 * ---------------------------------------------------------------- */

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Looks up a pending invite by its raw token.
 *
 * The token is hashed before the lookup, because only the hash was ever
 * stored. Returns null for an unknown, expired or already-redeemed invite —
 * the page says the same thing for all three, so a probe learns nothing.
 */
export async function findInvite(
  token: string,
): Promise<{ artistId: string; email: string; name: string } | null> {
  await connectDB();

  const user = await ArtistUser.findOne({ inviteTokenHash: hashToken(token) })
    .select("artistId email inviteExpiresAt")
    .lean();
  if (!user) return null;
  if (!user.inviteExpiresAt || user.inviteExpiresAt < new Date()) return null;

  const artist = await Artist.findById(user.artistId)
    .select("name applicationStatus")
    .lean();
  if (!artist || artist.applicationStatus !== "approved") return null;

  return {
    artistId: String(user.artistId),
    email: user.email as string,
    name: artist.name as string,
  };
}

/**
 * Redeems an invite by setting the password, and clears the token so the link
 * cannot be used twice.
 */
export async function redeemInvite(
  token: string,
  password: string,
): Promise<ArtistSession | null> {
  const invite = await findInvite(token);
  if (!invite) return null;

  const hash = await bcrypt.hash(password, 12);
  await ArtistUser.findOneAndUpdate(
    { inviteTokenHash: hashToken(token) },
    {
      passwordHash: hash,
      inviteTokenHash: null,
      inviteExpiresAt: null,
      lastLoginAt: new Date(),
    },
  );

  return { artistId: invite.artistId, email: invite.email };
}

export const ARTIST_SESSION_COOKIE = COOKIE;
