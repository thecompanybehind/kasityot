import type { MetadataRoute } from "next";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Order results carry a payment reference and are per-buyer; the
      // API routes are not content. Neither belongs in an index.
      disallow: ["/api/", "/order/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
