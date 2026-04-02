"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DisciplinePage from "../../../components/DisciplinePage";

interface Tarif {
  nom: string;
  prix: string;
  horaires: string[];
  description: string;
}

interface Coach {
  id: number;
  prenom: string;
  nom: string;
}

interface Discipline {
  key: string;
  name: string;
  presentation: string;
  tarifs: Tarif[];
  contact: string[];
  coaches: Coach[];
}

export default function SportDynamicPage() {
  const params = useParams();
  const key = params.sport as string;
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/disciplines/${key}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => { if (data) setDiscipline(data); })
      .catch(() => setNotFound(true));
  }, [key]);

  if (notFound) {
    return (
      <div className="text-center mt-20 text-xl">
        Sport introuvable 😕
      </div>
    );
  }

  if (!discipline) return null;

  return <DisciplinePage {...discipline} />;
}