"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { QRCodeSVG } from "qrcode.react";

import { formaterTelephone, normaliserTelephone } from "../../lib/telephone";

interface SessionUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  telephone_enfant: string;
  role: string;
}

interface Horaire {
  id: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  description: string;
}

interface Adhesion {
  saison: string;
  statut: string;
  discipline: string | null;
  discipline_key: string | null;
  code_zk: number | null;
  afficher_qr: boolean;
  horaires: Horaire[];
}

const JOURS_LABEL: Record<string, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

interface Annonce {
  id: number;
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

const DESTINATAIRE_BADGE: Record<string, { label: string; className: string }> = {
  tous: { label: "👥 Tous", className: "bg-blue-900/40 text-blue-300" },
  coachs: { label: "🎓 Coachs", className: "bg-violet-900/40 text-violet-300" },
  adherents: { label: "👤 Adhérents", className: "bg-green-900/40 text-green-300" },
};

export default function ProfilPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [filterDiscipline, setFilterDiscipline] = useState<string>("all");
  const router = useRouter();

  // Édition des informations personnelles
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ prenom: "", nom: "", telephone: "", telephone_enfant: "" });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

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

  const ouvrirEdition = () => {
    if (!user) return;
    setEditForm({
      prenom: user.prenom,
      nom: user.nom,
      telephone: formaterTelephone(user.telephone),
      telephone_enfant: formaterTelephone(user.telephone_enfant),
    });
    setEditError("");
    setEditing(true);
  };

  const enregistrerEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");

    const telephone = normaliserTelephone(editForm.telephone);
    if (!telephone) {
      setEditError("Numéro de téléphone invalide. Format attendu : 06 12 34 56 78.");
      return;
    }
    const telephoneEnfant = normaliserTelephone(editForm.telephone_enfant);
    if (telephoneEnfant === null) {
      setEditError("Numéro de téléphone de l'enfant invalide. Format attendu : 06 12 34 56 78.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/mon-profil/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prenom: editForm.prenom.trim(),
          nom: editForm.nom.trim(),
          telephone,
          telephone_enfant: telephoneEnfant,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        // Le header et les pages qui lisent localStorage doivent suivre
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("userChanged"));
        setEditing(false);
      } else {
        setEditError(data.error || "Erreur lors de l'enregistrement.");
      }
    } catch {
      setEditError("Erreur de connexion au serveur.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const disciplinesAnnoncees = Array.from(
    new Set(annonces.flatMap((a) => a.disciplines.map((d) => d.name)))
  );

  const annoncesVisibles = annonces.filter((a) => {
    if (filterDiscipline === "all") return true;
    return a.disciplines.some((d) => d.name === filterDiscipline);
  });

  const adhesionsAvecHoraires = adhesions.filter((a) => a.horaires.length > 0);

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* En-tête */}
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold text-indigo-300">Mon espace</h1>
          <p className="text-gray-400 text-sm">
            {user.prenom} {user.nom}
          </p>
        </header>

        {/* Annonces */}
        {annonces.length > 0 && (
          <Section
            icon="📢"
            title="Annonces"
            action={
              disciplinesAnnoncees.length > 0 ? (
                <select
                  value={filterDiscipline}
                  onChange={(e) => setFilterDiscipline(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="all">Toutes</option>
                  {disciplinesAnnoncees.map((discipline) => (
                    <option key={discipline} value={discipline}>
                      {discipline}
                    </option>
                  ))}
                </select>
              ) : null
            }
          >
            {annoncesVisibles.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune annonce pour cette discipline.
              </p>
            ) : (
              <div className="space-y-3">
                {annoncesVisibles.map((annonce) => {
                  const badge = DESTINATAIRE_BADGE[annonce.destinataire];
                  return (
                    <article
                      key={annonce.id}
                      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition"
                    >
                      <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
                        {annonce.contenu}
                      </p>

                      <div className="mt-3 pt-3 border-t border-gray-700/50 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
                        {badge && (
                          <span className={`font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                            {badge.label}
                          </span>
                        )}
                        <span>✍️ {annonce.auteur_nom}</span>
                        {annonce.disciplines.length > 0 && (
                          <span>📚 {annonce.disciplines.map((d) => d.name).join(", ")}</span>
                        )}
                        <span className="ml-auto">
                          📅 {new Date(annonce.date_creation).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Section>
        )}

        {/* Adhésions */}
        {adhesions.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-lg text-center text-gray-400">
            <p className="mb-2 font-semibold text-white">Aucune adhésion active</p>
            <p className="text-sm">
              Scannez un QR code dans les locaux du club pour vous inscrire à une discipline.
            </p>
          </div>
        ) : (
          <Section icon="🥋" title="Mes adhésions">
            {adhesions.length === 1 ? (
              // Une seule adhésion : affichage normal
              <AdhesionCard adhesion={adhesions[0]} />
            ) : (
              // Plusieurs adhésions : carrousel horizontal
              <div className="relative">
                <div className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scroll-smooth">
                  <div className="flex gap-4" style={{ width: `${adhesions.length * 100}%` }}>
                    {adhesions.map((adhesion, i) => (
                      <div
                        key={i}
                        className="snap-center shrink-0"
                        style={{ width: `${100 / adhesions.length}%`, minWidth: "300px" }}
                      >
                        <AdhesionCard adhesion={adhesion} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-2">
                  {adhesions.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-gray-700"></div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Mes horaires */}
        {adhesionsAvecHoraires.length > 0 && (
          <Section icon="🕒" title="Mes horaires">
            <div className="space-y-6">
              {adhesionsAvecHoraires.map((adhesion, i) => (
                <div key={i} className="space-y-2">
                  {adhesionsAvecHoraires.length > 1 && (
                    <h3 className="text-sm font-bold text-white">{adhesion.discipline}</h3>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-800/50">
                          <th className="px-4 py-2 text-indigo-300 text-sm font-medium rounded-l-lg">Jour</th>
                          <th className="px-4 py-2 text-indigo-300 text-sm font-medium">Horaire</th>
                          <th className="px-4 py-2 text-indigo-300 text-sm font-medium rounded-r-lg">Détail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adhesion.horaires.map((h) => (
                          <tr key={h.id} className="border-t border-gray-800">
                            <td className="px-4 py-2.5 capitalize font-medium text-gray-100">
                              {JOURS_LABEL[h.jour] ?? h.jour}
                            </td>
                            <td className="px-4 py-2.5 text-gray-300">
                              {h.heure_debut} – {h.heure_fin}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 text-sm">{h.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Informations personnelles */}
        <Section
          icon="👤"
          title="Informations personnelles"
          action={
            !editing ? (
              <button
                onClick={ouvrirEdition}
                className="text-xs text-gray-500 hover:text-gray-300 transition"
              >
                Modifier
              </button>
            ) : null
          }
        >
          {editing ? (
            <form onSubmit={enregistrerEdition} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1" htmlFor="edit-prenom">Prénom</label>
                  <input
                    id="edit-prenom"
                    type="text"
                    required
                    pattern="[^0-9]*"
                    value={editForm.prenom}
                    onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1" htmlFor="edit-nom">Nom</label>
                  <input
                    id="edit-nom"
                    type="text"
                    required
                    pattern="[^0-9]*"
                    value={editForm.nom}
                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1" htmlFor="edit-tel">Téléphone</label>
                  <input
                    id="edit-tel"
                    type="tel"
                    required
                    value={editForm.telephone}
                    onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                    placeholder="06 12 34 56 78"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1" htmlFor="edit-tel-enfant">
                    Téléphone de l&apos;enfant <span className="text-gray-600">(facultatif)</span>
                  </label>
                  <input
                    id="edit-tel-enfant"
                    type="tel"
                    value={editForm.telephone_enfant}
                    onChange={(e) => setEditForm({ ...editForm, telephone_enfant: e.target.value })}
                    placeholder="06 12 34 56 78"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                L&apos;adresse email sert d&apos;identifiant de connexion et ne peut pas être modifiée ici.
              </p>

              {editError && <p className="text-red-400 text-sm">{editError}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl transition text-sm disabled:opacity-50"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-xl transition text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <dl className="divide-y divide-gray-800">
              <InfoRow label="Identifiant" value={`#${user.id}`} />
              <InfoRow label="Prénom" value={user.prenom} />
              <InfoRow label="Nom" value={user.nom} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow
                label="Téléphone"
                value={
                  user.telephone
                    ? formaterTelephone(user.telephone)
                    : <span className="text-gray-500 font-normal">Non renseigné</span>
                }
              />
              {user.telephone_enfant && (
                <InfoRow label="Téléphone de l'enfant" value={formaterTelephone(user.telephone_enfant)} />
              )}
              <InfoRow
                label="Rôle"
                value={
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
                }
              />
            </dl>
          )}
        </Section>

      </div>
    </main>
  );
}

function Section({
  icon,
  title,
  action,
  children,
}: {
  icon?: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-lg">
      <div className="flex justify-between items-center gap-4 mb-5">
        <h2 className="text-lg font-semibold text-indigo-200 flex items-center gap-2">
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function AdhesionCard({ adhesion }: { adhesion: Adhesion }) {
  const statutLabel = adhesion.statut === 'payee' 
    ? 'Payée' 
    : adhesion.statut === 'en_attente' 
    ? 'En attente' 
    : adhesion.statut === 'expiree' 
    ? 'Expirée' 
    : 'Remboursée';

  const statutColor = adhesion.statut === 'payee'
    ? 'text-green-400'
    : adhesion.statut === 'en_attente'
    ? 'text-blue-400'
    : adhesion.statut === 'expiree'
    ? 'text-amber-400'
    : 'text-red-400';

  return (
    <div className="bg-gray-800/50 rounded-xl p-5 sm:p-6 border border-gray-700/50 h-full">
      <h3 className="text-base font-bold text-white mb-3">
        {adhesion.discipline || "Adhésion"}
      </h3>

      <dl className="divide-y divide-gray-800">
        <InfoRow label="Saison" value={adhesion.saison} />
        <InfoRow
          label="Statut"
          value={<span className={`font-semibold ${statutColor}`}>{statutLabel}</span>}
        />
        {adhesion.code_zk !== null && adhesion.afficher_qr && (
          <InfoRow label="Code ZK" value={String(adhesion.code_zk)} />
        )}
      </dl>

      {adhesion.code_zk !== null && adhesion.afficher_qr ? (
        <div className="flex flex-col items-center gap-3 mt-5">
          <p className="text-sm text-gray-400">QR Code d&apos;accès au portique</p>
          <div className="bg-white p-3 rounded-xl" data-testid="qr-code">
            <QRCodeSVG value={String(adhesion.code_zk)} size={160} />
          </div>
          <p className="text-xs text-gray-500 text-center max-w-xs">
            Scannez ce QR code au portique pour accéder au club
          </p>
        </div>
      ) : adhesion.code_zk !== null && !adhesion.afficher_qr ? (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 mt-5">
          <p className="text-sm text-red-300 text-center">
            🔒 Votre QR code a été temporairement désactivé. Contactez votre coach pour plus d&apos;informations.
          </p>
        </div>
      ) : (
        <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4 mt-5">
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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-gray-400 text-sm">{label}</dt>
      <dd className="text-gray-100 font-medium text-right">{value}</dd>
    </div>
  );
}
