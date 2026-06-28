'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  toggleItem, genererChecklist, genererValise, ajouterItem,
  supprimerItem, supprimerCategorie, modifierItem, deplacerItem,
} from './checklist-actions'
import { QuestionnaireValise } from '@/lib/utils/generateValise'

type Item = {
  id: string
  valise_id: string
  categorie: string
  sous_categorie: string | null
  label: string
  description: string | null
  quantite: string | null
  obligatoire: boolean
  completed: boolean
}

type Membre = { id: string; prenom: string; type: string; date_naissance?: string | null }

type Valise = {
  id: string
  membre: Membre
  items: Item[]
  bagagesTypes: string[]
}

const CATEGORIES = [
  { key: 'documents',    label: 'Documents',  emoji: '📄', color: '#1D4ED8', light: '#DBEAFE' },
  { key: 'sante',        label: 'Santé',       emoji: '💊', color: '#1D9E75', light: '#D1FAE5' },
  { key: 'argent',       label: 'Argent',      emoji: '💰', color: '#D97706', light: '#FEF3C7' },
  { key: 'logistique',   label: 'Logistique',  emoji: '🔧', color: '#2563EB', light: '#DBEAFE' },
  { key: 'avant_depart', label: 'Maison',      emoji: '🏠', color: '#E11D48', light: '#FFE4E6' },
]

const SOUS_CATEGORIES = [
  { key: 'vetements',    label: 'Vêtements',    emoji: '👕', color: '#1D4ED8', light: '#DBEAFE' },
  { key: 'hygiene',      label: 'Hygiène',      emoji: '🧴', color: '#1D9E75', light: '#D1FAE5' },
  { key: 'medicaments',  label: 'Médicaments',  emoji: '💊', color: '#D97706', light: '#FEF3C7' },
  { key: 'electronique', label: 'Électronique', emoji: '🔋', color: '#EA580C', light: '#FFEDD5' },
  { key: 'documents',    label: 'Documents',    emoji: '📄', color: '#2563EB', light: '#DBEAFE' },
  { key: 'divers',       label: 'Divers',       emoji: '🎒', color: '#E11D48', light: '#FFE4E6' },
]

const BAGAGES_OPTIONS = [
  { value: 'main',     label: 'Bagage à main', emoji: '👜' },
  { value: 'cabine',   label: 'Bagage cabine', emoji: '🎒' },
  { value: 'soute_20', label: 'Soute',          emoji: '🧳' },
]

const BAGAGE_PILLS: Record<string, { label: string; emoji: string }> = {
  main:     { label: 'Bagage à main', emoji: '👜' },
  cabine:   { label: 'Cabine',        emoji: '🎒' },
  soute_20: { label: 'Soute 20 kg',  emoji: '🧳' },
  soute_23: { label: 'Soute 23 kg+', emoji: '🧳' },
}

const TEMPERATURES = [
  { value: 'froid',    label: 'Froid', emoji: '🧊', sub: '< 10°C' },
  { value: 'doux',     label: 'Doux', emoji: '🌤️', sub: '10–20°C' },
  { value: 'chaud',    label: 'Chaud', emoji: '☀️', sub: '20–30°C' },
  { value: 'tropical', label: 'Tropical', emoji: '🌴', sub: '> 30°C' },
]

const ACTIVITES_OPTIONS = [
  { value: 'plage',    label: 'Plage', emoji: '🏖️' },
  { value: 'montagne', label: 'Montagne', emoji: '🏔️' },
  { value: 'ville',    label: 'Ville', emoji: '🏙️' },
  { value: 'business', label: 'Business', emoji: '💼' },
  { value: 'sport',    label: 'Sport', emoji: '🏃' },
]

const AVIATION_NOTES: { keywords: string[]; badge: string }[] = [
  { keywords: ['batterie', 'powerbank'], badge: 'Cabine uniquement' },
  { keywords: ['shampoing', 'après-shampoing', 'gel douche', 'savon', 'déodorant', 'mousse', 'crème', 'after-sun', 'hydratant', 'solaire', 'démaquillant', 'gel', 'répulsif', 'anti-moustique', 'maquillage'], badge: '100ml maximum en cabine' },
]

function getAviationBadge(label: string): string | null {
  const l = label.toLowerCase()
  for (const rule of AVIATION_NOTES) {
    if (rule.keywords.some(k => l.includes(k))) return rule.badge
  }
  return null
}

function getAge(dateNaissance?: string | null): 'adulte' | 'enfant' {
  if (!dateNaissance) return 'adulte'
  const age = (Date.now() - new Date(dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return age < 18 ? 'enfant' : 'adulte'
}

function deduireTemperature(paysCode: string | null | undefined, dateDepart: string | null | undefined): QuestionnaireValise['temperature'] {
  const mois = dateDepart ? new Date(dateDepart).getMonth() + 1 : 7
  const ete = mois >= 5 && mois <= 9
  const hiver = mois <= 2 || mois === 12
  const toujours_tropical = ['TH', 'ID', 'SN']
  const toujours_chaud = ['MA', 'MX']
  const saison: Record<string, string> = { PT: ete ? 'chaud' : 'doux', GR: ete ? 'chaud' : 'doux', IT: ete ? 'chaud' : 'doux', US: ete ? 'chaud' : 'froid', JP: ete ? 'chaud' : hiver ? 'froid' : 'doux' }
  if (!paysCode) return 'chaud'
  if (toujours_tropical.includes(paysCode)) return 'tropical'
  if (toujours_chaud.includes(paysCode)) return 'chaud'
  return (saison[paysCode] as QuestionnaireValise['temperature']) ?? 'chaud'
}

function deduireActivites(paysCode: string | null | undefined): string[] {
  const plage = ['TH', 'ID', 'MA', 'PT', 'GR', 'MX', 'SN']
  const ville = ['JP', 'IT', 'US', 'FR']
  if (paysCode && plage.includes(paysCode)) return ['plage', 'ville']
  if (paysCode && ville.includes(paysCode)) return ['ville']
  return ['ville']
}

function CircleProgress({ value, size = 52 }: { value: number; size?: number }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={value === 100 ? '#1D9E75' : 'white'} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  )
}

export default function ChecklistSection({
  valises: valisesInitiales, voyageId, voyageNom, dateDepart, dateRetour, paysCode, jours, onGoToPratique,
}: {
  valises: Valise[]
  voyageId: string
  voyageNom?: string
  dateDepart?: string
  dateRetour?: string
  paysCode?: string | null
  jours: number
  onGoToPratique?: () => void
}) {
  const router = useRouter()
  const [valises, setValises] = useState(valisesInitiales)
  useEffect(() => { setValises(valisesInitiales) }, [valisesInitiales])
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [generatingChecklist, setGeneratingChecklist] = useState<string | null>(null)
  const [generatingValise, setGeneratingValise] = useState<string | null>(null)

  // Modal ajout
  const [showAddModal, setShowAddModal] = useState<string | null>(null) // valiseId
  const [addForm, setAddForm] = useState({ label: '', categorie: 'documents', sousCategorie: 'vetements', description: '', quantite: '', obligatoire: false })
  const [addSaving, setAddSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ label: '', description: '', quantite: '', obligatoire: false })
  const [editSaving, setEditSaving] = useState(false)

  // Modal questionnaire valise
  const [showQuestionnaire, setShowQuestionnaire] = useState<string | null>(null) // valiseId
  const [step, setStep] = useState(0)
  const [q, setQ] = useState<Partial<QuestionnaireValise>>({})

  useEffect(() => {
    if (!showAddModal && !showQuestionnaire) return
    const scrollEl = document.querySelector('.phone-screen') as HTMLElement | null
    if (!scrollEl) return
    const original = scrollEl.style.overflow
    scrollEl.style.overflow = 'hidden'
    return () => { scrollEl.style.overflow = original }
  }, [showAddModal, showQuestionnaire])

  function openQuestionnaire(valise: Valise) {
    setQ({
      sexe: 'femme',
      jours,
      temperature: deduireTemperature(paysCode, dateDepart),
      activites: deduireActivites(paysCode),
      bagages: valise.bagagesTypes.length > 0 ? valise.bagagesTypes : ['cabine'],
    })
    setStep(0)
    setShowQuestionnaire(valise.id)
  }

  async function handleGenererChecklist(valiseId: string) {
    setGeneratingChecklist(valiseId)
    await genererChecklist(valiseId, voyageId)
    router.refresh()
    setGeneratingChecklist(null)
  }

  async function handleGenererValise(valise: Valise) {
    if (!q.sexe || !q.temperature || !q.bagages?.length) return
    setGeneratingValise(valise.id)
    const questionnaire: QuestionnaireValise = {
      prenom: valise.membre.prenom,
      sexe: q.sexe,
      age: valise.membre.type === 'enfant' ? 'enfant' : getAge(valise.membre.date_naissance),
      jours: q.jours ?? jours,
      temperature: q.temperature,
      activites: q.activites ?? [],
      bagages: q.bagages,
    }
    await genererValise(valise.id, voyageId, questionnaire)
    router.refresh()
    setGeneratingValise(null)
    setShowQuestionnaire(null)
  }

  function handleToggle(id: string, current: boolean) {
    setValises(prev => prev.map(v => ({ ...v, items: v.items.map(i => i.id === id ? { ...i, completed: !current } : i) })))
    startTransition(() => toggleItem(id, !current, voyageId))
  }

  async function handleAjouter(valiseId: string) {
    if (!addForm.label.trim()) return
    setAddSaving(true)
    const result = await ajouterItem(valiseId, voyageId, {
      label: addForm.label,
      categorie: addForm.categorie,
      sous_categorie: addForm.categorie === 'bagages' ? addForm.sousCategorie : null,
      description: addForm.description,
      quantite: addForm.categorie === 'bagages' ? addForm.quantite : undefined,
      obligatoire: addForm.obligatoire,
    })
    if (!result?.error) {
      const newItem: Item = {
        id: crypto.randomUUID(),
        valise_id: valiseId,
        categorie: addForm.categorie,
        sous_categorie: addForm.categorie === 'bagages' ? addForm.sousCategorie : null,
        label: addForm.label,
        description: addForm.description || null,
        quantite: addForm.categorie === 'bagages' ? (addForm.quantite || null) : null,
        obligatoire: addForm.obligatoire,
        completed: false,
      }
      setValises(prev => prev.map(v => v.id === valiseId ? { ...v, items: [...v.items, newItem] } : v))
      setOpen(prev => ({ ...prev, [`${valiseId}-${addForm.categorie}`]: true }))
      setAddForm({ label: '', categorie: 'documents', sousCategorie: 'vetements', description: '', quantite: '', obligatoire: false })
      setShowAddModal(null)
    }
    setAddSaving(false)
  }

  function handleSupprimer(id: string, valiseId: string) {
    setValises(prev => prev.map(v => v.id === valiseId ? { ...v, items: v.items.filter(i => i.id !== id) } : v))
    startTransition(() => supprimerItem(id, voyageId))
  }

  function handleStartEdit(item: Item) {
    setEditingId(item.id)
    setEditForm({ label: item.label, description: item.description ?? '', quantite: item.quantite ?? '', obligatoire: item.obligatoire })
  }

  async function handleSaveEdit(valiseId: string) {
    if (!editingId || !editForm.label.trim()) return
    setEditSaving(true)
    const result = await modifierItem(editingId, voyageId, editForm)
    if (!result?.error) {
      setValises(prev => prev.map(v => v.id === valiseId ? {
        ...v,
        items: v.items.map(i => i.id === editingId
          ? { ...i, label: editForm.label, description: editForm.description || null, quantite: editForm.quantite || null, obligatoire: editForm.obligatoire }
          : i),
      } : v))
      setEditingId(null)
    }
    setEditSaving(false)
  }

  function handleDeplacer(item: Item, valiseId: string, direction: 'haut' | 'bas') {
    const valise = valises.find(v => v.id === valiseId)
    if (!valise) return
    const groupItems = valise.items.filter(i => i.categorie === item.categorie)
    const idx = groupItems.findIndex(i => i.id === item.id)
    const targetIdx = direction === 'haut' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= groupItems.length) return
    const targetItem = groupItems[targetIdx]

    setValises(prev => prev.map(v => {
      if (v.id !== valiseId) return v
      const next = [...v.items]
      const i1 = next.findIndex(i => i.id === item.id)
      const i2 = next.findIndex(i => i.id === targetItem.id)
      ;[next[i1], next[i2]] = [next[i2], next[i1]]
      return { ...v, items: next }
    }))

    startTransition(() => { deplacerItem(item.id, voyageId, valiseId, item.categorie, direction) })
  }

  function handlePrint(valise: Valise) {
    const win = window.open('', '_blank')
    if (!win) return
    const adminCats = CATEGORIES.map(cat => ({ ...cat, items: valise.items.filter(i => i.categorie === cat.key) })).filter(c => c.items.length > 0)
    const bagagesItems = valise.items.filter(i => i.categorie === 'bagages')
    const html = `<!DOCTYPE html><html lang="fr"><head>
      <meta charset="UTF-8"><title>${voyageNom ?? 'Checklist'} — ${valise.membre.prenom} — Bon Vol</title>
      <style>
        * { margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important }
        body { font-family:-apple-system,Arial,sans-serif;background:white;padding:32px;color:#1F2937 }
        h1 { font-size:20px;font-weight:800;margin-bottom:4px }
        .sub { font-size:12px;color:#9CA3AF;margin-bottom:24px }
        .cat { margin-bottom:16px;border-radius:12px;overflow:hidden;border:1.5px solid #eee }
        .cat-header { display:flex;align-items:center;gap:10px;padding:10px 16px;font-weight:700;font-size:13px }
        .item { display:flex;align-items:center;gap:10px;padding:8px 16px;border-top:1px solid #F9FAFB }
        .checkbox { width:16px;height:16px;border-radius:50%;border:2px solid #D1D5DB;flex-shrink:0 }
        .label { font-size:13px }
        .qty { font-size:11px;padding:1px 6px;border-radius:99px;margin-left:6px }
        @media print { @page { margin:1cm } }
      </style></head><body>
      <h1>✈️ ${voyageNom ?? 'Checklist de préparation'} — ${valise.membre.prenom}</h1>
      <div class="sub">Bon Vol · ${new Date().toLocaleDateString('fr-FR')}</div>
      ${adminCats.map(cat => `<div class="cat">
        <div class="cat-header" style="background:${cat.light};border-left:4px solid ${cat.color}">
          <span style="font-size:16px">${cat.emoji}</span><span style="color:${cat.color}">${cat.label}</span>
        </div>
        ${cat.items.map(item => `<div class="item"><div class="checkbox"></div><span class="label">${item.label}</span></div>`).join('')}
      </div>`).join('')}
      ${bagagesItems.length > 0 ? SOUS_CATEGORIES.map(sc => {
        const items = bagagesItems.filter(i => i.sous_categorie === sc.key)
        if (!items.length) return ''
        return `<div class="cat">
          <div class="cat-header" style="background:${sc.light};border-left:4px solid ${sc.color}">
            <span style="font-size:16px">${sc.emoji}</span><span style="color:${sc.color}">${sc.label}</span>
          </div>
          ${items.map(item => `<div class="item"><div class="checkbox"></div><span class="label">${item.label}</span>${item.quantite ? `<span class="qty" style="background:${sc.light};color:${sc.color}">${item.quantite}</span>` : ''}</div>`).join('')}
        </div>`
      }).join('') : ''}
      <script>window.onload=()=>window.print()</script>
    </body></html>`
    win.document.write(html)
    win.document.close()
  }

  return (
    <div className="flex flex-col gap-5 mt-4">
      {valises.map(valise => {
        const adminItems = valise.items.filter(i => i.categorie !== 'bagages')
        const bagagesItems = valise.items.filter(i => i.categorie === 'bagages')
        const total = valise.items.length
        const done = valise.items.filter(i => i.completed).length
        const score = total > 0 ? Math.round((done / total) * 100) : 0
        const byCategory = CATEGORIES.map(cat => ({
          ...cat,
          items: adminItems.filter(i => i.categorie === cat.key),
          done: adminItems.filter(i => i.categorie === cat.key && i.completed).length,
        })).filter(c => c.items.length > 0)
        const bySousCategorie = SOUS_CATEGORIES.map(sc => ({
          ...sc,
          items: bagagesItems.filter(i => i.sous_categorie === sc.key),
          done: bagagesItems.filter(i => i.sous_categorie === sc.key && i.completed).length,
        })).filter(c => c.items.length > 0)

        return (
          <div key={valise.id} className="flex flex-col gap-3">
            {/* En-tête + score */}
            <div className="rounded-2xl shadow-sm p-5" style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #60A5FA 100%)' }}>
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <CircleProgress value={score} size={64} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{score}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-bold text-white text-base">{valises.length > 1 ? valise.membre.prenom : 'Ma préparation'}</h2>
                    {valises.length > 1 && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        {valise.membre.type === 'enfant' ? '👶' : '🧑'} {valise.membre.prenom}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-blue-100 mt-0.5">{done}/{total} tâche{total > 1 ? 's' : ''} complétée{done > 1 ? 's' : ''}</p>
                  {valise.bagagesTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {valise.bagagesTypes.map(b => BAGAGE_PILLS[b] && (
                        <span key={b} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                          {BAGAGE_PILLS[b].emoji} {BAGAGE_PILLS[b].label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setShowAddModal(valise.id)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white shadow text-xs font-semibold" style={{ color: '#1D4ED8' }}>
                ＋ Ajouter
              </button>
              <button onClick={() => handlePrint(valise)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow text-xs font-semibold" style={{ color: '#1D4ED8' }}>
                🖨️ Imprimer
              </button>
              <button onClick={() => handleGenererChecklist(valise.id)} disabled={generatingChecklist === valise.id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}>
                ↺ {generatingChecklist === valise.id ? '...' : 'Checklist'}
              </button>
              <button onClick={() => openQuestionnaire(valise)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}>
                🧳 Valise
              </button>
              {onGoToPratique && bagagesItems.length > 0 && (
                <button onClick={onGoToPratique} className="text-xs text-gray-400 hover:text-[#1D4ED8] transition underline ml-auto">
                  Dimensions autorisées →
                </button>
              )}
            </div>

            {total === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 py-10 text-center">
                <div className="text-4xl mb-3">✈️</div>
                <p className="text-sm text-gray-400">Génère la checklist et la valise pour commencer.</p>
              </div>
            )}

            {/* Catégories admin */}
            {byCategory.map(cat => {
              const isOpen = open[`${valise.id}-${cat.key}`] ?? false
              const allDone = cat.done === cat.items.length
              return (
                <div key={cat.key} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <button onClick={() => setOpen(prev => ({ ...prev, [`${valise.id}-${cat.key}`]: !isOpen }))}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left">
                    <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${cat.color}15` }}>{cat.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{cat.label}</span>
                        {allDone && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#D1FAE5', color: '#065F46' }}>✓ Complet</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((cat.done / cat.items.length) * 100)}%`, background: allDone ? '#1D9E75' : cat.color }} />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{cat.done}/{cat.items.length}</span>
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <path d="M2 4.5L7 9.5L12 4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #F3F4F6' }}>
                      {cat.items.map((item, idx) => editingId === item.id ? (
                        <div key={item.id} className="px-5 py-3.5" style={{ borderBottom: idx < cat.items.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                          <div className="flex flex-col gap-2">
                            <input value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))} placeholder="Tâche" autoFocus
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                            <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optionnel)"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-500">Annuler</button>
                              <button onClick={() => handleSaveEdit(valise.id)} disabled={editSaving || !editForm.label.trim()}
                                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40" style={{ background: cat.color }}>
                                {editSaving ? '...' : 'Enregistrer'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={item.id} onClick={() => handleToggle(item.id, item.completed)}
                          className="flex items-start gap-4 px-5 py-3.5 cursor-pointer select-none"
                          style={{ borderBottom: idx < cat.items.length - 1 ? '1px solid #F3F4F6' : 'none', background: item.completed ? '#FAFAFA' : 'white' }}>
                          <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                            style={{ borderColor: item.completed ? cat.color : '#D1D5DB', background: item.completed ? cat.color : 'white' }}>
                            {item.completed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-800" style={item.completed ? { textDecoration: 'line-through', textDecorationColor: cat.color, textDecorationThickness: '2px' } : {}}>{item.label}</span>
                              {item.obligatoire && !item.completed && <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: '#FEF3C7', color: '#92400E' }}>⚠️ Requis</span>}
                            </div>
                            {item.description && <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 self-center">
                            <button onClick={e => { e.stopPropagation(); handleDeplacer(item, valise.id, 'haut') }} disabled={idx === 0}
                              className="w-4 h-4 flex items-center justify-center text-gray-200 hover:text-gray-500 disabled:opacity-0 text-[10px]">▲</button>
                            <button onClick={e => { e.stopPropagation(); handleDeplacer(item, valise.id, 'bas') }} disabled={idx === cat.items.length - 1}
                              className="w-4 h-4 flex items-center justify-center text-gray-200 hover:text-gray-500 disabled:opacity-0 text-[10px]">▼</button>
                            <button onClick={e => { e.stopPropagation(); handleStartEdit(item) }} className="w-4 h-4 flex items-center justify-center text-gray-200 hover:text-[#1D4ED8] text-sm">✎</button>
                            <button onClick={e => { e.stopPropagation(); handleSupprimer(item.id, valise.id) }} className="w-4 h-4 flex items-center justify-center text-gray-200 hover:text-red-400 text-lg">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Bagages — sous-catégorisé */}
            {bySousCategorie.map(sc => {
              const isOpen = open[`${valise.id}-bagages-${sc.key}`] ?? false
              const allDone = sc.done === sc.items.length
              return (
                <div key={sc.key} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <button onClick={() => setOpen(prev => ({ ...prev, [`${valise.id}-bagages-${sc.key}`]: !isOpen }))}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left">
                    <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${sc.color}15` }}>{sc.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{sc.label}</span>
                        {allDone && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#D1FAE5', color: '#065F46' }}>✓ Complet</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((sc.done / sc.items.length) * 100)}%`, background: allDone ? '#1D9E75' : sc.color }} />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{sc.done}/{sc.items.length}</span>
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <path d="M2 4.5L7 9.5L12 4.5" stroke={sc.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #F3F4F6' }}>
                      {sc.items.map((item, idx) => editingId === item.id ? (
                        <div key={item.id} className="px-5 py-3.5" style={{ borderBottom: idx < sc.items.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                          <div className="flex flex-col gap-2">
                            <input value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))} placeholder="Article" autoFocus
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                            <input value={editForm.quantite} onChange={e => setEditForm(f => ({ ...f, quantite: e.target.value }))} placeholder="Quantité (optionnel)"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-500">Annuler</button>
                              <button onClick={() => handleSaveEdit(valise.id)} disabled={editSaving || !editForm.label.trim()}
                                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40" style={{ background: sc.color }}>
                                {editSaving ? '...' : 'Enregistrer'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={item.id} onClick={() => handleToggle(item.id, item.completed)}
                          className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none"
                          style={{ borderBottom: idx < sc.items.length - 1 ? '1px solid #F3F4F6' : 'none', background: item.completed ? '#FAFAFA' : 'white' }}>
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: item.completed ? sc.color : '#D1D5DB', background: item.completed ? sc.color : 'white' }}>
                            {item.completed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-1">
                              <span className="text-sm font-medium text-gray-800" style={item.completed ? { textDecoration: 'line-through', textDecorationColor: sc.color, textDecorationThickness: '2px' } : {}}>{item.label}</span>
                              {item.quantite && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: sc.light, color: sc.color }}>{item.quantite}</span>}
                              {item.obligatoire && !item.completed && <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: '#FEF3C7', color: '#92400E' }}>⚠️ Requis</span>}
                              {getAviationBadge(item.label) && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>{getAviationBadge(item.label)}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 self-center">
                            <button onClick={e => { e.stopPropagation(); handleDeplacer(item, valise.id, 'haut') }} disabled={idx === 0}
                              className="w-4 h-4 flex items-center justify-center text-gray-200 hover:text-gray-500 disabled:opacity-0 text-[10px]">▲</button>
                            <button onClick={e => { e.stopPropagation(); handleDeplacer(item, valise.id, 'bas') }} disabled={idx === sc.items.length - 1}
                              className="w-4 h-4 flex items-center justify-center text-gray-200 hover:text-gray-500 disabled:opacity-0 text-[10px]">▼</button>
                            <button onClick={e => { e.stopPropagation(); handleStartEdit(item) }} className="w-4 h-4 flex items-center justify-center text-gray-200 hover:text-[#1D4ED8] text-sm">✎</button>
                            <button onClick={e => { e.stopPropagation(); handleSupprimer(item.id, valise.id) }} className="w-4 h-4 flex items-center justify-center text-gray-200 hover:text-red-400 text-lg">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Modal ajout */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowAddModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Ajouter un élément</h3>
              <button onClick={() => setShowAddModal(null)} className="text-gray-300 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Nom</label>
                <input type="text" placeholder="Ex : Acheter un guide de voyage" value={addForm.label}
                  onChange={e => setAddForm(f => ({ ...f, label: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Catégorie</label>
                <div className="grid grid-cols-3 gap-2">
                  {[...CATEGORIES, { key: 'bagages', label: 'Bagages', emoji: '🧳', color: '#EA580C', light: '#FFEDD5' }].map(cat => (
                    <button key={cat.key} type="button" onClick={() => setAddForm(f => ({ ...f, categorie: cat.key }))}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 text-xs font-semibold transition-all"
                      style={{ borderColor: addForm.categorie === cat.key ? cat.color : 'transparent', background: addForm.categorie === cat.key ? cat.light : '#F9FAFB', color: addForm.categorie === cat.key ? cat.color : '#6B7280' }}>
                      <span>{cat.emoji}</span><span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {addForm.categorie === 'bagages' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SOUS_CATEGORIES.map(sc => (
                      <button key={sc.key} type="button" onClick={() => setAddForm(f => ({ ...f, sousCategorie: sc.key }))}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{ background: addForm.sousCategorie === sc.key ? sc.light : '#F9FAFB', border: `2px solid ${addForm.sousCategorie === sc.key ? sc.color : 'transparent'}`, color: addForm.sousCategorie === sc.key ? sc.color : '#6B7280' }}>
                        <span>{sc.emoji}</span><span>{sc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {addForm.categorie === 'bagages' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Quantité <span className="font-normal normal-case">(optionnel)</span></label>
                  <input value={addForm.quantite} onChange={e => setAddForm(f => ({ ...f, quantite: e.target.value }))} placeholder="Ex : 2 paires..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description <span className="font-normal normal-case">(optionnel)</span></label>
                  <input type="text" placeholder="Précision, lien, note..." value={addForm.description}
                    onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                </div>
              )}
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setAddForm(f => ({ ...f, obligatoire: !f.obligatoire }))}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
                  style={{ borderColor: addForm.obligatoire ? '#1D4ED8' : '#D1D5DB', background: addForm.obligatoire ? '#1D4ED8' : 'white' }}>
                  {addForm.obligatoire && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span className="text-sm text-gray-700">Marquer comme obligatoire</span>
              </label>
              <button onClick={() => handleAjouter(showAddModal)} disabled={addSaving || !addForm.label.trim()}
                className="w-full py-3 rounded-2xl font-semibold text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #60A5FA 100%)' }}>
                {addSaving ? 'Ajout...' : '+ Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal questionnaire valise */}
      {showQuestionnaire && (() => {
        const valise = valises.find(v => v.id === showQuestionnaire)
        if (!valise) return null
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowQuestionnaire(null)}>
            <div className="bg-white w-full max-w-md shadow-2xl" style={{ borderRadius: '16px' }} onClick={e => e.stopPropagation()}>
              <div className="px-5 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)', borderRadius: '16px 16px 0 0' }}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-white text-lg">🧳 Valise de {valise.membre.prenom}</h3>
                  <button onClick={() => setShowQuestionnaire(null)} className="text-white/60 hover:text-white text-2xl leading-none shrink-0">×</button>
                </div>
                <p className="text-blue-100 text-xs mt-1">Étape {step + 1} / 3</p>
              </div>
              <div className="h-1" style={{ background: '#DBEAFE' }}>
                <div className="h-full transition-all" style={{ width: `${((step + 1) / 3) * 100}%`, background: '#1D4ED8' }} />
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {step === 0 && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <p className="font-bold text-gray-900 mb-3">Sexe</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[{ value: 'femme', label: 'Femme', emoji: '👩' }, { value: 'homme', label: 'Homme', emoji: '👨' }].map(s => (
                          <button key={s.value} onClick={() => setQ(prev => ({ ...prev, sexe: s.value as 'homme' | 'femme' }))}
                            className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all"
                            style={{ borderColor: q.sexe === s.value ? '#1D4ED8' : 'transparent', background: q.sexe === s.value ? '#DBEAFE' : '#F9FAFB', color: q.sexe === s.value ? '#1D4ED8' : '#6B7280' }}>
                            <span className="text-2xl">{s.emoji}</span><span className="font-semibold">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-1">Type de bagage</p>
                      <p className="text-xs text-gray-400 mb-3">Plusieurs choix possibles</p>
                      <div className="flex flex-col gap-2">
                        {BAGAGES_OPTIONS.map(b => {
                          const sel = q.bagages?.includes(b.value)
                          return (
                            <button key={b.value} onClick={() => setQ(prev => ({ ...prev, bagages: sel ? (prev.bagages ?? []).filter(x => x !== b.value) : [...(prev.bagages ?? []), b.value] }))}
                              className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all"
                              style={{ borderColor: sel ? '#1D4ED8' : 'transparent', background: sel ? '#DBEAFE' : '#F9FAFB' }}>
                              <span className="text-2xl">{b.emoji}</span><p className="font-semibold text-gray-800">{b.label}</p>
                              {sel && <span className="ml-auto text-[#1D4ED8]">✓</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-3">Nombre de jours</p>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setQ(prev => ({ ...prev, jours: Math.max(1, (prev.jours ?? 1) - 1) }))} className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold text-gray-700">−</button>
                        <span className="text-3xl font-bold text-gray-900 w-16 text-center">{q.jours}</span>
                        <button onClick={() => setQ(prev => ({ ...prev, jours: (prev.jours ?? 1) + 1 }))} className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold text-gray-700">+</button>
                      </div>
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div>
                    <p className="font-bold text-gray-900 mb-3">Température sur place</p>
                    <div className="flex flex-col gap-2">
                      {TEMPERATURES.map(t => (
                        <button key={t.value} onClick={() => setQ(prev => ({ ...prev, temperature: t.value as QuestionnaireValise['temperature'] }))}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all"
                          style={{ borderColor: q.temperature === t.value ? '#1D4ED8' : 'transparent', background: q.temperature === t.value ? '#DBEAFE' : '#F9FAFB' }}>
                          <span className="text-2xl">{t.emoji}</span>
                          <div><p className="font-semibold text-gray-800">{t.label}</p><p className="text-xs text-gray-400">{t.sub}</p></div>
                          {q.temperature === t.value && <span className="ml-auto text-[#1D4ED8]">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Activités prévues</p>
                    <p className="text-xs text-gray-400 mb-4">Plusieurs choix possibles</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ACTIVITES_OPTIONS.map(a => {
                        const sel = q.activites?.includes(a.value)
                        return (
                          <button key={a.value} onClick={() => setQ(prev => ({ ...prev, activites: sel ? (prev.activites ?? []).filter(x => x !== a.value) : [...(prev.activites ?? []), a.value] }))}
                            className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all"
                            style={{ borderColor: sel ? '#1D4ED8' : 'transparent', background: sel ? '#DBEAFE' : '#F9FAFB', color: sel ? '#1D4ED8' : '#6B7280' }}>
                            <span className="text-xl">{a.emoji}</span><span className="font-semibold text-sm">{a.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 flex gap-3 border-t border-gray-50">
                {step > 0 && <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-2xl font-semibold border-2 border-gray-200 text-gray-600">← Retour</button>}
                {step < 2 ? (
                  <button onClick={() => setStep(s => s + 1)} disabled={!q.sexe}
                    className="flex-1 py-3 rounded-2xl font-semibold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}>
                    Suivant →
                  </button>
                ) : (
                  <button onClick={() => handleGenererValise(valise)} disabled={generatingValise === valise.id}
                    className="flex-1 py-3 rounded-2xl font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}>
                    {generatingValise === valise.id ? 'Génération...' : '✨ Générer ma valise'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
