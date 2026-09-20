import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  /**
   * The models live in ../packages/core, outside this app's root. Next only
   * compiles files under the app root by default, so the shared package is
   * listed here to be transpiled along with the app's own source.
   */
  transpilePackages: ["@kasityot/core"],
  images: {
    // Artwork photography, artist portraits and hero banners are uploaded
    // through the admin panel and served from Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
