'use client'

import { useState, useMemo } from 'react'
import InfoBlock from '@/components/InfoBlock'

type Equivalent = { pays: string; emoji: string; noms: string[] }
type Medicament = {
  nom_fr: string[]
  generique: string
  categorie: string
  symptomes: string[]
  equivalents: Equivalent[]
  note?: string
  noteType?: 'alerte' | 'disclaimer'
}

const SYMPTOMES = [
  { id: 'fievre',       label: 'Fièvre / Douleur' },
  { id: 'inflammation', label: 'Inflammation' },
  { id: 'diarrhee',     label: 'Diarrhée' },
  { id: 'allergie',     label: 'Allergie' },
  { id: 'estomac',      label: 'Estomac' },
  { id: 'gorge',        label: 'Gorge' },
  { id: 'deshydrat',    label: 'Déshydratation' },
  { id: 'jetlag',       label: 'Jet lag' },
  { id: 'transport',    label: 'Transport' },
  { id: 'plaie',        label: 'Plaie / Coupure' },
]

const MEDICAMENTS: Medicament[] = [
  {
    nom_fr: ['Doliprane', 'Efferalgan', 'Dafalgan'],
    generique: 'Paracétamol (Acetaminophen)',
    categorie: 'Antidouleur / Fièvre',
    symptomes: ['fievre'],
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
    symptomes: ['inflammation', 'fievre'],
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
    symptomes: ['diarrhee'],
    equivalents: [
      { pays: 'Espagne',       emoji: '🇪🇸', noms: ['Smecta'] },
      { pays: 'Maroc',         emoji: '🇲🇦', noms: ['Smecta'] },
      { pays: 'Tunisie',       emoji: '🇹🇳', noms: ['Smecta'] },
      { pays: 'International', emoji: '🌍', noms: ['Diasorb', 'Diosmectite'] },
    ],
    note: 'Peu connu hors de France. Demandez un "anti-diarrheal" ou expliquez le symptôme.',
  },
  {
    nom_fr: ['Imodium', 'Lopéramide'],
    generique: 'Lopéramide',
    categorie: 'Diarrhée (action rapide)',
    symptomes: ['diarrhee'],
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
    symptomes: ['allergie'],
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
    symptomes: ['estomac'],
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
    symptomes: [],
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
    symptomes: ['transport'],
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
  {
    nom_fr: ['Mélatonine'],
    generique: 'Mélatonine',
    categorie: 'Décalage horaire',
    symptomes: ['jetlag'],
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Melatonin', 'Nature Made', 'Natrol'] },
      { pays: 'Royaume-Uni',         emoji: '🇬🇧', noms: ['Melatonin'] },
      { pays: 'Espagne',             emoji: '🇪🇸', noms: ['Melatonina'] },
      { pays: 'Italie',              emoji: '🇮🇹', noms: ['Melatonina'] },
      { pays: 'Allemagne',           emoji: '🇩🇪', noms: ['Melatonin'] },
      { pays: 'Portugal',            emoji: '🇵🇹', noms: ['Melatonina'] },
      { pays: 'Thaïlande',           emoji: '🇹🇭', noms: ['Melatonin'] },
      { pays: 'Japon',               emoji: '🇯🇵', noms: ['Melatonin'] },
      { pays: 'Australie',           emoji: '🇦🇺', noms: ['Melatonin'] },
      { pays: 'Mexique',             emoji: '🇲🇽', noms: ['Melatonina'] },
    ],
    note: 'Vendu comme complément alimentaire dans la plupart des pays, sans ordonnance.',
  },
  {
    nom_fr: ['Betadine', 'Biseptine'],
    generique: 'Povidone-iodée / Antiseptique',
    categorie: 'Antiseptique cutané',
    symptomes: ['plaie'],
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Betadine'] },
      { pays: 'Royaume-Uni',         emoji: '🇬🇧', noms: ['Betadine', 'Savlon'] },
      { pays: 'Espagne',             emoji: '🇪🇸', noms: ['Betadine'] },
      { pays: 'Italie',              emoji: '🇮🇹', noms: ['Betadine'] },
      { pays: 'Allemagne',           emoji: '🇩🇪', noms: ['Betadine', 'Braunoderm'] },
      { pays: 'Portugal',            emoji: '🇵🇹', noms: ['Betadine'] },
      { pays: 'Grèce',               emoji: '🇬🇷', noms: ['Betadine'] },
      { pays: 'Turquie',             emoji: '🇹🇷', noms: ['Betadine'] },
      { pays: 'Maroc',               emoji: '🇲🇦', noms: ['Betadine'] },
      { pays: 'Tunisie',             emoji: '🇹🇳', noms: ['Betadine'] },
      { pays: 'Thaïlande',           emoji: '🇹🇭', noms: ['Betadine'] },
      { pays: 'Japon',               emoji: '🇯🇵', noms: ['Isodine'] },
      { pays: 'Inde',                emoji: '🇮🇳', noms: ['Betadine'] },
      { pays: 'Indonésie / Bali',    emoji: '🇮🇩', noms: ['Betadine'] },
      { pays: 'Vietnam',             emoji: '🇻🇳', noms: ['Betadine'] },
      { pays: 'Mexique',             emoji: '🇲🇽', noms: ['Betadine'] },
      { pays: 'Brésil',              emoji: '🇧🇷', noms: ['Betadine', 'Povidine'] },
      { pays: 'Australie',           emoji: '🇦🇺', noms: ['Betadine'] },
    ],
  },
  {
    nom_fr: ['Strepsils'],
    generique: 'Antiseptique buccal',
    categorie: 'Maux de gorge',
    symptomes: ['gorge'],
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Halls', 'Cepacol', 'Ricola'] },
      { pays: 'Royaume-Uni',         emoji: '🇬🇧', noms: ['Strepsils'] },
      { pays: 'Espagne',             emoji: '🇪🇸', noms: ['Strepsils'] },
      { pays: 'Italie',              emoji: '🇮🇹', noms: ['Strepsils', 'Lemonsol'] },
      { pays: 'Allemagne',           emoji: '🇩🇪', noms: ['Strepsils', 'Dobendan'] },
      { pays: 'Portugal',            emoji: '🇵🇹', noms: ['Strepsils'] },
      { pays: 'Grèce',               emoji: '🇬🇷', noms: ['Strepsils'] },
      { pays: 'Turquie',             emoji: '🇹🇷', noms: ['Strepsils'] },
      { pays: 'Maroc',               emoji: '🇲🇦', noms: ['Strepsils'] },
      { pays: 'Inde',                emoji: '🇮🇳', noms: ['Strepsils'] },
      { pays: 'Mexique',             emoji: '🇲🇽', noms: ['Halls', 'Strepsils'] },
      { pays: 'Brésil',              emoji: '🇧🇷', noms: ['Strepsils', 'Halls'] },
      { pays: 'Australie',           emoji: '🇦🇺', noms: ['Strepsils'] },
    ],
  },
  {
    nom_fr: ['Sachets de réhydratation', 'SRO'],
    generique: 'Sels de réhydratation orale',
    categorie: 'Déshydratation / Gastro',
    symptomes: ['deshydrat', 'diarrhee'],
    equivalents: [
      { pays: 'États-Unis / Canada', emoji: '🇺🇸', noms: ['Pedialyte', 'DripDrop', 'CeraLyte'] },
      { pays: 'Royaume-Uni',         emoji: '🇬🇧', noms: ['Dioralyte'] },
      { pays: 'Espagne',             emoji: '🇪🇸', noms: ['Sueroral', 'ORS'] },
      { pays: 'Italie',              emoji: '🇮🇹', noms: ['Idravita', 'Reidrax'] },
      { pays: 'Allemagne',           emoji: '🇩🇪', noms: ['Oralpädon', 'Elotrans'] },
      { pays: 'Portugal',            emoji: '🇵🇹', noms: ['Hidrolar', 'ORS'] },
      { pays: 'Thaïlande',           emoji: '🇹🇭', noms: ['ORS'] },
      { pays: 'Japon',               emoji: '🇯🇵', noms: ['OS-1'] },
      { pays: 'Inde',                emoji: '🇮🇳', noms: ['Electral', 'ORS'] },
      { pays: 'Indonésie / Bali',    emoji: '🇮🇩', noms: ['Oralit'] },
      { pays: 'Vietnam',             emoji: '🇻🇳', noms: ['Oresol'] },
      { pays: 'Mexique',             emoji: '🇲🇽', noms: ['Pedialyte', 'Suero oral'] },
      { pays: 'Brésil',              emoji: '🇧🇷', noms: ['Pedialyte', 'Soro de reidratação'] },
      { pays: 'Australie',           emoji: '🇦🇺', noms: ['Gastrolyte', 'Hydralyte'] },
    ],
    note: 'À combiner avec Smecta ou Imodium en cas de gastro. Disponible en pharmacie partout.',
  },
]

const ALL_COUNTRIES = Array.from(
  new Map(
    MEDICAMENTS.flatMap(m => m.equivalents.map(e => [e.pays, { pays: e.pays, emoji: e.emoji }]))
  ).values()
).sort((a, b) => a.pays.localeCompare(b.pays, 'fr'))

export default function MedicamentsTraducteur() {
  const [query, setQuery]                           = useState('')
  const [selectedSymptome, setSelectedSymptome]     = useState<string | null>(null)
  const [paysDestination, setPaysDestination]       = useState<string | null>(null)
  const [destinationSearch, setDestinationSearch]   = useState('')
  const [showDestinationList, setShowDestinationList] = useState(false)
  const [medicament, setMedicament]                 = useState<Medicament | null>(null)
  const [paysNom, setPaysNom]                       = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (paysDestination) {
      return MEDICAMENTS.filter(m => m.equivalents.some(e => e.pays === paysDestination))
    }
    if (selectedSymptome) {
      return MEDICAMENTS.filter(m => m.symptomes.includes(selectedSymptome))
    }
    if (query.trim().length >= 2) {
      const q = query.toLowerCase()
      return MEDICAMENTS.filter(m =>
        m.nom_fr.some(n => n.toLowerCase().includes(q)) ||
        m.generique.toLowerCase().includes(q) ||
        m.categorie.toLowerCase().includes(q)
      )
    }
    return []
  }, [query, selectedSymptome, paysDestination])

  const equivalent = medicament && paysNom
    ? medicament.equivalents.find(e => e.pays === paysNom) ?? null
    : null

  function selectMedicament(m: Medicament) {
    setMedicament(m)
    setPaysNom(paysDestination) // si on vient d'une destination, saute l'étape pays
  }

  const destinationFiltered = useMemo(() => {
    if (!destinationSearch.trim()) return []
    const q = destinationSearch.toLowerCase()
    return ALL_COUNTRIES.filter(c => c.pays.toLowerCase().includes(q)).slice(0, 8)
  }, [destinationSearch])

  function selectDestination(c: { pays: string; emoji: string }) {
    setPaysDestination(c.pays)
    setDestinationSearch(c.pays)
    setShowDestinationList(false)
    setQuery('')
    setSelectedSymptome(null)
  }

  function reset() {
    setMedicament(null)
    setPaysNom(null)
    setPaysDestination(null)
    setDestinationSearch('')
    setShowDestinationList(false)
    setSelectedSymptome(null)
    setQuery('')
  }

  const showSearch = !medicament && !paysNom

  return (
    <div className="flex flex-col gap-4">
      <InfoBlock type="disclaimer">
        Ces informations ne remplacent pas un avis médical. Consultez un professionnel de santé avant de prendre tout médicament.
      </InfoBlock>

      {/* Étape 1 : Recherche */}
      {showSearch && (
        <div className="flex flex-col gap-3">
          {/* Input nom */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Médicament</p>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedSymptome(null); setPaysDestination(null); setDestinationSearch(''); setShowDestinationList(false) }}
                placeholder="Doliprane, Smecta, Imodium…"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">×</button>
              )}
            </div>
          </div>

          {/* Chips symptômes */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Symptôme</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMES.map(s => (
                <button key={s.id}
                  onClick={() => { setSelectedSymptome(selectedSymptome === s.id ? null : s.id); setQuery(''); setPaysDestination(null); setDestinationSearch(''); setShowDestinationList(false) }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                  style={{
                    background: selectedSymptome === s.id ? '#004850' : '#F9FAFB',
                    color:      selectedSymptome === s.id ? 'white'   : '#6B7280',
                    borderColor: selectedSymptome === s.id ? '#004850' : '#E5E7EB',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Destination</p>
            <input
              type="text"
              value={destinationSearch}
              onChange={e => {
                setDestinationSearch(e.target.value)
                setShowDestinationList(true)
                setPaysDestination(null)
                setQuery('')
                setSelectedSymptome(null)
              }}
              onFocus={() => setShowDestinationList(true)}
              onBlur={() => setTimeout(() => setShowDestinationList(false), 150)}
              placeholder="Rechercher un pays..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
            />
            {showDestinationList && destinationFiltered.length > 0 && (
              <div className="w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
                {destinationFiltered.map(c => (
                  <button key={c.pays}
                    type="button"
                    onMouseDown={() => selectDestination(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0">
                    <span className="text-xl">{c.emoji}</span>
                    <span className="text-gray-800">{c.pays}</span>
                    {paysDestination === c.pays && <span className="ml-auto text-[#36A6B2]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Liste filtrée */}
          {filtered.length > 0 && (
            <div className="w-full bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
              {filtered.map(m => (
                <button key={m.generique} onClick={() => selectMedicament(m)}
                  className="w-full flex flex-col px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0">
                  <p className="font-semibold text-gray-800">{m.nom_fr.join(' / ')}</p>
                  <p className="text-xs text-gray-400 italic">{m.categorie}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Étape 2 : Choix du pays (si pas venu par destination) */}
      {medicament && !paysNom && (
        <div className="flex flex-col gap-3">
          <button onClick={reset}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition self-start">
            <span>←</span>
            <span>{medicament.nom_fr[0]}</span>
          </button>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destination</p>
          <div className="w-full bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            {medicament.equivalents.map(eq => (
              <button key={eq.pays} onClick={() => setPaysNom(eq.pays)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0">
                <span className="text-xl">{eq.emoji}</span>
                <span className="text-gray-800">{eq.pays}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 3 : Résultat */}
      {medicament && paysNom && equivalent && (
        <div className="flex flex-col gap-3">
          <button onClick={() => { setPaysNom(null); if (paysDestination) setMedicament(null) }}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition self-start">
            <span>←</span>
            <span>{medicament.nom_fr[0]} · {paysNom}</span>
          </button>

          <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
            <div>
              <p className="text-white/70 text-xs mb-1">En France</p>
              <p className="text-white font-bold text-sm">{medicament.nom_fr.join(' · ')}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs mb-2">{equivalent.emoji} {paysNom}</p>
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
