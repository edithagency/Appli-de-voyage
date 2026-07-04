'use client'

import { useState } from 'react'
import InfoBlock from '@/components/InfoBlock'

const PAYS_PERMIS = [
  { pays: 'États-Unis',         emoji: '🇺🇸', valide: true,  idp: 'recommandé',   duree: '1 an',     note: 'Le permis FR est accepté dans la plupart des États. Le permis international est fortement recommandé avec une traduction officielle.' },
  { pays: 'Canada',             emoji: '🇨🇦', valide: true,  idp: 'recommandé',   duree: '6 mois',   note: 'Permis FR accepté 6 mois. Au-delà, permis international ou permis local requis.' },
  { pays: 'Thaïlande',          emoji: '🇹🇭', valide: false, idp: 'obligatoire',  duree: null,       note: 'Le permis français seul n\'est pas suffisant. Un PIC est obligatoire pour louer un véhicule ou conduire légalement.' },
  { pays: 'Japon',              emoji: '🇯🇵', valide: false, idp: 'obligatoire',  duree: null,       note: 'Une traduction japonaise du permis est obligatoire — différente du PIC standard. Disponible auprès de certains auto-clubs en France.' },
  { pays: 'Australie',          emoji: '🇦🇺', valide: true,  idp: 'recommandé',   duree: '3 mois',   note: 'Permis FR accepté 3 mois accompagné d\'une traduction en anglais ou d\'un PIC.' },
  { pays: 'Maroc',              emoji: '🇲🇦', valide: true,  idp: 'non requis',   duree: '6 mois',   note: 'Le permis français est reconnu au Maroc pour les ressortissants français en séjour touristique.' },
  { pays: 'Espagne',            emoji: '🇪🇸', valide: true,  idp: 'non requis',   duree: 'illimité', note: 'Pays UE — permis FR valable sans restriction.' },
  { pays: 'Portugal',           emoji: '🇵🇹', valide: true,  idp: 'non requis',   duree: 'illimité', note: 'Pays UE — permis FR valable sans restriction.' },
  { pays: 'Italie',             emoji: '🇮🇹', valide: true,  idp: 'non requis',   duree: 'illimité', note: 'Pays UE — permis FR valable sans restriction.' },
  { pays: 'Grèce',              emoji: '🇬🇷', valide: true,  idp: 'non requis',   duree: 'illimité', note: 'Pays UE — permis FR valable sans restriction.' },
  { pays: 'Turquie',            emoji: '🇹🇷', valide: true,  idp: 'recommandé',   duree: '3 mois',   note: 'Permis FR accepté 3 mois. PIC recommandé pour les zones rurales et la location de voiture.' },
  { pays: 'Mexique',            emoji: '🇲🇽', valide: true,  idp: 'recommandé',   duree: '6 mois',   note: 'Le permis français est généralement accepté. Le PIC est recommandé pour la location.' },
  { pays: 'Brésil',             emoji: '🇧🇷', valide: true,  idp: 'recommandé',   duree: '6 mois',   note: 'Permis FR reconnu accompagné d\'une traduction certifiée ou d\'un PIC.' },
  { pays: 'Inde',               emoji: '🇮🇳', valide: false, idp: 'obligatoire',  duree: null,       note: 'Un PIC est obligatoire pour conduire en Inde avec un permis étranger.' },
  { pays: 'Indonésie / Bali',   emoji: '🇮🇩', valide: false, idp: 'obligatoire',  duree: null,       note: 'PIC obligatoire. Sans lui, les compagnies d\'assurance ne couvrent pas les accidents.' },
  { pays: 'Vietnam',            emoji: '🇻🇳', valide: false, idp: 'non suffisant', duree: null,      note: 'Ni le permis FR ni le PIC ne permettent de conduire légalement au Vietnam. Un permis local est requis.' },
  { pays: 'Royaume-Uni',        emoji: '🇬🇧', valide: true,  idp: 'non requis',   duree: 'illimité', note: 'Post-Brexit : le permis FR reste valable pour les visiteurs. Pour les résidents à long terme, une conversion est requise.' },
  { pays: 'Émirats arabes unis',emoji: '🇦🇪', valide: true,  idp: 'recommandé',   duree: '3 mois',   note: 'Permis FR accepté avec traduction officielle ou PIC pour la location de véhicule.' },
]

const PERMIS_INFO = `Le Permis International de Conduire (PIC) est une traduction officielle de votre permis national, valable dans 150+ pays. En France, il s'obtient auprès des préfectures ou sous-préfectures, gratuitement, en présentant votre permis FR en cours de validité et une photo d'identité. Sa durée de validité est de 3 ans.`

export default function PermisGuide() {
  const [selected, setSelected]   = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [showList, setShowList]   = useState(false)

  const sel = PAYS_PERMIS.find(p => p.pays === selected)

  const paysFiltered = PAYS_PERMIS.filter(p =>
    p.pays.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6)

  function handleSelect(p: typeof PAYS_PERMIS[0]) {
    setSelected(p.pays)
    setSearch(p.pays)
    setShowList(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sélecteur de pays */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Destination</p>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowList(e.target.value.length > 0); setSelected(null) }}
          onBlur={() => setTimeout(() => setShowList(false), 150)}
          placeholder="Rechercher un pays..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
        />
        {showList && search.length > 0 && paysFiltered.length > 0 && (
          <div className="w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            {paysFiltered.map(p => (
              <button key={p.pays} type="button"
                onMouseDown={() => handleSelect(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm border-b border-gray-50 last:border-0">
                <span className="text-xl">{p.emoji}</span>
                <span className="text-gray-800">{p.pays}</span>
                {selected === p.pays && <span className="ml-auto text-[#36A6B2]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Résultat */}
      {sel && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-100">
            {/* Statut coloré */}
            <span className="self-start text-xs font-bold px-3 py-1 rounded-full" style={{
              background: sel.valide ? '#e7f8ce' : '#ffe9ba',
              color:      sel.valide ? '#2D5A1B' : '#7A4A00',
            }}>
              {sel.valide ? 'Permis FR valide' : 'Permis FR insuffisant'}
              {sel.duree && <span className="font-normal ml-1">· {sel.duree} max</span>}
            </span>

            {/* Note */}
            <p className="text-xs text-gray-500 leading-relaxed">{sel.note}</p>

            <p className="text-xs text-gray-600 font-semibold">
              {sel.idp === 'obligatoire' ? 'PIC obligatoire' :
               sel.idp === 'recommandé' ? 'PIC recommandé' :
               sel.idp === 'non suffisant' ? 'PIC insuffisant — permis local requis' :
               'PIC non requis'}
            </p>
          </div>

          {/* Explication PIC — uniquement si le permis FR ne suffit pas */}
          {!sel.valide && (
            <InfoBlock type="disclaimer">
              <p>{PERMIS_INFO}</p>
            </InfoBlock>
          )}
        </div>
      )}

    </div>
  )
}
