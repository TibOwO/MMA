"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { QRCodeSVG } from "qrcode.react";

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
  discipline: string | null;
  discipline_key: string | null;
  code_zk: number | null;
}

const roleLabel: Record<string, string> = {
  admin: "Administrateur",
  coach: "Coach",
  membre: "Membre",
};

export default function ProfilPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
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
        setAdhesions(data.adhesions ?? []);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Titre */}
        <h1 className="text-3xl font-extrabold text-indigo-300 text-center">Mon espace</h1>

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

        {/* Adhésions */}
        {adhesions.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg text-center text-gray-400">
            <p className="mb-2 font-semibold text-white">Aucune adhésion active</p>
            <p className="text-sm">Scannez un QR code dans les locaux du club pour vous inscrire à une discipline.</p>
          </div>
        ) : (
          adhesions.map((a, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-8 shadow-lg space-y-5">
              <h2 className="text-lg font-semibold text-indigo-200 mb-2">
                Adhésion{a.discipline ? ` — ${a.discipline}` : ""}
              </h2>
              <InfoRow label="Saison" value={a.saison} />
              <InfoRow label="Statut" value={a.statut} />
              {a.code_zk !== null && (
                <>
                  <InfoRow label="Code ZK" value={String(a.code_zk)} />
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <p className="text-sm text-gray-400">QR Code d&apos;accès</p>
                    <div className="bg-white p-3 rounded-xl">
                      <QRCodeSVG value={String(a.code_zk)} size={160} />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
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
