import crypto from "node:crypto";
import { ArtistUser } from "@kasityot/core";

/**
 * Single-use invites that let an approved artist set their own password.
 *
 * The raw token is returned to the caller once, to be put in a link, and only
 * its SHA-256 hash is stored. A read of the collection therefore never yields
 * a working way in. SHA-256 rather than bcrypt is deliberate and safe here:
 * the token is 32 bytes of CSPRNG output, so there is nothing to brute-force
 * and nothing to gain from a slow hash.
 */

const TTL_DAYS = 14;

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Mints a fresh invite for an artist, replacing any previous one so an older
 * link cannot still be redeemed.
 *
 * The ArtistUser row is created if absent and reused otherwise, keyed on
 * artistId, which is unique — so approving twice cannot produce two logins for
 * one artist.
 */
export async function issueInvite(
  artistId: string,
  email: string,
): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);

  await ArtistUser.findOneAndUpdate(
    { artistId },
    {
      artistId,
      email: email.toLowerCase().trim(),
      inviteTokenHash: hashToken(token),
      inviteExpiresAt: expiresAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return { token, expiresAt };
}

/**
 * The studio lives on its own origin, so the link has to be absolute. Falls
 * back to the dev port rather than throwing: a missing env var should not stop
 * the owner approving someone, and a wrong host is obvious in the link itself.
 */
export function inviteUrl(token: string): string {
  const base = (
    process.env.NEXT_PUBLIC_ARTIST_URL ?? "http://localhost:3002"
  ).replace(/\/$/, "");
  return `${base}/invite/${token}`;
}
