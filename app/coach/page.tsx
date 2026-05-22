"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PANELS = [
  {
    href: "/coach/disciplines",
    title: "Mes disciplines",
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
    title: "Mes adhérents",
    description: "Consulter la liste des adhérents inscrits à vos disciplines.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.916-3.519M9 20H4v-2a4 4 0 015.916-3.519M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0zM3 10a3 3 0 116 0 3 3 0 01-6 0z" />
      </svg>
    ),
    color: "sky",
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
  {
    href: "/admin/helloasso-config",
    title: "Configuration HelloAsso",
    description: "Configurer votre association HelloAsso pour les paiements.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "violet",
  },
];

const colorMap: Record<string, string> = {
  rose: "bg-rose-900/40 text-rose-400 group-hover:bg-rose-800/60",
  sky: "bg-sky-900/40 text-sky-400 group-hover:bg-sky-800/60",
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
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">Espace coach</h1>
          <p className="text-gray-400">
            Bienvenue <span className="text-indigo-400 font-medium">{userName}</span>. Choisissez un panneau de gestion ci-dessous.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PANELS.map((panel) => (
            <Link
              key={panel.href}
              href={panel.href}
              className="group bg-gray-900 hover:bg-gray-800 rounded-2xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] border border-gray-800 hover:border-gray-700"
            >
              <div className={`inline-flex p-3 rounded-xl mb-4 transition ${colorMap[panel.color]}`}>
                {panel.icon}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{panel.title}</h2>
              <p className="text-sm text-gray-400">{panel.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
