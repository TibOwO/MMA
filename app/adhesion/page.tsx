'use client';
import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

// Associer chaque clé de discipline à son URL widget HelloAsso
const WIDGET_URLS: Record<string, { label: string; url: string }> = {
  judo: {
    label: 'Judo',
    url: 'https://www.helloasso-sandbox.com/associations/marseille-fight-club/adhesions/test/widget',
  },
  boxe: {
    label: 'Boxe',
    url: 'https://www.helloasso-sandbox.com/associations/marseille-fight-club/adhesions/test/widget',
  },
  mma: {
    label: 'MMA',
    url: 'https://www.helloasso-sandbox.com/associations/marseille-fight-club/adhesions/test/widget',
  },
};

// URL par défaut si pas de discipline ou si la discipline n'est pas reconnue
const DEFAULT_URL =
  'https://www.helloasso-sandbox.com/associations/marseille-fight-club/adhesions/test/widget';

export default function AdhesionPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const searchParams = useSearchParams();
  const disciplineKey = searchParams.get('discipline') ?? '';

  const discipline = WIDGET_URLS[disciplineKey];
  const widgetUrl = discipline?.url ?? DEFAULT_URL;
  const label = discipline?.label ?? 'club'; // club si pas de discipline ou si la discipline n'est pas reconnue

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
