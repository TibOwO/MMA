"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Annonce {
  id: number;
  titre: string;
  contenu: string;
  destinataire: string;
  discipline_key: string | null;
  discipline_name: string | null;
  date_creation: string;
  date_expiration: string;
}

interface Discipline {
  key: string;
  name: string;
}

export default function AnnoncesPage() {
  const router = useRouter();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnonce, setEditingAnnonce] = useState<Annonce | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  // Messages
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  // Confirmation de suppression
  const [deletingAnnonceId, setDeletingAnnonceId] = useState<number | null>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    titre: "",
    contenu: "",
    destinataire: "adherents" as string,
    discipline_key: "",
    date_expiration: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le rôle de l'utilisateur
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserRole(user.role);
        }

        // Charger les annonces
        const annoncesRes = await fetch("/api/annonces/mes-annonces", {
          credentials: "include",
        });
        if (annoncesRes.ok) {
          const annoncesData = await annoncesRes.json();
          setAnnonces(annoncesData.annonces || []);
        } else if (annoncesRes.status === 401) {
          router.push("/login");
          return;
        }

        // Charger les disciplines (pour les coachs)
        const disciplinesRes = await fetch("/api/coach/mes-disciplines", {
          credentials: "include",
        });
        if (disciplinesRes.ok) {
          const disciplinesData = await disciplinesRes.json();
          setDisciplines(disciplinesData.disciplines || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveOk(false);

    try {
      const payload = {
        ...formData,
        discipline_key: formData.discipline_key || null,
      };

      if (editingAnnonce) {
        // Modifier
        const res = await fetch(`/api/annonces/${editingAnnonce.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSaveOk(true);
          setTimeout(() => {
            setEditingAnnonce(null);
            setShowForm(false);
            window.location.reload();
          }, 1000);
        } else {
          const data = await res.json();
          setSaveError(data.error || "Erreur lors de la modification");
        }
      } else {
        // Créer
        const res = await fetch("/api/annonces/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSaveOk(true);
          setTimeout(() => {
            setShowForm(false);
            window.location.reload();
          }, 1000);
        } else {
          const data = await res.json();
          setSaveError(data.error || "Erreur lors de la création");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSaveError("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (annonce: Annonce) => {
    setEditingAnnonce(annonce);
    setFormData({
      titre: annonce.titre,
      contenu: annonce.contenu,
      destinataire: annonce.destinataire,
      discipline_key: annonce.discipline_key || "",
      date_expiration: annonce.date_expiration.slice(0, 16), // Format datetime-local
    });
    setSaveError("");
    setSaveOk(false);
    setShowForm(true);
  };

  const confirmDelete = (annonceId: number) => {
    setDeletingAnnonceId(annonceId);
  };

  const handleDelete = async (annonceId: number) => {
    try {
      const res = await fetch(`/api/annonces/${annonceId}/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setAnnonces(annonces.filter((a) => a.id !== annonceId));
        setDeletingAnnonceId(null);
      } else {
        setSaveError("Erreur lors de la suppression");
        setDeletingAnnonceId(null);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSaveError("Erreur lors de la suppression");
      setDeletingAnnonceId(null);
    }
  };

  const resetForm = () => {
    // Date par défaut : dans 7 jours
    const defaultExpiration = new Date();
    defaultExpiration.setDate(defaultExpiration.getDate() + 7);
    const defaultExpirationStr = defaultExpiration.toISOString().slice(0, 16);

    setFormData({
      titre: "",
      contenu: "",
      destinataire: userRole === "coach" ? "adherents" : "tous",
      discipline_key: "",
      date_expiration: defaultExpirationStr,
    });
    setEditingAnnonce(null);
    setShowForm(false);
    setSaveError("");
    setSaveOk(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Mes annonces</h1>
            <p className="text-gray-400 text-sm mt-1">
              Créez des annonces pour informer vos adhérents
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ➕ Créer une annonce
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-gray-900 p-6 rounded-2xl shadow-md mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingAnnonce ? "Modifier l'annonce" : "Nouvelle annonce"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
                  placeholder="Annulation du cours de mardi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Contenu <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.contenu}
                  onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                  required
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
                  placeholder="Le cours de mardi 20h est annulé en raison d'un événement exceptionnel..."
                />
              </div>

              {userRole === "admin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Destinataires <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.destinataire}
                    onChange={(e) => setFormData({ ...formData, destinataire: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
                  >
                    <option value="tous">Tout le monde</option>
                    <option value="coachs">Uniquement les coachs</option>
                    <option value="adherents">Adhérents d'une discipline</option>
                  </select>
                </div>
              )}

              {(userRole === "coach" || (userRole === "admin" && formData.destinataire === "adherents")) && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Discipline {userRole === "coach" && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={formData.discipline_key}
                    onChange={(e) => setFormData({ ...formData, discipline_key: e.target.value })}
                    required={userRole === "coach"}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
                  >
                    <option value="">-- Sélectionner --</option>
                    {disciplines.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date d'expiration <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.date_expiration}
                  onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'annonce sera automatiquement supprimée après cette date
                </p>
              </div>

              {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
              {saveOk && <p className="text-emerald-400 text-sm">Enregistré ✓</p>}

              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {editingAnnonce ? "Modifier" : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des annonces */}
        <div className="bg-gray-900 rounded-2xl shadow-md overflow-hidden">
          {annonces.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Aucune annonce créée
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {annonces.map((annonce) => (
                <div key={annonce.id} className="p-4 hover:bg-gray-800/40 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{annonce.titre}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(annonce)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => confirmDelete(annonce.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-2 whitespace-pre-wrap">{annonce.contenu}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>📅 Expire le {new Date(annonce.date_expiration).toLocaleString("fr-FR")}</span>
                    {annonce.discipline_name && <span>📚 {annonce.discipline_name}</span>}
                    <span className="text-indigo-400">
                      {annonce.destinataire === "tous" && "👥 Tous"}
                      {annonce.destinataire === "coachs" && "🎓 Coachs"}
                      {annonce.destinataire === "adherents" && "👤 Adhérents"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message d'erreur global */}
        {saveError && !showForm && (
          <div className="mt-4 bg-red-900/40 border border-red-700 text-red-400 px-4 py-3 rounded">
            {saveError}
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {deletingAnnonceId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">⚠️ Confirmer la suppression</h2>
            <p className="text-gray-300 mb-6">
              Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deletingAnnonceId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl transition"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeletingAnnonceId(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold px-4 py-2.5 rounded-xl transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
