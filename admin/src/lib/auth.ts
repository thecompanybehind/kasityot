import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

/**
 * Single owner account. There is deliberately NO signup route anywhere in
 * this app — the account is provisioned through environment variables and
 * nothing can create another.
 */

const COOKIE = "kasityot_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

/** Constant-time-ish credential check against the env-provisioned owner. */
/**
 * A bcrypt hash starts with "$2b$12$…", and dotenv expands `$VAR` inside
 * double-quoted values — which silently truncates the hash and makes every
 * login fail. It is therefore stored base64-encoded, which has no `$`.
 */
function ownerHash(): string | null {
  const b64 = process.env.ADMIN_PASSWORD_HASH_B64;
  if (b64) return Buffer.from(b64, "base64").toString("utf8");
  // Fall back to a plain hash for anyone who sets it the obvious way and
  // single-quotes it.
  return process.env.ADMIN_PASSWORD_HASH ?? null;
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const hash = ownerHash();
  if (!expectedEmail || !hash) return false;

  // Always run the bcrypt compare, even when the email is wrong, so a
  // wrong-email response is not measurably faster than a wrong-password one.
  const emailOk = email.trim().toLowerCase() === expectedEmail.toLowerCase();
  const passwordOk = await bcrypt.compare(password, hash);
  return emailOk && passwordOk;
}

export async function createSession(email: string): Promise<void> {
  const token = await new SignJWT({ email, role: "owner" })
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

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Returns the owner's email when a valid session exists, else null. */
export async function getSession(): Promise<{ email: string } | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return { email: String(payload.email) };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE;
