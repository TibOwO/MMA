"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StoredUser {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  email: string;
}

export default function HeaderNav() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const router = useRouter();

  // Fonction pour charger l'utilisateur depuis localStorage
  const loadUser = () => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Chargement initial
    loadUser();

    // Écouter les changements de localStorage (connexion/déconnexion)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        loadUser();
      }
    };

    // Écouter un événement personnalisé pour les changements dans le même onglet
    const handleUserChange = () => {
      loadUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userChanged", handleUserChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userChanged", handleUserChange);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("user");
    setUser(null);
    // Déclencher l'événement pour notifier les autres composants
    window.dispatchEvent(new Event("userChanged"));
    router.push("/");
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.role === "admin" && (
          <Link
            href="/admin"
            className="text-white text-sm font-semibold px-3 py-2 rounded-full border border-white/40 hover:bg-white/10 transition"
          >
            Admin
          </Link>
        )}
        {(user.role === "coach") && (
          <Link
            href="/coach"
            className="text-white text-sm font-semibold px-3 py-2 rounded-full border border-teal-400/50 hover:bg-teal-400/10 transition"
          >
            Coach
          </Link>
        )}
        {user.role === "membre" && (
          <Link
            href="/adhesion-checkout"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Adhérer
          </Link>
        )}
        <Link
          href="/profil"
          className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition"
        >
          Mon espace
        </Link>
        <button
          onClick={handleLogout}
          className="text-white text-sm font-semibold px-3 py-2 rounded-full border border-white/40 hover:bg-white/10 transition"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  // Visiteur non connecté : rien à afficher. La connexion et l'inscription se
  // font depuis la page de connexion, qui est l'écran d'accueil hors session.
  return null;
}
