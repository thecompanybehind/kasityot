"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  connectDB,
  Artist,
  ArtistUser,
  Artwork,
  Enquiry,
  HeroSlide,
} from "@kasityot/core";
import { issueInvite, inviteUrl } from "@/lib/invite";
import { getSession } from "@/lib/auth";

/**
 * Every mutation the owner can perform.
 *
 * Each action re-checks the session itself. The proxy already guards the
 * routes, but a server action is its own POST endpoint — guarding only the
 * page that renders the form would leave the action callable directly.
 */

async function requireOwner() {
  const session = await getSession();
  if (!session) redirect("/login");
}

export type ActionResult = { ok: boolean; error?: string };

/** An approval also hands back a one-time invite link for the owner to pass on. */
export type InviteResult = ActionResult & {
  inviteUrl?: string;
  expiresAt?: string;
};

/** URL-safe slug, uniquified against the collection it belongs to. */
async function uniqueSlug(
  base: string,
  // Narrowed to the one method used: a union of the two models is not
  // callable, because their overload signatures do not unify.
  model: { findOne(f: { slug: string }): { select(s: string): { lean(): Promise<{ _id: unknown } | null> } } },
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

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/* ---------------------------------------------------------------- *
 * Artists
 * ---------------------------------------------------------------- */

export async function saveArtist(
  id: string | null,
  form: FormData,
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();

  const name = str(form, "name");
  if (!name) return { ok: false, error: "Name is required." };

  const data = {
    name,
    craftType: str(form, "craftType"),
    region: str(form, "region"),
    story: str(form, "story"),
    // Empty string must become null, not "", so the public page's
    // "has a video?" check stays unambiguous.
    photo: str(form, "photo") || null,
    videoUrl: str(form, "videoUrl") || null,
    status: (str(form, "status") || "visible") as "visible" | "hidden",
  };

  if (!data.craftType || !data.region || !data.story) {
    return { ok: false, error: "Craft, region and story are all required." };
  }

  try {
    if (id) {
      const slug = await uniqueSlug(name, Artist, id);
      // Editing here does not approve an applicant: approval mints an invite
      // and is its own deliberate step on the applications page. The owner
      // may well want to tidy an application up before deciding on it.
      await Artist.findByIdAndUpdate(id, { ...data, slug });
    } else {
      const slug = await uniqueSlug(name, Artist);
      await Artist.create({ ...data, slug });
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  revalidatePath("/artists");
  return { ok: true };
}

/**
 * Deleting an artist would orphan their artwork: MongoDB has no foreign
 * keys and will not cascade. Refuse the delete while work still hangs off
 * them, and point the owner at hiding instead.
 */
export async function deleteArtist(id: string): Promise<ActionResult> {
  await requireOwner();
  await connectDB();

  const count = await Artwork.countDocuments({ artistId: id });
  if (count > 0) {
    return {
      ok: false,
      error: `This artist still has ${count} artwork${count === 1 ? "" : "s"}. Delete or reassign those first, or hide the artist instead.`,
    };
  }

  await Artist.findByIdAndDelete(id);
  revalidatePath("/artists");
  return { ok: true };
}

export async function setArtistStatus(
  id: string,
  status: "visible" | "hidden",
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await Artist.findByIdAndUpdate(id, { status });
  revalidatePath("/artists");
  return { ok: true };
}

/* ---------------------------------------------------------------- *
 * Artworks
 * ---------------------------------------------------------------- */

export async function saveArtwork(
  id: string | null,
  form: FormData,
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();

  const title = str(form, "title");
  const artistId = str(form, "artistId");
  if (!title) return { ok: false, error: "Title is required." };
  if (!artistId) return { ok: false, error: "Choose an artist." };

  const artist = await Artist.findById(artistId).select("_id").lean();
  if (!artist) return { ok: false, error: "That artist no longer exists." };

  const priceOnRequest = form.get("priceOnRequest") === "on";
  const rawPrice = str(form, "price");

  if (!priceOnRequest && !rawPrice) {
    return {
      ok: false,
      error: "Enter a price, or tick “price on request”.",
    };
  }

  // The form collects rupees; the database stores paise.
  const price = priceOnRequest ? null : Math.round(Number(rawPrice) * 100);
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { ok: false, error: "Price must be a positive number." };
  }

  // Ordered list; images[0] is the cover the owner chose.
  const images = (form.getAll("images") as string[])
    .map((s) => s.trim())
    .filter(Boolean);

  const data = {
    title,
    artistId,
    description: str(form, "description"),
    material: str(form, "material"),
    dimensions: str(form, "dimensions"),
    price,
    priceOnRequest,
    images,
    status: (str(form, "status") || "available") as
      | "available"
      | "sold"
      | "hidden",
    featured: form.get("featured") === "on",
  };

  if (!data.description || !data.material || !data.dimensions) {
    return {
      ok: false,
      error: "Description, material and dimensions are all required.",
    };
  }

  try {
    if (id) {
      const slug = await uniqueSlug(title, Artwork, id);
      // runValidators keeps the price/priceOnRequest rule alive on update;
      // findByIdAndUpdate skips schema validation by default.
      await Artwork.findByIdAndUpdate(
        id,
        {
          ...data,
          slug,
          // The owner editing a piece is itself the approval, so a submission
          // they fix up goes live rather than staying in their own queue.
          reviewStatus: "approved",
          wasApproved: false,
          reviewNote: "",
        },
        { runValidators: true },
      );
    } else {
      const slug = await uniqueSlug(title, Artwork);
      await Artwork.create({ ...data, slug });
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  revalidatePath("/artworks");
  return { ok: true };
}

/**
 * Enquiries reference the artwork. Deleting the piece would leave the
 * inbox showing rows with no subject, so they go together.
 */
export async function deleteArtwork(id: string): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await Enquiry.deleteMany({ artworkId: id });
  await Artwork.findByIdAndDelete(id);
  revalidatePath("/artworks");
  revalidatePath("/enquiries");
  return { ok: true };
}

/**
 * Marking sold immediately stops new enquiries and purchases on the public
 * site, because every public read filters on this field.
 */
export async function setArtworkStatus(
  id: string,
  status: "available" | "sold" | "hidden",
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await Artwork.findByIdAndUpdate(id, { status });
  revalidatePath("/artworks");
  return { ok: true };
}

/* ---------------------------------------------------------------- *
 * Artist applications
 * ---------------------------------------------------------------- */

/**
 * Approving an application also mints the artist's invite.
 *
 * The raw token is returned to the caller exactly once and never stored: only
 * its hash goes to the database, so a later read of that row — a backup, a
 * support query, a leak — cannot be turned into a working login.
 */
export async function approveArtistApplication(
  id: string,
): Promise<InviteResult> {
  await requireOwner();
  await connectDB();

  const artist = await Artist.findById(id).select("email name").lean();
  if (!artist) return { ok: false, error: "That application no longer exists." };
  if (!artist.email) {
    return {
      ok: false,
      error: "This artist has no email address, so they cannot be invited.",
    };
  }

  await Artist.findByIdAndUpdate(id, {
    applicationStatus: "approved",
    reviewNote: "",
    reviewedAt: new Date(),
  });

  const { token, expiresAt } = await issueInvite(id, artist.email as string);

  revalidatePath("/applications");
  revalidatePath("/artists");
  return {
    ok: true,
    inviteUrl: inviteUrl(token),
    // Surfaced so the owner can tell the artist how long the link lasts.
    expiresAt: expiresAt.toISOString(),
  };
}

export async function rejectArtistApplication(
  id: string,
  note: string,
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();

  const trimmed = note.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: "Give a reason — the artist is shown this, so it should help them.",
    };
  }

  await Artist.findByIdAndUpdate(id, {
    applicationStatus: "rejected",
    reviewNote: trimmed,
    reviewedAt: new Date(),
  });

  // A rejected artist must not keep a usable login if they had one.
  await ArtistUser.findOneAndUpdate(
    { artistId: id },
    { inviteTokenHash: null, inviteExpiresAt: null },
  );

  revalidatePath("/applications");
  revalidatePath("/artists");
  return { ok: true };
}

/** Fresh token, overwriting any previous one — the old link stops working. */
export async function resendArtistInvite(
  id: string,
): Promise<ActionResult & { inviteUrl?: string }> {
  await requireOwner();
  await connectDB();

  const artist = await Artist.findById(id).select("email applicationStatus").lean();
  if (!artist) return { ok: false, error: "That artist no longer exists." };
  if (artist.applicationStatus !== "approved") {
    return { ok: false, error: "Approve the application first." };
  }
  if (!artist.email) {
    return { ok: false, error: "This artist has no email address." };
  }

  const { token } = await issueInvite(id, artist.email as string);
  revalidatePath("/applications");
  return { ok: true, inviteUrl: inviteUrl(token) };
}

/* ---------------------------------------------------------------- *
 * Artwork submissions
 * ---------------------------------------------------------------- */

/**
 * Approving a submission puts it on the public site.
 *
 * wasApproved is cleared because it exists only to mark "was live, now
 * awaiting re-approval" — once approved again the distinction is spent.
 */
export async function approveArtwork(id: string): Promise<ActionResult> {
  await requireOwner();
  await connectDB();

  const art = await Artwork.findById(id).select("_id").lean();
  if (!art) return { ok: false, error: "That piece no longer exists." };

  await Artwork.findByIdAndUpdate(id, {
    reviewStatus: "approved",
    wasApproved: false,
    reviewNote: "",
    reviewedAt: new Date(),
  });

  revalidatePath("/submissions");
  revalidatePath("/artworks");
  return { ok: true };
}

export async function rejectArtwork(
  id: string,
  note: string,
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();

  const trimmed = note.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: "Give a reason — the artist is shown this, so it should help them.",
    };
  }

  await Artwork.findByIdAndUpdate(id, {
    reviewStatus: "rejected",
    reviewNote: trimmed,
    reviewedAt: new Date(),
  });

  revalidatePath("/submissions");
  revalidatePath("/artworks");
  return { ok: true };
}

/* ---------------------------------------------------------------- *
 * Enquiries
 * ---------------------------------------------------------------- */

export async function setEnquiryStatus(
  id: string,
  status: "new" | "contacted" | "closed",
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await Enquiry.findByIdAndUpdate(id, { status });
  revalidatePath("/enquiries");
  return { ok: true };
}

export async function saveEnquiryNotes(
  id: string,
  notes: string,
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await Enquiry.findByIdAndUpdate(id, { ownerNotes: notes });
  revalidatePath("/enquiries");
  return { ok: true };
}

/* ---------------------------------------------------------------- *
 * Hero banner
 * ---------------------------------------------------------------- */

export async function saveHeroSlide(
  id: string | null,
  form: FormData,
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();

  const image = str(form, "image");
  if (!image) return { ok: false, error: "Upload a banner image first." };

  const data = {
    image,
    alt: str(form, "alt"),
    // Blank means "use the design's default copy" — the public hero falls
    // back per field, so these are stored as empty rather than rejected.
    eyebrow: str(form, "eyebrow"),
    heading: str(form, "heading"),
    headingAccent: str(form, "headingAccent"),
    subtext: str(form, "subtext"),
    status: (str(form, "status") || "visible") as "visible" | "hidden",
  };

  try {
    if (id) {
      await HeroSlide.findByIdAndUpdate(id, data);
    } else {
      // New slides go to the end of the running order.
      const last = await HeroSlide.findOne().sort({ order: -1 }).lean();
      const order = ((last?.order as number) ?? -1) + 1;
      await HeroSlide.create({ ...data, order });
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  revalidatePath("/hero");
  return { ok: true };
}

export async function deleteHeroSlide(id: string): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await HeroSlide.findByIdAndDelete(id);
  revalidatePath("/hero");
  return { ok: true };
}

export async function setHeroSlideStatus(
  id: string,
  status: "visible" | "hidden",
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();
  await HeroSlide.findByIdAndUpdate(id, { status });
  revalidatePath("/hero");
  return { ok: true };
}

/**
 * Swaps a slide with its neighbour. Order values are rewritten for the
 * whole list afterwards so gaps from deletes never accumulate.
 */
export async function moveHeroSlide(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  await requireOwner();
  await connectDB();

  const slides = await HeroSlide.find().sort({ order: 1, createdAt: 1 }).lean();
  const i = slides.findIndex((s) => String(s._id) === id);
  if (i < 0) return { ok: false, error: "That banner no longer exists." };

  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= slides.length) return { ok: true };

  const reordered = [...slides];
  [reordered[i], reordered[j]] = [reordered[j], reordered[i]];

  await Promise.all(
    reordered.map((s, n) => HeroSlide.findByIdAndUpdate(s._id, { order: n })),
  );

  revalidatePath("/hero");
  return { ok: true };
}
