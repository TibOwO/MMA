'use client';
import React, { useEffect, useRef } from 'react';

const WIDGET_URL =
  'https://www.helloasso-sandbox.com/associations/marseille-fight-club/adhesions/test/widget';

export default function SubscriptionPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
      <h1 className="text-2xl font-bold mb-2">Adhésion au club</h1>
      <p className="text-sm text-gray-500 mb-6">
        Paiement sécurisé via HelloAsso — 100% reversé au club, contribution volontaire à HelloAsso lors du paiement.
      </p>
      <iframe
        ref={iframeRef}
        id="haWidget"
        src={WIDGET_URL}
        title="Formulaire d'adhésion HelloAsso"
        allowTransparency
        scrolling="auto"
        style={{ width: '100%', height: '750px', border: 'none', display: 'block' }}
      />
    </main>
  );
}
