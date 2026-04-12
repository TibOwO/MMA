// src/components/DisciplinePage.tsx
import React from "react";

interface Horaire {
  id: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  description: string;
}

interface Coach {
  id: number;
  prenom: string;
  nom: string;
  telephone: string;
}

interface DisciplineProps {
  name: string;
  presentation: string;
  tarif: string;
  horaires: Horaire[];
  coaches: Coach[];
}

const JOURS_ORDER = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const JOURS_LABEL: Record<string, string> = {
  lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi',
  jeudi: 'Jeudi', vendredi: 'Vendredi', samedi: 'Samedi', dimanche: 'Dimanche',
};

const DisciplinePage: React.FC<DisciplineProps> = ({ name, presentation, tarif, horaires, coaches }) => {
  const sortedHoraires = [...horaires].sort(
    (a, b) => JOURS_ORDER.indexOf(a.jour) - JOURS_ORDER.indexOf(b.jour)
  );

  return (
    <div className="container mx-auto p-6 space-y-12 bg-gray-900 min-h-screen text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-md">
        <h1 className="text-5xl font-extrabold mb-4 capitalize text-indigo-300">{name}</h1>
        <p className="text-lg text-gray-300 max-w-3xl">{presentation}</p>
        {tarif && (
          <div className="mt-5 inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-700 rounded-xl px-5 py-3">
            <span className="text-indigo-300 text-sm font-medium">Tarif</span>
            <span className="text-white text-xl font-bold">{tarif}</span>
          </div>
        )}
      </div>

      {/* Coaches */}
      {coaches.length > 0 && (
        <div>
          <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-300">Coach(s)</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="flex flex-col items-center w-40 p-4 rounded-xl bg-gray-800 shadow-md"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-200 text-xl font-bold">
                  {coach.prenom[0]}{coach.nom[0]}
                </div>
                <span className="mt-3 text-center text-sm font-medium text-gray-100">
                  {coach.prenom} {coach.nom}
                </span>
                {coach.telephone && (
                  <a
                    href={`tel:${coach.telephone.replace(/\s/g, '')}`}
                    className="mt-1 text-xs text-indigo-400 hover:text-indigo-200 transition"
                  >
                    📞 {coach.telephone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Horaires */}
      {sortedHoraires.length > 0 && (
        <div>
          <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-300">Horaires</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-4 py-3 text-indigo-300">Jour</th>
                  <th className="px-4 py-3 text-indigo-300">Horaire</th>
                  <th className="px-4 py-3 text-indigo-300">Détail</th>
                </tr>
              </thead>
              <tbody>
                {sortedHoraires.map((h) => (
                  <tr key={h.id} className="border-t border-gray-700 hover:bg-gray-800 transition">
                    <td className="px-4 py-3 capitalize font-medium">{JOURS_LABEL[h.jour] ?? h.jour}</td>
                    <td className="px-4 py-3">{h.heure_debut} – {h.heure_fin}</td>
                    <td className="px-4 py-3 text-gray-400">{h.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default DisciplinePage;