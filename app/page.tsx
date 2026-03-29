"use client"; // On met en client pour utiliser éventuellement des hooks si nécessaire

import React from "react";
import SportCard from "../components/SportCard";
import { disciplines } from "../data/disciplines";
import Link from "next/link";

const sportsArray = Object.keys(disciplines).map((key) => ({
  name: disciplines[key as keyof typeof disciplines].name,
  description: disciplines[key as keyof typeof disciplines].presentation,
  imageUrl: `/images/${key}.jpg`,
  link: `/discipline/${key}`,
}));

export default function HomePage() {
  return (
    <div className="relative">
      {/* Présentation du club */}
      <section className="container mx-auto p-6 mb-10 text-center">
        <h2 className="text-3xl font-bold mb-4">Bienvenue au MMA Club</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Le MMA Club est l'endroit idéal pour apprendre et pratiquer les sports de combat dans un environnement sûr et motivant. 
          Que vous soyez débutant ou confirmé, enfant ou adulte, nos coachs expérimentés vous accompagnent pour progresser à votre rythme.
        </p>
      </section>

      {/* Grille des disciplines */}
      <section className="container mx-auto p-6">
        <h2 className="text-4xl font-bold mb-6 text-center">Nos Disciplines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sportsArray.map((sport) => (
            <SportCard key={sport.name} {...sport} />
          ))}
        </div>
      </section>
    </div>
  );
}