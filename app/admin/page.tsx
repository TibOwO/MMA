"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PAGES = [
  {
    href: "/admin/helloasso",
    title: "Synchronisation HelloAsso",
    description: "Importer les commandes HelloAsso, consulter les adhésions et réassigner les codes ZK manquants.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: "indigo",
  },
  {
    href: "/admin/qrcodes",
    title: "QR Codes — Adhésions",
    description: "Générer et imprimer les QR codes à afficher dans les locaux pour chaque discipline.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
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
    href: "/admin/mapping",
    title: "Mappings HelloAsso",
    description: "Gérer les correspondances entre les labels HelloAsso et les disciplines/groupe.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 4h10M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    ),
    color: "emerald",
  },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-900/40 text-indigo-400 group-hover:bg-indigo-800/60",
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
