// src/app/page.tsx
import React from "react";
import SportCard from "../components/SportCard";
import { disciplines } from "../data/disciplines";

const sportsArray = Object.keys(disciplines).map((key) => ({
  name: disciplines[key as keyof typeof disciplines].name,
  description: disciplines[key as keyof typeof disciplines].presentation,
  imageUrl: `/images/${key}.jpg`,
  link: `/discipline/${key}`,
}));

export default function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Nos Disciplines</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sportsArray.map((sport) => (
          <SportCard key={sport.name} {...sport} />
        ))}
      </div>
    </div>
  );
}