'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

function AdhesionContent() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const disciplineKey = searchParams.get('discipline') ?? '';

  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!disciplineKey) {
      setError('Aucune discipline spécifiée.');
      return;
    }

    // L'adhésion est réservée aux utilisateurs connectés.
    fetch('/api/mon-profil')
      .then((res) => {
        if (res.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(`/adhesion?discipline=${disciplineKey}`)}`);
          return null;
        }
        if (!res.ok) throw new Error('Session invalide');
        return fetch(`/api/disciplines/${disciplineKey}`);
      })
      .then((r) => {
        if (!r) return null;
        if (!r.ok) throw new Error('Discipline introuvable');
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setLabel(data.name ?? disciplineKey);
        if (!data.helloasso_url) {
          setError("Le formulaire d'adhésion n'est pas encore configuré pour cette discipline.");
        } else {
          setWidgetUrl(data.helloasso_url);
        }
      })
      .catch(() => setError('Discipline introuvable.'));
  }, [disciplineKey, router]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const dataHeight = e.data?.height;
      const el = iframeRef.current;
      if (el && dataHeight && dataHeight > parseFloat(el.style.height || '0')) {
        el.style.height = dataHeight + 'px';
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (error) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </main>
    );
  }

  if (!widgetUrl) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        Chargement…
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Adhésion — {label}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Paiement sécurisé via HelloAsso — 100% reversé au club, contribution volontaire à HelloAsso lors du paiement.
      </p>
      <iframe
        ref={iframeRef}
        id="haWidget"
        src={widgetUrl}
        title="Formulaire d'adhésion HelloAsso"
        allowTransparency
        scrolling="auto"
        style={{ width: '100%', height: '750px', border: 'none', display: 'block' }}
      />
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
