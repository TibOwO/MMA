"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StatsGlobales {
  total_adhesions: number;
  adhesions_payees: number;
  adhesions_en_attente: number;
  ca_total: number;
  ca_helloasso: number;
  ca_especes_cheques: number;
  nb_impayes_helloasso: number;
  nb_impayes_especes_cheques: number;
  taux_paiement: number;
  nb_adherents_echelonnes: number;
  montant_echeances_a_recevoir: number;
}

interface StatsDiscipline {
  discipline_key: string;
  discipline_name: string;
  tarif: string;
  total_adhesions: number;
  adhesions_payees: number;
  ca_total: number;
  ca_helloasso: number;
  ca_especes_cheques: number;
  nb_impayes_helloasso: number;
  nb_impayes_especes_cheques: number;
  taux_paiement: number;
}

interface EvolutionMois {
  mois: string;
  mois_label: string;
  nb_adhesions: number;
  ca_estime: number;
}

interface Impaye {
  id: number;
  user_id: number | null;
  nom: string;
  prenom: string;
  email: string;
  discipline: string;
  discipline_key: string;
  mode_paiement: string;
  type_impaye: string;
  details: string;
  montant_impaye?: number;
  saison: string;
}

interface StatsModePaiement {
  mode_paiement: string;
  mode_paiement_label: string;
  nb_adhesions: number;
  ca_estime: number;
  pourcentage: number;
}

interface DisciplineDisponible {
  key: string;
  name: string;
  tarif: string;
}

interface UtilisateurEcheance {
  user_id: number | null;
  prenom: string;
  nom: string;
  email: string;
  discipline: string;
  discipline_key: string;
  mode_paiement: string;
  nb_echeances: number;
  montant_total: number;
  echeances: Array<{
    numero: number;
    montant: number;
    date_echeance: string;
    statut: string;
  }>;
}

interface DashboardData {
  success: boolean;
  user_role: string;
  periode: {
    type: string;
    date_debut: string;
    date_fin: string;
  };
  filters: {
    discipline_key: string;
    mode_paiement: string;
  };
  stats_globales: StatsGlobales;
  stats_par_discipline: StatsDiscipline[];
  evolution_temporelle: EvolutionMois[];
  impayes: Impaye[];
  stats_modes_paiement: StatsModePaiement[];
  utilisateurs_echeances_en_attente: UtilisateurEcheance[];
  disciplines_disponibles: DisciplineDisponible[];
}

export default function DashboardFinancierPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);

  // Filtres
  const [disciplineFilter, setDisciplineFilter] = useState("");
  const [saisonFilter, setSaisonFilter] = useState("");
  const [modePaiementFilter, setModePaiementFilter] = useState("tous");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { 
      router.replace("/login"); 
      return; 
    }
    
    try {
      const user = JSON.parse(raw);
      if (!["admin", "coach"].includes(user.role)) { 
        router.replace("/"); 
        return; 
      }
      setUserName(`${user.prenom} ${user.nom}`);
      setUserRole(user.role);
    } catch {
      router.replace("/login");
      return;
    }
    
    setReady(true);
  }, [router]);

  const fetchDashboardData = async () => {
    if (!ready) return;
    
    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams({
        saison: saisonFilter,
        mode_paiement: modePaiementFilter,
      });
      
      if (disciplineFilter) {
        params.append('discipline_key', disciplineFilter);
      }

      const response = await fetch(`/api/dashboard/financier?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des données');
      }

      const dashboardData: DashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [ready, disciplineFilter, saisonFilter, modePaiementFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const generateSaisonOptions = (): string[] => {
    const options: string[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Générer les 5 dernières saisons + la saison actuelle
    for (let i = 0; i < 6; i++) {
      const year = currentYear - i;
      const saisonLabel = `${year}-${year + 1}`;
      options.push(saisonLabel);
    }
    
    return options;
  };

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              Connecté en tant que {userRole} — {userName}
            </p>
            <h1 className="text-3xl font-extrabold text-white">Dashboard Financier</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Suivi des revenus HelloAsso et espèces/chèques
            </p>
          </div>
          
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
          >
            ← Retour
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Filtres</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Filtre Saison */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Saison
              </label>
              <select
                value={saisonFilter}
                onChange={(e) => setSaisonFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Saison actuelle</option>
                {generateSaisonOptions().map((saison) => (
                  <option key={saison} value={saison}>
                    {saison}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Mode de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mode de paiement
              </label>
              <select
                value={modePaiementFilter}
                onChange={(e) => setModePaiementFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tous">Tous</option>
                <option value="helloasso">HelloAsso</option>
                <option value="especes">Espèces</option>
                <option value="cheque">Chèque</option>
              </select>
            </div>

            {/* Filtre Discipline */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discipline
              </label>
              <select
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les disciplines</option>
                {data?.disciplines_disponibles.map((discipline) => (
                  <option key={discipline.key} value={discipline.key}>
                    {discipline.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Chargement des données...</span>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
            <h3 className="text-red-400 font-semibold mb-2">Erreur</h3>
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-sm transition"
            >
              Réessayer
            </button>
          </div>
        ) : data ? (
          <>
            {/* Statistiques globales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl p-6 border border-blue-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">CA Total</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {formatCurrency(data.stats_globales.ca_total)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-400">HelloAsso: {formatCurrency(data.stats_globales.ca_helloasso)}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-yellow-400">Espèces/Chèques: {formatCurrency(data.stats_globales.ca_especes_cheques)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl p-6 border border-green-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Adhésions</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {data.stats_globales.total_adhesions}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5.916-3.519M9 20H4v-2a4 4 0 015.916-3.519M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0zM3 10a3 3 0 116 0 3 3 0 01-6 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-400">Payées: {data.stats_globales.adhesions_payees}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-yellow-400">En attente: {data.stats_globales.adhesions_en_attente}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 rounded-xl p-6 border border-yellow-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm font-medium">Adhérents échelonnés</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {data.stats_globales.nb_adherents_echelonnes}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <p className="text-yellow-400">À recevoir: {formatCurrency(data.stats_globales.montant_echeances_a_recevoir)}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 rounded-xl p-6 border border-red-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm font-medium">Impayés</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {data.stats_globales.nb_impayes_helloasso + data.stats_globales.nb_impayes_especes_cheques}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-400">HA: {data.stats_globales.nb_impayes_helloasso}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-red-400">Espèces: {data.stats_globales.nb_impayes_especes_cheques}</span>
                </div>
              </div>
            </div>

            {/* Statistiques par discipline */}
            {data.stats_par_discipline.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Répartition par discipline</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Discipline</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-medium">Adhésions</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-medium">CA Total</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-medium">HelloAsso</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-medium">Espèces/Chèques</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-medium">Impayés</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.stats_par_discipline.map((discipline) => (
                        <tr key={discipline.discipline_key} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-white font-medium">{discipline.discipline_name}</p>
                              <p className="text-gray-400 text-sm">{discipline.tarif} €</p>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-white">
                            {discipline.adhesions_payees}/{discipline.total_adhesions}
                          </td>
                          <td className="text-right py-3 px-4 text-white font-semibold">
                            {formatCurrency(discipline.ca_total)}
                          </td>
                          <td className="text-right py-3 px-4 text-green-400">
                            {formatCurrency(discipline.ca_helloasso)}
                          </td>
                          <td className="text-right py-3 px-4 text-yellow-400">
                            {formatCurrency(discipline.ca_especes_cheques)}
                          </td>
                          <td className="text-right py-3 px-4 text-red-400">
                            {discipline.nb_impayes_helloasso + discipline.nb_impayes_especes_cheques}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Utilisateurs avec échéances en attente */}
            {data.utilisateurs_echeances_en_attente && data.utilisateurs_echeances_en_attente.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Utilisateurs avec échéances en attente/non payées</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Utilisateur</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Discipline</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Mode paiement</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-medium">Nb Échéances</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Détails des échéances</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-medium">Montant total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.utilisateurs_echeances_en_attente.map((user, idx) => (
                        <tr
                          key={`${user.nom}-${user.prenom}-${idx}`}
                          className={`border-b border-gray-800 hover:bg-gray-800/50 ${userRole === "admin" && user.user_id ? "cursor-pointer" : ""}`}
                          onClick={() => {
                            if (userRole === "admin" && user.user_id) {
                              router.push(`/admin/users?userId=${user.user_id}`);
                            }
                          }}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-white font-medium">{user.prenom} {user.nom}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-white">{user.discipline}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.mode_paiement === 'HelloAsso' 
                                ? 'bg-blue-900/50 text-blue-300' 
                                : 'bg-yellow-900/50 text-yellow-300'
                            }`}>
                              {user.mode_paiement}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 text-white font-semibold">
                            {user.nb_echeances}
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-sm">
                            <div className="space-y-1">
                              {user.echeances.map((ech, echIdx) => (
                                <div key={echIdx} className="text-xs">
                                  <span className={`font-medium ${
                                    ech.statut === 'retard' ? 'text-red-400' : 'text-yellow-400'
                                  }`}>
                                    Échéance {ech.numero}:
                                  </span>
                                  {' '}{ech.montant}€ (due le {ech.date_echeance})
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-orange-400 font-semibold">
                            {formatCurrency(user.montant_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Impayés détaillés */}
            {data.impayes.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Impayés détaillés</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Adhérent</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Discipline</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Mode paiement</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Type d'impayé</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Détails</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-medium">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.impayes.map((impaye) => (
                        <tr
                          key={impaye.id}
                          className={`border-b border-gray-800 hover:bg-gray-800/50 ${userRole === "admin" && impaye.user_id ? "cursor-pointer" : ""}`}
                          onClick={() => {
                            if (userRole === "admin" && impaye.user_id) {
                              router.push(`/admin/users?userId=${impaye.user_id}`);
                            }
                          }}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-white font-medium">{impaye.prenom} {impaye.nom}</p>
                              <p className="text-gray-400 text-sm">{impaye.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-white">{impaye.discipline}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              impaye.mode_paiement === 'HelloAsso' 
                                ? 'bg-blue-900/50 text-blue-300' 
                                : 'bg-yellow-900/50 text-yellow-300'
                            }`}>
                              {impaye.mode_paiement}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-red-400">{impaye.type_impaye}</td>
                          <td className="py-3 px-4 text-gray-300 text-sm">
                            <div className="space-y-1 whitespace-pre-wrap">
                              {impaye.details.split(' | ').map((detail, idx) => (
                                <div key={idx} className="text-xs">{detail}</div>
                              ))}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-red-400 font-semibold">
                            {impaye.montant_impaye ? formatCurrency(impaye.montant_impaye) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Informations sur la période */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Informations sur la période</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Période sélectionnée</p>
                  <p className="text-white font-medium capitalize">{data.periode.type}</p>
                </div>
                <div>
                  <p className="text-gray-400">Du</p>
                  <p className="text-white font-medium">{formatDate(data.periode.date_debut)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Au</p>
                  <p className="text-white font-medium">{formatDate(data.periode.date_fin)}</p>
                </div>
              </div>
            </div>
          </>
        )
        : (
          <div className="bg-gray-900 rounded-xl p-6">
            <p className="text-gray-400">Aucune donnée disponible pour les filtres sélectionnés.</p>
          </div>
        )}
      </div>
    </main>
  );
}
