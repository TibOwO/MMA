"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Discipline {
  key: string;
  name: string;
}

interface Adhesion {
  id: number;
  discipline: string | null;
  discipline_key: string | null;
  saison: string;
  statut: string;
  date_expiration: string | null;
  ha_order_id: string;
  afficher_qr: boolean;
  qr_override_manuel: boolean;
  has_payment_issues: boolean;
  mode_paiement: string;
}

interface Echeance {
  id?: number;
  numero: number;
  montant: number;
  date_echeance: string;
  date_paiement?: string | null;
  statut?: string;
  remarque: string;
  discipline?: string;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  disciplines: string[];
  adhesions: Adhesion[];
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

function CoachAdherentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all"); // all, paid, unpaid

  // Edit panel
  const [editId, setEditId] = useState<number | null>(null);

  // Modal création adhésion
  const [showCreateAdhesion, setShowCreateAdhesion] = useState(false);
  const [createDisciplineKey, setCreateDisciplineKey] = useState("");
  const [createMontant, setCreateMontant] = useState(0);
  const [createType, setCreateType] = useState<"gratuite" | "especes" | "plusieurs">("gratuite");
  const [createModePaiement, setCreateModePaiement] = useState<"especes" | "cheque">("especes");
  const [createEcheances, setCreateEcheances] = useState<Echeance[]>([]);
  const [creatingAdhesion, setCreatingAdhesion] = useState(false);
  const [createError, setCreateError] = useState("");
  
  // Gestion échéances
  const [echeances, setEcheances] = useState<Echeance[]>([]);
  const [loadingEcheances, setLoadingEcheances] = useState(false);

  // Transfert de discipline
  const [transferAdhesionId, setTransferAdhesionId] = useState<number | null>(null);
  const [transferDisciplineKey, setTransferDisciplineKey] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "coach" && u.role !== "admin") { router.replace("/"); return; }
    } catch { router.replace("/login"); return; }
    setReady(true);
  }, [router]);

  function loadData() {
    setLoading(true);
    const timestamp = Date.now();
    Promise.all([
      fetch(`/api/coach/utilisateurs?_t=${timestamp}`, { cache: 'no-cache' }).then((r) => r.json()),
      fetch(`/api/coach/mes-disciplines?_t=${timestamp}`, { cache: 'no-cache' }).then((r) => r.json()),
    ]).then(([ud, dd]) => {
      setUsers(ud.users ?? []);
      setDisciplines(dd.disciplines ?? []);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { if (ready) loadData(); }, [ready]);

  // Ouvre automatiquement la fiche d'un adhérent si ?userId=... est présent
  // dans l'URL (ex: lien depuis le dashboard financier).
  useEffect(() => {
    if (users.length === 0) return;
    const userIdParam = searchParams.get("userId");
    if (!userIdParam) return;
    const target = users.find((u) => u.id === Number(userIdParam));
    if (target) openEdit(target);
  }, [users, searchParams]);

  function openEdit(u: User) {
    setEditId(u.id);
    loadEcheances(u.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadEcheances(userId: number) {
    setLoadingEcheances(true);
    try {
      const res = await fetch(`/api/admin/echeances?user_id=${userId}`);
      const data = await res.json();
      setEcheances(data.echeances ?? []);
    } catch {
      setEcheances([]);
    } finally {
      setLoadingEcheances(false);
    }
  }

  // Vérifier si une échéance est réellement impayée (en retard ou en attente mais dont la date est passée)
  function isEcheanceUnpaid(echeance: Echeance): boolean {
    if (echeance.statut === 'retard') return true;
    if (echeance.statut === 'payee') return false;
    
    // Pour les échéances en attente, vérifier si la date est passée
    if (echeance.statut === 'en_attente') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(echeance.date_echeance);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }
    
    return false;
  }

  // Helper pour ajouter des mois à une date
  function addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  function openCreateAdhesion() {
    setShowCreateAdhesion(true);
    setCreateDisciplineKey(disciplines[0]?.key || "");
    setCreateMontant(0);
    setCreateType("gratuite");
    setCreateEcheances([]);
    setCreateError("");
  }

  function handleTypeChange(type: "gratuite" | "especes" | "plusieurs") {
    setCreateType(type);
    if (type === "gratuite") {
      setCreateMontant(0);
      setCreateEcheances([]);
    } else if (type === "especes") {
      const montant = createMontant > 0 ? createMontant : 0;
      setCreateEcheances([
        { numero: 1, montant, date_echeance: new Date().toISOString().split('T')[0], remarque: "" }
      ]);
    } else {
      // plusieurs fois - initialiser avec 3 échéances
      const today = new Date();
      const montantParEcheance = createMontant > 0 ? Math.ceil(createMontant / 3) : 0;
      const reste = createMontant > 0 ? createMontant - 2*Math.ceil(createMontant / 3) : 0;
      setCreateEcheances([
        { numero: 1, montant: montantParEcheance, date_echeance: today.toISOString().split('T')[0], remarque: "" },
        { numero: 2, montant: montantParEcheance, date_echeance: addMonths(today, 1).toISOString().split('T')[0], remarque: "" },
        { numero: 3, montant: reste, date_echeance: addMonths(today, 2).toISOString().split('T')[0], remarque: "" },
      ]);
    }
  }

  // Mettre à jour les échéances quand le montant change
  function handleMontantChange(newMontant: number) {
    setCreateMontant(newMontant);
    
    // Pour paiement 1x, mettre à jour l'échéance unique
    if (createType === "especes" && createEcheances.length === 1) {
      setCreateEcheances([{
        ...createEcheances[0],
        montant: newMontant > 0 ? newMontant : 0
      }]);
    }
    // Pour paiement plusieurs fois, recalculer automatiquement
    else if (createType === "plusieurs" && createEcheances.length > 0) {
      const nbEcheances = createEcheances.length;
      const montantParEcheance = newMontant > 0 ? Math.ceil(newMontant / nbEcheances) : 0;
      const reste = newMontant > 0 ? newMontant - (nbEcheances - 1) * montantParEcheance : 0;
      
      setCreateEcheances(prev => prev.map((e, idx) => ({
        ...e,
        montant: idx === nbEcheances - 1 ? reste : montantParEcheance
      })));
    }
  }

  function ajouterEcheance() {
    const nextNumero = createEcheances.length + 1;
    const lastDate = createEcheances.length > 0 
      ? new Date(createEcheances[createEcheances.length - 1].date_echeance)
      : new Date();
    const nextDate = addMonths(lastDate, 1);
    
    setCreateEcheances([
      ...createEcheances,
      { numero: nextNumero, montant: 0, date_echeance: nextDate.toISOString().split('T')[0], remarque: "" }
    ]);
  }

  function supprimerEcheance(index: number) {
    const newEcheances = createEcheances.filter((_, i) => i !== index);
    setCreateEcheances(newEcheances.map((e, i) => ({ ...e, numero: i + 1 })));
  }

  function updateEcheance(index: number, field: keyof Echeance, value: any) {
    setCreateEcheances(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  }

  async function handleCreateAdhesion() {
    if (!editId) return;
    if (!createDisciplineKey) {
      setCreateError("Veuillez sélectionner une discipline");
      return;
    }

    // Validation du montant pour les adhésions payantes
    if (createType !== "gratuite" && createMontant <= 0) {
      setCreateError("Le montant total doit être supérieur à 0€");
      return;
    }

    setCreatingAdhesion(true);
    setCreateError("");
    try {
      const res = await fetch("/api/admin/adhesions/create-manuelle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editId,
          discipline_key: createDisciplineKey,
          mode_paiement: createType === "gratuite" ? undefined : createModePaiement,
          montant_total: createMontant,
          echeances: createType === "gratuite" ? [] : createEcheances.map(e => {
            const montant = parseFloat(String(e.montant));
            return {
              numero: e.numero,
              montant: isNaN(montant) ? 0 : montant,
              date_echeance: e.date_echeance,
              remarque: e.remarque || "",
            };
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCreateError(data.error ?? "Erreur lors de la création");
      } else {
        setShowCreateAdhesion(false);
        loadData();
        if (editId) loadEcheances(editId);
      }
    } catch (e: any) {
      setCreateError(e.message ?? "Erreur serveur");
    } finally {
      setCreatingAdhesion(false);
    }
  }

  async function marquerEcheancePayee(echeanceId: number) {
    try {
      const res = await fetch(`/api/admin/echeances/${echeanceId}/marquer-payee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date_paiement: new Date().toISOString().split('T')[0],
          remarque: `Paiement reçu le ${new Date().toLocaleDateString('fr-FR')}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && editId) {
        loadEcheances(editId);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function annulerEcheancePayee(echeanceId: number) {
    try {
      const res = await fetch(`/api/admin/echeances/${echeanceId}/annuler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success && editId) {
        loadEcheances(editId);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteAdhesionManuelle(adhesionId: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette adhésion manuelle ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/adhesions/${adhesionId}/delete`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadData();
        if (editId) loadEcheances(editId);
      } else {
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur serveur");
    }
  }

  function openTransfer(adhesion: Adhesion) {
    setTransferAdhesionId(adhesion.id);
    setTransferDisciplineKey("");
    setTransferError("");
  }

  async function handleTransferAdhesion() {
    if (!transferAdhesionId || !transferDisciplineKey) return;
    setTransferring(true);
    setTransferError("");
    try {
      const res = await fetch(`/api/admin/adhesions/${transferAdhesionId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discipline_key: transferDisciplineKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTransferError(data.error ?? "Erreur lors du transfert");
      } else {
        setTransferAdhesionId(null);
        loadData();
        if (editId) loadEcheances(editId);
      }
    } catch (e: any) {
      setTransferError(e.message ?? "Erreur serveur");
    } finally {
      setTransferring(false);
    }
  }

  async function toggleAfficherQR(adhesionId: number) {
    try {
      const res = await fetch(`/api/adhesions/${adhesionId}/toggle-qr`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Recharger les données pour mettre à jour l'affichage
        loadData();
        if (editId) loadEcheances(editId);
      } else {
        alert(data.error || "Erreur lors de la modification");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur serveur");
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch = (
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
    
    // Filtre par discipline
    let matchesDiscipline = true;
    if (filterDiscipline !== "all") {
      matchesDiscipline = u.adhesions.some((adhesion) => adhesion.discipline === filterDiscipline);
    }
    
    // Filtre par paiement
    let matchesPayment = true;
    if (filterPayment === "unpaid") {
      matchesPayment = u.adhesions.some((adhesion) => adhesion.has_payment_issues);
    } else if (filterPayment === "paid") {
      matchesPayment = u.adhesions.some((adhesion) => !adhesion.has_payment_issues && adhesion.statut === 'payee');
    }
    
    return matchesSearch && matchesDiscipline && matchesPayment;
  });

  if (!ready) return null;

  const editUser = editId ? users.find((u) => u.id === editId) : null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <a href="/coach" className="text-sm text-gray-500 hover:text-gray-300 transition">← Retour à l&apos;espace coach</a>
          <h1 className="text-3xl font-extrabold text-white mt-2">Gestion des utilisateurs</h1>
          <p className="text-gray-400 mt-1 text-sm">Consultez vos adhérents et gérez leurs adhésions.</p>
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

            {/* Adhésions */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">
                  Adhésions {editUser.adhesions.length > 0 && `(${editUser.adhesions.length})`}
                </label>
                <button
                  onClick={openCreateAdhesion}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition"
                >
                  + Créer une adhésion
                </button>
              </div>
              {editUser.adhesions.length > 0 ? (
                <div className="bg-gray-800 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                  {editUser.adhesions.map((a) => (
                    <div key={a.id} className="text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <span className="text-white font-medium">{a.discipline || 'Sans discipline'}</span>
                          <span className="text-gray-500 ml-2">• {a.saison}</span>
                          {a.ha_order_id?.startsWith('MANUAL-') && (
                            <span className="ml-2 text-[10px] text-indigo-400">(manuelle)</span>
                          )}
                          <span className="ml-2 text-[10px] text-gray-400">
                            {a.mode_paiement === 'especes' && '💵'}
                            {a.mode_paiement === 'cheque' && '📝'}
                            {a.mode_paiement === 'helloasso' && '💳'}
                            {a.mode_paiement === 'transfert' && '🔁'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {a.date_expiration && (
                            <span className="text-gray-400">
                              {new Date(a.date_expiration).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold ${
                              a.statut === 'payee' && a.has_payment_issues
                                ? 'bg-red-900 text-red-300'
                                : a.statut === 'payee'
                                ? 'bg-green-900 text-green-300'
                                : a.statut === 'expiree'
                                ? 'bg-amber-900 text-amber-300'
                                : 'bg-red-900 text-red-300'
                            }`}
                            title={a.statut === 'payee' && a.has_payment_issues ? "Échéance(s) en retard ou paiement HelloAsso refusé" : undefined}
                          >
                            {a.statut === 'payee' && a.has_payment_issues
                              ? 'Impayé'
                              : a.statut === 'payee'
                              ? 'Payée'
                              : a.statut === 'expiree'
                              ? 'Expirée'
                              : 'Remboursée'}
                          </span>
                          <button
                            onClick={() => toggleAfficherQR(a.id)}
                            className={`px-2 py-0.5 rounded font-semibold transition text-[10px] ${
                              a.afficher_qr
                                ? 'bg-green-700 hover:bg-green-600 text-green-100'
                                : 'bg-red-700 hover:bg-red-600 text-red-100'
                            }`}
                            title={a.afficher_qr ? "Désactiver le QR code" : "Activer le QR code"}
                          >
                            {a.afficher_qr ? '🔓 QR' : '🔒 QR'}
                            {a.qr_override_manuel && <span className="ml-1 text-yellow-300" title="Override manuel actif (impayé)">!</span>}
                          </button>
                          <button
                            onClick={() => openTransfer(a)}
                            className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded font-semibold transition text-[10px]"
                            title="Transférer vers une autre discipline"
                          >
                            🔁
                          </button>
                          {a.ha_order_id?.startsWith('MANUAL-') && (
                            <button
                              onClick={() => deleteAdhesionManuelle(a.id)}
                              className="px-2 py-0.5 bg-red-700 hover:bg-red-600 text-red-100 rounded font-semibold transition"
                              title="Supprimer cette adhésion manuelle"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {transferAdhesionId === a.id && (
                        <div className="mt-2 bg-gray-900 border border-indigo-800 rounded-lg p-3 flex flex-col gap-2">
                          <label className="text-[10px] text-gray-400">Transférer vers la discipline :</label>
                          <div className="flex items-center gap-2">
                            <select
                              value={transferDisciplineKey}
                              onChange={(e) => setTransferDisciplineKey(e.target.value)}
                              className="flex-1 bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-xs text-gray-100 rounded-lg px-2 py-1.5"
                            >
                              <option value="">Choisir une discipline…</option>
                              {disciplines
                                .filter((d) => d.key !== a.discipline_key)
                                .map((d) => (
                                  <option key={d.key} value={d.key}>
                                    {d.name}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={handleTransferAdhesion}
                              disabled={transferring || !transferDisciplineKey}
                              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-lg transition text-[10px]"
                            >
                              {transferring ? "…" : "Confirmer"}
                            </button>
                            <button
                              onClick={() => setTransferAdhesionId(null)}
                              className="text-gray-400 hover:text-white px-2 py-1.5 rounded-lg transition text-[10px]"
                            >
                              Annuler
                            </button>
                          </div>
                          {transferError && (
                            <p className="text-red-400 text-[10px]">{transferError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-500 text-center">
                  Aucune adhésion enregistrée
                </div>
              )}
            </div>

            {/* Échéances */}
            {echeances.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 flex items-center gap-2">
                  Échéances de paiement
                  {echeances.filter((e: any) => isEcheanceUnpaid(e)).length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-900 text-red-300 font-semibold">
                      {echeances.filter((e: any) => isEcheanceUnpaid(e)).length} impayée{echeances.filter((e: any) => isEcheanceUnpaid(e)).length > 1 ? 's' : ''}
                    </span>
                  )}
                </label>
                <div className="bg-gray-800 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                  {echeances.map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between text-xs border-b border-gray-700 pb-2 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium">Échéance {e.numero}</span>
                          <span className="text-indigo-400">{e.montant}€</span>
                          <span className="text-gray-500">• {new Date(e.date_echeance).toLocaleDateString('fr-FR')}</span>
                          {e.statut === 'retard' && (
                            <span className="px-2 py-0.5 rounded-full bg-red-900 text-red-300 font-semibold text-[10px]">
                              EN RETARD
                            </span>
                          )}
                          {e.statut === 'en_attente' && !isEcheanceUnpaid(e) && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-900 text-blue-300 font-semibold text-[10px]">
                              EN ATTENTE
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 mt-0.5">{e.discipline}</div>
                        {e.remarque && <div className="text-gray-400 italic mt-0.5">{e.remarque}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        {e.statut === 'payee' ? (
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full font-semibold bg-green-900 text-green-300">
                                Payée
                              </span>
                              <button
                                onClick={() => annulerEcheancePayee(e.id)}
                                className="px-2 py-0.5 bg-red-700 hover:bg-red-600 text-red-100 rounded text-[10px] font-semibold transition"
                                title="Annuler le paiement"
                              >
                                Annuler
                              </button>
                            </div>
                            {e.date_paiement && (
                              <span className="text-gray-500 text-[10px]">
                                {new Date(e.date_paiement).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => marquerEcheancePayee(e.id)}
                            className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-emerald-100 rounded font-semibold transition"
                          >
                            Marquer payée
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
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
          <div className="px-6 py-4 border-b border-gray-800 space-y-3">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-white shrink-0">
                Adhérents <span className="text-indigo-400 font-bold">{filtered.length}</span>
                {(filterDiscipline !== "all" || filterPayment !== "all") && <span className="text-gray-500">/{users.length}</span>}
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
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400 shrink-0">Filtrer par discipline :</label>
              <select
                value={filterDiscipline}
                onChange={(e) => setFilterDiscipline(e.target.value)}
                className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 rounded-lg px-3 py-1.5 transition"
              >
                <option value="all">Toutes mes disciplines</option>
                {disciplines.map((d) => (
                  <option key={d.key} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              {filterDiscipline !== "all" && (
                <button
                  onClick={() => setFilterDiscipline("all")}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded transition"
                  title="Réinitialiser le filtre"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400 shrink-0">Filtrer par paiement :</label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 rounded-lg px-3 py-1.5 transition"
              >
                <option value="all">Tous</option>
                <option value="paid">Paiement OK</option>
                <option value="unpaid">Impayés</option>
              </select>
              {filterPayment !== "all" && (
                <button
                  onClick={() => setFilterPayment("all")}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded transition"
                  title="Réinitialiser le filtre"
                >
                  ✕
                </button>
              )}
            </div>
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
                    {u.adhesions.length > 0 && (
                      <p className="text-xs text-indigo-400 mt-0.5">
                        Adhésions : {u.adhesions.map(a => a.discipline || 'Sans discipline').filter((v, i, arr) => arr.indexOf(v) === i).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">Voir détails →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal création adhésion */}
        {showCreateAdhesion && editUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-indigo-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Créer une adhésion pour {editUser.prenom} {editUser.nom}
                </h2>
                <button
                  onClick={() => setShowCreateAdhesion(false)}
                  className="text-gray-500 hover:text-white text-2xl leading-none transition"
                >
                  ×
                </button>
              </div>

              {/* Sélection discipline */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Discipline</label>
                <select
                  value={createDisciplineKey}
                  onChange={(e) => setCreateDisciplineKey(e.target.value)}
                  className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 rounded-lg px-3 py-2 transition"
                >
                  {disciplines.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type d'adhésion */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Type de paiement</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTypeChange("gratuite")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      createType === "gratuite"
                        ? "bg-green-700 text-green-100"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    Gratuite (0€)
                  </button>
                  <button
                    onClick={() => handleTypeChange("especes")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      createType === "especes"
                        ? "bg-amber-700 text-amber-100"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    Paiement (1x)
                  </button>
                  <button
                    onClick={() => handleTypeChange("plusieurs")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      createType === "plusieurs"
                        ? "bg-indigo-700 text-indigo-100"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    Paiement (plusieurs fois)
                  </button>
                </div>
              </div>

              {/* Mode de paiement (espèces ou chèque) */}
              {createType !== "gratuite" && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Mode de paiement</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCreateModePaiement("especes")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        createModePaiement === "especes"
                          ? "bg-indigo-700 text-indigo-100"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      💵 Espèces
                    </button>
                    <button
                      onClick={() => setCreateModePaiement("cheque")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        createModePaiement === "cheque"
                          ? "bg-indigo-700 text-indigo-100"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      📝 Chèque
                    </button>
                  </div>
                </div>
              )}

              {/* Montant total */}
              {createType !== "gratuite" && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Montant total (€)</label>
                  <input
/*                   type="number"
                     step="0.01"
                     value={createMontant} */
                    onChange={(e) => handleMontantChange(parseFloat(e.target.value) || 0)}
                    className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 rounded-lg px-3 py-2 transition"
                    placeholder="300"
                  />
                </div>
              )}

              {/* Tableau des échéances */}
              {createType === "plusieurs" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">
                      Échéances ({createEcheances.length})
                      <span className="ml-2 text-indigo-400">
                        Total: {createEcheances.reduce((acc, e) => acc + parseFloat(String(e.montant || 0)), 0).toFixed(2)}€
                      </span>
                    </label>
                    <button
                      onClick={ajouterEcheance}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 space-y-3 max-h-80 overflow-y-auto">
                    {createEcheances.map((ech, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-gray-900 p-3 rounded-lg border border-gray-700">
                        <div className="flex-shrink-0 w-6 text-center text-sm font-bold text-indigo-400 mt-2">
                          {ech.numero}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500">Montant (€)</label>
                            <input
/*                              type="number"
                              step="0.01"
                              value={ech.montant} */
                              onChange={(e) => updateEcheance(idx, 'montant', parseFloat(e.target.value) || 0)}
                              className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-xs text-gray-100 rounded px-2 py-1.5"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500">Date d'échéance</label>
                            <input
                              type="date"
                              value={ech.date_echeance}
                              onChange={(e) => updateEcheance(idx, 'date_echeance', e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-xs text-gray-100 rounded px-2 py-1.5"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] text-gray-500">Remarque (optionnel)</label>
                            <input
                              type="text"
                              value={ech.remarque}
                              onChange={(e) => updateEcheance(idx, 'remarque', e.target.value)}
                              placeholder="Ex: Premier versement"
                              className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-xs text-gray-100 rounded px-2 py-1.5"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => supprimerEcheance(idx)}
                          className="flex-shrink-0 text-red-400 hover:text-red-300 text-xl leading-none mt-2 transition"
                          title="Supprimer cette échéance"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Échéance unique pour espèces 1x */}
              {createType === "especes" && createEcheances.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <label className="text-xs text-gray-400 block mb-2">Date de paiement</label>
                  <input
                    type="date"
                    value={createEcheances[0].date_echeance}
                    onChange={(e) => updateEcheance(0, 'date_echeance', e.target.value)}
                    className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-sm text-gray-100 rounded-lg px-3 py-2 transition w-full"
                  />
                </div>
              )}

              {createError && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-sm text-red-300">
                  {createError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateAdhesion}
                  disabled={creatingAdhesion}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm"
                >
                  {creatingAdhesion ? "Création..." : "Créer l'adhésion"}
                </button>
                <button
                  onClick={() => setShowCreateAdhesion(false)}
                  className="text-gray-400 hover:text-white border border-gray-700 px-5 py-2.5 rounded-xl transition text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default function CoachAdherentsPage() {
  return (
    <Suspense fallback={null}>
      <CoachAdherentsContent />
    </Suspense>
  );
}
