/**
 * Seeds the database with realistic content so every screen can be viewed
 * from day one. Safe to re-run: it clears the four collections first.
 *
 *   npm run seed
 */
import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: ".env.local", quiet: true });

import { connectDB } from "../src/lib/db";
import { Artist } from "../src/models/Artist";
import { Artwork } from "../src/models/Artwork";
import { Enquiry } from "../src/models/Enquiry";
import { Order } from "../src/models/Order";
import { seedArtists, seedArtworks } from "../src/lib/seed-data";

async function main() {
  await connectDB();
  console.log("connected to", mongoose.connection.name);

  await Promise.all([
    Artist.deleteMany({}),
    Artwork.deleteMany({}),
    Enquiry.deleteMany({}),
    Order.deleteMany({}),
  ]);
  console.log("cleared existing collections");

  const artists = await Artist.insertMany(seedArtists);
  console.log(`inserted ${artists.length} artists`);

  const idBySlug = new Map(artists.map((a) => [a.slug, a._id]));

  const artworkDocs = seedArtworks.map((art) => {
    const artistId = idBySlug.get(art.artistSlug);
    if (!artistId) {
      throw new Error(
        `Artwork "${art.slug}" references unknown artist "${art.artistSlug}"`,
      );
    }
    // artistSlug is a seed-file convenience, not a stored field.
    const rest = { ...art } as Partial<typeof art>;
    delete rest.artistSlug;
    return { ...rest, artistId };
  });

  const artworks = await Artwork.insertMany(artworkDocs);
  console.log(`inserted ${artworks.length} artworks`);

  // A few enquiries, deliberately including two against the SAME artwork so
  // the inbox can be checked for the "never collapse them" rule.
  const first = artworks.find((a) => a.status === "available");
  const second = artworks.filter((a) => a.status === "available")[1];
  if (first && second) {
    await Enquiry.insertMany([
      {
        artworkId: first._id,
        name: "Ananya Rao",
        phone: "+91 98450 22119",
        city: "Bengaluru",
        message:
          "Is this still available? I'd like it for a housewarming on the 12th.",
        status: "new",
      },
      {
        artworkId: first._id,
        name: "Vikram Sethi",
        phone: "+91 99201 40388",
        city: "Mumbai",
        message: "Could you share the dimensions framed? Interested in buying.",
        status: "new",
      },
      {
        artworkId: second._id,
        name: "Meera Krishnan",
        phone: "+91 98400 71265",
        city: "Chennai",
        message: "Do you ship to Chennai, and is the price negotiable?",
        status: "contacted",
        ownerNotes: "Called 14th — wants to see more photos. Follow up Monday.",
      },
    ]);
    console.log("inserted 3 enquiries (2 against the same artwork)");
  }

  const counts = {
    artists: await Artist.countDocuments(),
    artworks: await Artwork.countDocuments(),
    available: await Artwork.countDocuments({ status: "available" }),
    sold: await Artwork.countDocuments({ status: "sold" }),
    hidden: await Artwork.countDocuments({ status: "hidden" }),
    priceOnRequest: await Artwork.countDocuments({ priceOnRequest: true }),
    artistsWithoutVideo: await Artist.countDocuments({ videoUrl: null }),
    enquiries: await Enquiry.countDocuments(),
  };
  console.log("\nseed complete:", counts);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("\nseed failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
