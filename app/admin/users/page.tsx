"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Discipline {
  key: string;
  name: string;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  disciplines: string[];
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  coach: "Coach",
  membre: "Membre",
};

const ROLE_COLOR: Record<string, string> = {
  admin: "bg-violet-800 text-violet-200",
  coach: "bg-teal-800 text-teal-200",
  membre: "bg-gray-700 text-gray-300",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit panel
  const [editId, setEditId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState("membre");
  const [editDisciplines, setEditDisciplines] = useState<string[]>([]);
  const [editTelephone, setEditTelephone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "admin") { router.replace("/"); return; }
    } catch { router.replace("/login"); return; }
    setReady(true);
  }, [router]);

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/disciplines").then((r) => r.json()),
    ]).then(([ud, dd]) => {
      setUsers(ud.users ?? []);
      setDisciplines(dd.disciplines ?? []);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { if (ready) loadData(); }, [ready]);

  function openEdit(u: User) {
    setEditId(u.id);
    setEditRole(u.role);
    setEditDisciplines(u.disciplines);
    setEditTelephone(u.telephone);
    setSaveError("");
    setSaveOk(false);
  }

  function toggleDiscipline(key: string) {
    setEditDisciplines((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleSave() {
    if (!editId) return;
    setSaving(true);
    setSaveError("");
    setSaveOk(false);
    try {
      const res = await fetch(`/api/admin/users/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole, disciplines: editDisciplines, telephone: editTelephone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveError(data.error ?? "Erreur");
      } else {
        setSaveOk(true);
        loadData();
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  if (!ready) return null;

  const editUser = editId ? users.find((u) => u.id === editId) : null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition">← Retour à l&apos;administration</a>
          <h1 className="text-3xl font-extrabold text-white mt-2">Gestion des utilisateurs</h1>
          <p className="text-gray-400 mt-1 text-sm">Attribuer les rôles coach, affecter les disciplines, gérer les coordonnées.</p>
        </div>

        {/* Edit panel */}
        {editUser && (
          <div className="bg-gray-900 border border-indigo-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white text-lg">
                {editUser.prenom} {editUser.nom}
                <span className="ml-2 text-sm text-gray-400 font-normal">{editUser.email}</span>
              </h2>
              <button onClick={() => setEditId(null)} className="text-gray-500 hover:text-white text-xl leading-none transition">×</button>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Rôle</label>
              <div className="flex gap-2">
                {["membre", "coach", "admin"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setEditRole(r)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                      editRole === r
                        ? ROLE_COLOR[r]
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {ROLE_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>

            {/* Telephone */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Téléphone <span className="text-gray-600">(affiché sur la page du sport)</span></label>
              <input
                value={editTelephone}
                onChange={(e) => setEditTelephone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 placeholder-gray-600 rounded-xl px-4 py-2.5 transition max-w-xs"
              />
            </div>

            {/* Disciplines */}
            {editRole === "coach" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Disciplines enseignées</label>
                <div className="flex flex-wrap gap-2">
                  {disciplines.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => toggleDiscipline(d.key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        editDisciplines.includes(d.key)
                          ? "bg-teal-700 text-teal-100"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {saveError && <p className="text-red-400 text-xs">{saveError}</p>}
            {saveOk && <p className="text-emerald-400 text-xs">Enregistré ✓</p>}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm"
              >
                {saving ? "…" : "Enregistrer"}
              </button>
              <button
                onClick={() => setEditId(null)}
                className="text-gray-400 hover:text-white border border-gray-700 px-5 py-2.5 rounded-xl transition text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Filters + list */}
        <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-4">
            <h2 className="font-semibold text-white shrink-0">
              Membres <span className="text-indigo-400 font-bold">{users.length}</span>
            </h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="flex-1 bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 placeholder-gray-500 rounded-lg px-3 py-1.5 transition"
            />
            <button onClick={loadData} className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition shrink-0">
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500 text-sm">Chargement…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-sm">Aucun résultat.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between gap-4 px-6 py-3 hover:bg-gray-800/40 transition cursor-pointer ${editId === u.id ? "bg-indigo-950/30" : ""}`}
                  onClick={() => openEdit(u)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{u.prenom} {u.nom}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_COLOR[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    {u.role === "coach" && u.disciplines.length > 0 && (
                      <p className="text-xs text-teal-400 mt-0.5">{u.disciplines.join(", ")}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">Modifier →</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
