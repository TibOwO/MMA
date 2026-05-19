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
  const [editingPresentationKey, setEditingPresentationKey] = useState<string | null>(null);
  const [editedPresentation, setEditedPresentation] = useState("");
  const [savingPresentation, setSavingPresentation] = useState(false);

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
      const res = await fetch(`/api/disciplines/${encodeURIComponent(key)}/horaires`, {
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

  function startEditPresentation(key: string, currentPresentation: string) {
    setEditingPresentationKey(key);
    setEditedPresentation(currentPresentation || "");
  }

  async function handleSavePresentation(key: string) {
    setSavingPresentation(true);
    try {
      const res = await fetch(`/api/disciplines/${encodeURIComponent(key)}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentation: editedPresentation }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingPresentationKey(null);
        loadData();
      } else {
        alert(data.error || "Erreur lors de la sauvegarde");
      }
    } finally {
      setSavingPresentation(false);
    }
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Espace coach</h1>
            <p className="text-gray-400 mt-1 text-sm">Gérez les créneaux de vos disciplines.</p>
          </div>
          
          <a
            href="/admin/helloasso-config"
            className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Config HelloAsso
          </a>
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
                      {/* Description/Présentation */}
                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-300">Description</h3>
                          {editingPresentationKey !== d.key && (
                            <button
                              onClick={() => startEditPresentation(d.key, d.presentation)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                            >
                              Modifier
                            </button>
                          )}
                        </div>
                        {editingPresentationKey === d.key ? (
                          <div className="space-y-2">
                            <textarea
                              value={editedPresentation}
                              onChange={(e) => setEditedPresentation(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 min-h-[100px]"
                              placeholder="Décrivez la discipline..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSavePresentation(d.key)}
                                disabled={savingPresentation}
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white px-3 py-1 rounded transition"
                              >
                                {savingPresentation ? "Enregistrement..." : "Enregistrer"}
                              </button>
                              <button
                                onClick={() => setEditingPresentationKey(null)}
                                disabled={savingPresentation}
                                className="text-xs text-gray-400 hover:text-gray-300 transition"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            {d.presentation || <span className="italic">Aucune description</span>}
                          </p>
                        )}
                      </div>

                      {/* Horaires table */}
                      <div className="border-t border-gray-800 pt-4">
                        <h3 className="text-sm font-medium text-gray-300 mb-3">Créneaux horaires</h3>
                      {sorted.length === 0 ? (
                        <p className="text-sm text-gray-500">Aucun créneau. Ajoutez-en un ci-dessous.</p>
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
