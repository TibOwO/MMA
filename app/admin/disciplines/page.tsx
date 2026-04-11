"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Discipline {
  key: string;
  name: string;
  helloasso_url: string;
}

export default function AdminDisciplinesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    try {
      const user = JSON.parse(raw);
      if (user.role !== "admin") { router.replace("/"); return; }
    } catch {
      router.replace("/login"); return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/disciplines")
      .then((r) => r.json())
      .then((data) => {
        const list: Discipline[] = data.disciplines ?? [];
        setDisciplines(list);
        const initial: Record<string, string> = {};
        list.forEach((d) => { initial[d.key] = d.helloasso_url ?? ""; });
        setEditing(initial);
      });
  }, [ready]);

  async function handleSave(key: string) {
    setSaving((s) => ({ ...s, [key]: true }));
    setSaved((s) => ({ ...s, [key]: false }));
    setErrors((e) => ({ ...e, [key]: "" }));
    try {
      const res = await fetch(`/api/disciplines/${key}/helloasso-url`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helloasso_url: editing[key] }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors((e) => ({ ...e, [key]: data.error ?? "Erreur inconnue" }));
      } else {
        setSaved((s) => ({ ...s, [key]: true }));
        setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 3000);
      }
    } catch (err) {
      setErrors((e) => ({ ...e, [key]: String(err) }));
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition">← Retour à l&apos;administration</a>
          <h1 className="text-3xl font-extrabold text-white mt-2">URLs HelloAsso par discipline</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Copiez l&apos;URL du widget HelloAsso depuis votre back-office HelloAsso et collez-la ci-dessous pour chaque discipline.
          </p>
        </div>

        {/* Comment obtenir l'URL */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-sm text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">Comment trouver l&apos;URL widget HelloAsso ?</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Connectez-vous sur <span className="text-white">helloasso.com</span></li>
            <li>Allez dans votre formulaire d&apos;adhésion → <strong className="text-white">Partager</strong></li>
            <li>Copiez le lien du <strong className="text-white">Widget</strong> (se termine par <code className="bg-gray-800 px-1 rounded">/widget</code>)</li>
            <li>Collez-le dans le champ ci-dessous</li>
          </ol>
        </div>

        {/* Disciplines */}
        <div className="space-y-4">
          {disciplines.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">Chargement…</p>
          )}
          {disciplines.map((d) => (
            <div key={d.key} className="bg-gray-900 rounded-2xl p-6 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white text-lg">{d.name}</h2>
                <span className="text-xs text-gray-600 font-mono bg-gray-800 px-2 py-0.5 rounded">{d.key}</span>
              </div>

              <div className="flex gap-3">
                <input
                  type="url"
                  value={editing[d.key] ?? ""}
                  onChange={(e) => {
                    setEditing((prev) => ({ ...prev, [d.key]: e.target.value }));
                    setSaved((s) => ({ ...s, [d.key]: false }));
                  }}
                  placeholder="https://www.helloasso.com/associations/…/widget"
                  className="flex-1 bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 placeholder-gray-600 rounded-xl px-4 py-2.5 transition"
                />
                <button
                  onClick={() => handleSave(d.key)}
                  disabled={saving[d.key]}
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
                >
                  {saving[d.key] ? "…" : "Enregistrer"}
                </button>
              </div>

              {errors[d.key] && (
                <p className="text-red-400 text-xs">{errors[d.key]}</p>
              )}
              {saved[d.key] && (
                <p className="text-green-400 text-xs">✓ URL enregistrée</p>
              )}

              {editing[d.key] && (
                <p className="text-xs text-gray-600 break-all">
                  Aperçu : <a href={editing[d.key]} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{editing[d.key]}</a>
                </p>
              )}
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
