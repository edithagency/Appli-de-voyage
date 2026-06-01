'use client'

import { useState, useTransition } from 'react'
import { toggleItem, genererChecklist, ajouterItem, supprimerItem, supprimerChecklist } from './checklist-actions'

type Item = {
  id: string
  label: string
  description: string | null
  obligatoire: boolean
  completed: boolean
  categorie: string
  membre_id: string | null
}

const CATEGORIES = [
  { key: 'documents',    label: 'Documents',       emoji: '📄', color: '#534AB7', light: '#EDE9FF' },
  { key: 'sante',        label: 'Santé',            emoji: '💊', color: '#1D9E75', light: '#D1FAE5' },
  { key: 'argent',       label: 'Argent',           emoji: '💰', color: '#D97706', light: '#FEF3C7' },
  { key: 'bagages',      label: 'Bagages',          emoji: '🧳', color: '#EA580C', light: '#FFEDD5' },
  { key: 'logistique',   label: 'Logistique',       emoji: '🔧', color: '#2563EB', light: '#DBEAFE' },
  { key: 'avant_depart', label: 'Maison',            emoji: '🏠', color: '#E11D48', light: '#FFE4E6' },
]

function CircleProgress({ value, color, trackColor = '#E5E7EB', size = 52 }: { value: number; color: string; trackColor?: string; size?: number }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={value === 100 ? '#1D9E75' : color}
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

export default function ChecklistSection({ items, voyageId, voyageNom, dateDepart, dateRetour, membres, participantId }: {
  items: Item[]
  voyageId: string
  voyageNom?: string
  dateDepart?: string
  dateRetour?: string
  membres?: { id: string; prenom: string }[]
  participantId?: string | null
}) {
  const [localItems, setLocalItems] = useState(items)
  const [, startTransition] = useTransition()
  const [generating, setGenerating] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ label: '', categorie: 'documents', description: '', obligatoire: false, membre_id: '' })
  const [saving, setSaving] = useState(false)

  const total = localItems.length
  const done = localItems.filter(i => i.completed).length
  const score = total > 0 ? Math.round((done / total) * 100) : 0

  async function handleGenerate() {
    setGenerating(true)
    await genererChecklist(voyageId, participantId)
    window.location.reload()
  }

  function handleToggle(id: string, current: boolean) {
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, completed: !current } : i))
    startTransition(() => toggleItem(id, !current, voyageId))
  }

  async function handleAjouter() {
    if (!form.label.trim()) return
    setSaving(true)
    const result = await ajouterItem(voyageId, { ...form, membre_id: form.membre_id || '' })
    if (!result?.error) {
      const newItem: Item = {
        id: crypto.randomUUID(),
        label: form.label,
        categorie: form.categorie,
        description: form.description || null,
        obligatoire: form.obligatoire,
        completed: false,
        membre_id: form.membre_id || null,
      }
      setLocalItems(prev => [...prev, newItem])
      setOpen(prev => ({ ...prev, [form.categorie]: true }))
      setForm({ label: '', categorie: 'documents', description: '', obligatoire: false, membre_id: '' })
      setShowModal(false)
    }
    setSaving(false)
  }

  async function handleSupprimer(id: string) {
    setLocalItems(prev => prev.filter(i => i.id !== id))
    startTransition(() => supprimerItem(id, voyageId))
  }

  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) return

    const html = `<!DOCTYPE html><html lang="fr"><head>
      <meta charset="UTF-8">
      <title>Checklist ReadyToFly</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: -apple-system, Arial, sans-serif; background: #EDE9FF; color: #1F2937; padding: 32px; }
        .header { background: linear-gradient(135deg, #534AB7, #6B63C8); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; color: white; display: flex; align-items: center; justify-content: space-between; }
        .header h1 { font-size: 20px; font-weight: 800; }
        .header .score { font-size: 32px; font-weight: 800; }
        .header .sub { font-size: 12px; opacity: 0.8; margin-top: 2px; }
        .category { background: white; border-radius: 14px; margin-bottom: 14px; overflow: hidden; border: 1.5px solid #eee; }
        .cat-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px; font-weight: 700; font-size: 13px; }
        .cat-bar { flex: 1; height: 5px; background: #F3F4F6; border-radius: 99px; overflow: hidden; }
        .cat-bar-fill { height: 100%; border-radius: 99px; }
        .item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 16px; border-top: 1px solid #F9FAFB; }
        .checkbox { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #D1D5DB; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; }
        .checkbox.done { border-color: currentColor; background: currentColor; }
        .check-svg { display: block; }
        .item-label { font-size: 13px; font-weight: 500; }
        .item-label.done { text-decoration: line-through; }
        .item-desc { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
        .badge { font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: 99px; margin-left: 6px; }
        .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #9CA3AF; }
        @media print { body { background: white; padding: 16px; } @page { margin: 1cm; } }
      </style>
    </head><body>
      <div class="header">
        <div>
          <h1>${voyageNom ?? 'Checklist de préparation'}</h1>
          ${dateDepart && dateRetour ? `<div class="sub" style="margin-top:6px">📅 ${new Date(dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} → ${new Date(dateRetour).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>` : ''}
          ${membres && membres.length > 0 ? `<div class="sub" style="margin-top:4px">👥 ${membres.map(m => m.prenom).join(', ')}</div>` : ''}
        </div>
        <div style="font-size:40px">✈️</div>
      </div>
      ${byCategory.map(cat => {
        const catScore = Math.round((cat.done / cat.items.length) * 100)
        return `
        <div class="category">
          <div class="cat-header" style="background:${cat.light};border-left:4px solid ${cat.color}">
            <span style="font-size:18px">${cat.emoji}</span>
            <span style="color:${cat.color};font-size:14px;font-weight:800">${cat.label}</span>
            <span style="font-size:11px;color:${cat.color};margin-left:auto">${cat.items.length} tâches</span>
          </div>
          ${cat.items.map(item => `
          <div class="item">
            <div class="checkbox" style="color:${cat.color}"></div>
            <div>
              <span class="item-label">${item.label}</span>
              ${item.obligatoire ? `<span class="badge" style="background:${cat.light};color:${cat.color}">Requis</span>` : ''}
              ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
            </div>
          </div>`).join('')}
        </div>`
      }).join('')}
      <div class="footer">Généré par ReadyToFly · Bon voyage ! ✈️</div>
      <script>window.onload = () => { window.print() }</script>
    </body></html>`

    win.document.write(html)
    win.document.close()
  }

  const byCategory = CATEGORIES.map(cat => ({
    ...cat,
    items: localItems.filter(i => i.categorie === cat.key),
    done: localItems.filter(i => i.categorie === cat.key && i.completed).length,
  })).filter(c => c.items.length > 0)

  if (total === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-bold text-gray-900">✅ Avant mon départ</h2>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 py-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-sm text-gray-400 mb-5">Génère ta checklist de préparation personnalisée</p>
          <button onClick={handleGenerate} disabled={generating}
            className="px-6 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
            {generating ? '⏳ Génération...' : '✨ Générer ma checklist'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-gray-900">✅ Avant mon départ</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white shadow text-xs font-semibold transition hover:shadow-md"
            style={{ color: '#534AB7' }}>
            ＋ Ajouter
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow text-xs font-semibold transition hover:shadow-md"
            style={{ color: '#534AB7' }}>
            🖨️ Imprimer
          </button>
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
            ↺ {generating ? '...' : 'Régénérer'}
          </button>
          <button
            onClick={async () => {
              if (!confirm('Supprimer toute la checklist ?')) return
              setLocalItems([])
              await supprimerChecklist(voyageId)
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-100"
            style={{ background: '#FEE2E2', color: '#F87171', fontSize: 16, fontWeight: 'bold' }}>
            ×
          </button>
        </div>
      </div>

      {/* Score global */}
      <div className="rounded-3xl shadow-sm p-5" style={{ background: 'linear-gradient(135deg, #534AB7 0%, #6B63C8 100%)' }}>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <CircleProgress value={score} color="white" trackColor="rgba(255,255,255,0.25)" size={72} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-bold text-white">{score}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-base">Préparation de mon départ</h2>
            <p className="text-sm text-purple-200 mt-0.5">{done} tâche{done > 1 ? 's' : ''} sur {total} complétée{done > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Catégories */}
      {byCategory.map(cat => {
        const isOpen = open[cat.key] ?? false
        const catScore = Math.round((cat.done / cat.items.length) * 100)
        const allDone = cat.done === cat.items.length

        return (
          <div key={cat.key} className="rounded-3xl shadow-sm overflow-hidden" style={{ background: cat.light, border: `1.5px solid ${cat.color}22` }}>
            {/* Header cliquable */}
            <button
              onClick={() => setOpen(prev => ({ ...prev, [cat.key]: !isOpen }))}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
              style={{ background: 'transparent' }}
            >
              {/* Icône colorée */}
              <div className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: `${cat.color}22` }}>
                {cat.emoji}
              </div>

              {/* Titre + sous-titre */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{cat.label}</span>
                  {allDone && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: '#D1FAE5', color: '#065F46' }}>
                      ✓ Complet
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${catScore}%`, background: allDone ? '#1D9E75' : cat.color }} />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{cat.done}/{cat.items.length}</span>
                </div>
              </div>

              {/* Chevron */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <path d="M2 4.5L7 9.5L12 4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Items */}
            {isOpen && (
              <div style={{ borderTop: `1px solid ${cat.color}20` }}>
                {cat.items.map((item, idx) => (
                  <div key={item.id}
                    onClick={() => handleToggle(item.id, item.completed)}
                    className="flex items-start gap-4 px-5 py-3.5 cursor-pointer select-none"
                    style={{
                      borderBottom: idx < cat.items.length - 1 ? `1px solid ${cat.color}15` : 'none',
                      background: item.completed ? `${cat.color}08` : 'white',
                    }}>

                    {/* Checkbox custom */}
                    <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: item.completed ? cat.color : '#D1D5DB',
                        background: item.completed ? cat.color : 'white',
                      }}>
                      {item.completed && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-800"
                          style={item.completed ? {
                            textDecoration: 'line-through',
                            textDecorationColor: cat.color,
                            textDecorationThickness: '2px',
                          } : {}}>
                          {item.label}
                        </span>
                        {item.obligatoire && !item.completed && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 whitespace-nowrap"
                            style={{ background: '#FEF3C7', color: '#92400E' }}>
                            ⚠️ Requis
                          </span>
                        )}
                      </div>
                      {item.description && (() => {
                        const parts = item.description.split(' | ')
                        const text = parts[0]
                        const url = parts[1]
                        return (
                          <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                            <span>{text}</span>
                            {url && (
                              <a href={url} target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="flex items-center justify-between mt-1.5 px-3 py-2 rounded-xl border bg-purple-50 border-purple-200 text-xs font-medium text-purple-700">
                                <span>S'inscrire sur Ariane</span>
                                <span className="opacity-60">↗</span>
                              </a>
                            )}
                          </div>
                        )
                      })()}
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={e => { e.stopPropagation(); handleSupprimer(item.id) }}
                      className="shrink-0 self-center text-gray-200 hover:text-red-400 transition text-lg leading-none">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}


      {/* Modal ajout */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Ajouter une tâche</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Tâche */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Tâche</label>
                <input
                  type="text"
                  placeholder="Ex : Acheter un guide de voyage"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                  autoFocus
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Catégorie</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.key} type="button"
                      onClick={() => setForm(f => ({ ...f, categorie: cat.key }))}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 text-xs font-semibold transition-all"
                      style={{
                        borderColor: form.categorie === cat.key ? cat.color : 'transparent',
                        background: form.categorie === cat.key ? cat.light : '#F9FAFB',
                        color: form.categorie === cat.key ? cat.color : '#6B7280',
                      }}>
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description <span className="font-normal normal-case">(optionnel)</span></label>
                <input
                  type="text"
                  placeholder="Précision, lien, note..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>

              {/* Pour qui */}
              {membres && membres.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pour qui ?</label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setForm(f => ({ ...f, membre_id: '' }))}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{ background: form.membre_id === '' ? '#534AB7' : '#EDE9FF', color: form.membre_id === '' ? 'white' : '#534AB7' }}>
                      Tout le monde
                    </button>
                    {membres.map(m => (
                      <button key={m.id} type="button" onClick={() => setForm(f => ({ ...f, membre_id: m.id }))}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{ background: form.membre_id === m.id ? '#534AB7' : '#EDE9FF', color: form.membre_id === m.id ? 'white' : '#534AB7' }}>
                        {m.prenom}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Obligatoire */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm(f => ({ ...f, obligatoire: !f.obligatoire }))}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
                  style={{
                    borderColor: form.obligatoire ? '#534AB7' : '#D1D5DB',
                    background: form.obligatoire ? '#534AB7' : 'white',
                  }}>
                  {form.obligatoire && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700">Marquer comme obligatoire</span>
              </label>

              <button
                onClick={handleAjouter}
                disabled={saving || !form.label.trim()}
                className="w-full py-3 rounded-2xl font-semibold text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #534AB7 0%, #6B63C8 100%)' }}>
                {saving ? 'Ajout...' : '+ Ajouter à la checklist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
