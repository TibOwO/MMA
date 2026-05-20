"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CodePromo {
  id: number;
  code: string;
  description: string;
  type_reduction: "pourcentage" | "montant";
  valeur: number;
  actif: boolean;
  utilisations_max: number | null;
  utilisations_actuelles: number;
  discipline_key: string | null;
  discipline_name: string;
}

interface Discipline {
  key: string;
  name: string;
}

export default function CodesPromoPage() {
  const router = useRouter();
  const [codesPromo, setCodesPromo] = useState<CodePromo[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<CodePromo | null>(null);
  
  // Messages
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);
  
  // Confirmation de suppression
  const [deletingCodeId, setDeletingCodeId] = useState<number | null>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type_reduction: "pourcentage" as "pourcentage" | "montant",
    valeur: 0,
    actif: true,
    utilisations_max: null as number | null,
    discipline_key: "" as string,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les codes promo
        const codesRes = await fetch("http://localhost:8000/api/coach/codes-promo", {
          credentials: "include",
        });
        if (codesRes.ok) {
          const codesData = await codesRes.json();
          setCodesPromo(codesData.codes_promo || []);
        } else if (codesRes.status === 401) {
          router.push("/login");
          return;
        }

        // Charger les disciplines du coach
        const disciplinesRes = await fetch("http://localhost:8000/api/coach/mes-disciplines", {
          credentials: "include",
        });
        if (disciplinesRes.ok) {
          const disciplinesData = await disciplinesRes.json();
          setDisciplines(disciplinesData.disciplines || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveOk(false);

    try {
      const payload = {
        ...formData,
        discipline_key: formData.discipline_key || null,
        utilisations_max: formData.utilisations_max || null,
      };

      if (editingCode) {
        // Modifier
        const res = await fetch(`http://localhost:8000/api/coach/codes-promo/${editingCode.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSaveOk(true);
          setTimeout(() => {
            setEditingCode(null);
            setShowForm(false);
            window.location.reload();
          }, 1000);
        } else {
          const data = await res.json();
          setSaveError(data.error || "Erreur lors de la modification");
        }
      } else {
        // Créer
        const res = await fetch("http://localhost:8000/api/coach/codes-promo/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSaveOk(true);
          setTimeout(() => {
            setShowForm(false);
            window.location.reload();
          }, 1000);
        } else {
          const data = await res.json();
          setSaveError(data.error || "Erreur lors de la création");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSaveError("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (code: CodePromo) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description,
      type_reduction: code.type_reduction,
      valeur: code.valeur,
      actif: code.actif,
      utilisations_max: code.utilisations_max,
      discipline_key: code.discipline_key || "",
    });
    setSaveError("");
    setSaveOk(false);
    setShowForm(true);
  };

  const confirmDelete = (codeId: number) => {
    setDeletingCodeId(codeId);
  };

  const handleDelete = async (codeId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/coach/codes-promo/${codeId}/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setCodesPromo(codesPromo.filter((c) => c.id !== codeId));
        setDeletingCodeId(null);
      } else {
        setSaveError("Erreur lors de la suppression");
        setDeletingCodeId(null);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSaveError("Erreur lors de la suppression");
      setDeletingCodeId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      type_reduction: "pourcentage",
      valeur: 0,
      actif: true,
      utilisations_max: null,
      discipline_key: "",
    });
    setEditingCode(null);
    setShowForm(false);
    setSaveError("");
    setSaveOk(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-white">Mes codes promo</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ➕ Créer un code promo
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-gray-900 p-6 rounded-2xl shadow-md mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingCode ? "Modifier le code promo" : "Nouveau code promo"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Code promo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    disabled={!!editingCode}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2 uppercase disabled:bg-gray-700"
                    placeholder="BIENVENUE2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Discipline</label>
                  <select
                    value={formData.discipline_key}
                    onChange={(e) => setFormData({ ...formData, discipline_key: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
                  >
                    <option value="">Toutes mes disciplines</option>
                    {disciplines.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type de réduction</label>
                  <select
                    value={formData.type_reduction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type_reduction: e.target.value as "pourcentage" | "montant",
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
                  >
                    <option value="pourcentage">Pourcentage (%)</option>
                    <option value="montant">Montant fixe (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Valeur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.valeur}
                    onChange={(e) => setFormData({ ...formData, valeur: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
                    placeholder={formData.type_reduction === "pourcentage" ? "20" : "50"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Utilisations max</label>
                  <input
                    type="number"
                    value={formData.utilisations_max || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        utilisations_max: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
                    placeholder="Illimité"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="actif" className="text-sm font-medium text-gray-300">
                    Code actif
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
                  rows={2}
                  placeholder="Réduction pour les étudiants"
                />
              </div>

              {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
              {saveOk && <p className="text-emerald-400 text-sm">Enregistré ✓</p>}

              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {editingCode ? "Modifier" : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des codes */}
        <div className="bg-gray-900 rounded-2xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-3 text-gray-300">Code</th>
                <th className="text-left p-3 text-gray-300">Description</th>
                <th className="text-left p-3 text-gray-300">Réduction</th>
                <th className="text-left p-3 text-gray-300">Discipline</th>
                <th className="text-left p-3 text-gray-300">Utilisations</th>
                <th className="text-left p-3 text-gray-300">Statut</th>
                <th className="text-left p-3 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codesPromo.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-400">
                    Aucun code promo créé
                  </td>
                </tr>
              ) : (
                codesPromo.map((code) => (
                  <tr key={code.id} className="border-t border-gray-800 hover:bg-gray-800">
                    <td className="p-3 font-mono font-bold text-indigo-400">{code.code}</td>
                    <td className="p-3 text-gray-300">{code.description || "-"}</td>
                    <td className="p-3 text-gray-100">
                      {code.type_reduction === "pourcentage" ? `${code.valeur}%` : `${code.valeur}€`}
                    </td>
                    <td className="p-3 text-gray-300">{code.discipline_name}</td>
                    <td className="p-3 text-gray-300">
                      {code.utilisations_actuelles}
                      {code.utilisations_max ? ` / ${code.utilisations_max}` : " / ∞"}
                    </td>
                    <td className="p-3">
                      {code.actif ? (
                        <span className="bg-green-900/40 text-green-400 px-2 py-1 rounded text-xs">Actif</span>
                      ) : (
                        <span className="bg-gray-700 text-gray-400 px-2 py-1 rounded text-xs">Inactif</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleEdit(code)}
                        className="text-blue-400 hover:text-blue-300 hover:underline mr-2"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => confirmDelete(code.id)}
                        className="text-red-400 hover:text-red-300 hover:underline"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Message d'erreur global */}
        {saveError && !showForm && (
          <div className="mt-4 bg-red-900/40 border border-red-700 text-red-400 px-4 py-3 rounded">
            {saveError}
          </div>
        )}
      </div>
      
      {/* Modal de confirmation de suppression */}
      {deletingCodeId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">⚠️ Confirmer la suppression</h2>
            <p className="text-gray-300 mb-6">
              Voulez-vous vraiment supprimer ce code promo ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deletingCodeId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl transition"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeletingCodeId(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold px-4 py-2.5 rounded-xl transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
