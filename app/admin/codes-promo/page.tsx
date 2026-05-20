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
  coach_nom: string;
}

export default function AdminCodesPromoPage() {
  const router = useRouter();
  const [codesPromo, setCodesPromo] = useState<CodePromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<CodePromo | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Messages
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);
  
  // Confirmation de suppression
  const [deletingCodeId, setDeletingCodeId] = useState<number | null>(null);

  // Formulaire d'édition
  const [formData, setFormData] = useState({
    actif: true,
    utilisations_max: null as number | null,
  });

  // Filtres
  const [filterActif, setFilterActif] = useState<"all" | "actif" | "inactif">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCodesPromo = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/admin/codes-promo", {
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          setCodesPromo(data.codes_promo || []);
        } else if (res.status === 401) {
          router.push("/login");
          return;
        } else if (res.status === 403) {
          setSaveError("Accès réservé aux administrateurs");
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCodesPromo();
  }, [router]);

  const handleEdit = (code: CodePromo) => {
    setEditingCode(code);
    setFormData({
      actif: code.actif,
      utilisations_max: code.utilisations_max,
    });
    setSaveError("");
    setSaveOk(false);
    setShowEditForm(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;
    setSaveError("");
    setSaveOk(false);

    try {
      const res = await fetch(`http://localhost:8000/api/coach/codes-promo/${editingCode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          actif: formData.actif,
          utilisations_max: formData.utilisations_max || null,
        }),
      });

      if (res.ok) {
        setSaveOk(true);
        setTimeout(() => {
          setShowEditForm(false);
          setEditingCode(null);
          window.location.reload();
        }, 1000);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSaveError("Erreur lors de l'enregistrement");
    }
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

  // Filtrer les codes promo
  const filteredCodes = codesPromo.filter((code) => {
    // Filtre actif/inactif
    if (filterActif === "actif" && !code.actif) return false;
    if (filterActif === "inactif" && code.actif) return false;

    // Recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        code.code.toLowerCase().includes(term) ||
        code.description.toLowerCase().includes(term) ||
        code.coach_nom.toLowerCase().includes(term) ||
        code.discipline_name.toLowerCase().includes(term)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-6">Gestion des codes promo</h1>

        {/* Filtres */}
        <div className="bg-gray-900 p-4 rounded-2xl shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Rechercher</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Code, coach, discipline..."
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Statut</label>
              <select
                value={filterActif}
                onChange={(e) => setFilterActif(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
              >
                <option value="all">Tous</option>
                <option value="actif">Actifs uniquement</option>
                <option value="inactif">Inactifs uniquement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 p-4 rounded-2xl shadow-md">
            <div className="text-2xl font-bold text-blue-400">{codesPromo.length}</div>
            <div className="text-sm text-gray-400">Total des codes</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-2xl shadow-md">
            <div className="text-2xl font-bold text-green-400">
              {codesPromo.filter((c) => c.actif).length}
            </div>
            <div className="text-sm text-gray-400">Codes actifs</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-2xl shadow-md">
            <div className="text-2xl font-bold text-purple-400">
              {codesPromo.reduce((sum, c) => sum + c.utilisations_actuelles, 0)}
            </div>
            <div className="text-sm text-gray-400">Utilisations totales</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-3 text-gray-300">Code</th>
                  <th className="text-left p-3 text-gray-300">Coach</th>
                  <th className="text-left p-3 text-gray-300">Discipline</th>
                  <th className="text-left p-3 text-gray-300">Réduction</th>
                  <th className="text-left p-3 text-gray-300">Utilisations</th>
                  <th className="text-left p-3 text-gray-300">Statut</th>
                  <th className="text-left p-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-400">
                      Aucun code promo trouvé
                    </td>
                  </tr>
                ) : (
                  filteredCodes.map((code) => (
                    <tr key={code.id} className="border-t border-gray-800 hover:bg-gray-800">
                      <td className="p-3 font-mono font-bold text-indigo-400">{code.code}</td>
                      <td className="p-3 text-gray-300">{code.coach_nom}</td>
                      <td className="p-3 text-gray-300">{code.discipline_name}</td>
                      <td className="p-3 text-gray-100">
                        {code.type_reduction === "pourcentage" ? `${code.valeur}%` : `${code.valeur}€`}
                      </td>
                      <td className="p-3 text-gray-300">
                        {code.utilisations_actuelles}
                        {code.utilisations_max ? ` / ${code.utilisations_max}` : " / ∞"}
                      </td>
                      <td className="p-3">
                        {code.actif ? (
                          <span className="bg-green-900/40 text-green-400 px-2 py-1 rounded text-xs">
                            Actif
                          </span>
                        ) : (
                          <span className="bg-gray-700 text-gray-400 px-2 py-1 rounded text-xs">
                            Inactif
                          </span>
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
        </div>

        {/* Modal d'édition */}
        {showEditForm && editingCode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Modifier le code promo</h2>
              <p className="text-gray-400 mb-4">
                Code : <span className="font-mono font-bold text-indigo-400">{editingCode.code}</span>
              </p>

              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nombre maximum d'utilisations
                  </label>
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
                    id="actif-edit"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="actif-edit" className="text-sm font-medium text-gray-300">
                    Code actif
                  </label>
                </div>

                {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
                {saveOk && <p className="text-emerald-400 text-sm">Enregistré ✓</p>}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingCode(null);
                      setSaveError("");
                      setSaveOk(false);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Message d'erreur global */}
        {saveError && !showEditForm && (
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
