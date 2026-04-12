"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Horaire {
  id: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  description: string;
}

interface Discipline {
  key: string;
  name: string;
  presentation: string;
  tarif: string;
  horaires: Horaire[];
}

const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const JOURS_LABEL: Record<string, string> = {
  lundi: "Lundi", mardi: "Mardi", mercredi: "Mercredi", jeudi: "Jeudi",
  vendredi: "Vendredi", samedi: "Samedi", dimanche: "Dimanche",
};
const JOURS_ORDER = JOURS;

const EMPTY_HORAIRE = { jour: "lundi", heure_debut: "", heure_fin: "", description: "" };

export default function CoachPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [newHoraire, setNewHoraire] = useState(EMPTY_HORAIRE);
  const [addingHoraire, setAddingHoraire] = useState(false);
  const [horaireError, setHoraireError] = useState("");

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
    fetch("/api/coach/mes-disciplines")
      .then((r) => r.json())
      .then((data) => setDisciplines(data.disciplines ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (ready) loadData(); }, [ready]);

  async function handleAddHoraire(key: string) {
    if (!newHoraire.heure_debut || !newHoraire.heure_fin) {
      setHoraireError("Heure de début et de fin obligatoires.");
      return;
    }
    setAddingHoraire(true);
    setHoraireError("");
    try {
      const res = await fetch(`/api/disciplines/${key}/horaires`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHoraire),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setHoraireError(data.error ?? "Erreur");
      } else {
        setNewHoraire(EMPTY_HORAIRE);
        loadData();
      }
    } finally {
      setAddingHoraire(false);
    }
  }

  async function handleDeleteHoraire(id: number) {
    await fetch(`/api/horaires/${id}`, { method: "DELETE" });
    loadData();
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <h1 className="text-3xl font-extrabold text-white">Espace coach</h1>
          <p className="text-gray-400 mt-1 text-sm">Gérez les créneaux de vos disciplines.</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Chargement…</div>
        ) : disciplines.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center text-gray-500">
            Aucune discipline ne vous est assignée. Contactez un administrateur.
          </div>
        ) : (
          <div className="space-y-4">
            {disciplines.map((d) => {
              const sorted = [...d.horaires].sort(
                (a, b) => JOURS_ORDER.indexOf(a.jour) - JOURS_ORDER.indexOf(b.jour)
              );
              const isOpen = openKey === d.key;
              return (
                <div key={d.key} className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
                  {/* Header */}
                  <button
                    onClick={() => { setOpenKey(isOpen ? null : d.key); setHoraireError(""); setNewHoraire(EMPTY_HORAIRE); }}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition text-left"
                  >
                    <div>
                      <span className="font-semibold text-white text-lg">{d.name}</span>
                      {d.tarif && <span className="ml-3 text-sm text-emerald-400">{d.tarif}</span>}
                      <span className="ml-3 text-xs text-gray-500">{d.horaires.length} créneau{d.horaires.length !== 1 ? "x" : ""}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-800">
                      {/* Horaires table */}
                      {sorted.length === 0 ? (
                        <p className="text-sm text-gray-500 pt-4">Aucun créneau. Ajoutez-en un ci-dessous.</p>
                      ) : (
                        <table className="w-full text-sm mt-4">
                          <thead>
                            <tr className="text-xs text-gray-400">
                              <th className="text-left pb-2 font-medium">Jour</th>
                              <th className="text-left pb-2 font-medium">Horaire</th>
                              <th className="text-left pb-2 font-medium">Détail</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {sorted.map((h) => (
                              <tr key={h.id} className="border-t border-gray-800">
                                <td className="py-2 capitalize text-gray-200">{JOURS_LABEL[h.jour] ?? h.jour}</td>
                                <td className="py-2 text-gray-200">{h.heure_debut} – {h.heure_fin}</td>
                                <td className="py-2 text-gray-400">{h.description}</td>
                                <td className="py-2 text-right">
                                  <button
                                    onClick={() => handleDeleteHoraire(h.id)}
                                    className="text-xs text-red-400 hover:text-red-300 transition"
                                  >
                                    Supprimer
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* Add form */}
                      <div className="pt-3 border-t border-gray-800">
                        <p className="text-xs text-gray-400 mb-2 font-medium">Ajouter un créneau</p>
                        <div className="flex flex-wrap gap-2 items-end">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-xs text-gray-500">Jour</label>
                            <select
                              value={newHoraire.jour}
                              onChange={(e) => setNewHoraire((h) => ({ ...h, jour: e.target.value }))}
                              className="bg-gray-800 border border-gray-700 text-sm text-gray-100 rounded-lg px-3 py-2 focus:outline-none"
                            >
                              {JOURS.map((j) => <option key={j} value={j}>{JOURS_LABEL[j]}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-xs text-gray-500">Début</label>
                            <input
                              type="time"
                              value={newHoraire.heure_debut}
                              onChange={(e) => setNewHoraire((h) => ({ ...h, heure_debut: e.target.value }))}
                              className="bg-gray-800 border border-gray-700 text-sm text-gray-100 rounded-lg px-3 py-2 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-xs text-gray-500">Fin</label>
                            <input
                              type="time"
                              value={newHoraire.heure_fin}
                              onChange={(e) => setNewHoraire((h) => ({ ...h, heure_fin: e.target.value }))}
                              className="bg-gray-800 border border-gray-700 text-sm text-gray-100 rounded-lg px-3 py-2 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-xs text-gray-500">Détail (optionnel)</label>
                            <input
                              value={newHoraire.description}
                              onChange={(e) => setNewHoraire((h) => ({ ...h, description: e.target.value }))}
                              placeholder="Adultes, Enfants…"
                              className="bg-gray-800 border border-gray-700 text-sm text-gray-100 rounded-lg px-3 py-2 focus:outline-none placeholder-gray-600"
                            />
                          </div>
                          <button
                            onClick={() => handleAddHoraire(d.key)}
                            disabled={addingHoraire}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
                          >
                            {addingHoraire ? "…" : "Ajouter"}
                          </button>
                        </div>
                        {horaireError && <p className="text-red-400 text-xs mt-1">{horaireError}</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
