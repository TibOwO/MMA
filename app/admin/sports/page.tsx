"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Discipline {
  key: string;
  name: string;
  presentation: string;
  helloasso_url: string;
}

const EMPTY_FORM = { key: "", name: "", presentation: "", helloasso_url: "" };

export default function AdminSportsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire création / édition
  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editKey, setEditKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Suppression
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError("");
    setMode("create");
  }

  function openEdit(d: Discipline) {
    setForm({ key: d.key, name: d.name, presentation: d.presentation, helloasso_url: d.helloasso_url });
    setEditKey(d.key);
    setFormError("");
    setMode("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const isCreate = mode === "create";
      const url = isCreate ? "/api/disciplines/create" : `/api/disciplines/${editKey}/edit`;
      const method = isCreate ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error ?? "Erreur inconnue");
      } else {
        setMode("idle");
        loadDisciplines();
      }
    } catch (err) {
      setFormError(String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(key: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/disciplines/${key}/delete`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeleteKey(null);
        loadDisciplines();
      }
    } finally {
      setDeleting(false);
    }
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <a href="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition">← Retour à l&apos;administration</a>
            <h1 className="text-3xl font-extrabold text-white mt-2">Gestion des sports</h1>
            <p className="text-gray-400 mt-1 text-sm">Ajouter, modifier ou supprimer les disciplines du club.</p>
          </div>
          <button
            onClick={openCreate}
            className="shrink-0 mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            + Nouveau sport
          </button>
        </div>

        {/* Formulaire création / édition */}
        {mode !== "idle" && (
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 shadow-lg space-y-4 border border-indigo-800">
            <h2 className="font-semibold text-white text-lg">
              {mode === "create" ? "Nouveau sport" : `Modifier — ${editKey}`}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mode === "create" && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Clé URL <span className="text-gray-600">(ex: judo, boxe-thai)</span></label>
                  <input
                    required
                    value={form.key}
                    onChange={(e) => setForm((f) => ({ ...f, key: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                    placeholder="judo"
                    className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 placeholder-gray-600 rounded-xl px-4 py-2.5 transition"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Nom affiché</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Judo"
                  className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 placeholder-gray-600 rounded-xl px-4 py-2.5 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Présentation</label>
              <textarea
                rows={3}
                value={form.presentation}
                onChange={(e) => setForm((f) => ({ ...f, presentation: e.target.value }))}
                placeholder="Description de la discipline…"
                className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 placeholder-gray-600 rounded-xl px-4 py-2.5 transition resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">URL widget HelloAsso</label>
              <input
                type="url"
                value={form.helloasso_url}
                onChange={(e) => setForm((f) => ({ ...f, helloasso_url: e.target.value }))}
                placeholder="https://www.helloasso.com/associations/…/widget"
                className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 placeholder-gray-600 rounded-xl px-4 py-2.5 transition"
              />
            </div>

            {formError && <p className="text-red-400 text-xs">{formError}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm"
              >
                {saving ? "…" : mode === "create" ? "Créer" : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={() => setMode("idle")}
                className="text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-5 py-2.5 rounded-xl transition text-sm"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Confirmation suppression */}
        {deleteKey && (
          <div className="bg-red-950 border border-red-800 rounded-2xl p-5 flex items-center justify-between gap-4">
            <p className="text-sm text-red-300">
              Supprimer <strong className="text-white">{deleteKey}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleDelete(deleteKey)}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
              >
                {deleting ? "…" : "Confirmer"}
              </button>
              <button
                onClick={() => setDeleteKey(null)}
                className="text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl text-sm transition"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste */}
        <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">
              Sports <span className="text-indigo-400 font-bold">{disciplines.length}</span>
            </h2>
            <button onClick={loadDisciplines} className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition">
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500 text-sm">Chargement…</div>
          ) : disciplines.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-sm">Aucun sport configuré.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {disciplines.map((d) => (
                <div key={d.key} className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-gray-800/40 transition">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{d.name}</span>
                      <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{d.key}</span>
                    </div>
                    {d.presentation && (
                      <p className="text-xs text-gray-400 truncate max-w-md">{d.presentation}</p>
                    )}
                    {d.helloasso_url ? (
                      <p className="text-xs text-indigo-400 truncate max-w-md">✓ Widget HelloAsso configuré</p>
                    ) : (
                      <p className="text-xs text-amber-500">⚠ URL HelloAsso manquante</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 mt-0.5">
                    <button
                      onClick={() => openEdit(d)}
                      className="text-xs text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => setDeleteKey(d.key)}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
