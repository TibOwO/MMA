'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

function AdhesionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const disciplineKey = searchParams.get('discipline') ?? '';
  
  // HelloAsso Checkout Intent retourne: orderId, checkoutIntentId, code
  const returnOrderId = searchParams.get('orderId') ?? '';
  const checkoutCode = searchParams.get('code') ?? '';  // succeeded, refused, etc.

  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [confirmState, setConfirmState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [confirmMessage, setConfirmMessage] = useState('');

  // Si pas de retour HelloAsso, rediriger vers la page de sélection
  useEffect(() => {
    if (!returnOrderId) {
      router.replace('/adhesion-checkout');
    }
  }, [returnOrderId, router]);

  useEffect(() => {
    if (!disciplineKey || !returnOrderId) {
      return;
    }

    // Charger le nom de la discipline pour l'affichage
    fetch('/api/disciplines/' + disciplineKey)
      .then((r) => {
        if (!r.ok) throw new Error('Discipline introuvable');
        return r.json();
      })
      .then((data) => {
        setLabel(data.name ?? disciplineKey);
      })
      .catch(() => setError('Discipline introuvable.'));
  }, [disciplineKey, returnOrderId]);

  useEffect(() => {
    if (!returnOrderId || !disciplineKey) {
      return;
    }

    // Si le paiement a échoué, afficher un message d'erreur
    if (checkoutCode && checkoutCode !== 'succeeded') {
      setConfirmState('error');
      setConfirmMessage('Le paiement a été refusé ou annulé. Veuillez réessayer.');
      return;
    }

    setConfirmState('loading');
    setConfirmMessage('Confirmation du paiement en cours...');

    console.log('[Adhesion] Calling confirm-order with:', { ha_order_id: returnOrderId, discipline_key: disciplineKey });

    fetch('/api/helloasso/confirm-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ha_order_id: returnOrderId, discipline_key: disciplineKey }),
      credentials: 'include',
    })
      .then(async (res) => {
        console.log('[Adhesion] Response status:', res.status);
        const data = await res.json();
        console.log('[Adhesion] Response data:', data);
        
        // Si l'adhésion sera créée par le webhook (404), c'est OK
        if (res.status === 404 && data.will_be_created_by_webhook) {
          setConfirmState('success');
          setConfirmMessage('Votre paiement a été enregistré. Votre adhésion sera activée sous peu.');
          return;
        }
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Impossible de confirmer le paiement.');
        }
        setConfirmState('success');
        if (data.already_exists) {
          setConfirmMessage('Adhésion déjà confirmée pour cette commande.');
          return;
        }
        setConfirmMessage('Paiement confirmé, votre adhésion a été créée.');
      })
      .catch((err) => {
        console.error('[Adhesion] Error:', err);
        setConfirmState('error');
        setConfirmMessage(String(err?.message || err));
      });
  }, [returnOrderId, disciplineKey, checkoutCode]);

  if (error) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </main>
    );
  }

  // Page de confirmation après paiement
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Adhésion — {label || disciplineKey}</h1>
      <div
        className={`mt-6 rounded-lg px-4 py-3 text-sm ${
          confirmState === 'success'
            ? 'bg-green-100 text-green-800'
            : confirmState === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
        }`}
      >
        {confirmMessage || 'Traitement en cours...'}
      </div>
      {confirmState === 'success' && (
        <div className="mt-6 text-center">
          <a
            href="/profil"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
          >
            Voir mon profil
          </a>
        </div>
      )}
    </main>
  );
}

export default function AdhesionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement…</div>}>
      <AdhesionContent />
    </Suspense>
  );
}
