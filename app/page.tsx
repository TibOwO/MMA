"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    fetch("/api/mon-profil")
      .then((res) => {
        if (res.status === 401) {
          // Non connecté -> rediriger vers login
          router.replace("/login");
        } else {
          // Connecté -> rediriger vers profil
          router.replace("/profil");
        }
      })
      .catch(() => {
        // En cas d'erreur, rediriger vers login
        router.replace("/login");
      });
  }, [router]);

  // Afficher un écran de chargement pendant la vérification
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-400">Chargement...</p>
      </div>
    </div>
  );
}