'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Discipline {
  key: string;
  name: string;
  presentation: string;
  tarif: string;
  image_url: string;
}

export default function AdhesionCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Vérifier que l'utilisateur est connecté
    fetch('/api/mon-profil')
      .then((res) => {
        if (res.status === 401) {
          router.replace(`/login?next=${encodeURIComponent('/adhesion-checkout')}`);
          return null;
        }
        if (!res.ok) throw new Error('Session invalide');
        return fetch('/api/disciplines');
      })
      .then((r) => {
        if (!r) return null;
        if (!r.ok) throw new Error('Impossible de charger les disciplines');
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setDisciplines(data.disciplines || []);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMessage(String(err?.message || err));
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    if (error) {
      setErrorMessage('Une erreur est survenue lors du paiement. Veuillez réessayer.');
    }
  }, [error]);

  const handleInitializeCheckout = async (disciplineKey: string) => {
    setProcessingKey(disciplineKey);
    setErrorMessage('');

    try {
      const res = await fetch('/api/adhesion/initialize-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discipline_key: disciplineKey }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Impossible d\'initialiser le paiement');
      }

      // Rediriger vers HelloAsso
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setErrorMessage(String(err?.message || err));
      setProcessingKey(null);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Chargement des disciplines...</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Adhésion au club</h1>
      <p className="text-gray-600 mb-8">
        Sélectionnez la discipline pour laquelle vous souhaitez adhérer. 
        Le paiement est sécurisé via HelloAsso.
      </p>

      {errorMessage && (
        <div className="mb-6 rounded-lg bg-red-100 text-red-800 px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      {disciplines.length === 0 ? (
        <p className="text-center text-gray-500">Aucune discipline disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disciplines.map((discipline) => (
            <div
              key={discipline.key}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {discipline.image_url && (
                <img
                  src={discipline.image_url}
                  alt={discipline.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{discipline.name}</h2>
                {discipline.presentation && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {discipline.presentation}
                  </p>
                )}
                {discipline.tarif && (
                  <p className="text-lg font-semibold text-blue-600 mb-4">
                    {discipline.tarif}
                  </p>
                )}
                <button
                  onClick={() => handleInitializeCheckout(discipline.key)}
                  disabled={processingKey === discipline.key}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  {processingKey === discipline.key
                    ? 'Redirection en cours...'
                    : 'Adhérer à cette discipline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">Comment ça marche ?</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Sélectionnez la discipline qui vous intéresse</li>
          <li>Vous serez redirigé vers HelloAsso pour effectuer le paiement sécurisé</li>
          <li>Une fois le paiement validé, votre adhésion sera automatiquement créée</li>
          <li>Vous recevrez un code d'accès pour le portique du club</li>
        </ol>
      </div>
    </main>
  );
}
