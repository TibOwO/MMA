"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardFinancier from "../../../components/DashboardFinancier";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // Un coach qui arrive ici (ancien lien / favori) est renvoyé vers son
  // propre espace pour garder une URL cohérente avec son rôle.
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        if (JSON.parse(raw).role === "coach") {
          router.replace("/coach/dashboard");
          return;
        }
      } catch {
        // Session illisible : DashboardFinancier gère la redirection vers /login
      }
    }
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return <DashboardFinancier />;
}
