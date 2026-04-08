"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscribePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/profil");
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Créer mon compte</h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          Accédez à votre espace membre après inscription.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" htmlFor="prenom">
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                required
                value={form.prenom}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" htmlFor="nom">
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                value={form.nom}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="8 caractères minimum"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="confirm">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              value={form.confirm}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-white text-black font-semibold py-2 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "Création du compte…" : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Déjà un compte ?{" "}
            <a href="/login" className="text-white underline">
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
