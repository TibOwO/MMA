// src/components/DisciplinePage.tsx
import React from "react";

interface Tarif {
  nom: string;
  prix: string;
  horaires: string[];
  description: string;
}

interface Coach {
  nom: string;
  photoUrl?: string;
}

interface DisciplineProps {
  name: string;
  presentation: string;
  tarifs: Tarif[];
  coaches: Coach[];
}

const DisciplinePage: React.FC<DisciplineProps> = ({ name, presentation, tarifs, coaches }) => {
  return (
    <div className="container mx-auto p-6 space-y-12 bg-gray-900 min-h-screen text-gray-100">
      {/* Header du sport */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-md">
        <h1 className="text-5xl font-extrabold mb-4 capitalize text-indigo-300">{name}</h1>
        <p className="text-lg text-gray-300 max-w-3xl">{presentation}</p>
      </div>

      {/* Coaches */}
      <div>
        <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-300">Coach(s)</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {coaches.map((coach) => (
            <div
              key={coach.nom}
              className="flex flex-col items-center w-36 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 bg-gray-800"
            >
              {coach.photoUrl ? (
                <img
                  src={coach.photoUrl}
                  alt={coach.nom}
                  className="w-28 h-28 rounded-full object-cover border-2 border-gray-700"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                  ?
                </div>
              )}
              <span className="mt-3 text-center font-medium text-gray-100">{coach.nom}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tarifs */}
      <div>
        <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-300">Tarifs & Horaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tarifs.map((tarif) => (
            <div
              key={tarif.nom}
              className="border border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gray-800"
            >
              <h3 className="text-2xl font-bold text-indigo-200 mb-2">{tarif.nom}</h3>
              <p className="text-lg font-semibold text-gray-100">{tarif.prix}</p>
              <p className="mt-2 text-gray-300">{tarif.description}</p>
              <ul className="mt-3 list-disc list-inside text-gray-400">
                {tarif.horaires.map((h, idx) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisciplinePage;