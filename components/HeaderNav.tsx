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

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("user");
    setUser(null);
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
    <div className="flex items-center gap-2">
      <Link
        href="/subscribe"
        className="text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/40 hover:bg-white/10 transition"
      >
        Inscription
      </Link>
      <Link
        href="/login"
        className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition"
      >
        Connexion
      </Link>
    </div>
  );
}
