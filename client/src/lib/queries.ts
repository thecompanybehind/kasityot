import { connectDB, Artist, Artwork, Enquiry, HeroSlide, Order } from "@kasityot/core";

/**
 * Read helpers shared by the public site and the admin panel.
 *
 * Everything returns plain serialisable objects, never Mongoose documents —
 * server components cannot pass class instances or ObjectIds to the client.
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
  artist: Pick<ArtistView, "id" | "name" | "slug" | "craftType" | "region"> | null;
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
  artwork: { id: string; title: string; slug: string } | null;
};

/* ---------------------------------------------------------------- *
 * Serialisers
 * ---------------------------------------------------------------- */

type RawArtist = Record<string, unknown>;

function toArtist(doc: RawArtist): ArtistView {
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

function toArtwork(doc: Record<string, unknown>): ArtworkView {
  // artistId is either a raw ObjectId or a populated artist document.
  const a = doc.artistId as Record<string, unknown> | null;
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
    artist: populated
      ? {
          id: String(a._id),
          name: a.name as string,
          slug: a.slug as string,
          craftType: a.craftType as string,
          region: a.region as string,
        }
      : null,
  };
}

/* ---------------------------------------------------------------- *
 * Public reads — these must never leak hidden records.
 * ---------------------------------------------------------------- */

/** Visible artists only. */
export async function getArtists(filters?: {
  craftType?: string;
  region?: string;
}): Promise<ArtistView[]> {
  await connectDB();
  const query: Record<string, unknown> = { status: "visible" };
  if (filters?.craftType) query.craftType = filters.craftType;
  if (filters?.region) query.region = filters.region;

  const docs = await Artist.find(query).sort({ name: 1 }).lean();
  return docs.map(toArtist);
}

export async function getArtistBySlug(slug: string): Promise<ArtistView | null> {
  await connectDB();
  const doc = await Artist.findOne({ slug, status: "visible" }).lean();
  return doc ? toArtist(doc) : null;
}

export type ArtworkFilters = {
  craftType?: string;
  artistSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "title";
};

/**
 * Public artwork listing. Sold pieces stay visible (clearly marked in the
 * UI); hidden ones never appear. Artworks by a hidden artist are excluded
 * too — Mongo will not do that join for us, so it is done explicitly.
 */
export async function getArtworks(
  filters: ArtworkFilters = {},
): Promise<ArtworkView[]> {
  await connectDB();

  const visibleArtists = await Artist.find(
    filters.craftType
      ? { status: "visible", craftType: filters.craftType }
      : { status: "visible" },
  )
    .select("_id slug")
    .lean();

  let allowedIds = visibleArtists.map((a) => a._id);
  if (filters.artistSlug) {
    const match = visibleArtists.find((a) => a.slug === filters.artistSlug);
    allowedIds = match ? [match._id] : [];
  }

  const query: Record<string, unknown> = {
    status: { $in: ["available", "sold"] },
    artistId: { $in: allowedIds },
  };

  // Price-on-request pieces have a null price and are excluded by a price
  // filter rather than treated as free.
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const range: Record<string, number> = {};
    if (filters.minPrice !== undefined) range.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) range.$lte = filters.maxPrice;
    query.price = range;
  }

  const sortMap = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    title: { title: 1 },
  } as const;

  const docs = await Artwork.find(query)
    .populate("artistId", "name slug craftType region")
    .sort(sortMap[filters.sort ?? "newest"] as Record<string, 1 | -1>)
    .lean();

  return docs.map(toArtwork);
}

export async function getArtworkBySlug(
  slug: string,
): Promise<ArtworkView | null> {
  await connectDB();
  const doc = await Artwork.findOne({
    slug,
    status: { $in: ["available", "sold"] },
  })
    .populate("artistId", "name slug craftType region")
    .lean();
  if (!doc) return null;

  const view = toArtwork(doc);
  // An artwork whose artist was hidden must not be publicly reachable.
  if (view.artist) {
    const artist = await Artist.findById(view.artist.id).select("status").lean();
    if (!artist || artist.status !== "visible") return null;
  }
  return view;
}

/** Artworks for one artist's profile page. */
export async function getArtworksByArtist(
  artistId: string,
): Promise<ArtworkView[]> {
  await connectDB();
  const docs = await Artwork.find({
    artistId,
    status: { $in: ["available", "sold"] },
  })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toArtwork);
}

export async function getFeaturedArtworks(limit = 6): Promise<ArtworkView[]> {
  await connectDB();
  const visible = await Artist.find({ status: "visible" }).select("_id").lean();
  const docs = await Artwork.find({
    status: "available",
    artistId: { $in: visible.map((a) => a._id) },
  })
    .populate("artistId", "name slug craftType region")
    .sort({ featured: -1, createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(toArtwork);
}

/** Distinct values that drive the public filter controls. */
export async function getFilterOptions() {
  await connectDB();
  const [craftTypes, regions] = await Promise.all([
    Artist.distinct("craftType", { status: "visible" }),
    Artist.distinct("region", { status: "visible" }),
  ]);
  return {
    craftTypes: (craftTypes as string[]).sort(),
    regions: (regions as string[]).sort(),
  };
}

/* ---------------------------------------------------------------- *
 * Admin reads — never exposed on public routes.
 * ---------------------------------------------------------------- */

export async function getDashboardStats() {
  await connectDB();
  const [artworks, artists, newEnquiries, paidOrders] = await Promise.all([
    Artwork.countDocuments(),
    Artist.countDocuments(),
    Enquiry.countDocuments({ status: "new" }),
    Order.countDocuments({ status: "paid" }),
  ]);
  return { artworks, artists, newEnquiries, paidOrders };
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

function toEnquiry(doc: Record<string, unknown>): EnquiryView {
  const a = doc.artworkId as Record<string, unknown> | null;
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
    artwork: populated
      ? { id: String(a._id), title: a.title as string, slug: a.slug as string }
      : null,
  };
}

/** Admin listing: unlike the public read, this shows hidden records too. */
export async function getAllArtworks(search?: string): Promise<ArtworkView[]> {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (search) query.title = { $regex: search, $options: "i" };
  const docs = await Artwork.find(query)
    .populate("artistId", "name slug craftType region")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toArtwork);
}

export async function getAllArtists(): Promise<ArtistView[]> {
  await connectDB();
  const docs = await Artist.find().sort({ name: 1 }).lean();
  return docs.map(toArtist);
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
};

/** The approved design's own hero copy, used when a field is left blank. */
export const HERO_DEFAULTS = {
  image: "/design/a7cbff28-f98a-4d87-b8e1-ff3b89c4275c.jpg",
  alt: "An artist at work",
  eyebrow: "Handmade in India",
  heading: "The hand,",
  headingAccent: "unhurried.",
  subtext:
    "Objects made slowly, by people we know by name. Signed, traceable, and meant to outlive their first owner.",
};

/**
 * Visible slides in the owner's order. Returns the design default when the
 * owner has not added any, so the hero is never empty.
 */
export async function getHeroSlides(): Promise<HeroSlideView[]> {
  await connectDB();
  const docs = await HeroSlide.find({ status: "visible" })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  if (!docs.length) {
    return [{ id: "default", ...HERO_DEFAULTS }];
  }

  return docs.map((d) => ({
    id: String(d._id),
    image: d.image as string,
    alt: (d.alt as string) || HERO_DEFAULTS.alt,
    // Each field falls back independently: a slide may override only the
    // heading and keep the rest of the design's copy.
    eyebrow: (d.eyebrow as string) || HERO_DEFAULTS.eyebrow,
    heading: (d.heading as string) || HERO_DEFAULTS.heading,
    headingAccent: (d.headingAccent as string) || HERO_DEFAULTS.headingAccent,
    subtext: (d.subtext as string) || HERO_DEFAULTS.subtext,
  }));
}
