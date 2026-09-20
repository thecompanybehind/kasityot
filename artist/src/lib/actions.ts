"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB, Artist, Artwork } from "@kasityot/core";
import {
  createArtistSession,
  getArtistSession,
  redeemInvite,
  verifyArtist,
} from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Everything an artist can do.
 *
 * Each action re-checks the session itself. A server action is its own POST
 * endpoint, so guarding the page that renders the form would leave the action
 * callable directly.
 *
 * Every artwork lookup filters on the session's artistId inside the query
 * rather than fetching and then comparing. A forgotten ownership check then
 * reads as "not found" instead of silently allowing one artist to edit
 * another's work.
 */

export type ActionResult = { ok: boolean; error?: string };

async function requireArtist(): Promise<string> {
  const session = await getArtistSession();
  if (!session) redirect("/login");
  return session.artistId;
}

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/** URL-safe slug, uniquified against the collection it belongs to. */
async function uniqueSlug(
  base: string,
  model: {
    findOne(f: { slug: string }): {
      select(s: string): { lean(): Promise<{ _id: unknown } | null> };
    };
  },
  excludeId?: string,
): Promise<string> {
  const root =
    base
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "item";

  let slug = root;
  let n = 1;
  for (;;) {
    const clash = await model.findOne({ slug }).select("_id").lean();
    if (!clash || (excludeId && String(clash._id) === excludeId)) return slug;
    slug = `${root}-${++n}`;
  }
}

/* ---------------------------------------------------------------- *
 * Joining
 * ---------------------------------------------------------------- */

/**
 * The public application form.
 *
 * Creates a pending, hidden artist: both gates are shut, so nothing here
 * reaches the public site until the owner approves. No account exists yet —
 * credentials are minted with the invite on approval.
 */
export async function submitApplication(
  form: FormData,
): Promise<ActionResult> {
  // Unauthenticated and public, so it is rate limited per IP like the
  // enquiry form on the main site.
  const { allowed, retryAfterSeconds } = checkRateLimit(
    `join:${clientIp(await headers())}`,
  );
  if (!allowed) {
    const mins = Math.ceil(retryAfterSeconds / 60);
    return {
      ok: false,
      error: `Too many applications from here. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
    };
  }

  await connectDB();

  const name = str(form, "name");
  const email = str(form, "email").toLowerCase();
  const craftType = str(form, "craftType");
  const region = str(form, "region");
  const story = str(form, "story");

  if (!name || !email || !craftType || !region || !story) {
    return { ok: false, error: "Every field except phone and photo is needed." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "That email address does not look right." };
  }
  if (story.length < 120) {
    return {
      ok: false,
      error:
        "Tell us a little more — a few sentences about your craft and where you learned it.",
    };
  }

  // email is unique on the collection, so this is a friendly message rather
  // than the guard; the try/catch below is what actually holds the line.
  const existing = await Artist.findOne({ email }).select("_id").lean();
  if (existing) {
    return {
      ok: false,
      error: "There is already an application under that email address.",
    };
  }

  try {
    const slug = await uniqueSlug(name, Artist);
    await Artist.create({
      name,
      slug,
      email,
      phone: str(form, "phone") || null,
      craftType,
      region,
      story,
      photo: str(form, "photo") || null,
      applicationStatus: "pending",
      // Hidden as well as pending: approving the application is a decision to
      // let them in, not a decision to publish a profile page that moment.
      status: "hidden",
    });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes("duplicate key")) {
      return {
        ok: false,
        error: "There is already an application under that email address.",
      };
    }
    return { ok: false, error: msg };
  }

  return { ok: true };
}

/* ---------------------------------------------------------------- *
 * Signing in
 * ---------------------------------------------------------------- */

export async function signIn(form: FormData): Promise<ActionResult> {
  const email = str(form, "email");
  const password = String(form.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  const session = await verifyArtist(email, password);
  if (!session) {
    // One message for every failure: a wrong password, an unknown address, an
    // application not yet approved. Distinguishing them tells an outsider
    // which artists exist and where they stand.
    return { ok: false, error: "Those details did not work." };
  }

  await createArtistSession(session);
  return { ok: true };
}

/** Sets the password behind an invite link and signs the artist straight in. */
export async function acceptInvite(
  token: string,
  form: FormData,
): Promise<ActionResult> {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (password.length < 10) {
    return { ok: false, error: "Use at least 10 characters." };
  }
  if (password !== confirm) {
    return { ok: false, error: "The two passwords do not match." };
  }

  const session = await redeemInvite(token, password);
  if (!session) {
    return {
      ok: false,
      error: "This link has expired or has already been used.",
    };
  }

  await createArtistSession(session);
  return { ok: true };
}

/* ---------------------------------------------------------------- *
 * The artist's own profile
 * ---------------------------------------------------------------- */

/**
 * Artists may edit their story and photograph, but not their craft or region:
 * those drive the public site's filters and the owner curates them.
 */
export async function saveProfile(form: FormData): Promise<ActionResult> {
  const artistId = await requireArtist();
  await connectDB();

  const story = str(form, "story");
  if (!story) return { ok: false, error: "Your story cannot be empty." };

  await Artist.findByIdAndUpdate(artistId, {
    story,
    photo: str(form, "photo") || null,
    phone: str(form, "phone") || null,
  });

  revalidatePath("/studio/profile");
  return { ok: true };
}

/* ---------------------------------------------------------------- *
 * The artist's own work
 * ---------------------------------------------------------------- */

/**
 * Creates or updates one of the artist's pieces.
 *
 * `intent` decides where it lands: "draft" keeps it private to the artist,
 * "submit" puts it in the owner's queue. Editing an already-approved piece
 * always sends it back for review — the studio warns about this before the
 * artist saves, because otherwise fixing a typo would silently unpublish
 * their own work.
 */
export async function saveArtwork(
  id: string | null,
  intent: "draft" | "submit",
  form: FormData,
): Promise<ActionResult> {
  const artistId = await requireArtist();
  await connectDB();

  const title = str(form, "title");
  const description = str(form, "description");
  const material = str(form, "material");
  const dimensions = str(form, "dimensions");

  if (!title) return { ok: false, error: "Give the piece a title." };

  const priceOnRequest = form.get("priceOnRequest") === "on";
  const rawPrice = str(form, "price");
  if (!priceOnRequest && !rawPrice) {
    return {
      ok: false,
      error: "Suggest a price, or tick “ask me for a price”.",
    };
  }

  // The form collects rupees; the database stores paise.
  const price = priceOnRequest ? null : Math.round(Number(rawPrice) * 100);
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { ok: false, error: "The price must be a positive number." };
  }

  const images = (form.getAll("images") as string[])
    .map((s) => s.trim())
    .filter(Boolean);

  // A draft may be half-finished; a submission may not.
  if (intent === "submit") {
    if (!description || !material || !dimensions) {
      return {
        ok: false,
        error:
          "Description, material and size are all needed before you send a piece in.",
      };
    }
    if (images.length === 0) {
      return { ok: false, error: "Add at least one photograph." };
    }
  }

  const base = {
    title,
    description,
    material,
    dimensions,
    price,
    // Kept alongside price so the owner's re-pricing never erases what was
    // actually asked for.
    proposedPrice: price,
    priceOnRequest,
    images,
    artistId,
    submittedByArtist: true,
  };

  try {
    if (id) {
      // Ownership is part of the query: another artist's id simply misses.
      const existing = await Artwork.findOne({ _id: id, artistId })
        .select("reviewStatus")
        .lean();
      if (!existing) return { ok: false, error: "That piece was not found." };

      const wasLive = existing.reviewStatus === "approved";
      const slug = await uniqueSlug(title, Artwork, id);

      await Artwork.findByIdAndUpdate(
        id,
        {
          ...base,
          slug,
          reviewStatus: intent === "draft" ? "draft" : "pending",
          // Marks "was live, now awaiting re-approval", which the owner's
          // queue sorts to the top.
          wasApproved: wasLive,
          submittedAt: intent === "submit" ? new Date() : null,
          reviewNote: "",
        },
        { runValidators: true },
      );
    } else {
      const slug = await uniqueSlug(title, Artwork);
      await Artwork.create({
        ...base,
        slug,
        reviewStatus: intent === "draft" ? "draft" : "pending",
        submittedAt: intent === "submit" ? new Date() : null,
        // New work is never on sale until the owner approves it; status is
        // the commercial axis and starts at its default.
        status: "available",
      });
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  revalidatePath("/studio/artworks");
  return { ok: true };
}

/**
 * Artists may delete their own work only while it has never been live.
 * An approved piece may already have enquiries or an order against it, so
 * removing it is the owner's decision.
 */
export async function deleteArtwork(id: string): Promise<ActionResult> {
  const artistId = await requireArtist();
  await connectDB();

  const art = await Artwork.findOne({ _id: id, artistId })
    .select("reviewStatus wasApproved")
    .lean();
  if (!art) return { ok: false, error: "That piece was not found." };

  if (art.reviewStatus === "approved" || art.wasApproved) {
    return {
      ok: false,
      error:
        "This piece has been published, so only Kasityot can remove it. Ask us and we will take it down.",
    };
  }

  await Artwork.findByIdAndDelete(id);
  revalidatePath("/studio/artworks");
  return { ok: true };
}

/** Withdraws a submission that has not been decided on yet. */
export async function withdrawSubmission(id: string): Promise<ActionResult> {
  const artistId = await requireArtist();
  await connectDB();

  const art = await Artwork.findOne({
    _id: id,
    artistId,
    reviewStatus: "pending",
  })
    .select("wasApproved")
    .lean();
  if (!art) {
    return { ok: false, error: "That piece is not waiting for review." };
  }
  if (art.wasApproved) {
    return {
      ok: false,
      error:
        "This piece is an edit to published work. Ask us if you want the change dropped.",
    };
  }

  await Artwork.findByIdAndUpdate(id, {
    reviewStatus: "draft",
    submittedAt: null,
  });
  revalidatePath("/studio/artworks");
  return { ok: true };
}
