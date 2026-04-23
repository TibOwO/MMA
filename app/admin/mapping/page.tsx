"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Discipline {
  key: string;
  name: string;
}

interface HelloAssoMapping {
  id: number;
  helloasso_label: string;
  discipline_key: string;
  discipline_name: string;
  groupe: string;
  actif: boolean;
}

export default function AdminHelloAssoMappingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mappings, setMappings] = useState<HelloAssoMapping[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create panel
  const [showCreate, setShowCreate] = useState(false);
  const [createLabel, setCreateLabel] = useState("");
  const [createDisciplineKey, setCreateDisciplineKey] = useState("");
  const [createGroupe, setCreateGroupe] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit panel
  const [editId, setEditId] = useState<number | null>(null);
  const [editGroupe, setEditGroupe] = useState("");
  const [editDisciplineKey, setEditDisciplineKey] = useState("");
  const [editActif, setEditActif] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "admin") {
        router.replace("/");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/helloasso-mappings").then((r) => r.json()),
      fetch("/api/disciplines").then((r) => r.json()),
    ])
      .then(([md, dd]) => {
        setMappings(md.mappings ?? []);
        setDisciplines(dd.disciplines ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (ready) loadData();
  }, [ready]);

  function openCreate() {
    setShowCreate(true);
    setCreateLabel("");
    setCreateDisciplineKey("");
    setCreateGroupe("");
    setCreateError("");
  }

  function closeCreate() {
    setShowCreate(false);
    setCreateLabel("");
    setCreateDisciplineKey("");
    setCreateGroupe("");
    setCreateError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/admin/helloasso-mappings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          helloasso_label: createLabel,
          discipline_key: createDisciplineKey,
          groupe: createGroupe,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCreateError(data.error || "Erreur lors de la création.");
        return;
      }
      setMappings([...mappings, data]);
      closeCreate();
    } catch (err) {
      setCreateError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  function openEdit(m: HelloAssoMapping) {
    setEditId(m.id);
    setEditGroupe(m.groupe);
    setEditDisciplineKey(m.discipline_key);
    setEditActif(m.actif);
    setSaveError("");
    setSaveOk(false);
  }

  async function handleSave() {
    if (!editId) return;
    setSaving(true);
    setSaveError("");
    setSaveOk(false);
    try {
      const res = await fetch(`/api/admin/helloasso-mappings/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupe: editGroupe,
          discipline_key: editDisciplineKey,
          actif: editActif,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveError(data.error || "Erreur lors de la sauvegarde.");
        return;
      }
      setMappings(
        mappings.map((m) =>
          m.id === editId
            ? {
                ...m,
                groupe: data.groupe,
                discipline_key: data.discipline_key,
                discipline_name: data.discipline_name,
                actif: data.actif,
              }
            : m
        )
      );
      setSaveOk(true);
      setEditId(null);
      setTimeout(() => setSaveOk(false), 3000);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function closeEdit() {
    setEditId(null);
    setSaveError("");
    setSaveOk(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/helloasso-mappings/${deleteId}/delete`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Erreur lors de la suppression.");
        return;
      }
      setMappings(mappings.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  const filtered = mappings.filter(
    (m) =>
      m.helloasso_label.toLowerCase().includes(search.toLowerCase()) ||
      m.discipline_name.toLowerCase().includes(search.toLowerCase()) ||
      m.groupe.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Mappings HelloAsso
            </h1>
            <p className="text-gray-400">
              Gérez la correspondance entre les libellés HelloAsso et vos
              disciplines
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition"
          >
            + Ajouter
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher par label, discipline ou groupe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Mappings Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              Aucun mapping trouvé
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                    Label HelloAsso
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                    Discipline
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                    Groupe
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-3 text-sm font-mono text-gray-300">
                      {m.helloasso_label}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-300">
                      {m.discipline_name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-300">
                      {m.groupe}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          m.actif
                            ? "bg-green-900 text-green-200"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {m.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => openEdit(m)}
                        className="text-blue-400 hover:text-blue-300 mr-4 transition"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => setDeleteId(m.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Ajouter un mapping
              </h2>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Label HelloAsso *
                  </label>
                  <input
                    type="text"
                    value={createLabel}
                    onChange={(e) => setCreateLabel(e.target.value)}
                    placeholder="Ex: MMA Adultes 2025-2026"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Discipline *
                  </label>
                  <select
                    value={createDisciplineKey}
                    onChange={(e) => setCreateDisciplineKey(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Choisir une discipline...</option>
                    {disciplines.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Groupe *
                  </label>
                  <input
                    type="text"
                    value={createGroupe}
                    onChange={(e) => setCreateGroupe(e.target.value)}
                    placeholder="Ex: adultes, ados, competition"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {createError && (
                  <div className="bg-red-900/30 border border-red-700 rounded p-3 text-red-200 text-sm">
                    {createError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeCreate}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded font-semibold transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded font-semibold transition"
                  >
                    {creating ? "Création..." : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editId !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Éditer le mapping
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Label HelloAsso (non modifiable)
                  </label>
                  <input
                    type="text"
                    value={
                      mappings.find((m) => m.id === editId)?.helloasso_label ||
                      ""
                    }
                    disabled
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Discipline
                  </label>
                  <select
                    value={editDisciplineKey}
                    onChange={(e) => setEditDisciplineKey(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                  >
                    {disciplines.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Groupe
                  </label>
                  <input
                    type="text"
                    value={editGroupe}
                    onChange={(e) => setEditGroupe(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={editActif}
                    onChange={(e) => setEditActif(e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 cursor-pointer"
                  />
                  <label
                    htmlFor="actif"
                    className="text-sm font-semibold text-gray-300 cursor-pointer"
                  >
                    Actif
                  </label>
                </div>

                {saveError && (
                  <div className="bg-red-900/30 border border-red-700 rounded p-3 text-red-200 text-sm">
                    {saveError}
                  </div>
                )}

                {saveOk && (
                  <div className="bg-green-900/30 border border-green-700 rounded p-3 text-green-200 text-sm">
                    Sauvegardé avec succès !
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeEdit}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded font-semibold transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold transition"
                  >
                    {saving ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Confirmer la suppression
              </h2>
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer ce mapping ? Cette action est
                irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded font-semibold transition"
                >
                  {deleting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
