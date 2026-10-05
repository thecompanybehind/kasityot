import {
  connectDB,
  Artist,
  ArtistUser,
  Artwork,
  Enquiry,
  HeroSlide,
  Order,
} from "@kasityot/core";

/**
 * Admin reads. Unlike the public site these deliberately include hidden
 * records — the owner must see everything.
 *
 * Everything returns plain serialisable objects; server components cannot
 * hand Mongoose documents or ObjectIds to the client.
 */

export type ArtistView = {
  id: string;
  name: string;
  slug: string;
  photo: string | null;
  craftType: string;
  region: string;
  story: string;
  videoUrl: string | null;
  /** A video the artist uploaded that is awaiting, or failed, review. */
  pendingVideoUrl: string | null;
  videoReviewStatus: "none" | "pending" | "rejected";
  videoReviewNote: string;
  videoSubmittedAt: string | null;
  status: "visible" | "hidden";
  artworkCount?: number;
  applicationStatus: "pending" | "approved" | "rejected";
  email: string | null;
  phone: string | null;
  reviewNote: string;
  /** ISO strings: a Date cannot cross into a client component. */
  reviewedAt: string | null;
  createdAt: string | null;
  /** Whether this artist has redeemed their invite and can sign in. */
  hasLogin?: boolean;
};

export type ArtworkView = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number | null;
  priceOnRequest: boolean;
  material: string;
  dimensions: string;
  images: string[];
  status: "available" | "sold" | "hidden";
  featured: boolean;
  artistId: string;
  artistName: string | null;
  reviewStatus: "draft" | "pending" | "approved" | "rejected";
  submittedByArtist: boolean;
  submittedAt: string | null;
  reviewNote: string;
  reviewedAt: string | null;
  /** True when an approved piece was edited and is awaiting re-approval. */
  wasApproved: boolean;
  proposedPrice: number | null;
};

export type EnquiryView = {
  id: string;
  name: string;
  phone: string;
  city: string;
  message: string;
  status: "new" | "contacted" | "closed";
  ownerNotes: string;
  createdAt: string;
  artworkId: string | null;
  artworkTitle: string | null;
};

type Raw = Record<string, unknown>;

/** Dates cannot cross into a client component, so they leave here as ISO. */
function iso(v: unknown): string | null {
  return v ? new Date(v as string).toISOString() : null;
}

function toArtist(doc: Raw): ArtistView {
  return {
    id: String(doc._id),
    name: doc.name as string,
    slug: doc.slug as string,
    photo: (doc.photo as string) ?? null,
    craftType: doc.craftType as string,
    region: doc.region as string,
    story: doc.story as string,
    videoUrl: (doc.videoUrl as string) ?? null,
    pendingVideoUrl: (doc.pendingVideoUrl as string) ?? null,
    videoReviewStatus:
      (doc.videoReviewStatus as ArtistView["videoReviewStatus"]) ?? "none",
    videoReviewNote: (doc.videoReviewNote as string) ?? "",
    videoSubmittedAt: iso(doc.videoSubmittedAt),
    status: doc.status as ArtistView["status"],
    // Rows predating the review fields have no value; they read as approved,
    // matching both the backfill and what the public site does.
    applicationStatus:
      (doc.applicationStatus as ArtistView["applicationStatus"]) ?? "approved",
    email: (doc.email as string) ?? null,
    phone: (doc.phone as string) ?? null,
    reviewNote: (doc.reviewNote as string) ?? "",
    reviewedAt: iso(doc.reviewedAt),
    createdAt: iso(doc.createdAt),
  };
}

function toArtwork(doc: Raw): ArtworkView {
  const a = doc.artistId as Raw | null;
  const populated = a && typeof a === "object" && "name" in a;
  return {
    id: String(doc._id),
    title: doc.title as string,
    slug: doc.slug as string,
    description: doc.description as string,
    price: (doc.price as number) ?? null,
    priceOnRequest: Boolean(doc.priceOnRequest),
    material: doc.material as string,
    dimensions: doc.dimensions as string,
    images: (doc.images as string[]) ?? [],
    status: doc.status as ArtworkView["status"],
    featured: Boolean(doc.featured),
    artistId: populated ? String(a._id) : String(doc.artistId),
    artistName: populated ? (a.name as string) : null,
    reviewStatus:
      (doc.reviewStatus as ArtworkView["reviewStatus"]) ?? "approved",
    submittedByArtist: Boolean(doc.submittedByArtist),
    submittedAt: iso(doc.submittedAt),
    reviewNote: (doc.reviewNote as string) ?? "",
    reviewedAt: iso(doc.reviewedAt),
    wasApproved: Boolean(doc.wasApproved),
    proposedPrice: (doc.proposedPrice as number) ?? null,
  };
}

function toEnquiry(doc: Raw): EnquiryView {
  const a = doc.artworkId as Raw | null;
  const populated = a && typeof a === "object" && "title" in a;
  return {
    id: String(doc._id),
    name: doc.name as string,
    phone: doc.phone as string,
    city: doc.city as string,
    message: doc.message as string,
    status: doc.status as EnquiryView["status"],
    ownerNotes: (doc.ownerNotes as string) ?? "",
    createdAt: new Date(doc.createdAt as string).toISOString(),
    artworkId: a ? String(populated ? a._id : doc.artworkId) : null,
    artworkTitle: populated ? (a.title as string) : null,
  };
}

/* ---------------------------------------------------------------- */

export async function getDashboardStats() {
  await connectDB();
  const [
    artworks,
    artists,
    newEnquiries,
    orders,
    available,
    sold,
    pendingApplications,
    pendingArtworks,
    pendingVideos,
  ] = await Promise.all([
    Artwork.countDocuments(),
    Artist.countDocuments(),
    Enquiry.countDocuments({ status: "new" }),
    Order.countDocuments({ status: { $in: PURCHASE_STATUSES } }),
    Artwork.countDocuments({ status: "available" }),
    Artwork.countDocuments({ status: "sold" }),
    // Surfaced on the dashboard and in the nav: an unnoticed queue is the
    // main failure mode of a design where nothing goes live without review.
    Artist.countDocuments({ applicationStatus: "pending" }),
    Artwork.countDocuments({ reviewStatus: "pending" }),
    Artist.countDocuments({ videoReviewStatus: "pending" }),
  ]);
  // Videos are reviewed on the submissions page, so they count towards it.
  const pendingSubmissions = pendingArtworks + pendingVideos;
  return {
    artworks,
    artists,
    newEnquiries,
    orders,
    available,
    sold,
    pendingApplications,
    pendingSubmissions,
  };
}

/**
 * The two queue counts for the nav badge, on every page.
 *
 * Its own small query rather than a slice of getDashboardStats: every page
 * calls this, and none of them needs the other six counts.
 */
export async function getQueueCounts(): Promise<{
  applications: number;
  submissions: number;
}> {
  await connectDB();
  const [applications, artworks, videos] = await Promise.all([
    Artist.countDocuments({ applicationStatus: "pending" }),
    Artwork.countDocuments({ reviewStatus: "pending" }),
    Artist.countDocuments({ videoReviewStatus: "pending" }),
  ]);
  // Videos are reviewed on the submissions page, so they share its badge.
  return { applications, submissions: artworks + videos };
}

/**
 * Artist applications, newest first, with pending ahead of everything else so
 * the owner sees what needs a decision without filtering.
 */
export async function getApplications(
  status?: "pending" | "approved" | "rejected",
): Promise<ArtistView[]> {
  await connectDB();

  // Only artists who actually applied; ones the owner created by hand have no
  // email and never entered this queue.
  const query: Record<string, unknown> = status
    ? { applicationStatus: status }
    : { email: { $ne: null } };

  const docs = await Artist.find(query)
    .sort({ applicationStatus: 1, createdAt: -1 })
    .lean();

  const views = docs.map(toArtist);

  // Whether each one has redeemed their invite, so the owner can tell "waiting
  // on them" from "waiting on me".
  const users = await ArtistUser.find({
    artistId: { $in: docs.map((d) => d._id) },
  })
    .select("artistId passwordHash")
    .lean();
  const redeemed = new Set(
    users.filter((u) => u.passwordHash).map((u) => String(u.artistId)),
  );

  return views.map((v) => ({ ...v, hasLogin: redeemed.has(v.id) }));
}

/** One application, with the same login flag as the listing. */
export async function getApplication(id: string): Promise<ArtistView | null> {
  await connectDB();
  const doc = await Artist.findById(id).lean();
  if (!doc) return null;
  const user = await ArtistUser.findOne({ artistId: id })
    .select("passwordHash")
    .lean();
  return { ...toArtist(doc), hasLogin: Boolean(user?.passwordHash) };
}

/**
 * Artwork awaiting review. Pieces that were live and have since been edited
 * sort first: they are off the public site until approved, so they cost the
 * owner a listing every hour they sit here.
 */
export async function getSubmissions(
  status?: "pending" | "approved" | "rejected",
): Promise<ArtworkView[]> {
  await connectDB();
  const query: Record<string, unknown> = status
    ? { reviewStatus: status }
    : { reviewStatus: "pending" };

  const docs = await Artwork.find(query)
    .populate("artistId", "name")
    .sort({ wasApproved: -1, submittedAt: 1 })
    .lean();
  return docs.map(toArtwork);
}

/**
 * Artists whose video is waiting on the owner, longest wait first.
 *
 * Only ever pending: an approved video is simply the artist's video, and a
 * rejected one is with the artist.
 */
export async function getVideoSubmissions(): Promise<ArtistView[]> {
  await connectDB();
  const docs = await Artist.find({
    videoReviewStatus: "pending",
    pendingVideoUrl: { $ne: null },
  })
    .sort({ videoSubmittedAt: 1 })
    .lean();
  return docs.map(toArtist);
}

export async function getRecentEnquiries(limit = 5): Promise<EnquiryView[]> {
  await connectDB();
  const docs = await Enquiry.find()
    .populate("artworkId", "title slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(toEnquiry);
}

export async function getArtworks(filters?: {
  search?: string;
  status?: string;
  artistId?: string;
}): Promise<ArtworkView[]> {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters?.search) query.title = { $regex: filters.search, $options: "i" };
  if (filters?.status) query.status = filters.status;
  if (filters?.artistId) query.artistId = filters.artistId;

  const docs = await Artwork.find(query)
    .populate("artistId", "name")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toArtwork);
}

export async function getArtwork(id: string): Promise<ArtworkView | null> {
  await connectDB();
  const doc = await Artwork.findById(id).populate("artistId", "name").lean();
  return doc ? toArtwork(doc) : null;
}

export async function getArtists(): Promise<ArtistView[]> {
  await connectDB();
  const docs = await Artist.find().sort({ name: 1 }).lean();
  const artists = docs.map(toArtist);

  // Show the owner how many pieces hang off each artist, so a delete that
  // would orphan artwork is obvious before they click it.
  const counts = await Artwork.aggregate<{ _id: unknown; n: number }>([
    { $group: { _id: "$artistId", n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  return artists.map((a) => ({ ...a, artworkCount: byId.get(a.id) ?? 0 }));
}

export async function getArtist(id: string): Promise<ArtistView | null> {
  await connectDB();
  const doc = await Artist.findById(id).lean();
  return doc ? toArtist(doc) : null;
}

export async function getEnquiries(filters?: {
  status?: string;
  artworkId?: string;
}): Promise<EnquiryView[]> {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters?.status) query.status = filters.status;
  if (filters?.artworkId) query.artworkId = filters.artworkId;

  const docs = await Enquiry.find(query)
    .populate("artworkId", "title slug")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toEnquiry);
}

/* ---------------------------------------------------------------- *
 * Customers
 * ---------------------------------------------------------------- */

export type CustomerOrderView = {
  id: string;
  artworkId: string | null;
  artworkTitle: string | null;
  amount: number;
  status: "requested" | "paid";
  createdAt: string;
};

export type CustomerView = {
  /** The buyer's email, which is what groups their orders together. */
  email: string;
  name: string;
  phone: string;
  address: string;
  orders: CustomerOrderView[];
  totalAmount: number;
  lastOrderAt: string;
};

/**
 * Orders that count as a purchase: a request placed without payment, or a
 * paid Razorpay order. An abandoned or failed checkout is not a customer.
 */
const PURCHASE_STATUSES = ["requested", "paid"] as const;

/**
 * Everyone who has ever bought, most recent buyer first, with one entry per
 * person however many pieces they ordered.
 *
 * Grouped by email. Name, phone and address come from their latest order,
 * since that is the one most likely to still be right.
 */
export async function getCustomers(): Promise<CustomerView[]> {
  await connectDB();
  const docs = await Order.find({ status: { $in: PURCHASE_STATUSES } })
    .populate("artworkId", "title")
    .sort({ createdAt: -1 })
    .lean();

  const byEmail = new Map<string, CustomerView>();
  for (const doc of docs as Raw[]) {
    const a = doc.artworkId as Raw | null;
    const populated = a && typeof a === "object" && "title" in a;
    const createdAt = new Date(doc.createdAt as string).toISOString();
    const order: CustomerOrderView = {
      id: String(doc._id),
      artworkId: populated ? String(a._id) : null,
      artworkTitle: populated ? (a.title as string) : null,
      amount: doc.amount as number,
      status: doc.status as CustomerOrderView["status"],
      createdAt,
    };

    const email = doc.email as string;
    const customer = byEmail.get(email);
    if (customer) {
      customer.orders.push(order);
      customer.totalAmount += order.amount;
    } else {
      // Newest first, so the first order seen for an email is their latest.
      byEmail.set(email, {
        email,
        name: doc.name as string,
        phone: doc.phone as string,
        address: doc.address as string,
        orders: [order],
        totalAmount: order.amount,
        lastOrderAt: createdAt,
      });
    }
  }
  return [...byEmail.values()];
}

/** Lightweight list for the enquiry filter dropdown. */
export async function getArtworkOptions() {
  await connectDB();
  const docs = await Artwork.find().select("_id title").sort({ title: 1 }).lean();
  return docs.map((d) => ({ id: String(d._id), title: d.title as string }));
}

export async function getArtistOptions() {
  await connectDB();
  const docs = await Artist.find().select("_id name").sort({ name: 1 }).lean();
  return docs.map((d) => ({ id: String(d._id), name: d.name as string }));
}

/* ---------------------------------------------------------------- *
 * Hero banner
 * ---------------------------------------------------------------- */

export type HeroSlideView = {
  id: string;
  image: string;
  alt: string;
  eyebrow: string;
  heading: string;
  headingAccent: string;
  subtext: string;
  order: number;
  status: "visible" | "hidden";
};

/** Admin listing: includes hidden slides, in the owner's order. */
export async function getHeroSlides(): Promise<HeroSlideView[]> {
  await connectDB();
  const docs = await HeroSlide.find().sort({ order: 1, createdAt: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    image: d.image as string,
    alt: (d.alt as string) ?? "",
    eyebrow: (d.eyebrow as string) ?? "",
    heading: (d.heading as string) ?? "",
    headingAccent: (d.headingAccent as string) ?? "",
    subtext: (d.subtext as string) ?? "",
    order: (d.order as number) ?? 0,
    status: d.status as HeroSlideView["status"],
  }));
}

export async function getHeroSlide(id: string): Promise<HeroSlideView | null> {
  await connectDB();
  const d = await HeroSlide.findById(id).lean();
  if (!d) return null;
  return {
    id: String(d._id),
    image: d.image as string,
    alt: (d.alt as string) ?? "",
    eyebrow: (d.eyebrow as string) ?? "",
    heading: (d.heading as string) ?? "",
    headingAccent: (d.headingAccent as string) ?? "",
    subtext: (d.subtext as string) ?? "",
    order: (d.order as number) ?? 0,
    status: d.status as HeroSlideView["status"],
  };
}
