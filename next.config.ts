import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://mma-backend-s3gu.onrender.com/api/:path*"
      },
    ];
  },
};

export default nextConfig;
