"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HelloAssoAssociation {
  id: number;
  nom: string;
  client_id: string;
  client_secret: string;
  api_base: string;
  organisation_slug: string;
  active: boolean;
  disciplines_count?: number;
  disciplines?: { id: number; key: string; name: string }[];
}

interface Discipline {
  id: number;
  key: string;
  name: string;
  helloasso_association?: {
    id: number;
    nom: string;
    active: boolean;
  } | null;
}

export default function HelloAssoConfigPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "coach">("admin");
  
  const [associations, setAssociations] = useState<HelloAssoAssociation[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [selectedAssoc, setSelectedAssoc] = useState<HelloAssoAssociation | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  
  const [formData, setFormData] = useState({
    nom: "",
    client_id: "",
    client_secret: "",
    api_base: "https://api.helloasso-sandbox.com",
    organisation_slug: "",
    active: true,
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    try {
      const user = JSON.parse(raw);
      if (user.role !== "admin" && user.role !== "coach") { 
        router.replace("/"); 
        return; 
      }
      setUserRole(user.role);
    } catch {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  function loadData() {
    setLoading(true);
    setError("");
    
    Promise.all([
      fetch("/api/helloasso-associations").then((r) => r.json()),
      userRole === "admin" 
        ? fetch("/api/disciplines").then((r) => r.json())
        : fetch("/api/coach/mes-disciplines").then((r) => r.json()),
    ])
      .then(([assocData, disciplineData]) => {
        console.log("🔍 DEBUG disciplines reçues:", disciplineData.disciplines);
        setAssociations(assocData.associations ?? []);
        setDisciplines(disciplineData.disciplines ?? []);
      })
      .catch((err) => setError("Erreur lors du chargement des données"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (ready) loadData();
  }, [ready, userRole]);

  async function handleCreateAssociation() {
    if (!formData.nom || !formData.client_id || !formData.client_secret) {
      setError("Nom, Client ID et Client Secret sont obligatoires");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/helloasso-associations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création");
        return;
      }
      
      setSuccess("Association créée avec succès !");
      setShowCreateModal(false);
      setFormData({
        nom: "",
        client_id: "",
        client_secret: "",
        api_base: "https://api.helloasso-sandbox.com",
        organisation_slug: "",
        active: true,
      });
      loadData();
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateAssociation() {
    if (!selectedAssoc) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/helloasso-associations/${selectedAssoc.id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Erreur lors de la modification");
        return;
      }
      
      setSuccess("Association modifiée avec succès !");
      setShowEditModal(false);
      setSelectedAssoc(null);
      loadData();
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAssociation(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette association ?")) return;

    try {
      const res = await fetch(`/api/helloasso-associations/${id}/delete`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Erreur lors de la suppression");
        return;
      }
      
      setSuccess("Association supprimée avec succès !");
      loadData();
    } catch (err) {
      setError("Erreur réseau");
    }
  }

  async function handleAssignAssociation(disciplineId: number, associationId: number | null) {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/disciplines/${disciplineId}/assign-association`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ association_id: associationId }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'assignation");
        return;
      }
      
      setSuccess(associationId ? "Association assignée !" : "Association retirée !");
      setShowAssignModal(false);
      setSelectedDiscipline(null);
      loadData();
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(assoc: HelloAssoAssociation) {
    setSelectedAssoc(assoc);
    setFormData({
      nom: assoc.nom,
      client_id: assoc.client_id,
      client_secret: assoc.client_secret,
      api_base: assoc.api_base,
      organisation_slug: assoc.organisation_slug,
      active: assoc.active,
    });
    setShowEditModal(true);
    setError("");
  }

  function openAssignModal(discipline: Discipline) {
    setSelectedDiscipline(discipline);
    setShowAssignModal(true);
    setError("");
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-300">
              Configuration HelloAsso
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              {userRole === "admin" 
                ? "Gérez les associations HelloAsso et assignez-les aux disciplines"
                : "Gérez les associations HelloAsso de vos disciplines"}
            </p>
          </div>
          
          {userRole === "admin" && (
            <button
              onClick={() => {
                setFormData({
                  nom: "",
                  client_id: "",
                  client_secret: "",
                  api_base: "https://api.helloasso-sandbox.com",
                  form_slug: "",
                  organisation_slug: "",
                  active: true,
                });
                setShowCreateModal(true);
                setError("");
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + Nouvelle association
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-20">Chargement…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Associations */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                Associations HelloAsso ({associations.length})
              </h2>
              
              {associations.length === 0 ? (
                <div className="bg-gray-900 rounded-2xl p-8 text-center text-gray-500">
                  {userRole === "admin" 
                    ? "Aucune association. Créez-en une pour commencer."
                    : "Aucune association accessible."}
                </div>
              ) : (
                <div className="space-y-3">
                  {associations.map((assoc) => (
                    <div
                      key={assoc.id}
                      className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{assoc.nom}</h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                assoc.active
                                  ? "bg-green-900/40 text-green-400"
                                  : "bg-gray-700 text-gray-400"
                              }`}
                            >
                              {assoc.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          
                          <div className="mt-2 space-y-1 text-xs text-gray-400">
                            <div>
                              <span className="text-gray-500">Org:</span> {assoc.organisation_slug || "—"}
                            </div>
                            <div>
                              <span className="text-gray-500">API:</span>{" "}
                              {assoc.api_base.includes("sandbox") ? "Sandbox" : "Production"}
                            </div>
                            <div className="text-indigo-400">
                              {assoc.disciplines_count || 0} discipline(s)
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(assoc)}
                            className="text-indigo-400 hover:text-indigo-300 text-sm px-3 py-1 border border-indigo-700 hover:border-indigo-600 rounded transition"
                          >
                            Modifier
                          </button>
                          
                          {userRole === "admin" && (
                            <button
                              onClick={() => handleDeleteAssociation(assoc.id)}
                              className="text-red-400 hover:text-red-300 text-sm px-3 py-1 border border-red-700 hover:border-red-600 rounded transition"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Disciplines */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                Disciplines ({disciplines.length})
              </h2>
              
              {disciplines.length === 0 ? (
                <div className="bg-gray-900 rounded-2xl p-8 text-center text-gray-500">
                  {userRole === "admin" 
                    ? "Aucune discipline."
                    : "Aucune discipline assignée."}
                </div>
              ) : (
                <div className="space-y-3">
                  {disciplines.map((discipline) => (
                    <div
                      key={discipline.id}
                      className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{discipline.name}</h3>
                          
                          <div className="mt-2 text-sm">
                            {discipline.helloasso_association ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    discipline.helloasso_association.active
                                      ? "bg-green-900/40 text-green-400"
                                      : "bg-red-900/40 text-red-400"
                                  }`}
                                >
                                  {discipline.helloasso_association.nom}
                                </span>
                                {!discipline.helloasso_association.active && (
                                  <span className="text-xs text-red-400">⚠️ Inactive</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-amber-400 text-xs">
                                ⚠️ Aucune association configurée
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => openAssignModal(discipline)}
                          className="text-indigo-400 hover:text-indigo-300 text-sm px-3 py-1 border border-indigo-700 hover:border-indigo-600 rounded transition"
                        >
                          {discipline.helloasso_association ? "Changer" : "Assigner"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Create Association */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white">Nouvelle association HelloAsso</h2>
              
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nom de l'association *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Ex: MMA Fontainebleau"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Client ID *
                  </label>
                  <input
                    type="text"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm"
                    placeholder="Récupérez-le sur HelloAsso"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Client Secret *
                  </label>
                  <input
                    type="password"
                    value={formData.client_secret}
                    onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm"
                    placeholder="Récupérez-le sur HelloAsso"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    API Base URL
                  </label>
                  <select
                    value={formData.api_base}
                    onChange={(e) => setFormData({ ...formData, api_base: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="https://api.helloasso-sandbox.com">
                      Sandbox (test)
                    </option>
                    <option value="https://api.helloasso.com">
                      Production
                    </option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Organisation Slug
                  </label>
                  <input
                    type="text"
                    value={formData.organisation_slug}
                    onChange={(e) => setFormData({ ...formData, organisation_slug: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Ex: mma-fontainebleau"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Visible dans l'URL de votre page HelloAsso
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="active" className="text-sm text-gray-300">
                    Association active
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateAssociation}
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  {submitting ? "Création..." : "Créer l'association"}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-lg text-gray-300 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Association */}
        {showEditModal && selectedAssoc && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white">
                Modifier {selectedAssoc.nom}
              </h2>
              
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nom de l'association
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={formData.client_secret}
                    onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm"
                    placeholder="••••••••"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    API Base URL
                  </label>
                  <select
                    value={formData.api_base}
                    onChange={(e) => setFormData({ ...formData, api_base: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="https://api.helloasso-sandbox.com">
                      Sandbox (test)
                    </option>
                    <option value="https://api.helloasso.com">
                      Production
                    </option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Organisation Slug
                  </label>
                  <input
                    type="text"
                    value={formData.organisation_slug}
                    onChange={(e) => setFormData({ ...formData, organisation_slug: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="edit-active" className="text-sm text-gray-300">
                    Association active
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateAssociation}
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  {submitting ? "Modification..." : "Enregistrer"}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAssoc(null);
                  }}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-lg text-gray-300 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Assign Association */}
        {showAssignModal && selectedDiscipline && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-lg w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Assigner une association à {selectedDiscipline.name}
              </h2>
              
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Sélectionnez l'association HelloAsso pour cette discipline :
                </p>
                
                {associations.length === 0 ? (
                  <div className="text-sm text-gray-500 py-4">
                    Aucune association disponible. Créez-en une d'abord.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {/* Option: Retirer l'association */}
                    {selectedDiscipline.helloasso_association && (
                      <button
                        onClick={() => handleAssignAssociation(selectedDiscipline.id, null)}
                        disabled={submitting}
                        className="w-full text-left bg-red-900/30 border border-red-700 hover:border-red-600 rounded-lg px-4 py-3 text-red-300 transition"
                      >
                        <div className="font-medium">Retirer l'association</div>
                        <div className="text-xs text-red-400 mt-1">
                          Les adhésions ne pourront plus être créées
                        </div>
                      </button>
                    )}
                    
                    {associations.map((assoc) => (
                      <button
                        key={assoc.id}
                        onClick={() => handleAssignAssociation(selectedDiscipline.id, assoc.id)}
                        disabled={submitting}
                        className={`w-full text-left border rounded-lg px-4 py-3 transition ${
                          selectedDiscipline.helloasso_association?.id === assoc.id
                            ? "bg-indigo-900/40 border-indigo-600"
                            : "bg-gray-800 border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-white">{assoc.nom}</div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              assoc.active
                                ? "bg-green-900/40 text-green-400"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {assoc.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {assoc.organisation_slug || "Pas d'organisation configurée"}
                        </div>
                        {selectedDiscipline.helloasso_association?.id === assoc.id && (
                          <div className="text-xs text-indigo-400 mt-2">✓ Actuellement assignée</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedDiscipline(null);
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-lg text-gray-300 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
