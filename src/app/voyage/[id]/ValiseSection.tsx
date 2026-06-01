'use client'

import { useState, useTransition } from 'react'
import { genererValise, toggleValiseItem, supprimerValiseItem, ajouterValiseItem, supprimerValise } from './valise-actions'
import { QuestionnaireValise } from '@/lib/utils/generateValise'

type ValiseItem = {
  id: string
  membre_prenom: string
  categorie: string
  label: string
  quantite: string | null
  obligatoire: boolean
  completed: boolean
}

type Membre = { id: string; prenom: string; type: string; date_naissance?: string | null }

// Notes aviation automatiques selon le label
const AVIATION_NOTES: { keywords: string[]; badge: string }[] = [
  {
    keywords: ['batterie', 'powerbank'],
    badge: 'Cabine uniquement',
  },
  {
    keywords: ['shampoing', 'après-shampoing', 'gel douche', 'savon', 'déodorant', 'mousse', 'crème', 'after-sun', 'hydratant', 'solaire', 'démaquillant', 'gel', 'répulsif', 'anti-moustique', 'maquillage'],
    badge: '100ml maximum en cabine',
  },
]

function getAviationBadge(label: string): string | null {
  const labelLower = label.toLowerCase()
  for (const rule of AVIATION_NOTES) {
    if (rule.keywords.some(k => labelLower.includes(k))) return rule.badge
  }
  return null
}

const CATEGORIES_CONFIG = [
  { key: 'vetements',    label: 'Vêtements',    emoji: '👕', color: '#534AB7', light: '#EDE9FF' },
  { key: 'hygiene',      label: 'Hygiène',      emoji: '🧴', color: '#1D9E75', light: '#D1FAE5' },
  { key: 'medicaments',  label: 'Médicaments',  emoji: '💊', color: '#D97706', light: '#FEF3C7' },
  { key: 'electronique', label: 'Électronique', emoji: '🔋', color: '#EA580C', light: '#FFEDD5' },
  { key: 'documents',    label: 'Documents',    emoji: '📄', color: '#2563EB', light: '#DBEAFE' },
  { key: 'divers',       label: 'Divers',       emoji: '🎒', color: '#E11D48', light: '#FFE4E6' },
]

const TEMPERATURES = [
  { value: 'froid',    label: 'Froid', emoji: '🧊', sub: '< 10°C' },
  { value: 'doux',     label: 'Doux', emoji: '🌤️', sub: '10–20°C' },
  { value: 'chaud',    label: 'Chaud', emoji: '☀️', sub: '20–30°C' },
  { value: 'tropical', label: 'Tropical', emoji: '🌴', sub: '> 30°C' },
]

const ACTIVITES = [
  { value: 'plage',    label: 'Plage', emoji: '🏖️' },
  { value: 'montagne', label: 'Montagne', emoji: '🏔️' },
  { value: 'ville',    label: 'Ville', emoji: '🏙️' },
  { value: 'business', label: 'Business', emoji: '💼' },
  { value: 'sport',    label: 'Sport', emoji: '🏃' },
]

const BAGAGES = [
  { value: 'main',     label: 'Bagage à main', emoji: '👜' },
  { value: 'cabine',   label: 'Bagage cabine', emoji: '🎒' },
  { value: 'soute_20', label: 'Soute',          emoji: '🧳' },
]

const BAGAGE_PILLS: Record<string, { label: string; emoji: string; bg: string; color: string }> = {
  main:     { label: 'Bagage à main', emoji: '👜', bg: '#DBEAFE', color: '#1E40AF' },
  cabine:   { label: 'Cabine',        emoji: '🎒', bg: '#EDE9FF', color: '#534AB7' },
  soute_20: { label: 'Soute 20 kg',  emoji: '🧳', bg: '#D1FAE5', color: '#065F46' },
  soute_23: { label: 'Soute 23 kg+', emoji: '🧳', bg: '#FEF3C7', color: '#92400E' },
}

function getAge(dateNaissance?: string | null): 'adulte' | 'enfant' {
  if (!dateNaissance) return 'adulte'
  const age = (Date.now() - new Date(dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return age < 18 ? 'enfant' : 'adulte'
}

// Déduit la température probable selon le pays et le mois de départ
function deduireTemperature(paysCode: string | null | undefined, dateDepart: string | null | undefined): QuestionnaireValise['temperature'] {
  const mois = dateDepart ? new Date(dateDepart).getMonth() + 1 : 7 // défaut : juillet
  const ete = mois >= 5 && mois <= 9
  const hiver = mois <= 2 || mois === 12

  const toujours_tropical = ['TH', 'ID', 'SN']
  const toujours_chaud = ['MA', 'MX']
  const saison = { 'PT': ete ? 'chaud' : 'doux', 'GR': ete ? 'chaud' : 'doux', 'IT': ete ? 'chaud' : 'doux', 'US': ete ? 'chaud' : 'froid', 'JP': ete ? 'chaud' : hiver ? 'froid' : 'doux' }

  if (!paysCode) return 'chaud'
  if (toujours_tropical.includes(paysCode)) return 'tropical'
  if (toujours_chaud.includes(paysCode)) return 'chaud'
  return (saison[paysCode as keyof typeof saison] as any) ?? 'chaud'
}

// Suggère des activités selon le pays
function deduireActivites(paysCode: string | null | undefined): string[] {
  const plage = ['TH', 'ID', 'MA', 'PT', 'GR', 'MX', 'SN']
  const ville = ['JP', 'IT', 'US', 'FR']
  const activites: string[] = []
  if (paysCode && plage.includes(paysCode)) activites.push('plage', 'ville')
  else if (paysCode && ville.includes(paysCode)) activites.push('ville')
  else activites.push('ville')
  return activites
}

export default function ValiseSection({
  voyageId, membres, itemsInitiaux, jours, paysCode, dateDepart, onGoToPratique,
}: {
  voyageId: string
  membres: Membre[]
  itemsInitiaux: ValiseItem[]
  jours: number
  paysCode?: string | null
  dateDepart?: string | null
  onGoToPratique?: () => void
}) {
  const [items, setItems] = useState(itemsInitiaux)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [, startTransition] = useTransition()
  const [generating, setGenerating] = useState(false)
  const storageKey = `valise_bagages_${voyageId}`
  const [bagageParPrenom, setBagageParPrenom] = useState<Record<string, string[]>>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? '{}') } catch { return {} }
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForPrenom, setAddForPrenom] = useState<string>('')
  const [addForm, setAddForm] = useState({ label: '', categorie: 'vetements', quantite: '', membre_prenom: membres[0]?.prenom ?? '' })
  const [addSaving, setAddSaving] = useState(false)

  // Questionnaire state
  const [q, setQ] = useState<Partial<QuestionnaireValise>>({
    prenom: membres[0]?.prenom ?? '',
    sexe: 'femme',
    jours,
    temperature: deduireTemperature(paysCode, dateDepart),
    activites: deduireActivites(paysCode),
    bagages: ['cabine'],
  })
  const [step, setStep] = useState(membres.length <= 1 ? 1 : 0)

  const membresByPrenom = Object.fromEntries(membres.map(m => [m.prenom, m]))

  // Grouper par membre puis catégorie
  const prenoms = [...new Set(items.map(i => i.membre_prenom))]

  async function handleGenerer() {
    if (!q.prenom || !q.sexe || !q.temperature || !q.bagages?.length) return
    setGenerating(true)
    const membre = membresByPrenom[q.prenom]
    const questionnaire: QuestionnaireValise = {
      prenom: q.prenom!,
      sexe: q.sexe!,
      age: membre?.type === 'enfant' ? 'enfant' : getAge(membre?.date_naissance),
      jours: q.jours ?? jours,
      temperature: q.temperature!,
      activites: q.activites ?? [],
      bagages: q.bagages ?? ['cabine'],
    }
    await genererValise(voyageId, questionnaire)
    const updated = { ...bagageParPrenom, [questionnaire.prenom]: questionnaire.bagages }
    setBagageParPrenom(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    window.location.reload()
  }

  function handleToggle(id: string, current: boolean) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, completed: !current } : i))
    startTransition(() => toggleValiseItem(id, !current))
  }

  function handleSupprimer(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    startTransition(() => supprimerValiseItem(id))
  }

  async function handleAjouterArticle() {
    if (!addForm.label.trim()) return
    setAddSaving(true)
    const result = await ajouterValiseItem(voyageId, addForm)
    if (!result?.error) {
      setItems(prev => [...prev, {
        id: crypto.randomUUID(),
        membre_prenom: addForm.membre_prenom,
        categorie: addForm.categorie,
        label: addForm.label,
        quantite: addForm.quantite || null,
        obligatoire: false,
        completed: false,
      }])
      setOpen(prev => ({ ...prev, [`${addForm.membre_prenom}-${addForm.categorie}`]: true }))
      setAddForm({ label: '', categorie: 'vetements', quantite: '', membre_prenom: membres[0]?.prenom ?? '' })
      setShowAddModal(false)
    }
    setAddSaving(false)
  }

  function handlePrint(prenomFiltre?: string) {
    const win = window.open('', '_blank')
    if (!win) return
    const prenomsFiltres = prenomFiltre ? [prenomFiltre] : prenoms
    const html = `<!DOCTYPE html><html lang="fr"><head>
      <meta charset="UTF-8"><title>${prenomFiltre ? `Valise de ${prenomFiltre}` : 'Ma valise'} — ReadyToFly</title>
      <style>
        * { margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important }
        body { font-family:-apple-system,Arial,sans-serif;background:white;padding:32px;color:#1F2937 }
        h1 { font-size:22px;font-weight:800;margin-bottom:4px }
        .sub { font-size:12px;color:#9CA3AF;margin-bottom:24px }
        .cat { margin-bottom:16px;border-radius:12px;overflow:hidden;border:1.5px solid #eee }
        .cat-header { display:flex;align-items:center;gap:10px;padding:10px 16px;font-weight:700;font-size:13px }
        .item { display:flex;align-items:center;gap:10px;padding:8px 16px;border-top:1px solid #F9FAFB }
        .checkbox { width:16px;height:16px;border-radius:50%;border:2px solid #D1D5DB;flex-shrink:0 }
        .label { font-size:13px }
        .qty { font-size:11px;padding:1px 6px;border-radius:99px;margin-left:6px }
        @media print { @page { margin:1cm } }
      </style></head><body>
      <h1>🧳 ${prenomFiltre ? `Valise de ${prenomFiltre}` : 'Ma valise'}</h1>
      <div class="sub">ReadyToFly · ${new Date().toLocaleDateString('fr-FR')}</div>
      ${prenomsFiltres.map(prenom => {
        const membreItems = items.filter(i => i.membre_prenom === prenom)
        return `${prenoms.length > 1 ? `<h2 style="font-size:14px;margin:16px 0 8px;color:#534AB7">👤 ${prenom}</h2>` : ''}
        ${CATEGORIES_CONFIG.map(cat => {
          const catItems = membreItems.filter(i => i.categorie === cat.key)
          if (!catItems.length) return ''
          return `<div class="cat">
            <div class="cat-header" style="background:${cat.light};border-left:4px solid ${cat.color}">
              <span style="font-size:16px">${cat.emoji}</span>
              <span style="color:${cat.color}">${cat.label}</span>
              <span style="margin-left:auto;font-size:11px;color:${cat.color}">${catItems.length} articles</span>
            </div>
            ${catItems.map(item => `
              <div class="item">
                <div class="checkbox"></div>
                <span class="label">${item.label}</span>
                ${item.quantite ? `<span class="qty" style="background:${cat.light};color:${cat.color}">${item.quantite}</span>` : ''}
              </div>`).join('')}
          </div>`
        }).join('')}`
      }).join('')}
      <script>window.onload=()=>window.print()</script>
    </body></html>`
    win.document.write(html)
    win.document.close()
  }

  // Score global
  const total = items.length
  const done = items.filter(i => i.completed).length
  const score = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="flex flex-col gap-1 mt-4">

      {/* En-tête */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900">🧳 Ma valise</h2>
        <button onClick={() => { setShowQuestionnaire(true); setStep(membres.length <= 1 ? 1 : 0) }}
          className="text-lg font-bold leading-none"
          style={{ color: '#534AB7' }}>
          +
        </button>
      </div>

      {/* Contenu par membre */}
      {total === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 py-12 text-center">
          <div className="text-5xl mb-3">🧳</div>
          <p className="text-sm text-gray-400 mb-5">Génère ta liste de valise personnalisée</p>
          <button onClick={() => { setShowQuestionnaire(true); setStep(membres.length <= 1 ? 1 : 0) }}
            className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
            ✨ Générer ma valise
          </button>
        </div>
      ) : (
        prenoms.map(prenom => {
          const membreItems = items.filter(i => i.membre_prenom === prenom)
          const membreDone = membreItems.filter(i => i.completed).length
          const membreTotal = membreItems.length
          const membreScore = membreTotal > 0 ? Math.round((membreDone / membreTotal) * 100) : 0

          return (
            <div key={prenom} className="flex flex-col gap-3 mt-2">

              {/* Boutons par personne */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div />
                <div className="flex gap-2">
                  <button onClick={() => { setAddForm(f => ({ ...f, membre_prenom: prenom })); setShowAddModal(true) }}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white shadow text-xs font-semibold"
                    style={{ color: '#534AB7' }}>＋ Ajouter</button>
                  <button onClick={() => handlePrint(prenom)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white shadow text-xs font-semibold"
                    style={{ color: '#534AB7' }}>🖨️ Imprimer</button>
                  <button onClick={() => { setQ(prev => ({ ...prev, prenom })); setShowQuestionnaire(true); setStep(1) }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>↺ Régénérer</button>
                  <button onClick={async () => {
                    if (!confirm(`Supprimer la valise de ${prenom} ?`)) return
                    setItems(prev => prev.filter(i => i.membre_prenom !== prenom))
                    await supprimerValise(voyageId, prenom)
                  }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-red-50 text-red-400 hover:bg-red-100 transition font-bold">
                    ×
                  </button>
                </div>
              </div>

              {/* Carte violette par personne */}
              <div className="rounded-3xl p-4 flex items-start gap-4"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #534AB7)' }}>
                {/* Cercle progression */}
                <div className="relative shrink-0">
                  <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="5" />
                    <circle cx="30" cy="30" r="25" fill="none"
                      stroke={membreScore === 100 ? '#1D9E75' : 'white'} strokeWidth="5"
                      strokeDasharray={2 * Math.PI * 25}
                      strokeDashoffset={2 * Math.PI * 25 * (1 - membreScore / 100)}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{membreScore}%</span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0 flex flex-col justify-between" style={{ minHeight: 60 }}>
                  {/* Ligne haut : titre + nom */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-white">Préparation de la valise</p>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full shrink-0"
                      style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                      👤 {prenom}
                    </span>
                  </div>

                  {/* Pills bagages sous le titre */}
                  {bagageParPrenom[prenom]?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {bagageParPrenom[prenom].map(b => {
                        const pill = BAGAGE_PILLS[b]
                        if (!pill) return null
                        return (
                          <span key={b} className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            {pill.emoji} {pill.label}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Ligne bas : articles + lien */}
                  <div className="flex items-end justify-between mt-2">
                    <p className="text-xs text-purple-200">{membreDone} / {membreTotal} articles</p>
                    {onGoToPratique && (
                      <button onClick={onGoToPratique}
                        className="text-xs text-purple-200 hover:text-white transition underline shrink-0">
                        Dimensions autorisées →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {CATEGORIES_CONFIG.map(cat => {
                const catItems = membreItems.filter(i => i.categorie === cat.key)
                if (catItems.length === 0) return null
                const catDone = catItems.filter(i => i.completed).length
                const isOpen = open[`${prenom}-${cat.key}`] ?? false
                return (
                  <div key={cat.key} className="rounded-3xl overflow-hidden mb-3 shadow-sm"
                    style={{ background: cat.light, border: `1.5px solid ${cat.color}22` }}>
                    <button onClick={() => setOpen(prev => ({ ...prev, [`${prenom}-${cat.key}`]: !isOpen }))}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left">
                      <div className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                        style={{ background: `${cat.color}22` }}>
                        {cat.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: cat.color }}>{cat.label}</span>
                          {catDone === catItems.length && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">✓ Complet</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${Math.round((catDone / catItems.length) * 100)}%`, background: catDone === catItems.length ? '#1D9E75' : cat.color }} />
                          </div>
                          <span className="text-xs shrink-0" style={{ color: cat.color }}>{catDone}/{catItems.length}</span>
                        </div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                        <path d="M2 4.5L7 9.5L12 4.5" stroke={cat.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div style={{ borderTop: `1px solid ${cat.color}20` }}>
                        {catItems.map((item, idx) => (
                          <div key={item.id}
                            onClick={() => handleToggle(item.id, item.completed)}
                            className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none"
                            style={{
                              borderBottom: idx < catItems.length - 1 ? `1px solid ${cat.color}15` : 'none',
                              background: item.completed ? `${cat.color}08` : 'white',
                            }}>
                            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                              style={{ borderColor: item.completed ? cat.color : '#D1D5DB', background: item.completed ? cat.color : 'white' }}>
                              {item.completed && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-1">
                                <span className="text-sm font-medium text-gray-800"
                                  style={item.completed ? { textDecoration: 'line-through', textDecorationColor: cat.color, textDecorationThickness: '2px' } : {}}>
                                  {item.label}
                                </span>
                                {item.quantite && (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: cat.light, color: cat.color }}>
                                    {item.quantite}
                                  </span>
                                )}
                                {item.obligatoire && !item.completed && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 whitespace-nowrap"
                                    style={{ background: '#FEF3C7', color: '#92400E' }}>
                                    ⚠️ Requis
                                  </span>
                                )}
                                {(() => {
                                  const badge = getAviationBadge(item.label)
                                  return badge ? (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                      style={{ background: '#FEF3C7', color: '#92400E' }}>
                                      {badge}
                                    </span>
                                  ) : null
                                })()}
                              </div>
                            </div>
                            <button onClick={e => { e.stopPropagation(); handleSupprimer(item.id) }}
                              className="shrink-0 self-center text-gray-200 hover:text-red-400 text-lg leading-none transition">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })
      )}

      {/* Modal questionnaire */}
      {showQuestionnaire && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowQuestionnaire(false)}>
          <div className="bg-white w-full max-w-md shadow-2xl"
            style={{ borderRadius: '24px' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="px-5 pt-5 pb-4"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #534AB7)', borderRadius: '24px 24px 0 0' }}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-white text-lg">🧳 Prépare ta valise</h3>
                <button onClick={() => setShowQuestionnaire(false)} className="text-white/60 hover:text-white text-2xl leading-none shrink-0">×</button>
              </div>
              <p className="text-purple-200 text-xs mt-1">Étape {step + 1} / 4</p>
            </div>

            {/* Barre de progression */}
            <div className="h-1" style={{ background: '#EDE9FF' }}>
              <div className="h-full transition-all" style={{ width: `${((step + 1) / 4) * 100}%`, background: '#534AB7' }} />
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">

              {/* Étape 0 : Pour qui + sexe */}
              {step === 0 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="font-bold text-gray-900 mb-3">Pour qui prépare-t-on la valise ?</p>
                    <div className="flex flex-col gap-2">
                      {membres.map(m => (
                        <button key={m.id} onClick={() => setQ(prev => ({ ...prev, prenom: m.prenom }))}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left"
                          style={{ borderColor: q.prenom === m.prenom ? '#534AB7' : 'transparent', background: q.prenom === m.prenom ? '#EDE9FF' : '#F9FAFB' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: '#534AB7' }}>
                            {m.prenom[0]}
                          </div>
                          <span className="font-semibold text-gray-800">{m.prenom}</span>
                          <span className="text-xs text-gray-400 ml-auto capitalize">{m.type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-gray-900 mb-3">Sexe</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ value: 'femme', label: 'Femme', emoji: '👩' }, { value: 'homme', label: 'Homme', emoji: '👨' }].map(s => (
                        <button key={s.value} onClick={() => setQ(prev => ({ ...prev, sexe: s.value as any }))}
                          className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all"
                          style={{ borderColor: q.sexe === s.value ? '#534AB7' : 'transparent', background: q.sexe === s.value ? '#EDE9FF' : '#F9FAFB', color: q.sexe === s.value ? '#534AB7' : '#6B7280' }}>
                          <span className="text-2xl">{s.emoji}</span>
                          <span className="font-semibold">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 1 : Bagage + jours */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Type de bagage</p>
                    <p className="text-xs text-gray-400 mb-3">Plusieurs choix possibles</p>
                    <div className="flex flex-col gap-2">
                      {BAGAGES.map(b => {
                        const sel = q.bagages?.includes(b.value)
                        return (
                          <button key={b.value} onClick={() => setQ(prev => ({
                            ...prev,
                            bagages: sel
                              ? (prev.bagages ?? []).filter(x => x !== b.value)
                              : [...(prev.bagages ?? []), b.value]
                          }))}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all"
                            style={{ borderColor: sel ? '#534AB7' : 'transparent', background: sel ? '#EDE9FF' : '#F9FAFB' }}>
                            <span className="text-2xl">{b.emoji}</span>
                            <p className="font-semibold text-gray-800">{b.label}</p>
                            {sel && <span className="ml-auto text-[#534AB7]">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-gray-900 mb-3">Nombre de jours</p>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setQ(prev => ({ ...prev, jours: Math.max(1, (prev.jours ?? 1) - 1) }))}
                        className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold text-gray-700 hover:bg-gray-200 transition">−</button>
                      <span className="text-3xl font-bold text-gray-900 w-16 text-center">{q.jours}</span>
                      <button onClick={() => setQ(prev => ({ ...prev, jours: (prev.jours ?? 1) + 1 }))}
                        className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold text-gray-700 hover:bg-gray-200 transition">+</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2 : Température */}
              {step === 2 && (
                <div>
                  <p className="font-bold text-gray-900 mb-3">Température sur place</p>
                  <div className="flex flex-col gap-2">
                    {TEMPERATURES.map(t => (
                      <button key={t.value} onClick={() => setQ(prev => ({ ...prev, temperature: t.value as any }))}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all"
                        style={{ borderColor: q.temperature === t.value ? '#534AB7' : 'transparent', background: q.temperature === t.value ? '#EDE9FF' : '#F9FAFB' }}>
                        <span className="text-2xl">{t.emoji}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{t.label}</p>
                          <p className="text-xs text-gray-400">{t.sub}</p>
                        </div>
                        {q.temperature === t.value && <span className="ml-auto text-[#534AB7]">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Étape 3 : Activités */}
              {step === 3 && (
                <div>
                  <p className="font-bold text-gray-900 mb-1">Activités prévues</p>
                  <p className="text-xs text-gray-400 mb-4">Plusieurs choix possibles</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIVITES.map(a => {
                      const sel = q.activites?.includes(a.value)
                      return (
                        <button key={a.value}
                          onClick={() => setQ(prev => ({
                            ...prev,
                            activites: sel
                              ? (prev.activites ?? []).filter(x => x !== a.value)
                              : [...(prev.activites ?? []), a.value]
                          }))}
                          className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all"
                          style={{ borderColor: sel ? '#534AB7' : 'transparent', background: sel ? '#EDE9FF' : '#F9FAFB', color: sel ? '#534AB7' : '#6B7280' }}>
                          <span className="text-xl">{a.emoji}</span>
                          <span className="font-semibold text-sm">{a.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 flex gap-3 border-t border-gray-50">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 rounded-2xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                  ← Retour
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)}
                  disabled={step === 0 && !q.prenom}
                  className="flex-1 py-3 rounded-2xl font-semibold text-white disabled:opacity-40 transition"
                  style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
                  Suivant →
                </button>
              ) : (
                <button onClick={handleGenerer} disabled={generating}
                  className="flex-1 py-3 rounded-2xl font-semibold text-white disabled:opacity-50 transition"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #534AB7)' }}>
                  {generating ? 'Génération...' : '✨ Générer ma liste'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout article */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Ajouter un article</h3>
                <p className="text-xs text-gray-400 mt-0.5">Valise de <span className="font-semibold text-[#534AB7]">{addForm.membre_prenom}</span></p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-300 text-2xl">×</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Catégorie</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES_CONFIG.map(cat => (
                    <button key={cat.key} type="button" onClick={() => setAddForm(f => ({ ...f, categorie: cat.key }))}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{ background: addForm.categorie === cat.key ? cat.light : '#F9FAFB', border: `2px solid ${addForm.categorie === cat.key ? cat.color : 'transparent'}`, color: addForm.categorie === cat.key ? cat.color : '#6B7280' }}>
                      <span>{cat.emoji}</span><span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Article</label>
                <input value={addForm.label} onChange={e => setAddForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Ex : Chaussures de sport..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                  autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Quantité <span className="font-normal normal-case">(optionnel)</span></label>
                <input value={addForm.quantite} onChange={e => setAddForm(f => ({ ...f, quantite: e.target.value }))}
                  placeholder="Ex : 2 paires..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
              </div>
              <button onClick={handleAjouterArticle} disabled={addSaving || !addForm.label.trim()}
                className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
                {addSaving ? 'Ajout...' : '+ Ajouter à la valise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
