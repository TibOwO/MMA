"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la demande");
        return;
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-gray-400">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              {/* Success Message */}
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <p className="text-green-300 text-sm">
                  ✓ Email envoyé avec succès !
                </p>
                <p className="text-green-200 text-sm mt-2">
                  Vérifiez votre boîte mail (et les spams) pour le lien de réinitialisation.
                  Le lien expire dans 24 heures.
                </p>
              </div>

              {/* Back to Login */}
              <Link
                href="/login"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@example.com"
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-medium py-2 rounded-lg transition"
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </button>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition"
                >
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-xs">
            💡 <strong>Conseil :</strong> Vérifiez votre dossier spam si vous ne recevez pas l'email.
          </p>
        </div>
      </div>
    </main>
  );
}