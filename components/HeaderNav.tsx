"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StoredUser {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  role: string;
    email?: string;
    sport?: string | string[] | null;
    
}

export default function HeaderNav() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
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

  return (
    <Link
      href="/login"
      className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition"
    >
      Connexion
    </Link>
  );
}
