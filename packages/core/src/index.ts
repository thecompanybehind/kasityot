/**
 * The single source of truth for the database schema.
 *
 * Every app — public site, owner panel, artist studio — imports its models
 * from here. They were previously duplicated per app, which meant a schema
 * change had to be applied in each copy and drifted silently when one was
 * missed: one app could filter on a status value another never wrote.
 *
 * Consumers import from "@kasityot/core" rather than reaching into the
 * file tree, so the internal layout stays free to change.
 */

export { connectDB } from "./db";

export { Artist, type ArtistDoc } from "./models/Artist";
export { Artwork, type ArtworkDoc } from "./models/Artwork";
export { Enquiry, type EnquiryDoc } from "./models/Enquiry";
export { HeroSlide, type HeroSlideDoc } from "./models/HeroSlide";
export { Order, type OrderDoc } from "./models/Order";
