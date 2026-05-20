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
  code_zk: number | null;
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
  
  // Code promo
  const [showCodePromo, setShowCodePromo] = useState(false);
  const [codePromo, setCodePromo] = useState('');
  const [codePromoData, setCodePromoData] = useState<any>(null);
  const [codePromoError, setCodePromoError] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);

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

  // Vérifier si la discipline est prête pour l'adhésion
  const isDisciplineReady = (discipline: Discipline): boolean => {
    return discipline.tarif.trim() !== '' && discipline.code_zk !== null;
  };

  // Message d'erreur pour discipline non configurée
  const getDisabledMessage = (discipline: Discipline): string => {
    if (!discipline.tarif.trim() && discipline.code_zk === null) {
      return 'Tarif et code ZK non configurés';
    }
    if (!discipline.tarif.trim()) {
      return 'Tarif non configuré';
    }
    if (discipline.code_zk === null) {
      return 'Code ZK non configuré';
    }
    return '';
  };

  // Afficher la modal de choix de paiement
  const handleDisciplineClick = (discipline: Discipline) => {
    const amount = extractAmount(discipline.tarif);
    
    // Réinitialiser le code promo
    setShowCodePromo(false);
    setCodePromo('');
    setCodePromoData(null);
    setCodePromoError('');
    
    // Si montant < 90€, paiement comptant direct (pas assez pour 3 fois)
    if (amount < 90) {
      handleInitializeCheckout(discipline.key, false);
    } else {
      // Sinon, proposer le choix
      setSelectedDiscipline(discipline);
      setShowPaymentChoice(true);
    }
  };

  // Valider le code promo
  const handleValidateCodePromo = async () => {
    if (!codePromo.trim() || !selectedDiscipline) return;

    setValidatingCode(true);
    setCodePromoError('');

    try {
      const res = await fetch('/api/codes-promo/valider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codePromo.toUpperCase(),
          discipline_key: selectedDiscipline.key,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCodePromoError(data.error || 'Code promo invalide');
        setCodePromoData(null);
      } else {
        setCodePromoData(data.code_promo);
        setCodePromoError('');
      }
    } catch (err) {
      setCodePromoError('Erreur lors de la validation du code');
      setCodePromoData(null);
    } finally {
      setValidatingCode(false);
    }
  };

  // Calculer le prix final après réduction
  const calculateFinalPrice = (tarif: string): number => {
    const basePrice = extractAmount(tarif);
    if (!codePromoData) return basePrice;

    if (codePromoData.type_reduction === 'pourcentage') {
      return Math.max(0, basePrice - (basePrice * codePromoData.valeur / 100));
    } else {
      return Math.max(0, basePrice - codePromoData.valeur);
    }
  };

  const handleInitializeCheckout = async (disciplineKey: string, enableInstallments: boolean) => {
    setProcessingKey(disciplineKey);
    setErrorMessage('');
    setShowPaymentChoice(false);

    try {
      const payload: any = {
        discipline_key: disciplineKey,
        enable_installments: enableInstallments,
      };

      // Ajouter le code promo s'il est valide
      if (codePromoData) {
        payload.code_promo = codePromoData.code;
      }

      const res = await fetch('/api/adhesion/initialize-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
                
                {!isDisciplineReady(discipline) && (
                  <p className="text-sm text-amber-600 mb-3 bg-amber-50 px-3 py-2 rounded border border-amber-200">
                    ⚠️ {getDisabledMessage(discipline)}
                  </p>
                )}
                
                <button
                  onClick={() => handleDisciplineClick(discipline)}
                  disabled={processingKey === discipline.key || !isDisciplineReady(discipline)}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  {processingKey === discipline.key
                    ? 'Redirection en cours...'
                    : !isDisciplineReady(discipline)
                    ? 'Non disponible'
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">{selectedDiscipline.name}</h2>
            <p className="text-gray-600 mb-4">
              Tarif : <span className={`font-semibold ${codePromoData ? 'line-through text-gray-400' : 'text-blue-600'}`}>
                {selectedDiscipline.tarif}
              </span>
              {codePromoData && (
                <span className="ml-2 font-bold text-green-600">
                  {calculateFinalPrice(selectedDiscipline.tarif).toFixed(2)}€
                </span>
              )}
            </p>

            {/* Section code promo */}
            <div className="mb-6">
              {!showCodePromo ? (
                <button
                  onClick={() => setShowCodePromo(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  J'ai un code promo
                </button>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Code promo (optionnel)
                    </label>
                    <button
                      onClick={() => {
                        setShowCodePromo(false);
                        setCodePromo('');
                        setCodePromoData(null);
                        setCodePromoError('');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Masquer
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codePromo}
                      onChange={(e) => {
                        setCodePromo(e.target.value.toUpperCase());
                        setCodePromoError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleValidateCodePromo();
                        }
                      }}
                      placeholder="BIENVENUE2025"
                      disabled={validatingCode || !!codePromoData}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm uppercase disabled:bg-gray-100 text-gray-900 placeholder-gray-400 bg-white"
                    />
                    {!codePromoData ? (
                      <button
                        onClick={handleValidateCodePromo}
                        disabled={!codePromo.trim() || validatingCode}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        {validatingCode ? '...' : 'Valider'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setCodePromo('');
                          setCodePromoData(null);
                          setCodePromoError('');
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                  
                  {codePromoError && (
                    <p className="mt-2 text-xs text-red-600">⚠️ {codePromoError}</p>
                  )}
                  
                  {codePromoData && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-semibold text-green-800 mb-1">
                        ✓ Code promo appliqué !
                      </p>
                      <p className="text-xs text-green-700">
                        {codePromoData.description || `Réduction de ${codePromoData.type_reduction === 'pourcentage' ? codePromoData.valeur + '%' : codePromoData.valeur + '€'}`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

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
                      Paiement en une seule fois : {codePromoData 
                        ? `${calculateFinalPrice(selectedDiscipline.tarif).toFixed(2)}€`
                        : selectedDiscipline.tarif}
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
                      3 mensualités de {Math.ceil(calculateFinalPrice(selectedDiscipline.tarif) / 3)}€
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
                setCodePromo('');
                setCodePromoData(null);
                setCodePromoError('');
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
