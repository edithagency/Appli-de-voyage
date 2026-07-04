'use client'

import { useState, useMemo } from 'react'
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
    nom_fr: ['Doliprane', 'Efferalgan', 'Dafalgan'],
    generique: 'Paracétamol (Acetaminophen)',
    categorie: 'Antidouleur / Fièvre',
    emoji: '🟡',
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Tylenol', 'Acetaminophen'] },
      { pays: 'Royaume-Uni',         emoji: '🇬🇧', noms: ['Panadol', 'Calpol'] },
      { pays: 'Espagne',             emoji: '🇪🇸', noms: ['Paracetamol', 'Gelocatil', 'Termalgin'] },
      { pays: 'Italie',              emoji: '🇮🇹', noms: ['Tachipirina', 'Efferalgan'] },
      { pays: 'Portugal',            emoji: '🇵🇹', noms: ['Paracetamol', 'Ben-u-ron'] },
      { pays: 'Allemagne',           emoji: '🇩🇪', noms: ['Paracetamol', 'Ben-u-ron'] },
      { pays: 'Grèce',               emoji: '🇬🇷', noms: ['Depon', 'Panadol'] },
      { pays: 'Turquie',             emoji: '🇹🇷', noms: ['Parol', 'Tamol'] },
      { pays: 'Maroc',               emoji: '🇲🇦', noms: ['Doliprane', 'Paracetamol'] },
      { pays: 'Tunisie',             emoji: '🇹🇳', noms: ['Paracetamol', 'Efferalgan'] },
      { pays: 'Mexique',             emoji: '🇲🇽', noms: ['Tempra', 'Paracetamol'] },
      { pays: 'Brésil',              emoji: '🇧🇷', noms: ['Tylenol', 'Paracetamol'] },
      { pays: 'Thaïlande',           emoji: '🇹🇭', noms: ['Paracetamol', 'Sara'] },
      { pays: 'Japon',               emoji: '🇯🇵', noms: ['Tylenol', 'Calonal'] },
      { pays: 'Inde',                emoji: '🇮🇳', noms: ['Crocin', 'Dolo-650'] },
      { pays: 'Indonésie / Bali',    emoji: '🇮🇩', noms: ['Panadol', 'Paracetamol'] },
      { pays: 'Vietnam',             emoji: '🇻🇳', noms: ['Efferalgan', 'Paracetamol'] },
      { pays: 'Australie',           emoji: '🇦🇺', noms: ['Panadol', 'Panamax'] },
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
      { pays: 'Royaume-Uni',         emoji: '🇬🇧', noms: ['Nurofen', 'Brufen'] },
      { pays: 'Espagne',             emoji: '🇪🇸', noms: ['Nurofen', 'Espidifen', 'Ibuprofen'] },
      { pays: 'Italie',              emoji: '🇮🇹', noms: ['Brufen', 'Moment', 'Nurofen'] },
      { pays: 'Portugal',            emoji: '🇵🇹', noms: ['Brufen', 'Advil'] },
      { pays: 'Allemagne',           emoji: '🇩🇪', noms: ['Ibuprofen', 'Dolormin'] },
      { pays: 'Grèce',               emoji: '🇬🇷', noms: ['Nurofen', 'Ibuprofen'] },
      { pays: 'Turquie',             emoji: '🇹🇷', noms: ['Advil', 'Nurofen', 'Ibuprofen'] },
      { pays: 'Mexique',             emoji: '🇲🇽', noms: ['Advil', 'Ibuprofen'] },
      { pays: 'Brésil',              emoji: '🇧🇷', noms: ['Advil', 'Ibuprofen', 'Motrin'] },
      { pays: 'Inde',                emoji: '🇮🇳', noms: ['Ibuprofen', 'Brufen'] },
      { pays: 'Indonésie / Bali',    emoji: '🇮🇩', noms: ['Ibuprofen', 'Advil'] },
      { pays: 'Australie',           emoji: '🇦🇺', noms: ['Nurofen', 'Ibuprofen'] },
    ],
  },
  {
    nom_fr: ['Smecta'],
    generique: 'Diosmectite',
    categorie: 'Diarrhée',
    emoji: '🟤',
    equivalents: [
      { pays: 'Espagne',     emoji: '🇪🇸', noms: ['Smecta'] },
      { pays: 'Maroc',       emoji: '🇲🇦', noms: ['Smecta'] },
      { pays: 'Tunisie',     emoji: '🇹🇳', noms: ['Smecta'] },
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
      { pays: 'Royaume-Uni',         emoji: '🇬🇧', noms: ['Imodium', 'Loperamide'] },
      { pays: 'Espagne',             emoji: '🇪🇸', noms: ['Fortasec', 'Imodium'] },
      { pays: 'Italie',              emoji: '🇮🇹', noms: ['Imodium', 'Dissenten'] },
      { pays: 'Portugal',            emoji: '🇵🇹', noms: ['Imodium'] },
      { pays: 'Mexique',             emoji: '🇲🇽', noms: ['Imodium'] },
      { pays: 'Brésil',              emoji: '🇧🇷', noms: ['Imodium'] },
      { pays: 'Thaïlande',           emoji: '🇹🇭', noms: ['Imodium'] },
      { pays: 'Japon',               emoji: '🇯🇵', noms: ['Loperamide'] },
      { pays: 'Inde',                emoji: '🇮🇳', noms: ['Imodium', 'Eldoper'] },
      { pays: 'Vietnam',             emoji: '🇻🇳', noms: ['Imodium'] },
      { pays: 'Australie',           emoji: '🇦🇺', noms: ['Imodium'] },
    ],
  },
  {
    nom_fr: ['Xyzall', 'Zyrtec', 'Clarityne', 'Aerius'],
    generique: 'Antihistaminique',
    categorie: 'Allergie',
    emoji: '🌸',
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Zyrtec', 'Claritin', 'Benadryl'] },
      { pays: 'Royaume-Uni',         emoji: '🇬🇧', noms: ['Piriteze', 'Clarityn', 'Cetirizine'] },
      { pays: 'Espagne',             emoji: '🇪🇸', noms: ['Zyrtec', 'Loratadina'] },
      { pays: 'Italie',              emoji: '🇮🇹', noms: ['Zyrtec', 'Loratadina'] },
      { pays: 'Portugal',            emoji: '🇵🇹', noms: ['Zyrtec', 'Cetirizina'] },
      { pays: 'Mexique',             emoji: '🇲🇽', noms: ['Claritin', 'Benadryl'] },
      { pays: 'Brésil',              emoji: '🇧🇷', noms: ['Claritin', 'Zyrtec'] },
      { pays: 'Thaïlande',           emoji: '🇹🇭', noms: ['Cetirizine', 'Loratadine'] },
      { pays: 'Inde',                emoji: '🇮🇳', noms: ['Cetirizine', 'Benadryl'] },
      { pays: 'Australie',           emoji: '🇦🇺', noms: ['Zyrtec', 'Claratyne'] },
    ],
  },
  {
    nom_fr: ['Maalox', 'Gaviscon', 'Phosphalugel'],
    generique: 'Antiacide',
    categorie: "Brûlures d'estomac",
    emoji: '🟠',
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Tums', 'Rolaids', 'Pepto-Bismol'] },
      { pays: 'Royaume-Uni',         emoji: '🇬🇧', noms: ['Gaviscon', 'Rennie'] },
      { pays: 'Espagne',             emoji: '🇪🇸', noms: ['Almax', 'Maalox'] },
      { pays: 'Italie',              emoji: '🇮🇹', noms: ['Maalox', 'Gaviscon'] },
      { pays: 'Portugal',            emoji: '🇵🇹', noms: ['Gaviscon', 'Maalox'] },
      { pays: 'Mexique',             emoji: '🇲🇽', noms: ['Pepto-Bismol', 'Alka-Seltzer'] },
      { pays: 'Brésil',              emoji: '🇧🇷', noms: ['Eno', 'Pepsamar'] },
      { pays: 'Thaïlande',           emoji: '🇹🇭', noms: ['Kremil-S', 'Antacid'] },
      { pays: 'Australie',           emoji: '🇦🇺', noms: ['Gaviscon', 'Mylanta'] },
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
    noteType: 'alerte',
  },
  {
    nom_fr: ['Nautamine', 'Mercalm'],
    generique: 'Dimenhydrinate / Méclizine',
    categorie: 'Mal des transports',
    emoji: '🚢',
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Dramamine', 'Bonine'] },
      { pays: 'Royaume-Uni',         emoji: '🇬🇧', noms: ['Sea-Legs', 'Kwells'] },
      { pays: 'Espagne',             emoji: '🇪🇸', noms: ['Biodramina'] },
      { pays: 'Italie',              emoji: '🇮🇹', noms: ['Xamamina'] },
      { pays: 'Portugal',            emoji: '🇵🇹', noms: ['Dramamine'] },
      { pays: 'Mexique',             emoji: '🇲🇽', noms: ['Dramamine', 'Mareo'] },
      { pays: 'Brésil',              emoji: '🇧🇷', noms: ['Dramin'] },
      { pays: 'Australie',           emoji: '🇦🇺', noms: ['Travacalm', 'Dramamine'] },
    ],
  },
]

export default function MedicamentsTraducteur() {
  const [query, setQuery] = useState('')
  const [medicament, setMedicament] = useState<Medicament | null>(null)
  const [pays, setPays] = useState<Equivalent | null>(null)

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return []
    const q = query.toLowerCase()
    return MEDICAMENTS.filter(m =>
      m.nom_fr.some(n => n.toLowerCase().includes(q)) ||
      m.generique.toLowerCase().includes(q) ||
      m.categorie.toLowerCase().includes(q)
    )
  }, [query])

  function selectMedicament(m: Medicament) {
    setMedicament(m)
    setQuery(m.nom_fr[0])
    setPays(null)
  }

  function reset() {
    setMedicament(null)
    setPays(null)
    setQuery('')
  }

  return (
    <div className="flex flex-col gap-4">
      <InfoBlock type="disclaimer">
        Ces informations ne remplacent pas un avis médical. Consultez un professionnel de santé avant de prendre tout médicament.
      </InfoBlock>

      {/* Étape 1 : Recherche médicament */}
      {!medicament && (
        <>
          <div className="relative">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Médicament</p>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Doliprane, Smecta, Imodium…"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-3 top-[calc(100%-50%+2px)] -translate-y-1/2 text-gray-400 text-lg">×</button>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="w-full bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
              {suggestions.map(m => (
                <button key={m.generique} onClick={() => selectMedicament(m)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0">
                  <span className="text-xl">{m.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{m.nom_fr.join(' / ')}</p>
                    <p className="text-xs text-gray-400">{m.categorie}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Étape 2 : Choix du pays */}
      {medicament && !pays && (
        <div className="flex flex-col gap-3">
          <button onClick={reset}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition self-start">
            <span>←</span>
            <span>{medicament.emoji} {medicament.nom_fr[0]}</span>
          </button>
          <div className="relative">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Destination</p>
          </div>
          <div className="w-full bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            {medicament.equivalents.map(eq => (
              <button key={eq.pays} onClick={() => setPays(eq)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0">
                <span className="text-xl">{eq.emoji}</span>
                <span className="text-gray-800">{eq.pays}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 3 : Résultat */}
      {medicament && pays && (
        <div className="flex flex-col gap-3">
          <button onClick={() => setPays(null)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition self-start">
            <span>←</span>
            <span>{medicament.emoji} {medicament.nom_fr[0]} · {pays.pays}</span>
          </button>

          <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
            <div>
              <p className="text-white/70 text-xs mb-1">En France</p>
              <p className="text-white font-bold text-sm">{medicament.nom_fr.join(' · ')}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs mb-2">{pays.emoji} {pays.pays}</p>
              <div className="flex flex-wrap gap-2">
                {pays.noms.map(n => (
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
