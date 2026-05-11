import type { NextConfig } from "next";

// ==============================================================================
// Configuration de l'URL du backend Django
// ==============================================================================
// Priorité :
// 1. NEXT_PUBLIC_API_URL (depuis .env.local ou variables Vercel)
// 2. Fallback basé sur NODE_ENV si non définie

const BACKEND =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://mma-backend-s3gu.onrender.com"  // Changez pour Alwaysdata en prod
    : "http://localhost:8000");

console.log(`🔗 Backend API configuré : ${BACKEND}`);

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

// ==============================================================================
// NOTES :
// ==============================================================================
// - NODE_ENV est automatiquement définie par Next.js :
//   → npm run dev = "development"
//   → npm run build / Vercel = "production"
//
// - En DÉVELOPPEMENT :
//   → Créez .env.local avec NEXT_PUBLIC_API_URL=http://localhost:8000
//   → Démarrez le backend Django : python manage.py runserver
//
// - En PRODUCTION (Vercel) :
//   → Configurez NEXT_PUBLIC_API_URL dans Settings → Environment Variables
//   → Valeur : https://votre-compte.alwaysdata.net
// ==============================================================================