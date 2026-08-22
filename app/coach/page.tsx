"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PANELS = [
  {
    href: "/coach/dashboard",
    title: "Dashboard Financier",
    description: "Suivi des revenus HelloAsso, espèces et chèques avec statistiques détaillées par discipline.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "indigo",
  },
  {
    href: "/coach/disciplines",
    title: "Gestion des disciplines",
    description: "Gérer les horaires, tarifs et description de vos disciplines.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    color: "rose",
  },
  {
    href: "/coach/adherents",
    title: "Utilisateurs & Adhésions",
    description: "Consulter les adhérents de vos disciplines, leurs adhésions et leurs échéances.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.916-3.519M9 20H4v-2a4 4 0 015.916-3.519M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0zM3 10a3 3 0 116 0 3 3 0 01-6 0z" />
      </svg>
    ),
    color: "sky",
  },
  {
    href: "/coach/impayes",
    title: "Impayés",
    description: "Consulter la liste des adhérents avec paiements en attente ou refusés (HelloAsso, espèces, chèques).",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "red",
  },
  {
    href: "/coach/annonces",
    title: "Annonces",
    description: "Publier des annonces pour informer vos adhérents.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    color: "amber",
  },
  {
    href: "/coach/codes-promo",
    title: "Codes promo",
    description: "Créer et gérer vos codes de réduction pour les adhésions.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    color: "emerald",
  },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-900/40 text-indigo-400 group-hover:bg-indigo-800/60",
  rose: "bg-rose-900/40 text-rose-400 group-hover:bg-rose-800/60",
  sky: "bg-sky-900/40 text-sky-400 group-hover:bg-sky-800/60",
  red: "bg-red-900/40 text-red-400 group-hover:bg-red-800/60",
  amber: "bg-amber-900/40 text-amber-400 group-hover:bg-amber-800/60",
  emerald: "bg-emerald-900/40 text-emerald-400 group-hover:bg-emerald-800/60",
  violet: "bg-violet-900/40 text-violet-400 group-hover:bg-violet-800/60",
};

export default function CoachPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "coach" && u.role !== "admin") {
        router.replace("/");
        return;
      }
      setUserName(`${u.prenom} ${u.nom}`);
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
          <p className="text-sm text-gray-500 mb-1">Connecté en tant que coach — {userName}</p>
          <h1 className="text-3xl font-extrabold text-white">Espace coach</h1>
          <p className="text-gray-400 mt-1 text-sm">Sélectionnez une section à gérer.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PANELS.map((panel) => (
            <Link
              key={panel.href}
              href={panel.href}
              className="group bg-gray-900 hover:bg-gray-800 rounded-2xl p-6 flex flex-col gap-4 shadow-lg transition"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${colorMap[panel.color]}`}>
                {panel.icon}
              </div>
              <div>
                <h2 className="font-semibold text-white text-base">{panel.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{panel.description}</p>
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
