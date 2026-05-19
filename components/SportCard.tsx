"use client";
// src/components/SportCard.tsx
import React from "react";
import { useRouter } from "next/navigation";

interface Horaire {
  id: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  description: string;
}

interface SportCardProps {
  name: string;
  description: string;
  imageUrl: string;
  link: string;
  horaires: Horaire[];
}

const JOURS_LABEL: Record<string, string> = {
  lundi: 'Lun',
  mardi: 'Mar',
  mercredi: 'Mer',
  jeudi: 'Jeu',
  vendredi: 'Ven',
  samedi: 'Sam',
  dimanche: 'Dim',
};

const SportCard: React.FC<SportCardProps> = ({ name, description, imageUrl, link, horaires }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(link)}
      className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300 flex flex-col"
      style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", minHeight: "320px" }}
    >
      <div className="absolute inset-0 bg-black/40 transition-colors hover:bg-black/60"></div>
      <div className="absolute bottom-0 p-6 text-white w-full">
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="mt-1 text-sm">{description}</p>
        
        {/* Horaires */}
        {horaires && horaires.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/30">
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide">Horaires</p>
            <div className="space-y-1">
              {horaires.slice(0, 3).map((h) => (
                <div key={h.id} className="text-xs flex items-baseline gap-2">
                  <span className="font-medium">{JOURS_LABEL[h.jour] || h.jour}</span>
                  <span>{h.heure_debut} - {h.heure_fin}</span>
                  {h.description && <span className="text-gray-300">({h.description})</span>}
                </div>
              ))}
              {horaires.length > 3 && (
                <p className="text-xs text-gray-300 italic">+ {horaires.length - 3} autre{horaires.length > 4 ? 's' : ''}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SportCard;