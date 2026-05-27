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
  afficher_qr: boolean;
}

interface Annonce {
  id: number;
  titre: string;
  contenu: string;
  destinataire: string;
  disciplines: { key: string; name: string }[];
  auteur_nom: string;
  date_creation: string;
  date_expiration: string;
}

const roleLabel: Record<string, string> = {
  admin: "Administrateur",
  coach: "Coach",
  membre: "Membre",
};

export default function ProfilPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [filterDiscipline, setFilterDiscipline] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    // Charger le profil
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

    // Charger les annonces
    fetch("/api/annonces/adherent", { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data) {
          setAnnonces(data.annonces || []);
        }
      })
      .catch(() => {
        // Ignorer les erreurs de chargement des annonces
      });
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Titre */}
        <h1 className="text-3xl font-extrabold text-indigo-300 text-center">Mon espace</h1>

        {/* Annonces */}
        {annonces.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-indigo-200">📢 Annonces</h2>
              {(() => {
                const allDisciplineNames = Array.from(
                  new Set(annonces.flatMap((a) => a.disciplines.map((d) => d.name)))
                );
                return allDisciplineNames.length > 0 ? (
                  <select
                    value={filterDiscipline}
                    onChange={(e) => setFilterDiscipline(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-1.5 text-sm"
                  >
                    <option value="all">Toutes</option>
                    {allDisciplineNames.map((discipline) => (
                      <option key={discipline} value={discipline}>
                        {discipline}
                      </option>
                    ))}
                  </select>
                ) : null;
              })()}
            </div>

            <div className="space-y-4">
              {annonces
                .filter((a) => {
                  if (filterDiscipline === "all") return true;
                  return a.disciplines.some((d) => d.name === filterDiscipline);
                })
                .map((annonce) => (
                  <div
                    key={annonce.id}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-bold text-white">{annonce.titre}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                          annonce.destinataire === "tous"
                            ? "bg-blue-900/40 text-blue-400"
                            : annonce.destinataire === "coachs"
                            ? "bg-violet-900/40 text-violet-400"
                            : "bg-green-900/40 text-green-400"
                        }`}
                      >
                        {annonce.destinataire === "tous" && "👥"}
                        {annonce.destinataire === "coachs" && "🎓"}
                        {annonce.destinataire === "adherents" && "👤"}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{annonce.contenu}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex gap-3 flex-wrap">
                        <span>✍️ {annonce.auteur_nom}</span>
                        {annonce.disciplines.length > 0 && (
                          <span>📚 {annonce.disciplines.map((d) => d.name).join(", ")}</span>
                        )}
                      </div>
                      <span>📅 {new Date(annonce.date_creation).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Adhésions */}
        {adhesions.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg text-center text-gray-400">
            <p className="mb-2 font-semibold text-white">Aucune adhésion active</p>
            <p className="text-sm">Scannez un QR code dans les locaux du club pour vous inscrire à une discipline.</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
            <h2 className="text-lg font-semibold text-indigo-200 mb-6">Mes adhésions</h2>
            {adhesions.length === 1 ? (
              // Une seule adhésion : affichage normal
              <AdhesionCard adhesion={adhesions[0]} />
            ) : (
              // Plusieurs adhésions : carrousel horizontal
              <div className="relative">
                <div className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scroll-smooth">
                  <div className="flex gap-4" style={{ width: `${adhesions.length * 100}%` }}>
                    {adhesions.map((adhesion, i) => (
                      <div key={i} className="snap-center shrink-0" style={{ width: `${100 / adhesions.length}%`, minWidth: "300px" }}>
                        <AdhesionCard adhesion={adhesion} />
                      </div>
                    ))}
                  </div>
                </div>
                {adhesions.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {adhesions.map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-gray-700"></div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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

      </div>
    </main>
  );
}

function AdhesionCard({ adhesion }: { adhesion: Adhesion }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
      <h3 className="text-base font-bold text-white mb-4">
        {adhesion.discipline || "Adhésion"}
      </h3>
      <InfoRow label="Saison" value={adhesion.saison} />
      <InfoRow label="Statut" value={adhesion.statut} />
      {adhesion.code_zk !== null && adhesion.afficher_qr ? (
        <>
          <InfoRow label="Code ZK" value={String(adhesion.code_zk)} />
          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-sm text-gray-400">QR Code d&apos;accès au portique</p>
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG value={String(adhesion.code_zk)} size={160} />
            </div>
            <p className="text-xs text-gray-500 text-center max-w-xs">
              Scannez ce QR code au portique pour accéder au club
            </p>
          </div>
        </>
      ) : adhesion.code_zk !== null && !adhesion.afficher_qr ? (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 mt-2">
          <p className="text-sm text-red-300 text-center">
            🔒 Votre QR code a été temporairement désactivé. Contactez votre coach pour plus d&apos;informations.
          </p>
        </div>
      ) : (
        <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4 mt-2">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-amber-200">
              <p className="font-semibold">QR code non disponible</p>
              <p className="text-amber-300 mt-1">
                Le code d&apos;accès au portique n&apos;a pas encore été configuré pour cette discipline. Contactez un administrateur.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
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
