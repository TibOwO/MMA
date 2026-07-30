"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Valider le token au chargement
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError("Token manquant");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/password-reset/validate-token?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Token invalide ou expiré");
          setTokenValid(false);
        } else {
          setTokenValid(true);
          setUserEmail(data.email);
        }
      } catch (err) {
        setError("Erreur lors de la validation du token");
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la réinitialisation");
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
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
              Réinitialiser le mot de passe
            </h1>
            <p className="text-gray-400 text-sm">
              Créez un nouveau mot de passe sécurisé
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <p className="text-gray-400 mt-4">Vérification du lien...</p>
            </div>
          ) : !tokenValid ? (
            <div className="space-y-4">
              {/* Error Message */}
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                <p className="text-red-300 text-sm font-medium">❌ {error}</p>
                <p className="text-red-200 text-xs mt-2">
                  Le lien a peut-être expiré. Demandez un nouveau lien.
                </p>
              </div>

              {/* Back to Forgot Password */}
              <Link
                href="/forgot-password"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition"
              >
                Demander un nouveau lien
              </Link>
            </div>
          ) : success ? (
            <div className="space-y-4">
              {/* Success Message */}
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <p className="text-green-300 text-sm font-medium">
                  ✓ Mot de passe réinitialisé avec succès !
                </p>
                <p className="text-green-200 text-xs mt-2">
                  Redirection vers la connexion...
                </p>
              </div>

              {/* Manual Link */}
              <Link
                href="/login"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition"
              >
                Aller à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Display */}
              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-white font-medium">{userEmail}</p>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 8 caractères
                </p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Password Match Indicator */}
              {password && confirmPassword && (
                <div className={`text-xs p-2 rounded ${
                  password === confirmPassword
                    ? "bg-green-900/30 text-green-300"
                    : "bg-red-900/30 text-red-300"
                }`}>
                  {password === confirmPassword
                    ? "✓ Les mots de passe correspondent"
                    : "✗ Les mots de passe ne correspondent pas"}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !password || !confirmPassword || password !== confirmPassword}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-medium py-2 rounded-lg transition"
              >
                {submitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
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
            🔒 <strong>Sécurité :</strong> Utilisez un mot de passe fort et unique.
          </p>
        </div>
      </div>
    </main>
  );
}