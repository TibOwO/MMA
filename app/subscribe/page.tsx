'use client';
import React, { useState } from 'react';
import { disciplines } from '../../data/disciplines';


export default function SubscriptionPage() {
  const allOffers = Object.entries(disciplines).flatMap(([disciplineKey, discipline]) =>
    discipline.tarifs.map((tarif, idx) => ({
      disciplineKey,
      disciplineName: discipline.name,
      offerName: tarif.nom,
      prix: tarif.prix,
      prixValue: parseFloat(tarif.prix.replace(/[^\d.]/g, '')),
      description: tarif.description,
      horaires: tarif.horaires,
      idx,
    }))
  );

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [codePromo, setCodePromo] = useState('');
  const [selectedOffer, setSelectedOffer] = useState('');
  const [selectedOfferObj, setSelectedOfferObj] = useState<null | typeof allOffers[0]>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleOfferChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOffer(value);
    const offer = allOffers.find((o) => o.disciplineKey + '-' + o.idx === value);
    setSelectedOfferObj(offer || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferObj) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          prenom,
          date_naissance: dateNaissance,
          email,
          tel,
          code_promo: codePromo,
          offre: `${selectedOfferObj.disciplineKey}-${selectedOfferObj.idx}`,
          prix: selectedOfferObj.prixValue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Inscription enregistrée avec succès !' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Une erreur est survenue.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Impossible de contacter le serveur.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Souscription à une offre</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nom" className="block font-medium">Nom</label>
          <input type="text" id="nom" className="w-full border rounded p-2" required value={nom} onChange={(e) => setNom(e.target.value)} />
        </div>
        <div>
          <label htmlFor="prenom" className="block font-medium">Prénom</label>
          <input type="text" id="prenom" className="w-full border rounded p-2" required value={prenom} onChange={(e) => setPrenom(e.target.value)} />
        </div>
        <div>
          <label htmlFor="date_naissance" className="block font-medium">Date de naissance</label>
          <input type="date" id="date_naissance" className="w-full border rounded p-2" required value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email" className="block font-medium">Email (facultatif)</label>
          <input type="email" id="email" className="w-full border rounded p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="tel" className="block font-medium">Téléphone (facultatif)</label>
          <input type="tel" id="tel" className="w-full border rounded p-2" value={tel} onChange={(e) => setTel(e.target.value)} />
        </div>
        <div>
          <label htmlFor="offre" className="block font-medium">Offre</label>
          <select
            id="offre"
            name="offre"
            className="w-full border rounded p-2"
            required
            value={selectedOffer}
            onChange={handleOfferChange}
          >
            <option value="">Choisir une offre</option>
            {allOffers.map((offer, i) => (
              <option
                key={offer.disciplineKey + "-" + offer.idx}
                value={offer.disciplineKey + "-" + offer.idx}
                style={{ color: "black" }}
              >
                {offer.disciplineName} — {offer.offerName} ({offer.prix})
              </option>
            ))}
          </select>
        </div>
        {selectedOfferObj && (
          <>
            <div className="font-bold text-lg">Prix sélectionné : {selectedOfferObj.prix}</div>
            {selectedOfferObj.description && (
              <div className="italic text-gray-600 mb-2">{selectedOfferObj.description}</div>
            )}
          </>
        )}
        <div>
          <label htmlFor="code_promo" className="block font-medium">Code promo (facultatif)</label>
          <input type="text" id="code_promo" className="w-full border rounded p-2" value={codePromo} onChange={(e) => setCodePromo(e.target.value)} />
        </div>
        {message && (
          <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !selectedOffer}
          className="w-full bg-black text-white font-semibold py-2 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? 'Envoi en cours...' : "S'inscrire"}
        </button>
      </form>
    </main>
  );
}
