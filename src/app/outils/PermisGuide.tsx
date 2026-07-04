'use client'

import { useState } from 'react'
import InfoBlock from '@/components/InfoBlock'

const PAYS_PERMIS = [
  { pays: 'États-Unis', emoji: '🇺🇸', valide: true, idp: 'recommandé', duree: '1 an', note: 'Le permis FR est accepté dans la plupart des États. Le permis international est fortement recommandé avec une traduction officielle.' },
  { pays: 'Canada', emoji: '🇨🇦', valide: true, idp: 'recommandé', duree: '6 mois', note: 'Permis FR accepté 6 mois. Au-delà, permis international ou permis local requis.' },
  { pays: 'Thaïlande', emoji: '🇹🇭', valide: false, idp: 'obligatoire', duree: null, note: 'Le permis français seul n\'est pas suffisant. Un permis international (IDP) est obligatoire pour louer un véhicule ou conduire légalement.' },
  { pays: 'Japon', emoji: '🇯🇵', valide: false, idp: 'obligatoire', duree: null, note: 'Traduction japonaise du permis (JDP) obligatoire. Disponible en France auprès de certains auto-clubs. L\'IDP classique 1949 n\'est pas accepté au Japon.' },
  { pays: 'Australie', emoji: '🇦🇺', valide: true, idp: 'recommandé', duree: '3 mois', note: 'Permis FR accepté 3 mois accompagné d\'une traduction en anglais ou d\'un IDP.' },
  { pays: 'Maroc', emoji: '🇲🇦', valide: true, idp: 'non requis', duree: '6 mois', note: 'Le permis français est reconnu au Maroc pour les ressortissants français en séjour touristique.' },
  { pays: 'Espagne', emoji: '🇪🇸', valide: true, idp: 'non requis', duree: 'illimité', note: 'Pays UE — permis FR valable sans restriction.' },
  { pays: 'Portugal', emoji: '🇵🇹', valide: true, idp: 'non requis', duree: 'illimité', note: 'Pays UE — permis FR valable sans restriction.' },
  { pays: 'Italie', emoji: '🇮🇹', valide: true, idp: 'non requis', duree: 'illimité', note: 'Pays UE — permis FR valable sans restriction.' },
  { pays: 'Grèce', emoji: '🇬🇷', valide: true, idp: 'non requis', duree: 'illimité', note: 'Pays UE — permis FR valable sans restriction.' },
  { pays: 'Turquie', emoji: '🇹🇷', valide: true, idp: 'recommandé', duree: '3 mois', note: 'Permis FR accepté 3 mois. IDP recommandé pour les zones rurales et la location de voiture.' },
  { pays: 'Mexique', emoji: '🇲🇽', valide: true, idp: 'recommandé', duree: '6 mois', note: 'Le permis français est généralement accepté. L\'IDP est recommandé pour la location.' },
  { pays: 'Brésil', emoji: '🇧🇷', valide: true, idp: 'recommandé', duree: '6 mois', note: 'Permis FR reconnu accompagné d\'une traduction certifiée ou d\'un IDP.' },
  { pays: 'Inde', emoji: '🇮🇳', valide: false, idp: 'obligatoire', duree: null, note: 'Un permis international (IDP) est obligatoire pour conduire en Inde avec un permis étranger.' },
  { pays: 'Indonésie / Bali', emoji: '🇮🇩', valide: false, idp: 'obligatoire', duree: null, note: 'IDP obligatoire. Sans lui, les compagnies d\'assurance ne couvrent pas les accidents.' },
  { pays: 'Vietnam', emoji: '🇻🇳', valide: false, idp: 'non suffisant', duree: null, note: 'Ni le permis FR ni l\'IDP ne permettent de conduire légalement au Vietnam. Un permis local est requis. La location de scooter sans permis est illégale.' },
  { pays: 'Royaume-Uni', emoji: '🇬🇧', valide: true, idp: 'non requis', duree: 'illimité', note: 'Post-Brexit : le permis FR reste valable pour les visiteurs. Pour résidents à long terme, conversion requise.' },
  { pays: 'Émirats arabes unis', emoji: '🇦🇪', valide: true, idp: 'recommandé', duree: '3 mois', note: 'Permis FR accepté avec traduction officielle ou IDP pour la location de véhicule.' },
]

const IDP_INFO = `Le Permis International de Conduire (PIC) est une traduction officielle de votre permis national, valable dans 150+ pays. En France, il s'obtient auprès des préfectures ou sous-préfectures, gratuitement, en présentant votre permis FR en cours de validité et une photo d'identité. Sa durée de validité est de 3 ans.`

export default function PermisGuide() {
  const [selected, setSelected] = useState<string | null>(null)

  const sel = PAYS_PERMIS.find(p => p.pays === selected)

  return (
    <div className="flex flex-col gap-4">
      {/* Info IDP */}
      <InfoBlock type="disclaimer">
        <p>{IDP_INFO}</p>
      </InfoBlock>

      {/* Sélecteur de pays */}
      <select
        value={selected ?? ''}
        onChange={e => setSelected(e.target.value || null)}
        className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none"
      >
        <option value="">— Choisir une destination —</option>
        {PAYS_PERMIS.map(p => (
          <option key={p.pays} value={p.pays}>{p.emoji} {p.pays}</option>
        ))}
      </select>

      {/* Résultat */}
      {sel && (
        <div className="flex flex-col gap-3">
          <InfoBlock type={sel.valide ? 'info' : 'alerte'}>
            <p className="font-bold mb-1">
              {sel.valide ? 'Permis FR valide' : 'Permis FR insuffisant'}
              {sel.duree && <span className="font-normal ml-2">({sel.duree} max)</span>}
            </p>
            <p>{sel.note}</p>
          </InfoBlock>

          <InfoBlock type={
            sel.idp === 'obligatoire' ? 'alerte' :
            sel.idp === 'recommandé' ? 'disclaimer' :
            'info'
          }>
            {sel.idp === 'obligatoire' ? 'Permis international obligatoire' :
             sel.idp === 'recommandé' ? 'Permis international recommandé' :
             'Permis international non requis'}
          </InfoBlock>
        </div>
      )}

      {/* Liste rapide */}
      <div className="bg-gray-50 rounded-2xl p-3">
        <p className="text-xs font-bold text-gray-500 mb-2">Statut rapide</p>
        <div className="flex flex-col gap-1.5">
          {PAYS_PERMIS.map(p => (
            <div key={p.pays} className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{p.emoji} {p.pays}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                background: p.idp === 'obligatoire' ? '#ffe9ba' : p.idp === 'recommandé' ? '#fffcc7' : '#e7f8ce',
                color: p.idp === 'obligatoire' ? '#7A4A00' : p.idp === 'recommandé' ? '#786400' : '#2D5A1B',
              }}>
                {p.idp === 'obligatoire' ? 'IDP obligatoire' :
                 p.idp === 'recommandé' ? 'IDP recommandé' :
                 p.valide ? 'Permis FR OK' : 'Non valide'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
