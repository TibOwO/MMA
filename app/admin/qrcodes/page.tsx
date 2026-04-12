"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Discipline {
  key: string;
  name: string;
}

function QRCard({ discipline, baseUrl }: { discipline: Discipline; baseUrl: string }) {
  const url = `${baseUrl}/adhesion?discipline=${discipline.key}`;
  const ref = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR ${discipline.name}</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:40px">
        <h2>${discipline.name}</h2>
        ${svgData}
        <p style="margin-top:12px;font-size:12px;color:#666">${url}</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">{discipline.name}</h2>
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
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    try {
      const user = JSON.parse(raw);
      if (user.role !== "admin") { router.replace("/"); return; }
    } catch { router.replace("/login"); return; }
    setBaseUrl(window.location.origin);
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/disciplines")
      .then((r) => r.json())
      .then((data) => setDisciplines(data.disciplines ?? []))
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <a href="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition">← Retour à l&apos;administration</a>
      <h1 className="text-3xl font-bold mt-4 mb-2">QR Codes — Adhésions</h1>
      <p className="text-gray-400 mb-8">
        Affichez ces QR codes dans les locaux. Le scan redirige vers le formulaire d&apos;adhésion de la discipline.
      </p>
      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : disciplines.length === 0 ? (
        <p className="text-gray-500">Aucune discipline configurée.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
          {disciplines.map((d) => (
            <QRCard key={d.key} discipline={d} baseUrl={baseUrl} />
          ))}
        </div>
      )}
    </main>
  );
}

