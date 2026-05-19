"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Adherent {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  saison: string;
  statut: string;
  discipline: string;
  discipline_key: string;
  code_zk: number | null;
  date_expiration: string | null;
}

interface Discipline {
  key: string;
  name: string;
}

export default function CoachAdherentsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [adherents, setAdherents] = useState<Adherent[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "coach" && u.role !== "admin") { router.replace("/"); return; }
    } catch { router.replace("/login"); return; }
    setReady(true);
  }, [router]);

  function loadData() {
    setLoading(true);
    
    // Charger les disciplines du coach
    fetch("/api/coach/mes-disciplines")
      .then((r) => r.json())
      .then((data) => {
        setDisciplines(data.disciplines ?? []);
      });

    // Charger les adhérents
    fetch("/api/coach/mes-adherents")
      .then((r) => r.json())
      .then((data) => {
        setAdherents(data.adherents ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (ready) loadData(); }, [ready]);

  if (!ready) return null;

  const filteredAdherents = selectedDiscipline === "all"
    ? adherents
    : adherents.filter(a => a.discipline_key === selectedDiscipline);

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Mes adhérents</h1>
            <p className="text-gray-400 mt-1 text-sm">Consultez les adhérents inscrits à vos disciplines.</p>
          </div>
          
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-gray-300 transition"
          >
            ← Retour
          </button>
        </div>

        {/* Filtre discipline */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <label className="text-sm font-medium text-gray-300 mb-2 block">Filtrer par discipline</label>
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Toutes mes disciplines</option>
            {disciplines.map((d) => (
              <option key={d.key} value={d.key}>{d.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            {filteredAdherents.length} adhérent{filteredAdherents.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Liste des adhérents */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Chargement…</div>
        ) : filteredAdherents.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center text-gray-500">
            Aucun adhérent trouvé.
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr className="text-xs text-gray-400">
                  <th className="text-left px-6 py-3 font-medium">Nom</th>
                  <th className="text-left px-6 py-3 font-medium">Email</th>
                  <th className="text-left px-6 py-3 font-medium">Discipline</th>
                  <th className="text-left px-6 py-3 font-medium">Saison</th>
                  <th className="text-left px-6 py-3 font-medium">Code ZK</th>
                  <th className="text-left px-6 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdherents.map((a) => (
                  <tr key={a.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-gray-200">
                      {a.prenom} {a.nom}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{a.email}</td>
                    <td className="px-6 py-4 text-gray-300">{a.discipline}</td>
                    <td className="px-6 py-4 text-gray-400">{a.saison}</td>
                    <td className="px-6 py-4">
                      {a.code_zk ? (
                        <span className="text-indigo-400 font-mono">{a.code_zk}</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          a.statut === "actif"
                            ? "bg-green-900/40 text-green-400"
                            : a.statut === "expire"
                            ? "bg-red-900/40 text-red-400"
                            : "bg-gray-800 text-gray-500"
                        }`}
                      >
                        {a.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
