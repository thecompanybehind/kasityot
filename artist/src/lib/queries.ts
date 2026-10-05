import { connectDB, Artist, Artwork } from "@kasityot/core";

/**
 * Reads for the studio.
 *
 * Every one takes the artistId from the session and filters on it inside the
 * query. Nothing here accepts an id from a form or a URL without pairing it
 * with the session's own id, so one artist cannot read another's work.
 *
 * Returns plain serialisable objects: server components cannot hand Mongoose
 * documents or ObjectIds to a client component.
 */

export type StudioArtist = {
  id: string;
  name: string;
  slug: string;
  photo: string | null;
  craftType: string;
  region: string;
  story: string;
  phone: string | null;
  email: string | null;
  status: "visible" | "hidden";
  applicationStatus: "pending" | "approved" | "rejected";
  reviewNote: string;
  /** The video on the public site, if any. */
  videoUrl: string | null;
  /** The video awaiting the owner, or the one last sent back. */
  pendingVideoUrl: string | null;
  videoReviewStatus: "none" | "pending" | "rejected";
  videoReviewNote: string;
};

export type StudioArtwork = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number | null;
  proposedPrice: number | null;
  priceOnRequest: boolean;
  material: string;
  dimensions: string;
  images: string[];
  status: "available" | "sold" | "hidden";
  reviewStatus: "draft" | "pending" | "approved" | "rejected";
  reviewNote: string;
  wasApproved: boolean;
  submittedAt: string | null;
  updatedAt: string | null;
};

type Raw = Record<string, unknown>;

function iso(v: unknown): string | null {
  return v ? new Date(v as string).toISOString() : null;
}

function toArtist(doc: Raw): StudioArtist {
  return {
    id: String(doc._id),
    name: doc.name as string,
    slug: doc.slug as string,
    photo: (doc.photo as string) ?? null,
    craftType: doc.craftType as string,
    region: doc.region as string,
    story: doc.story as string,
    phone: (doc.phone as string) ?? null,
    email: (doc.email as string) ?? null,
    status: doc.status as StudioArtist["status"],
    applicationStatus:
      (doc.applicationStatus as StudioArtist["applicationStatus"]) ?? "approved",
    reviewNote: (doc.reviewNote as string) ?? "",
    videoUrl: (doc.videoUrl as string) ?? null,
    pendingVideoUrl: (doc.pendingVideoUrl as string) ?? null,
    // Rows predating the field have no value; they have nothing in review.
    videoReviewStatus:
      (doc.videoReviewStatus as StudioArtist["videoReviewStatus"]) ?? "none",
    videoReviewNote: (doc.videoReviewNote as string) ?? "",
  };
}

function toArtwork(doc: Raw): StudioArtwork {
  return {
    id: String(doc._id),
    title: doc.title as string,
    slug: doc.slug as string,
    description: (doc.description as string) ?? "",
    price: (doc.price as number) ?? null,
    proposedPrice: (doc.proposedPrice as number) ?? null,
    priceOnRequest: Boolean(doc.priceOnRequest),
    material: (doc.material as string) ?? "",
    dimensions: (doc.dimensions as string) ?? "",
    images: (doc.images as string[]) ?? [],
    status: doc.status as StudioArtwork["status"],
    reviewStatus:
      (doc.reviewStatus as StudioArtwork["reviewStatus"]) ?? "approved",
    reviewNote: (doc.reviewNote as string) ?? "",
    wasApproved: Boolean(doc.wasApproved),
    submittedAt: iso(doc.submittedAt),
    updatedAt: iso(doc.updatedAt),
  };
}

export async function getMyProfile(
  artistId: string,
): Promise<StudioArtist | null> {
  await connectDB();
  const doc = await Artist.findById(artistId).lean();
  return doc ? toArtist(doc) : null;
}

/**
 * The artist's own work, with anything needing their attention first:
 * rejected pieces, then drafts, then whatever is awaiting review.
 */
export async function getMyArtworks(
  artistId: string,
): Promise<StudioArtwork[]> {
  await connectDB();
  const docs = await Artwork.find({ artistId }).sort({ updatedAt: -1 }).lean();

  const rank: Record<string, number> = {
    rejected: 0,
    draft: 1,
    pending: 2,
    approved: 3,
  };
  return docs
    .map(toArtwork)
    .sort((a, b) => rank[a.reviewStatus] - rank[b.reviewStatus]);
}

/**
 * One piece, scoped to its owner.
 *
 * artistId is part of the query rather than something compared afterwards, so
 * another artist's id simply finds nothing.
 */
export async function getMyArtwork(
  artistId: string,
  id: string,
): Promise<StudioArtwork | null> {
  await connectDB();
  const doc = await Artwork.findOne({ _id: id, artistId }).lean();
  return doc ? toArtwork(doc) : null;
}

/** Counts for the studio dashboard. */
export async function getMyCounts(artistId: string): Promise<{
  live: number;
  pending: number;
  drafts: number;
  rejected: number;
}> {
  await connectDB();
  const [live, pending, drafts, rejected] = await Promise.all([
    Artwork.countDocuments({ artistId, reviewStatus: "approved" }),
    Artwork.countDocuments({ artistId, reviewStatus: "pending" }),
    Artwork.countDocuments({ artistId, reviewStatus: "draft" }),
    Artwork.countDocuments({ artistId, reviewStatus: "rejected" }),
  ]);
  return { live, pending, drafts, rejected };
}
