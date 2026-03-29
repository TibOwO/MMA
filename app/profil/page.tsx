"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StoredUser {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  role: string;
  email?: string;
  sport?: string | string[] | null;
}

const roleLabel: Record<string, string> = {
  admin: "Administrateur",
  coach: "Coach",
  membre: "Membre",
};

function SportBadge({ sport }: { sport: string | string[] | null | undefined }) {
  if (!sport) return <span className="text-gray-400">—</span>;
  const list = Array.isArray(sport) ? sport : [sport];
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((s) => (
        <span key={s} className="bg-indigo-900 text-indigo-200 text-sm px-3 py-0.5 rounded-full capitalize">
          {s}
        </span>
      ))}
    </div>
  );
}

export default function ProfilPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [qrError, setQrError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!user) return null;

  const qrUrl = `/images/qrcodes/${user.login}.png`;

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
          <InfoRow label="Login" value={user.login} />
          <InfoRow label="Email" value={user.email || "—"} />
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
          {user.role === "coach" && (
            <div className="flex justify-between items-start border-b border-gray-800 pb-4">
              <span className="text-gray-400 text-sm">Discipline(s)</span>
              <SportBadge sport={user.sport} />
            </div>
          )}
        </div>

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
