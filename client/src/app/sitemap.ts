import type { MetadataRoute } from "next";
import { getArtists, getArtworks } from "@/lib/queries";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

/** Regenerated hourly so new artwork appears without a redeploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artworks, artists] = await Promise.all([getArtworks(), getArtists()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/artworks`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/artists`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...artworks.map((a) => ({
      url: `${BASE}/artworks/${a.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...artists.map((a) => ({
      url: `${BASE}/artists/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
