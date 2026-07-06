'use client'

import { useState } from 'react'
import type { PaysOutil } from './NumerosUrgence'
import InfoBlock from '@/components/InfoBlock'

type Style = 'budget' | 'confort' | 'luxe'
type BudgetData = { hebergement: number; repas: number; transport: number; activites: number }
type BudgetEstimations = { budget: BudgetData; confort: BudgetData; luxe: BudgetData; zone?: string }

// Fallbacks par grande zone géographique.
// hebergement = chambre/nuit (groupe), repas/transport/activites = par personne/jour.
const ZONE_FALLBACKS: Record<string, BudgetEstimations> = {
  europe_ouest:      { budget:{hebergement:35,repas:16,transport:7,activites:10},  confort:{hebergement:110,repas:32,transport:14,activites:25}, luxe:{hebergement:300,repas:82,transport:40,activites:65} },
  europe_est:        { budget:{hebergement:22,repas:9, transport:4,activites:7},   confort:{hebergement:65, repas:22,transport:8, activites:16}, luxe:{hebergement:180,repas:55,transport:25,activites:42} },
  asie_sud_est:      { budget:{hebergement:13,repas:6, transport:4,activites:7},   confort:{hebergement:50, repas:16,transport:10,activites:18}, luxe:{hebergement:150,repas:44,transport:30,activites:42} },
  asie_developpee:   { budget:{hebergement:42,repas:16,transport:9,activites:14},  confort:{hebergement:130,repas:36,transport:17,activites:36}, luxe:{hebergement:390,repas:94,transport:48,activites:82} },
  asie_sud:          { budget:{hebergement:12,repas:5, transport:3,activites:6},   confort:{hebergement:50, repas:15,transport:8, activites:15}, luxe:{hebergement:150,repas:40,transport:28,activites:40} },
  amerique_nord:     { budget:{hebergement:58,repas:24,transport:12,activites:20}, confort:{hebergement:175,repas:48,transport:25,activites:40}, luxe:{hebergement:490,repas:100,transport:68,activites:88} },
  amerique_centrale: { budget:{hebergement:20,repas:8, transport:4,activites:8},   confort:{hebergement:70, repas:20,transport:12,activites:20}, luxe:{hebergement:210,repas:54,transport:34,activites:48} },
  amerique_sud:      { budget:{hebergement:18,repas:6, transport:3,activites:9},   confort:{hebergement:62, repas:19,transport:9, activites:21}, luxe:{hebergement:188,repas:54,transport:27,activites:48} },
  afrique_nord:      { budget:{hebergement:18,repas:7, transport:3,activites:6},   confort:{hebergement:62, repas:17,transport:8, activites:14}, luxe:{hebergement:194,repas:46,transport:28,activites:40} },
  afrique_sub:       { budget:{hebergement:28,repas:9, transport:5,activites:12},  confort:{hebergement:85, repas:23,transport:14,activites:30}, luxe:{hebergement:240,repas:65,transport:40,activites:70} },
  moyen_orient:      { budget:{hebergement:38,repas:13,transport:5,activites:12},  confort:{hebergement:120,repas:30,transport:14,activites:30}, luxe:{hebergement:380,repas:80,transport:42,activites:68} },
  oceanie:           { budget:{hebergement:50,repas:22,transport:12,activites:18}, confort:{hebergement:150,repas:45,transport:25,activites:36}, luxe:{hebergement:440,repas:100,transport:58,activites:78} },
}

// Codes ISO → zone géographique (fallback pour pays sans données DB)
const PAYS_ZONE: Record<string, string> = {
  // Europe de l'Ouest
  FR:'europe_ouest',DE:'europe_ouest',GB:'europe_ouest',ES:'europe_ouest',IT:'europe_ouest',
  PT:'europe_ouest',NL:'europe_ouest',BE:'europe_ouest',CH:'europe_ouest',AT:'europe_ouest',
  IE:'europe_ouest',LU:'europe_ouest',SE:'europe_ouest',NO:'europe_ouest',DK:'europe_ouest',
  FI:'europe_ouest',IS:'europe_ouest',GR:'europe_ouest',CY:'europe_ouest',MT:'europe_ouest',
  // Europe de l'Est
  PL:'europe_est',CZ:'europe_est',HU:'europe_est',RO:'europe_est',BG:'europe_est',
  SK:'europe_est',HR:'europe_est',SI:'europe_est',RS:'europe_est',BA:'europe_est',
  ME:'europe_est',MK:'europe_est',AL:'europe_est',MD:'europe_est',UA:'europe_est',
  LT:'europe_est',LV:'europe_est',EE:'europe_est',
  // Asie du Sud-Est
  TH:'asie_sud_est',VN:'asie_sud_est',ID:'asie_sud_est',MY:'asie_sud_est',PH:'asie_sud_est',
  KH:'asie_sud_est',LA:'asie_sud_est',MM:'asie_sud_est',BN:'asie_sud_est',TL:'asie_sud_est',
  // Asie développée
  JP:'asie_developpee',KR:'asie_developpee',SG:'asie_developpee',HK:'asie_developpee',TW:'asie_developpee',CN:'asie_developpee',
  // Asie du Sud
  IN:'asie_sud',LK:'asie_sud',NP:'asie_sud',BD:'asie_sud',PK:'asie_sud',BT:'asie_sud',MV:'asie_sud',
  // Asie Centrale
  KZ:'asie_sud',UZ:'asie_sud',MN:'asie_sud',TM:'asie_sud',KG:'asie_sud',TJ:'asie_sud',
  // Amérique du Nord
  US:'amerique_nord',CA:'amerique_nord',
  // Amérique Centrale & Caraïbes
  MX:'amerique_centrale',GT:'amerique_centrale',BZ:'amerique_centrale',HN:'amerique_centrale',
  SV:'amerique_centrale',NI:'amerique_centrale',CR:'amerique_centrale',PA:'amerique_centrale',
  CU:'amerique_centrale',JM:'amerique_centrale',HT:'amerique_centrale',DO:'amerique_centrale',
  TT:'amerique_centrale',BB:'amerique_centrale',
  // Amérique du Sud
  CO:'amerique_sud',VE:'amerique_sud',EC:'amerique_sud',PE:'amerique_sud',BO:'amerique_sud',
  BR:'amerique_sud',PY:'amerique_sud',UY:'amerique_sud',AR:'amerique_sud',CL:'amerique_sud',
  GY:'amerique_sud',SR:'amerique_sud',
  // Afrique du Nord
  MA:'afrique_nord',TN:'afrique_nord',DZ:'afrique_nord',LY:'afrique_nord',EG:'afrique_nord',SD:'afrique_nord',
  // Afrique subsaharienne
  SN:'afrique_sub',ML:'afrique_sub',BF:'afrique_sub',GH:'afrique_sub',CI:'afrique_sub',
  NG:'afrique_sub',CM:'afrique_sub',ET:'afrique_sub',KE:'afrique_sub',TZ:'afrique_sub',
  UG:'afrique_sub',RW:'afrique_sub',MZ:'afrique_sub',ZA:'afrique_sub',ZM:'afrique_sub',
  ZW:'afrique_sub',MG:'afrique_sub',MU:'afrique_sub',SC:'afrique_sub',CV:'afrique_sub',
  GA:'afrique_sub',CG:'afrique_sub',CD:'afrique_sub',AO:'afrique_sub',NA:'afrique_sub',
  BW:'afrique_sub',LS:'afrique_sub',SZ:'afrique_sub',
  // Moyen-Orient
  TR:'moyen_orient',JO:'moyen_orient',LB:'moyen_orient',IL:'moyen_orient',AE:'moyen_orient',
  SA:'moyen_orient',QA:'moyen_orient',KW:'moyen_orient',BH:'moyen_orient',OM:'moyen_orient',
  YE:'moyen_orient',IQ:'moyen_orient',IR:'moyen_orient',AM:'moyen_orient',GE:'moyen_orient',AZ:'moyen_orient',
  // Océanie
  AU:'oceanie',NZ:'oceanie',FJ:'oceanie',PG:'oceanie',WS:'oceanie',TO:'oceanie',VU:'oceanie',SB:'oceanie',
}

const STYLES: { id: Style; label: string }[] = [
  { id: 'budget',  label: 'Backpack' },
  { id: 'confort', label: 'Confort' },
  { id: 'luxe',    label: 'Luxe' },
]

const CATEGORIES = [
  { key: 'hebergement' as const, label: 'Hébergement',      emoji: '🏨', color: '#36A6B2' },
  { key: 'repas'       as const, label: 'Repas',            emoji: '🍽️', color: '#34C28E' },
  { key: 'transport'   as const, label: 'Transports locaux',emoji: '🚌', color: '#8B7FD9' },
  { key: 'activites'   as const, label: 'Activités',        emoji: '🎡', color: '#F0998A' },
]

function Stepper({ label, value, onChange, min, max, unit }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string
}) {
  return (
    <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '8px 12px' }}>
      <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          style={{ width: 27, height: 27, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: 'white', fontSize: 18, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontWeight: 300 }}
        >−</button>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{value} <span style={{ fontSize: 12, fontWeight: 400, color: '#9CA3AF' }}>{unit}</span></span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          style={{ width: 27, height: 27, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: 'white', fontSize: 18, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontWeight: 300 }}
        >+</button>
      </div>
    </div>
  )
}

export default function BudgetCalculateur({ pays }: { pays: PaysOutil[] }) {
  const [paysCode, setPaysCode] = useState('')
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [jours, setJours] = useState(7)
  const [personnes, setPersonnes] = useState(1)
  const [style, setStyle] = useState<Style>('confort')

  const paysFiltered = pays.filter(p =>
    p.nom_fr.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6)

  function handleSelectPays(p: PaysOutil) {
    setPaysCode(p.code)
    setSearch(p.nom_fr)
    setShowDropdown(false)
  }

  const paysSelectionne = pays.find(p => p.code === paysCode)
  const budgetEstimations = paysSelectionne?.budget_estimations as BudgetEstimations | null | undefined

  function getResult(): { data: BudgetData; source: 'verified' | 'regional' } | null {
    if (!paysCode) return null
    if (budgetEstimations) return { data: budgetEstimations[style], source: 'verified' }
    const zone = PAYS_ZONE[paysCode]
    if (zone && ZONE_FALLBACKS[zone]) return { data: ZONE_FALLBACKS[zone][style], source: 'regional' }
    return null
  }

  const result = getResult()

  const hebergementTotal = result ? Math.round(result.data.hebergement * jours) : 0
  const repasTotal       = result ? Math.round(result.data.repas * jours * personnes) : 0
  const transportTotal   = result ? Math.round(result.data.transport * jours * personnes) : 0
  const activitesTotal   = result ? Math.round(result.data.activites * jours * personnes) : 0
  const subtotal = hebergementTotal + repasTotal + transportTotal + activitesTotal
  const imprevu  = Math.round(subtotal * 0.1)
  const total    = subtotal + imprevu

  const amounts: Record<string, number> = {
    hebergement: hebergementTotal,
    repas:       repasTotal,
    transport:   transportTotal,
    activites:   activitesTotal,
  }

  const fmt = (n: number) => n.toLocaleString('fr-FR')

  return (
    <div className="flex flex-col gap-3">
      {/* Sélecteur de pays — même design que "Ajouter un voyage" */}
      <div className="relative">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Destination</p>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowDropdown(true); setPaysCode('') }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Rechercher un pays..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
        />
        {showDropdown && search.length > 0 && paysFiltered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            {paysFiltered.map(p => (
              <button
                key={p.code}
                type="button"
                onMouseDown={() => handleSelectPays(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm"
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-gray-800">{p.nom_fr}</span>
                {paysCode === p.code && <span className="ml-auto text-[#36A6B2]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Durée & voyageurs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Stepper label="Durée" value={jours} onChange={setJours} min={1} max={90} unit="jours" />
        <Stepper label="Voyageurs" value={personnes} onChange={setPersonnes} min={1} max={20} unit="pers." />
      </div>

      {/* Style de voyage */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {STYLES.map(s => (
          <button
            key={s.id}
            onClick={() => setStyle(s.id)}
            style={{
              padding: '5px 4px',
              borderRadius: 12,
              border: `2px solid ${style === s.id ? '#004850' : '#E5E7EB'}`,
              background: style === s.id ? '#004850' : 'white',
              color: style === s.id ? 'white' : '#6B7280',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Résultats */}
      {result ? (
        <div>
          {/* Badge source */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color:      result.source === 'verified' ? '#2D5A1B' : '#786400',
              background: result.source === 'verified' ? '#e7f8ce' : '#fffcc7',
              padding: '3px 10px', borderRadius: 999,
            }}>
              {result.source === 'verified' ? '✓ Données vérifiées' : '~ Estimation régionale'}
            </span>
          </div>

          {/* Barres par catégorie */}
          {CATEGORIES.map(cat => (
            <div key={cat.key} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 13, color: '#4B5563' }}>{cat.emoji} {cat.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{fmt(amounts[cat.key])} €</span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: '#F3F4F6', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 999, background: cat.color,
                  width: `${total > 0 ? (amounts[cat.key] / total) * 100 : 0}%`,
                  transition: 'width 0.35s ease',
                }} />
              </div>
            </div>
          ))}

          {/* Imprévus */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>❓ Imprévus (10%)</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>{fmt(imprevu)} €</span>
          </div>

          {/* Séparateur */}
          <div style={{ height: 1, background: '#F3F4F6', margin: '10px 0' }} />

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#004850' }}>{fmt(total)} €</span>
          </div>

          {/* Par jour / par personne */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Par jour', value: Math.round(total / jours) },
              { label: 'Par personne', value: Math.round(total / personnes) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#F9FAFB', borderRadius: 12, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#374151' }}>{fmt(value)} €</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <InfoBlock type="info">
              Vol non inclus. Hébergement estimé pour une chambre partagée.
            </InfoBlock>
          </div>
        </div>
      ) : paysCode ? (
        <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
          Pas de données disponibles pour cette destination.
        </p>
      ) : null}
    </div>
  )
}
