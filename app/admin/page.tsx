"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PAGES = [
  {
    href: "/admin/helloasso",
    title: "Adhesions",
    description: "Consulter les adhésions créées automatiquement via HelloAsso.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: "indigo",
  },
  {
    href: "/coach/annonces",
    title: "Annonces",
    description: "Publier des annonces pour informer les coachs ou tous les adhérents.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    color: "amber",
  },
  {
    href: "/admin/codes-promo",
    title: "Codes promo",
    description: "Gérer tous les codes promotionnels créés par les coachs et contrôler leur utilisation.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    color: "emerald",
  },
  {
    href: "/admin/helloasso-config",
    title: "Configuration HelloAsso",
    description: "Gérer les associations HelloAsso et les assigner aux disciplines pour les paiements.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "violet",
  },
  {
    href: "/admin/sports",
    title: "Gestion des sports",
    description: "Ajouter, modifier ou supprimer les disciplines disponibles (judo, MMA, boxe…).",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    color: "rose",
  },
  {
    href: "/admin/users",
    title: "Utilisateurs",
    description: "Promouvoir des membres au rôle de coach, assigner leurs disciplines et gérer leurs coordonnées.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.916-3.519M9 20H4v-2a4 4 0 015.916-3.519M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0zM3 10a3 3 0 116 0 3 3 0 01-6 0z" />
      </svg>
    ),
    color: "sky",
  },
  {
    href: "/admin/zk",
    title: "Gestion ZK",
    description: "Configurer les pools de codes et la date de fin de saison par discipline.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4zM9 12l2 2 4-4" />
      </svg>
    ),
    color: "amber",
  },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-900/40 text-indigo-400 group-hover:bg-indigo-800/60",
  amber: "bg-amber-900/40 text-amber-400 group-hover:bg-amber-800/60",
  violet: "bg-violet-900/40 text-violet-400 group-hover:bg-violet-800/60",
  rose: "bg-rose-900/40 text-rose-400 group-hover:bg-rose-800/60",
  sky: "bg-sky-900/40 text-sky-400 group-hover:bg-sky-800/60",
  emerald: "bg-emerald-900/40 text-emerald-400 group-hover:bg-emerald-800/60",
};

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    try {
      const user = JSON.parse(raw);
      if (user.role !== "admin") { router.replace("/"); return; }
      setUserName(`${user.prenom} ${user.nom}`);
    } catch {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Connecté en tant qu&apos;admin — {userName}</p>
          <h1 className="text-3xl font-extrabold text-white">Espace administration</h1>
          <p className="text-gray-400 mt-1 text-sm">Sélectionnez une section à gérer.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="group bg-gray-900 hover:bg-gray-800 rounded-2xl p-6 flex flex-col gap-4 shadow-lg transition"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${colorMap[page.color]}`}>
                {page.icon}
              </div>
              <div>
                <h2 className="font-semibold text-white text-base">{page.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{page.description}</p>
              </div>
              <span className="text-xs text-gray-600 group-hover:text-gray-400 transition mt-auto">
                Accéder →
              </span>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
