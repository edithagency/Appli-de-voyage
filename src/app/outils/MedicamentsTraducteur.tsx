'use client'

import { useState } from 'react'
import InfoBlock from '@/components/InfoBlock'

type Equivalent = { pays: string; emoji: string; noms: string[] }
type Medicament = {
  nom_fr: string[]
  generique: string
  categorie: string
  emoji: string
  equivalents: Equivalent[]
  note?: string
  noteType?: 'alerte' | 'disclaimer'
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
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Advil', 'Motrin', 'Ibuprofen'] },
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
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Imodium AD', 'Loperamide'] },
      { pays: 'Royaume-Uni', emoji: '🇬🇧', noms: ['Imodium', 'Loperamide'] },
      { pays: 'Espagne', emoji: '🇪🇸', noms: ['Fortasec', 'Imodium'] },
      { pays: 'Thaïlande', emoji: '🇹🇭', noms: ['Imodium'] },
      { pays: 'Japon', emoji: '🇯🇵', noms: ['Loperamide'] },
    ],
  },
  {
    nom_fr: ['Xyzall', 'Zyrtec', 'Clarityne', 'Aerius'],
    generique: 'Antihistaminique',
    categorie: 'Allergie',
    emoji: '🌸',
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Zyrtec', 'Claritin', 'Benadryl'] },
      { pays: 'Royaume-Uni', emoji: '🇬🇧', noms: ['Piriteze', 'Clarityn', 'Cetirizine'] },
      { pays: 'Espagne', emoji: '🇪🇸', noms: ['Zyrtec', 'Loratadina'] },
      { pays: 'Thaïlande', emoji: '🇹🇭', noms: ['Cetirizine', 'Loratadine'] },
    ],
  },
  {
    nom_fr: ['Maalox', 'Gaviscon', 'Phosphalugel'],
    generique: 'Antiacide',
    categorie: "Brûlures d'estomac",
    emoji: '🟠',
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Tums', 'Rolaids', 'Pepto-Bismol'] },
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
    note: 'Ordonnance requise dans la plupart des pays. Emportez votre ordonnance originale traduite en anglais.',
    noteType: 'alerte' as const,
  },
  {
    nom_fr: ['Nautamine', 'Mercalm'],
    generique: 'Dimenhydrinate / Méclizine',
    categorie: 'Mal des transports',
    emoji: '🚢',
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Dramamine', 'Bonine'] },
      { pays: 'Royaume-Uni', emoji: '🇬🇧', noms: ['Sea-Legs', 'Kwells'] },
      { pays: 'Espagne', emoji: '🇪🇸', noms: ['Biodramina'] },
      { pays: 'Australie', emoji: '🇦🇺', noms: ['Travacalm', 'Dramamine'] },
    ],
  },
]

const ALL_COUNTRIES: { pays: string; emoji: string }[] = Array.from(
  new Map(
    MEDICAMENTS.flatMap(m => m.equivalents.map(e => [e.pays, { pays: e.pays, emoji: e.emoji }]))
  ).values()
).sort((a, b) => a.pays.localeCompare(b.pays, 'fr'))

export default function MedicamentsTraducteur() {
  const [pays, setPays] = useState<{ pays: string; emoji: string } | null>(null)
  const [medicament, setMedicament] = useState<Medicament | null>(null)
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const paysFiltered = ALL_COUNTRIES.filter(c =>
    c.pays.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelectPays(c: { pays: string; emoji: string }) {
    setPays(c)
    setSearch(c.pays)
    setShowDropdown(false)
  }

  const medsForPays = pays
    ? MEDICAMENTS.filter(m => m.equivalents.some(e => e.pays === pays.pays))
    : []

  const equivalent = medicament && pays
    ? medicament.equivalents.find(e => e.pays === pays.pays) ?? null
    : null

  return (
    <div className="flex flex-col gap-4">
      <InfoBlock type="disclaimer">
        Ces informations ne remplacent pas un avis médical. Consultez un professionnel de santé avant de prendre tout médicament.
      </InfoBlock>

      {/* Étape 1 : Choix du pays */}
      {!pays && (
        <div className="relative">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Destination</p>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Rechercher un pays..."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
          />
          {showDropdown && paysFiltered.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
              {paysFiltered.map(c => (
                <button key={c.pays} type="button" onMouseDown={() => handleSelectPays(c)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm">
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-gray-800">{c.pays}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Étape 2 : Choix du médicament */}
      {pays && !medicament && (
        <div className="flex flex-col gap-3">
          <button onClick={() => setPays(null)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition self-start">
            <span>←</span>
            <span>{pays.emoji} {pays.pays}</span>
          </button>
          <div className="flex flex-col gap-1.5">
            {medsForPays.map(m => (
              <button key={m.generique} onClick={() => setMedicament(m as Medicament)}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 text-left hover:border-gray-200 transition">
                <span className="text-xl">{m.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{m.nom_fr.join(' / ')}</p>
                  <p className="text-xs text-gray-400">{m.categorie}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 3 : Résultat unique */}
      {pays && medicament && equivalent && (
        <div className="flex flex-col gap-3">
          <button onClick={() => setMedicament(null)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition self-start">
            <span>←</span>
            <span>{pays.emoji} {pays.pays} · {medicament.nom_fr[0]}</span>
          </button>

          <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
            <div>
              <p className="text-white/70 text-xs mb-1">En France</p>
              <p className="text-white font-bold text-sm">{medicament.nom_fr.join(' · ')}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs mb-2">{pays.emoji} {pays.pays}</p>
              <div className="flex flex-wrap gap-2">
                {equivalent.noms.map(n => (
                  <span key={n} className="text-sm font-bold px-3 py-1.5 rounded-full text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>{n}</span>
                ))}
              </div>
            </div>
          </div>

          {medicament.note && (
            <InfoBlock type={medicament.noteType ?? 'disclaimer'}>
              {medicament.note}
            </InfoBlock>
          )}
        </div>
      )}
    </div>
  )
}
