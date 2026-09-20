import { connectDB, Artist, Artwork, Enquiry, HeroSlide, Order } from "@kasityot/core";

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
  status: "visible" | "hidden";
  artworkCount?: number;
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
    status: doc.status as ArtistView["status"],
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
  const [artworks, artists, newEnquiries, paidOrders, available, sold] =
    await Promise.all([
      Artwork.countDocuments(),
      Artist.countDocuments(),
      Enquiry.countDocuments({ status: "new" }),
      Order.countDocuments({ status: "paid" }),
      Artwork.countDocuments({ status: "available" }),
      Artwork.countDocuments({ status: "sold" }),
    ]);
  return { artworks, artists, newEnquiries, paidOrders, available, sold };
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
