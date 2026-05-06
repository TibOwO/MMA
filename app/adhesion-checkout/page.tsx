'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Discipline {
  key: string;
  name: string;
  presentation: string;
  tarif: string;
  image_url: string;
}

// Composant client qui utilise useSearchParams
function AdhesionCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modal de choix du mode de paiement
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);

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

  // Extraire le montant numérique du tarif (ex: "300 €" -> 300)
  const extractAmount = (tarif: string): number => {
    const match = tarif.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Afficher la modal de choix de paiement
  const handleDisciplineClick = (discipline: Discipline) => {
    const amount = extractAmount(discipline.tarif);
    
    // Si montant < 90€, paiement comptant direct (pas assez pour 3 fois)
    if (amount < 90) {
      handleInitializeCheckout(discipline.key, false);
    } else {
      // Sinon, proposer le choix
      setSelectedDiscipline(discipline);
      setShowPaymentChoice(true);
    }
  };

  const handleInitializeCheckout = async (disciplineKey: string, enableInstallments: boolean) => {
    setProcessingKey(disciplineKey);
    setErrorMessage('');
    setShowPaymentChoice(false);

    try {
      const res = await fetch('/api/adhesion/initialize-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          discipline_key: disciplineKey,
          enable_installments: enableInstallments 
        }),
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
                  onClick={() => handleDisciplineClick(discipline)}
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

      {/* Modal de choix du mode de paiement */}
      {showPaymentChoice && selectedDiscipline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-2">{selectedDiscipline.name}</h2>
            <p className="text-gray-600 mb-6">
              Tarif : <span className="font-semibold text-blue-600">{selectedDiscipline.tarif}</span>
            </p>

            <h3 className="text-lg font-semibold mb-4">Choisissez votre mode de paiement</h3>

            <div className="space-y-3 mb-6">
              {/* Option paiement comptant */}
              <button
                onClick={() => handleInitializeCheckout(selectedDiscipline.key, false)}
                disabled={!!processingKey}
                className="w-full text-left border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-4 transition-all disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💳</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Paiement comptant</div>
                    <div className="text-sm text-gray-600">
                      Paiement en une seule fois : {selectedDiscipline.tarif}
                    </div>
                  </div>
                </div>
              </button>

              {/* Option paiement en 3 fois */}
              <button
                onClick={() => handleInitializeCheckout(selectedDiscipline.key, true)}
                disabled={!!processingKey}
                className="w-full text-left border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 rounded-xl p-4 transition-all disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📅</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Paiement en 3 fois</div>
                    <div className="text-sm text-gray-600">
                      3 mensualités de {Math.ceil(extractAmount(selectedDiscipline.tarif) / 3)}€
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      ✓ Sans frais supplémentaires
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Bouton annuler */}
            <button
              onClick={() => {
                setShowPaymentChoice(false);
                setSelectedDiscipline(null);
              }}
              disabled={!!processingKey}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// Composant principal avec Suspense boundary
export default function AdhesionCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Chargement...</p>
        </main>
      }
    >
      <AdhesionCheckoutContent />
    </Suspense>
  );
}
