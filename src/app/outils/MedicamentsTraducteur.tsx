'use client'

import { useState, useMemo } from 'react'

type Medicament = {
  nom_fr: string[]
  generique: string
  categorie: string
  emoji: string
  equivalents: { pays: string; emoji: string; noms: string[] }[]
  note?: string
}

const MEDICAMENTS: Medicament[] = [
  {
    nom_fr: ['Doliprane', 'Efferalgan', 'Dafalgan', 'Panadol FR'],
    generique: 'Paracétamol (Acetaminophen)',
    categorie: 'Antidouleur / Fièvre',
    emoji: '🟡',
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Tylenol', 'Acetaminophen'] },
      { pays: 'Royaume-Uni', emoji: '🇬🇧', noms: ['Panadol', 'Calpol'] },
      { pays: 'Espagne', emoji: '🇪🇸', noms: ['Paracetamol', 'Gelocatil', 'Termalgin'] },
      { pays: 'Allemagne', emoji: '🇩🇪', noms: ['Paracetamol', 'Ben-u-ron'] },
      { pays: 'Thaïlande', emoji: '🇹🇭', noms: ['Paracetamol', 'Sara'] },
      { pays: 'Japon', emoji: '🇯🇵', noms: ['Tylenol', 'Calonal'] },
    ],
    note: 'Le plus universel — disponible partout, souvent sans ordonnance.',
  },
  {
    nom_fr: ['Advil', 'Nurofen', 'Upfen'],
    generique: 'Ibuprofène',
    categorie: 'Anti-inflammatoire',
    emoji: '🔴',
    equivalents: [
      { pays: 'États-Unis', emoji: '🇺🇸', noms: ['Advil', 'Motrin', 'Ibuprofen'] },
      { pays: 'Royaume-Uni', emoji: '🇬🇧', noms: ['Nurofen', 'Brufen'] },
      { pays: 'Espagne', emoji: '🇪🇸', noms: ['Nurofen', 'Espidifen', 'Ibuprofen'] },
      { pays: 'Allemagne', emoji: '🇩🇪', noms: ['Ibuprofen', 'Dolormin'] },
      { pays: 'Australie', emoji: '🇦🇺', noms: ['Nurofen', 'Ibuprofen'] },
    ],
  },
  {
    nom_fr: ['Smecta'],
    generique: 'Diosmectite',
    categorie: 'Diarrhée',
    emoji: '🟤',
    equivalents: [
      { pays: 'Espagne', emoji: '🇪🇸', noms: ['Smecta'] },
      { pays: 'International', emoji: '🌍', noms: ['Diasorb', 'Diosmectite'] },
    ],
    note: 'Peu connu hors de France. Demandez un "anti-diarrheal" ou expliquez le symptôme.',
  },
  {
    nom_fr: ['Imodium', 'Lopéramide'],
    generique: 'Lopéramide',
    categorie: 'Diarrhée (action rapide)',
    emoji: '🔵',
    equivalents: [
      { pays: 'États-Unis', emoji: '🇺🇸', noms: ['Imodium AD', 'Loperamide'] },
      { pays: 'Royaume-Uni', emoji: '🇬🇧', noms: ['Imodium', 'Loperamide'] },
      { pays: 'Espagne', emoji: '🇪🇸', noms: ['Fortasec', 'Imodium'] },
      { pays: 'Thaïlande', emoji: '🇹🇭', noms: ['Imodium'] },
      { pays: 'Japon', emoji: '🇯🇵', noms: ['Loperamide'] },
    ],
  },
  {
    nom_fr: ['Xyzall', 'Zyrtec', 'Clarityne', 'Aerius'],
    generique: 'Antihistaminique (Lévocétirizine / Loratadine / Cétirizine)',
    categorie: 'Allergie',
    emoji: '🌸',
    equivalents: [
      { pays: 'États-Unis', emoji: '🇺🇸', noms: ['Zyrtec', 'Claritin', 'Benadryl'] },
      { pays: 'Royaume-Uni', emoji: '🇬🇧', noms: ['Piriteze', 'Clarityn', 'Cetirizine'] },
      { pays: 'Espagne', emoji: '🇪🇸', noms: ['Zyrtec', 'Loratadina'] },
      { pays: 'Thaïlande', emoji: '🇹🇭', noms: ['Cetirizine', 'Loratadine'] },
    ],
  },
  {
    nom_fr: ['Maalox', 'Gaviscon', 'Phosphalugel'],
    generique: 'Antiacide',
    categorie: 'Brûlures d\'estomac',
    emoji: '🟠',
    equivalents: [
      { pays: 'États-Unis', emoji: '🇺🇸', noms: ['Tums', 'Rolaids', 'Pepto-Bismol'] },
      { pays: 'Royaume-Uni', emoji: '🇬🇧', noms: ['Gaviscon', 'Rennie'] },
      { pays: 'Espagne', emoji: '🇪🇸', noms: ['Almax', 'Maalox'] },
      { pays: 'Thaïlande', emoji: '🇹🇭', noms: ['Kremil-S', 'Antacid'] },
    ],
  },
  {
    nom_fr: ['Josacine', 'Augmentin', 'Amoxicilline'],
    generique: 'Antibiotique (ordonnance)',
    categorie: 'Infection bactérienne',
    emoji: '💊',
    equivalents: [
      { pays: 'International', emoji: '🌍', noms: ['Amoxicillin', 'Augmentin', 'Azithromycin'] },
    ],
    note: '⚠️ Ordonnance requise dans la plupart des pays. Emportez votre ordonnance originale traduite en anglais.',
  },
  {
    nom_fr: ['Nautamine', 'Mercalm'],
    generique: 'Dimenhydrinate / Méclizine',
    categorie: 'Mal des transports',
    emoji: '🚢',
    equivalents: [
      { pays: 'États-Unis', emoji: '🇺🇸', noms: ['Dramamine', 'Bonine'] },
      { pays: 'Royaume-Uni', emoji: '🇬🇧', noms: ['Sea-Legs', 'Kwells'] },
      { pays: 'Espagne', emoji: '🇪🇸', noms: ['Biodramina'] },
      { pays: 'Australie', emoji: '🇦🇺', noms: ['Travacalm', 'Dramamine'] },
    ],
  },
]

export default function MedicamentsTraducteur() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Medicament | null>(null)

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return []
    const q = query.toLowerCase()
    return MEDICAMENTS.filter(m =>
      m.nom_fr.some(n => n.toLowerCase().includes(q)) ||
      m.generique.toLowerCase().includes(q) ||
      m.categorie.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
        ⚕️ <strong>Disclaimer :</strong> Ces informations ne remplacent pas un avis médical. Consultez un professionnel de santé avant de prendre tout médicament.
      </p>

      {/* Recherche */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null) }}
          placeholder="Doliprane, Smecta, Imodium…"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-300"
        />
        {query && (
          <button onClick={() => { setQuery(''); setSelected(null) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">×</button>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !selected && (
        <div className="flex flex-col gap-1">
          {suggestions.map(m => (
            <button key={m.generique} onClick={() => { setSelected(m); setQuery(m.nom_fr[0]) }}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 text-left hover:border-gray-200 transition">
              <span className="text-xl">{m.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{m.nom_fr.join(' / ')}</p>
                <p className="text-xs text-gray-400">{m.generique} — {m.categorie}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Résultat */}
      {selected && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl px-4 py-3" style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}>
            <p className="text-white font-bold text-sm">{selected.emoji} {selected.generique}</p>
            <p className="text-white/80 text-xs mt-0.5">{selected.categorie}</p>
            <p className="text-white/70 text-xs mt-1">Noms FR : {selected.nom_fr.join(', ')}</p>
          </div>

          {selected.note && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
              <p className="text-xs text-amber-800 leading-relaxed">{selected.note}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {selected.equivalents.map(eq => (
              <div key={eq.pays} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-gray-600 mb-1.5">{eq.emoji} {eq.pays}</p>
                <div className="flex flex-wrap gap-1.5">
                  {eq.noms.map(n => (
                    <span key={n} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{n}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {query.length >= 2 && suggestions.length === 0 && !selected && (
        <p className="text-sm text-gray-400 text-center py-4">
          Médicament non trouvé. Cherchez par nom générique ou demandez en pharmacie le <strong>generic name</strong>.
        </p>
      )}
    </div>
  )
}
