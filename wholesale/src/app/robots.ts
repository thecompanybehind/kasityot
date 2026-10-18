import type { MetadataRoute } from "next";

/** Nothing on the wholesaler panel belongs in a search index. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
