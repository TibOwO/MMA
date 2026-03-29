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
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold">{name}</h1>
      <p className="text-lg">{presentation}</p>

      <div>
        <h2 className="text-2xl font-semibold mb-2">Coach(s)</h2>
        <div className="flex flex-wrap gap-4">
          {coaches.map((coach) => (
            <div key={coach.nom} className="flex flex-col items-center w-32">
              {coach.photoUrl && (
                <img src={coach.photoUrl} alt={coach.nom} className="w-24 h-24 rounded-full object-cover" />
              )}
              <span className="mt-2 text-center">{coach.nom}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-2">Tarifs & Horaires</h2>
        <div className="space-y-4">
          {tarifs.map((tarif) => (
            <div key={tarif.nom} className="border p-4 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold">{tarif.nom}</h3>
              <p className="font-semibold mt-1">{tarif.prix}</p>
              <p className="mt-2">{tarif.description}</p>
              <ul className="mt-2 list-disc list-inside">
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