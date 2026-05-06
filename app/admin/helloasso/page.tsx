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
  date_expiration: string | null;
  code_zk: number | null;
  ha_order_id: string;
}

export default function HelloAssoAdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
  const [loadingList, setLoadingList] = useState(true);

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

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-300">Adhésions</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Les adhésions sont créées automatiquement via le webhook HelloAsso lors des paiements.
          </p>
        </div>

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
