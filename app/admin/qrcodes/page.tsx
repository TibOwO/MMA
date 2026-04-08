"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

const BASE_URL = "http://localhost:3000";

const DISCIPLINES = [
  { key: "judo", label: "Judo" },
  { key: "boxe", label: "Boxe" },
  { key: "mma", label: "MMA" },
];

function QRCard({ discipline }: { discipline: { key: string; label: string } }) {
  const url = `${BASE_URL}/adhesion?discipline=${discipline.key}`;
  const ref = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR ${discipline.label}</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:40px">
        <h2>${discipline.label}</h2>
        ${svgData}
        <p style="margin-top:12px;font-size:12px;color:#666">${url}</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">{discipline.label}</h2>
      <div ref={ref} className="bg-white p-3 rounded-xl">
        <QRCodeSVG value={url} size={180} />
      </div>
      <p className="text-xs text-gray-400 text-center break-all">{url}</p>
      <button
        onClick={handlePrint}
        className="mt-1 bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-200 transition"
      >
        Imprimer
      </button>
    </div>
  );
}

export default function QRCodesPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">QR Codes — Adhésions</h1>
      <p className="text-gray-400 mb-8">
        Affichez ces QR codes dans les locaux. Le scan redirige vers le formulaire HelloAsso de la discipline.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
        {DISCIPLINES.map((d) => (
          <QRCard key={d.key} discipline={d} />
        ))}
      </div>
      <p className="mt-10 text-xs text-gray-600">
        Pour remplacer les URLs par les vraies URLs HelloAsso, modifiez <code>WIDGET_URLS</code> dans <code>app/adhesion/page.tsx</code>.
      </p>
    </main>
  );
}
