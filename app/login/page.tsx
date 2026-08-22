"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
//combien de temps dure la requete ? 
//reponse :le try se termine quand la reponse est recu du serveur, ou quand une erreur de connexion survient.
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("userChanged"));
        const next = searchParams.get("next");
        router.replace(next || "/");
      } else {
        setError(data.error || "Email ou mot de passe incorrect.");
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
        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium" htmlFor="password">
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="••••••••"
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

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-white text-black font-semibold py-2 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>

          <Link
            href="/subscribe"
            className="text-center border border-white/40 text-white font-semibold py-2 rounded-full hover:bg-white/10 transition"
          >
            Inscription
          </Link>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
          <p className="text-white">Chargement...</p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

