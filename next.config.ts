import type { NextConfig } from "next";

import { securityHeaders } from "./src/shared/security-headers";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        headers: securityHeaders.map((header) => ({ ...header })),
        source: "/:path*",
      },
    ];
  },
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
