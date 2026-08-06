"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Impaye {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  discipline: string | null;
  discipline_key: string | null;
  mode_paiement: string;
  type_impaye: string;
  details: string;
  afficher_qr: boolean;
  qr_override_manuel: boolean;
  saison: string;
  ha_order_id: string;
  code_promo: string | null;
  nb_echeances_impayees?: number;
}

interface Discipline {
  key: string;
  name: string;
}

interface CurrentUser {
  id: number;
  prenom: string;
  nom: string;
  role: string;
}

export default function AdminImpayesPage() {
  const router = useRouter();
  const [impayes, setImpayes] = useState<Impaye[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [filterModePaiement, setFilterModePaiement] = useState<string>("tous");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("");
  
  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger l'utilisateur actuel
        const resCurrentUser = await fetch("/api/current-user", {
          credentials: "include",
        });
        if (resCurrentUser.ok) {
          const userData = await resCurrentUser.json();
          setCurrentUser(userData.user);
          
          if (userData.user.role !== "admin") {
            router.push("/");
            return;
          }
        } else if (resCurrentUser.status === 401) {
          router.push("/login");
          return;
        }

        // Charger les disciplines
        const resDisciplines = await fetch("/api/disciplines", {
          credentials: "include",
        });
        if (resDisciplines.ok) {
          const data = await resDisciplines.json();
          setDisciplines(data.disciplines || []);
        }

        // Charger les impayés
        await loadImpayes();

      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Fonction pour charger les impayés avec filtres
  const loadImpayes = async () => {
    try {
      let url = "/api/admin/adhesions/impayes?";
      const params = new URLSearchParams();
      
      if (filterModePaiement !== "tous") {
        params.append("mode_paiement", filterModePaiement);
      }
      
      if (filterDiscipline) {
        params.append("discipline_key", filterDiscipline);
      }
      
      const res = await fetch(url + params.toString(), {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setImpayes(data.impayes || []);
      } else if (res.status === 401) {
        router.push("/login");
      } else {
        setError("Erreur lors du chargement des impayés");
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement des impayés");
    }
  };

  // Recharger quand les filtres changent
  useEffect(() => {
    if (!loading) {
      loadImpayes();
    }
  }, [filterModePaiement, filterDiscipline]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div>
          <a
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-300 transition"
          >
            ← Retour à l'administration
          </a>
          
          <h1 className="text-3xl font-extrabold text-white mt-2">
            Adhérents avec impayés
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Liste des adhérents ayant des paiements en attente ou refusés
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-700 text-red-300 rounded-xl">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-4 text-red-400 hover:text-red-200 underline hover:no-underline transition"
            >
              Fermer
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900/30 border border-green-700 text-green-300 rounded-xl">
            {success}
            <button
              onClick={() => setSuccess("")}
              className="ml-4 text-green-400 hover:text-green-200 underline hover:no-underline transition"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-white mb-4">Filtres</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtre mode de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Mode de paiement
              </label>
              <select
                value={filterModePaiement}
                onChange={(e) => setFilterModePaiement(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none transition"
              >
                <option value="tous">Tous</option>
                <option value="helloasso">HelloAsso</option>
                <option value="especes">Espèces</option>
                <option value="cheque">Chèque</option>
              </select>
            </div>

            {/* Filtre discipline */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Discipline
              </label>
              <select
                value={filterDiscipline}
                onChange={(e) => setFilterDiscipline(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none transition"
              >
                <option value="">Toutes les disciplines</option>
                {disciplines.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total des impayés</p>
              <p className="text-3xl font-bold text-red-400">{impayes.length}</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-400">
                HelloAsso: {impayes.filter(i => i.mode_paiement === "HelloAsso").length} |{" "}
                Espèces: {impayes.filter(i => i.mode_paiement === "Espèces").length} |{" "}
                Chèque: {impayes.filter(i => i.mode_paiement === "Chèque").length}
              </p>
            </div>
          </div>
        </div>

        {/* Tableau des impayés */}
        <div className="bg-gray-900 rounded-2xl shadow-md overflow-hidden">
          {impayes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-lg">✅ Aucun impayé trouvé</p>
              <p className="text-sm mt-2">
                Tous les adhérents sont à jour de leurs paiements !
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Adhérent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Discipline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Mode de paiement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type d'impayé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Détails
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      QR Code
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {impayes.map((impaye) => (
                    <tr
                      key={impaye.id}
                      className="hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {impaye.prenom} {impaye.nom}
                          </div>
                          <div className="text-sm text-gray-400">
                            {impaye.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            Saison {impaye.saison}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {impaye.discipline || "—"}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          impaye.mode_paiement === "HelloAsso"
                            ? "bg-purple-900 text-purple-300"
                            : impaye.mode_paiement === "Espèces"
                            ? "bg-green-900 text-green-300"
                            : "bg-blue-900 text-blue-300"
                        }`}>
                          {impaye.mode_paiement}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-red-400">
                          {impaye.type_impaye}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 max-w-md">
                          {impaye.details}
                        </div>
                        {impaye.code_promo && (
                          <div className="text-xs text-gray-500 mt-1">
                            Code promo utilisé: <span className="font-mono text-indigo-400">{impaye.code_promo}</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {impaye.afficher_qr ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                            ✓ Activé
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">
                            ✗ Désactivé
                          </span>
                        )}
                        {impaye.qr_override_manuel && (
                          <div className="text-xs text-yellow-400 mt-1">
                            (Forcé manuellement)
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Aide */}
        <div className="bg-indigo-950/40 border border-indigo-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-indigo-300 mb-2">
            ℹ️ Comment fonctionne la détection des impayés ?
          </h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>
              <strong className="text-white">HelloAsso :</strong> Les impayés sont détectés automatiquement via le webhook
              quand un paiement est refusé, contesté ou remboursé. Le QR code est désactivé automatiquement.
            </p>
            <p>
              <strong className="text-white">Espèces/Chèques :</strong> Les échéances en retard sont détectées quotidiennement.
              Marquez les échéances comme payées pour réactiver automatiquement le QR code.
            </p>
            <p>
              <strong className="text-white">Réactivation automatique :</strong> Quand HelloAsso confirme le paiement ou que toutes
              les échéances sont payées, le QR code se réactive automatiquement (sauf si forcé manuellement).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
