/**
 * Backfills the review fields added for artist onboarding.
 *
 * Mongoose applies a schema default on write, not on read, so every artist
 * and artwork created before those fields existed has no value for them at
 * all. The public site filters on them from this change onward: without this
 * backfill every existing record would read as unapproved and vanish.
 *
 * Existing content is owner-curated and therefore approved by definition —
 * it was added by hand in the panel, which is the approval.
 *
 * Safe to re-run: it only touches documents where the field is still absent,
 * so a second run reports zero changes and never overwrites a real decision
 * the owner has since made.
 *
 *   cd packages/core && npm run backfill
 */
import { config } from "dotenv";
import mongoose from "mongoose";
import path from "node:path";

// The connection string lives with the apps, not here.
config({ path: path.join(process.cwd(), "../../client/.env.local"), quiet: true });
config({ path: path.join(process.cwd(), "../../admin/.env.local"), quiet: true });

import { connectDB } from "../src/db";
import { Artist } from "../src/models/Artist";
import { Artwork } from "../src/models/Artwork";

async function main() {
  await connectDB();
  console.log("connected to", mongoose.connection.name);

  const artists = await Artist.updateMany(
    { applicationStatus: { $exists: false } },
    { $set: { applicationStatus: "approved" } },
  );
  console.log(`artists  → approved: ${artists.modifiedCount}`);

  const artworks = await Artwork.updateMany(
    { reviewStatus: { $exists: false } },
    { $set: { reviewStatus: "approved", submittedByArtist: false } },
  );
  console.log(`artworks → approved: ${artworks.modifiedCount}`);

  // Report anything still missing a value, which would mean the filters above
  // did not match what is actually in the collection.
  const [staleArtists, staleArtworks] = await Promise.all([
    Artist.countDocuments({ applicationStatus: { $exists: false } }),
    Artwork.countDocuments({ reviewStatus: { $exists: false } }),
  ]);

  if (staleArtists || staleArtworks) {
    console.error(
      `\nstill unset — artists: ${staleArtists}, artworks: ${staleArtworks}`,
    );
    process.exitCode = 1;
  } else {
    console.log("\nevery record has a review state.");
  }

  await mongoose.connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
