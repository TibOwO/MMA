"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { users } from "@/data/users";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const user = users.find(
      (u) => u.login?.toLowerCase() === login.toLowerCase() && u.password === password
    );

    if (user) {
      localStorage.setItem("user", JSON.stringify({
        id: user.id,
        login: user.login,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        email: user.email,
        sport: user.sport ?? null,
      }));
      router.push("/");
    } else {
      setError("Login ou mot de passe incorrect.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="login">
              Login
            </label>
            <input
              id="login"
              type="text"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Votre login"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="mt-2 bg-white text-black font-semibold py-2 rounded-full hover:bg-gray-200 transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
