"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DisciplineWithCodes {
  id: number;
  key: string;
  name: string;
  codes: Record<number, string> | null;
  has_monthly: boolean;
}

interface ZKCodesState {
  [disciplineId: number]: Record<number, string>;
}

// Mois pour l'affichage (index 0 = janvier = mois 1)
const MONTHS_DISPLAY = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function AdminZKCodesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [disciplines, setDisciplines] = useState<DisciplineWithCodes[]>([]);
  const [codes, setCodes] = useState<ZKCodesState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Vérifier que c'est un admin
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "admin") { router.replace("/"); return; }
    } catch { router.replace("/login"); return; }
    setReady(true);
  }, [router]);

  // Charger les codes ZK
  function loadCodes() {
    setLoading(true);
    fetch(`/api/admin/zk-codes/batch?year=${year}`)
      .then((r) => r.json())
      .then((data) => {
        setDisciplines(data.disciplines ?? []);
        
        // Initialiser l'état des codes avec les clés numériques
        const newCodes: ZKCodesState = {};
        (data.disciplines ?? []).forEach((d: DisciplineWithCodes) => {
          if (d.codes) {
            // Convertir les clés en nombres si elles sont des strings
            const numericCodes: Record<number, string> = {};
            Object.entries(d.codes).forEach(([key, value]) => {
              const monthNum = parseInt(key, 10);
              if (!isNaN(monthNum)) {
                numericCodes[monthNum] = value as string;
              }
            });
            newCodes[d.id] = numericCodes;
          } else {
            newCodes[d.id] = {};
          }
        });
        setCodes(newCodes);
      })
      .catch((e) => {
        console.error(e);
        setSaveStatus({ type: "error", message: "Erreur lors du chargement des codes" });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (ready) loadCodes();
  }, [ready, year]);

  function updateCode(disciplineId: number, monthNumber: number, value: string) {
    setCodes((prev) => ({
      ...prev,
      [disciplineId]: {
        ...(prev[disciplineId] || {}),
        [monthNumber]: value,
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus({ type: null, message: "" });

    try {
      // Préparer les données à envoyer
      const disciplinesData = disciplines.map((d) => ({
        discipline_id: d.id,
        codes: codes[d.id] || {},
      }));

      const res = await fetch("/api/admin/zk-codes/batch/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          disciplines: disciplinesData,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSaveStatus({
          type: "error",
          message: data.message || "Erreur lors de l'enregistrement",
        });
      } else {
        setSaveStatus({
          type: "success",
          message: `${data.updated_count} discipline(s) mise(s) à jour pour ${year}`,
        });
        // Recharger après 2 secondes
        setTimeout(() => loadCodes(), 2000);
      }
    } catch (e: any) {
      setSaveStatus({
        type: "error",
        message: e.message || "Erreur serveur",
      });
    } finally {
      setSaving(false);
    }
  }

  async function fillAllCodes(disciplineId: number) {
    try {
      const response = await fetch(`/api/admin/zk-codes/generate?discipline_id=${disciplineId}&year=${year}`);
      const data = await response.json();
      
      if (data.success) {
        setCodes((prev) => ({
          ...prev,
          [disciplineId]: data.codes,
        }));
      } else {
        setSaveStatus({ type: "error", message: data.error || "Erreur lors de la génération des codes" });
      }
    } catch (error) {
      setSaveStatus({ type: "error", message: "Erreur lors de la génération des codes" });
    }
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition">
            ← Retour à l'administration
          </a>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            Gestion des codes ZK mensuels
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Configurez les 12 codes QR mensuels pour chaque discipline. Les codes changent automatiquement chaque mois.
          </p>
        </div>

        {/* Année et actions */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">Année:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 rounded-lg px-3 py-2 transition w-32"
            />
            <span className="text-xs text-gray-500 ml-4">
              Saison: {year - 1}-{year}
            </span>
          </div>

          {saveStatus.type && (
            <div
              className={`p-3 rounded-lg text-sm ${
                saveStatus.type === "success"
                  ? "bg-green-900/30 border border-green-700 text-green-300"
                  : "bg-red-900/30 border border-red-700 text-red-300"
              }`}
            >
              {saveStatus.message}
            </div>
          )}
        </div>

        {/* Disciplines */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Chargement...</div>
          ) : disciplines.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Aucune discipline trouvée</div>
          ) : (
            disciplines.map((discipline) => (
              <div key={discipline.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                {/* En-tête discipline */}
                <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-white text-lg">{discipline.name}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Discipline: {discipline.key}
                      {discipline.has_monthly && (
                        <span className="ml-2 text-green-400">✓ Codes mensuels configurés</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => fillAllCodes(discipline.id)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    title="Générer tous les codes au format standard"
                  >
                    Générer tous
                  </button>
                </div>

                {/* Grille des codes mensuels */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MONTHS_DISPLAY.map((monthName, idx) => {
                    const monthNumber = idx + 1;

                    return (
                      <div key={monthNumber} className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400 font-medium">
                          {monthName}
                        </label>
                        <input
                          type="text"
                          value={codes[discipline.id]?.[monthNumber] || ""}
                          onChange={(e) => updateCode(discipline.id, monthNumber, e.target.value)}
                          placeholder="Code généré automatiquement"
                          className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 placeholder-gray-600 rounded-lg px-3 py-2 transition font-mono"
                        />
                        <span className="text-[10px] text-gray-600">
                          Utilisez "Générer tous" pour remplir automatiquement
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 sticky bottom-4">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition"
          >
            {saving ? "Enregistrement..." : "Enregistrer tous les codes"}
          </button>
          <button
            onClick={loadCodes}
            disabled={loading}
            className="text-gray-400 hover:text-white border border-gray-700 px-6 py-3 rounded-xl transition text-sm"
          >
            Actualiser
          </button>
        </div>

        {/* Documentation */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-3">
          <h3 className="font-semibold text-white">📋 Format des codes</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>
              • <span className="text-gray-300">Format standard</span>: <code className="bg-gray-800 px-2 py-1 rounded text-indigo-300">[id_discipline][année][mois]</code>
            </p>
            <p>
              • <span className="text-gray-300">Exemple</span>: <code className="bg-gray-800 px-2 py-1 rounded text-indigo-300">001202603</code> (Judo, 2026, mars)
            </p>
            <p>
              • <span className="text-gray-300">Utilisez le bouton "Générer tous"</span> pour remplir automatiquement les 12 codes.
            </p>
            <p>
              • <span className="text-gray-300">Les codes changent automatiquement</span> chaque mois pour tous les adhérents.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
