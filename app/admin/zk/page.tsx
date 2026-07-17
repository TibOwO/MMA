"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Discipline {
  id: number;
  key: string;
  name: string;
  fin_saison: string;
}

export default function AdminZKPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    try {
      const user = JSON.parse(raw);
      if (user.role !== "admin") { router.replace("/"); return; }
    } catch { router.replace("/login"); return; }
    setReady(true);
  }, [router]);

  function loadDisciplines() {
    setLoading(true);
    fetch("/api/disciplines")
      .then((r) => r.json())
      .then((data) => setDisciplines(data.disciplines ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (ready) loadDisciplines(); }, [ready]);

  /**
   * Calcule le code ZK pour une discipline
   * Format: ID_discipline (3 chiffres)-année-mois
   * Exemple: 001-2026-07
   */
  function calculateZKCode(disciplineId: number): string {
    const today = new Date();
    const disciplineIdStr = String(disciplineId).padStart(3, "0");
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${disciplineIdStr}${year}${month}`;
  }

  async function handleUpdateFinSaison(key: string, finSaison: string) {
    setSaving(key);
    setError("");
    
    try {
      const res = await fetch(`/api/disciplines/${encodeURIComponent(key)}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fin_saison: finSaison }),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setError(data.error ?? "Erreur lors de la mise à jour");
      } else {
        loadDisciplines();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(null);
    }
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition">← Retour à l&apos;administration</a>
          <h1 className="text-3xl font-extrabold text-white mt-2">Codes ZK mensuel</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Les codes ZK se renouvellent chaque mois automatiquement. Format: ID_discipline-année-mois
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-200 space-y-1">
              <p className="font-semibold">Système hybride : Code dynamique par mois</p>
              <p className="text-blue-300">Chaque adhérent reçoit un code ZK calculé dynamiquement: <span className="font-mono bg-blue-900/50 px-2 py-1 rounded">ID_discipline-année-mois</span></p>
              <p className="text-blue-300">Le code change automatiquement le 1er de chaque mois pour tous les adhérents.</p>
              <p className="text-blue-300">Le QR code est généré automatiquement dans l&apos;espace membre de chaque adhérent.</p>
            </div>
          </div>
        </div>

        {/* Liste des disciplines */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : disciplines.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center text-gray-500">
            <p>Aucune discipline configurée.</p>
            <p className="text-sm mt-1">Ajoutez d&apos;abord des sports depuis la section &quot;Gestion des sports&quot;.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disciplines.map((d) => {
              const zkCode = calculateZKCode(d.id);
              return (
                <div key={d.key} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Nom discipline */}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold text-white">{d.name}</h3>
                      <p className="text-xs text-gray-500 font-mono">{d.key}</p>
                    </div>

                    {/* Code ZK calculé */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-gray-400 font-semibold">Code ZK du mois</label>
                      <div className="flex gap-2 items-center">
                        <div className="bg-gray-800 border border-gray-700 text-sm text-gray-100 rounded-lg px-3 py-2 font-mono font-bold w-full">
                          {zkCode}
                        </div>
                      </div>
                      <p className="text-xs text-green-400">✓ Calculé automatiquement</p>
                    </div>

                    {/* Fin de saison */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-gray-400 font-semibold">Date de fin de saison</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={d.fin_saison}
                          onChange={(e) => handleUpdateFinSaison(d.key, e.target.value)}
                          disabled={saving === d.key}
                          className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 rounded-lg px-3 py-2 transition w-full disabled:opacity-50"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Expiration automatique des adhésions</p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
