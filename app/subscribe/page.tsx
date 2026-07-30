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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (/\d/.test(form.nom)) {
      setError("Le nom ne doit pas contenir de chiffres.");
      return;
    }
    if (/\d/.test(form.prenom)) {
      setError("Le prénom ne doit pas contenir de chiffres.");
      return;
    }
    if (form.nom.toLowerCase() === 'test' || form.prenom.toLowerCase() === 'test') {
      setError('Le nom et le prénom ne peuvent pas être "test".');
      return;
    }
    if (form.nom.toLowerCase() === form.prenom.toLowerCase()) {
      setError("Le nom et le prénom doivent être différents.");
      return;
    }
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
        window.dispatchEvent(new Event("userChanged"));
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
                pattern="[^0-9]*"
                title="Le prénom ne doit pas contenir de chiffres"
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
                pattern="[^0-9]*"
                title="Le nom ne doit pas contenir de chiffres"
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
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="Minimum 8 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3c-4.478 0-8.268 2.943-9.542 7 .846 2.511 2.554 4.658 4.807 6.052l1.828-1.828A4 4 0 0110 7a4 4 0 014.172 5.172l1.828-1.828C15.658 9.254 13.511 5.846 10 3zm9.542 7c-1.274 4.057-5.064 7-9.542 7-.89 0-1.75-.12-2.578-.338l2.192-2.192A4 4 0 0010 13a4 4 0 003.586-6.414l2.192-2.192c.158.52.242 1.073.242 1.606z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="confirm">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                required
                minLength={8}
                value={form.confirm}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="Minimum 8 caractères"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                title={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirm ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3c-4.478 0-8.268 2.943-9.542 7 .846 2.511 2.554 4.658 4.807 6.052l1.828-1.828A4 4 0 0110 7a4 4 0 014.172 5.172l1.828-1.828C15.658 9.254 13.511 5.846 10 3zm9.542 7c-1.274 4.057-5.064 7-9.542 7-.89 0-1.75-.12-2.578-.338l2.192-2.192A4 4 0 0010 13a4 4 0 003.586-6.414l2.192-2.192c.158.52.242 1.073.242 1.606z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
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
