"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SessionUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface Adhesion {
  saison: string;
  statut: string;
  code_zk: number | null;
}

const roleLabel: Record<string, string> = {
  admin: "Administrateur",
  coach: "Coach",
  membre: "Membre",
};

export default function ProfilPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [adhesion, setAdhesion] = useState<Adhesion | null>(null);
  const [qrError, setQrError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/mon-profil")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setUser(data.user);
        setAdhesion(data.adhesion);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!user) return null;

  const qrUrl = `/images/qrcodes/${user.id}.png`;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Titre */}
        <h1 className="text-3xl font-extrabold text-indigo-300 text-center">Mon espace</h1>

        {/* QR Code */}
        <div className="bg-gray-900 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg">
          <h2 className="text-lg font-semibold text-indigo-200">Mon QR Code</h2>
          {!qrError ? (
            <img
              src={qrUrl}
              alt={`QR code de ${user.prenom} ${user.nom}`}
              className="w-52 h-52 object-contain rounded-xl border border-gray-700"
              onError={() => setQrError(true)}
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center rounded-xl border border-dashed border-gray-600 text-gray-500 text-sm text-center px-4">
              QR code non disponible
            </div>
          )}
        </div>

        {/* Informations personnelles */}
        <div className="bg-gray-900 rounded-2xl p-8 shadow-lg space-y-5">
          <h2 className="text-lg font-semibold text-indigo-200 mb-2">Informations personnelles</h2>

          <InfoRow label="Identifiant" value={`#${user.id}`} />
          <InfoRow label="Prénom" value={user.prenom} />
          <InfoRow label="Nom" value={user.nom} />
          <InfoRow label="Email" value={user.email} />
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <span className="text-gray-400 text-sm">Rôle</span>
            <span
              className={`text-sm font-semibold px-3 py-0.5 rounded-full ${
                user.role === "admin"
                  ? "bg-red-900 text-red-200"
                  : user.role === "coach"
                  ? "bg-yellow-900 text-yellow-200"
                  : "bg-green-900 text-green-200"
              }`}
            >
              {roleLabel[user.role] ?? user.role}
            </span>
          </div>
        </div>

        {/* Adhésion */}
        {adhesion && (
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg space-y-5">
            <h2 className="text-lg font-semibold text-indigo-200 mb-2">Adhésion</h2>
            <InfoRow label="Saison" value={adhesion.saison} />
            <InfoRow label="Statut" value={adhesion.statut} />
            {adhesion.code_zk && (
              <InfoRow label="Code ZK" value={String(adhesion.code_zk)} />
            )}
          </div>
        )}

      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-800 pb-4">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-gray-100 font-medium">{value}</span>
    </div>
  );
}
