import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "ubrw5iu3hw.ufs.sh" }],
  },
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
};

export default nextConfig;
