"use client";

// src/app/discipline/[sport]/page.tsx
import React from "react";
import { useParams } from "next/navigation";
import DisciplinePage from "../../../components/DisciplinePage";
import { disciplines } from "../../../data/disciplines";
import { users } from "../../../data/users";

export default function SportDynamicPage() {
  const params = useParams();
  const name = params.sport as string;
  const sportData = disciplines[name as keyof typeof disciplines];

  if (!sportData) {
    return (
      <div className="text-center mt-20 text-xl">
        Sport introuvable 😕
      </div>
    );
  }

  // Filtrer les coachs utilisateurs selon le sport (champ sport dans users)
  const coachsForSport = users.filter((u) => {
    if (u.role !== "coach") return false;
    if (!u.sport) return false;
    if (typeof u.sport === "string") return u.sport === name;
    if (Array.isArray(u.sport)) return u.sport.includes(name);
    return false;
  }).map((u) => ({
    nom: `${u.prenom} ${u.nom}`,
    photoUrl: `/images/coaches/${u.prenom.toLowerCase() + u.nom.toLowerCase()}.jpg`,
  }));

  return <DisciplinePage {...sportData} coaches={coachsForSport} />;
}