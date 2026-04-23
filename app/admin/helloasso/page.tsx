"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Adhesion {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  saison: string;
  statut: string;
  discipline: string | null;
  groupe: string;
  date_expiration: string | null;
  code_zk: number | null;
  ha_order_id: string;
}

type SyncStatus = "idle" | "loading" | "success" | "error";

export default function HelloAssoAdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncResult, setSyncResult] = useState<{ created: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [reassignStatus, setReassignStatus] = useState<SyncStatus>("idle");
  const [reassignResult, setReassignResult] = useState<{ assigned: number; skipped: number } | null>(null);
  const [reassignError, setReassignError] = useState<string | null>(null);

  useEffect(() => {
    // Vérification synchrone via localStorage — évite le flash de redirection
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    try {
      const user = JSON.parse(raw);
      if (user.role !== "admin") { router.replace("/"); return; }
    } catch {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  function loadAdhesions() {
    setLoadingList(true);
    fetch("/api/adhesions")
      .then((r) => r.json())
      .then((data) => setAdhesions(data.adhesions ?? []))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }

  useEffect(() => {
    if (!ready) return;
    loadAdhesions();
  }, [ready]);

  async function handleSync() {
    setSyncStatus("loading");
    setSyncResult(null);
    setSyncError(null);
    try {
      const res = await fetch("/api/helloasso/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSyncError(data.error ?? "Erreur inconnue");
        setSyncStatus("error");
      } else {
        setSyncResult({ created: data.created });
        setSyncStatus("success");
        loadAdhesions();
      }
    } catch (e) {
      setSyncError(String(e));
      setSyncStatus("error");
    }
  }

  async function handleReassign() {
    setReassignStatus("loading");
    setReassignResult(null);
    setReassignError(null);
    try {
      const res = await fetch("/api/adhesions/reassign-zk", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setReassignError(data.error ?? "Erreur inconnue");
        setReassignStatus("error");
      } else {
        setReassignResult({ assigned: data.assigned, skipped: data.skipped });
        setReassignStatus("success");
        loadAdhesions();
      }
    } catch (e) {
      setReassignError(String(e));
      setReassignStatus("error");
    }
  }

  if (!ready) return null;

  const manquants = adhesions.filter((a) => a.code_zk === null).length;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-300">Adhesions</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Importe les commandes HelloAsso manquantes dans la base de données.
          </p>
        </div>

        {/* Sync card */}
        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
          <div className="flex-1">
            <h2 className="font-semibold text-white text-lg">Lancer une synchronisation</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Récupère toutes les commandes HelloAsso et crée les adhésions manquantes.
              Les doublons sont ignorés automatiquement.
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncStatus === "loading"}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
          >
            {syncStatus === "loading" ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Synchronisation…
              </span>
            ) : (
              "Synchroniser"
            )}
          </button>
        </div>

        {/* Sync feedback */}
        {syncStatus === "success" && syncResult && (
          <div className="flex items-center gap-3 bg-green-900/40 border border-green-700 text-green-300 rounded-xl px-5 py-4 text-sm">
            <span className="text-lg">✓</span>
            <span>
              Synchronisation terminée —{" "}
              <strong>{syncResult.created}</strong>{" "}
              {syncResult.created === 1 ? "nouvelle adhésion créée" : "nouvelles adhésions créées"}.
            </span>
          </div>
        )}
        {syncStatus === "error" && (
          <div className="flex items-center gap-3 bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-5 py-4 text-sm">
            <span className="text-lg">✕</span>
            <span>Erreur : {syncError}</span>
          </div>
        )}

        {/* Reassign ZK card */}
        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
          <div className="flex-1">
            <h2 className="font-semibold text-white text-lg">Réassigner les codes ZK manquants</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Attribue un code ZK aux adhésions qui n&apos;en ont pas encore.
              {manquants > 0 && (
                <span className="ml-2 text-amber-400 font-semibold">{manquants} adhésion{manquants > 1 ? "s" : ""} sans code ZK.</span>
              )}
              {manquants === 0 && !loadingList && (
                <span className="ml-2 text-green-400 font-semibold">Toutes les adhésions ont un code ZK.</span>
              )}
            </p>
          </div>
          <button
            onClick={handleReassign}
            disabled={reassignStatus === "loading" || manquants === 0}
            className="shrink-0 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
          >
            {reassignStatus === "loading" ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Assignation…
              </span>
            ) : (
              "Réassigner"
            )}
          </button>
        </div>

        {/* Reassign feedback */}
        {reassignStatus === "success" && reassignResult && (
          <div className="flex items-center gap-3 bg-green-900/40 border border-green-700 text-green-300 rounded-xl px-5 py-4 text-sm">
            <span className="text-lg">✓</span>
            <span>
              <strong>{reassignResult.assigned}</strong> code{reassignResult.assigned > 1 ? "s" : ""} ZK assigné{reassignResult.assigned > 1 ? "s" : ""}.
              {reassignResult.skipped > 0 && (
                <span className="text-amber-300 ml-2">({reassignResult.skipped} ignorée{reassignResult.skipped > 1 ? "s" : ""} — pool épuisé)</span>
              )}
            </span>
          </div>
        )}
        {reassignStatus === "error" && (
          <div className="flex items-center gap-3 bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-5 py-4 text-sm">
            <span className="text-lg">✕</span>
            <span>Erreur : {reassignError}</span>
          </div>
        )}

        {/* Adhesions table */}
        <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-white">
              Adhésions en base{" "}
              <span className="text-indigo-400 font-bold">{adhesions.length}</span>
            </h2>
            <button
              onClick={loadAdhesions}
              className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition"
            >
              Actualiser
            </button>
          </div>

          {loadingList ? (
            <div className="flex justify-center items-center py-16 text-gray-500 text-sm">
              Chargement…
            </div>
          ) : adhesions.length === 0 ? (
            <div className="flex justify-center items-center py-16 text-gray-500 text-sm">
              Aucune adhésion trouvée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wide bg-gray-800/50">
                    <th className="text-left px-6 py-3">Membre</th>
                    <th className="text-left px-6 py-3">Email</th>
                    <th className="text-left px-6 py-3">Saison</th>
                    <th className="text-left px-6 py-3">Expiration</th>
                    <th className="text-left px-6 py-3">Discipline</th>
                    <th className="text-left px-6 py-3">Groupe</th>
                    <th className="text-left px-6 py-3">Code ZK</th>
                    <th className="text-left px-6 py-3">Statut</th>
                    <th className="text-left px-6 py-3">ID HelloAsso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {adhesions.map((a) => (
                    <tr key={a.ha_order_id} className="hover:bg-gray-800/40 transition">
                      <td className="px-6 py-4 font-medium text-white">
                        {a.prenom} {a.nom}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{a.email}</td>
                      <td className="px-6 py-4 text-gray-300">{a.saison}</td>
                      <td className="px-6 py-4 text-gray-300">{a.date_expiration ? new Date(a.date_expiration).toLocaleDateString("fr-FR") : <span className="text-gray-600">—</span>}</td>
                      <td className="px-6 py-4 text-gray-300">{a.discipline ?? <span className="text-gray-600">—</span>}</td>
                      <td className="px-6 py-4 text-gray-300">{a.groupe || <span className="text-gray-600">—</span>}</td>
                      <td className="px-6 py-4">
                        {a.code_zk != null ? (
                          <span className="font-mono bg-gray-800 text-indigo-300 px-2 py-0.5 rounded">
                            {a.code_zk}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            a.statut === "payee"
                              ? "bg-green-900 text-green-300"
                              : a.statut === "expiree"
                              ? "bg-amber-900 text-amber-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {a.statut === "payee" ? "Payée" : a.statut === "expiree" ? "Expirée" : "Remboursée"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{a.ha_order_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
