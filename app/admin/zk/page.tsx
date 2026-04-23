"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface ZKRule {
  id: number;
  groupe: string;
  code_min: number;
  code_max: number;
  fin_saison: string; // ISO date, only day+month matter
  libres: number;
  actifs: number;
}

interface Discipline {
  key: string;
  name: string;
}

interface MappingEntry {
  discipline_key: string;
  groupe: string;
}

export default function AdminZKPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [rules, setRules] = useState<ZKRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [allMappings, setAllMappings] = useState<MappingEntry[]>([]);
  const [groupe, setGroupe] = useState("");
  const [codeMin, setCodeMin] = useState("");
  const [codeMax, setCodeMax] = useState("");
  // date picker: we only use day+month, year is irrelevant
  const [finSaisonDate, setFinSaisonDate] = useState("2026-08-31");
  const [creating, setCreating] = useState(false);

  const [runningExpire, setRunningExpire] = useState(false);
  const [expireMsg, setExpireMsg] = useState<string | null>(null);

  // Groups available for the currently selected discipline
  const groupeOptions = useMemo(() => {
    if (!selectedDiscipline) return [];
    return Array.from(
      new Set(
        allMappings
          .filter((m) => m.discipline_key === selectedDiscipline && m.groupe?.trim())
          .map((m) => m.groupe)
      )
    ).sort();
  }, [allMappings, selectedDiscipline]);

  // Keep groupe in sync when discipline changes
  useEffect(() => {
    setGroupe(groupeOptions.length > 0 ? groupeOptions[0] : "");
  }, [groupeOptions]);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(raw);
      if (user.role !== "admin") {
        router.replace("/");
        return;
      }
      setReady(true);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  async function loadDisciplinesAndMappings() {
    try {
      const [resDisciplines, resMappings] = await Promise.all([
        fetch("/api/disciplines"),
        fetch("/api/admin/helloasso-mappings"),
      ]);
      const [dataDisciplines, dataMappings] = await Promise.all([
        resDisciplines.json(),
        resMappings.json(),
      ]);
      if (resDisciplines.ok && dataDisciplines.disciplines) {
        const discs: Discipline[] = dataDisciplines.disciplines;
        setDisciplines(discs);
        if (discs.length > 0) setSelectedDiscipline(discs[0].key);
      }
      if (resMappings.ok && dataMappings.mappings) {
        setAllMappings(dataMappings.mappings);
      }
    } catch {
      // ignore — selects remain empty
    }
  }

  async function loadRules() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/zk-rules");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Impossible de charger les règles ZK.");
        return;
      }
      setRules(data.rules ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    loadRules();
    loadDisciplinesAndMappings();
  }, [ready]);

  const totalLibres = useMemo(() => rules.reduce((acc, r) => acc + r.libres, 0), [rules]);
  const totalActifs = useMemo(() => rules.reduce((acc, r) => acc + r.actifs, 0), [rules]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/zk-rules/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupe,
          code_min: Number(codeMin),
          code_max: Number(codeMax),
          fin_saison: finSaisonDate,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Erreur lors de la création de la règle.");
        return;
      }
      setGroupe("");
      setCodeMin("");
      setCodeMax("");
      await loadRules();
    } catch (e) {
      setError(String(e));
    } finally {
      setCreating(false);
    }
  }

  async function deleteRule(ruleId: number) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/zk-rules/${ruleId}/delete`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Erreur lors de la suppression.");
        return;
      }
      await loadRules();
    } catch (e) {
      setError(String(e));
    }
  }

  async function runExpireNow() {
    setRunningExpire(true);
    setExpireMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/zk/expire", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Erreur lors de l'expiration manuelle.");
        return;
      }
      setExpireMsg(`${data.expired} adhésion(s) expirée(s), ${data.released} code(s) libéré(s).`);
      await loadRules();
    } catch (e) {
      setError(String(e));
    } finally {
      setRunningExpire(false);
    }
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition">← Retour à l&apos;administration</a>

        <div>
          <h1 className="text-3xl font-extrabold text-amber-300">Gestion ZK</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Définissez la plage de codes et la fin de saison par groupe. À expiration, les adhésions sont désactivées et les codes sont libérés.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-xs text-gray-500 uppercase">Codes libres</p>
            <p className="text-2xl font-bold text-green-300">{totalLibres}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-xs text-gray-500 uppercase">Codes actifs</p>
            <p className="text-2xl font-bold text-indigo-300">{totalActifs}</p>
          </div>
        </div>

        <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Nouvelle règle de groupe</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            {/* Row 1: Discipline + Groupe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Discipline</label>
                <select
                  value={selectedDiscipline}
                  onChange={(e) => setSelectedDiscipline(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
                  required
                >
                  {disciplines.length === 0 && (
                    <option value="" disabled>Aucune discipline disponible</option>
                  )}
                  {disciplines.map((d) => (
                    <option key={d.key} value={d.key}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Groupe</label>
                <select
                  value={groupe}
                  onChange={(e) => setGroupe(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
                  required
                  disabled={groupeOptions.length === 0}
                >
                  {groupeOptions.length === 0 ? (
                    <option value="" disabled>Aucun groupe pour cette discipline</option>
                  ) : (
                    groupeOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Row 2: Code min + Code max + Fin de saison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Code min</label>
                <input
                  type="number"
                  value={codeMin}
                  onChange={(e) => setCodeMin(e.target.value)}
                  placeholder="Ex: 100"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Code max</label>
                <input
                  type="number"
                  value={codeMax}
                  onChange={(e) => setCodeMax(e.target.value)}
                  placeholder="Ex: 199"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Fin de saison
                  <span className="ml-1 text-gray-500 font-normal">(seul le jour/mois compte)</span>
                </label>
                <input
                  type="date"
                  value={finSaisonDate}
                  onChange={(e) => setFinSaisonDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !groupe}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded px-6 py-2 font-semibold"
            >
              {creating ? "Création..." : "Ajouter"}
            </button>
          </form>
        </section>

        <section className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="font-semibold">Règles ZK par groupe</h2>
            <div className="flex gap-2">
              <button
                onClick={runExpireNow}
                disabled={runningExpire}
                className="text-xs bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1.5 rounded"
              >
                {runningExpire ? "Expiration..." : "Exécuter expiration"}
              </button>
              <button
                onClick={loadRules}
                className="text-xs border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded"
              >
                Actualiser
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-gray-400">Chargement...</div>
          ) : rules.length === 0 ? (
            <div className="p-6 text-gray-500">Aucune règle configurée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 bg-gray-800/40">
                    <th className="px-6 py-3">Groupe</th>
                    <th className="px-6 py-3">Plage</th>
                    <th className="px-6 py-3">Fin saison</th>
                    <th className="px-6 py-3">Libres</th>
                    <th className="px-6 py-3">Actifs</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {rules.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-800/30">
                      <td className="px-6 py-3 font-semibold text-white">{r.groupe}</td>
                      <td className="px-6 py-3 text-gray-300">{r.code_min} - {r.code_max}</td>
                      <td className="px-6 py-3 text-gray-300">
                        {r.fin_saison ? `${r.fin_saison.slice(8, 10)}/${r.fin_saison.slice(5, 7)}` : '—'}
                      </td>
                      <td className="px-6 py-3 text-green-300 font-semibold">{r.libres}</td>
                      <td className="px-6 py-3 text-indigo-300 font-semibold">{r.actifs}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-3">
                          <button onClick={() => deleteRule(r.id)} className="text-red-300 hover:text-red-200">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {expireMsg && <div className="text-green-300 text-sm">{expireMsg}</div>}
        {error && <div className="text-red-300 text-sm">{error}</div>}
      </div>
    </main>
  );
}
