"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Annonce {
  id: number;
  contenu: string;
  destinataire: string;
  discipline_key: string | null;
  discipline_name: string | null;
  auteur_nom: string;
  date_creation: string;
  date_expiration: string;
}

export default function AnnoncesAdherentPage() {
  const router = useRouter();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDiscipline, setFilterDiscipline] = useState<string>("all");

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const res = await fetch("/api/annonces/adherent", {
          credentials: "include",
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setAnnonces(data.annonces || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des annonces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonces();
  }, [router]);

  // Récupérer la liste unique des disciplines
  const disciplines = Array.from(
    new Set(annonces.filter((a) => a.discipline_name).map((a) => a.discipline_name!))
  );

  // Filtrer les annonces
  const filteredAnnonces =
    filterDiscipline === "all"
      ? annonces
      : annonces.filter((a) => a.discipline_name === filterDiscipline);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">📢 Annonces</h1>
          <p className="text-gray-400 text-sm">
            Retrouvez ici toutes les informations importantes de vos coachs et du club
          </p>
        </div>

        {/* Filtres */}
        {disciplines.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-300">Filtrer par discipline :</label>
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2 text-sm"
            >
              <option value="all">Toutes les disciplines</option>
              {disciplines.map((discipline) => (
                <option key={discipline} value={discipline}>
                  {discipline}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Liste des annonces */}
        <div className="space-y-4">
          {filteredAnnonces.length === 0 ? (
            <div className="bg-gray-900 rounded-2xl p-8 text-center text-gray-400">
              {annonces.length === 0 ? (
                <>
                  <p className="text-white font-semibold mb-1">Aucune annonce</p>
                  <p className="text-sm">Il n'y a actuellement aucune annonce à afficher.</p>
                </>
              ) : (
                <p className="text-sm">Aucune annonce pour cette discipline.</p>
              )}
            </div>
          ) : (
            filteredAnnonces.map((annonce) => (
              <div
                key={annonce.id}
                className="bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition"
              >
                <div className="flex justify-end mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      annonce.destinataire === "tous"
                        ? "bg-blue-900/40 text-blue-400"
                        : annonce.destinataire === "coachs"
                        ? "bg-violet-900/40 text-violet-400"
                        : "bg-green-900/40 text-green-400"
                    }`}
                  >
                    {annonce.destinataire === "tous" && "👥 Tous"}
                    {annonce.destinataire === "coachs" && "🎓 Coachs"}
                    {annonce.destinataire === "adherents" && "👤 Adhérents"}
                  </span>
                </div>

                <p className="text-gray-200 text-sm mb-4 whitespace-pre-wrap">{annonce.contenu}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex gap-4">
                    <span>✍️ {annonce.auteur_nom}</span>
                    {annonce.discipline_name && <span>📚 {annonce.discipline_name}</span>}
                  </div>
                  <span>📅 {new Date(annonce.date_creation).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
