import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The models live in ../packages/core, outside this app's root. Next only
   * compiles files under the app root by default, so the shared package is
   * listed here to be transpiled along with the app's own source.
   */
  transpilePackages: ["@kasityot/core"],
  images: {
    // Product photographs are uploaded through the owner panel to Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
