"use client";

// src/app/discipline/[sport]/page.tsx
import React, { use } from "react";
import { useParams } from "next/navigation";
import DisciplinePage from "../../../components/DisciplinePage";
import { disciplines } from "../../../data/disciplines";

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

  return <DisciplinePage {...sportData} />;
}