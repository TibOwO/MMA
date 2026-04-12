import type { NextConfig } from "next";

const BACKEND =
  process.env.NODE_ENV === "production"
    ? "https://mma-backend-s3gu.onrender.com"
    : "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

//NODE_ENV est une variable d'environnement automatiquement définie par Next.js :

//npm run dev → Next.js la met à "development"
//npm run build / Vercel → Next.js la met à "production"