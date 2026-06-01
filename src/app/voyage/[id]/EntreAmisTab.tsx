'use client'

import { useState, useTransition } from 'react'
import { ajouterDepense, supprimerDepense, mettreAJourBudget } from './depenses-actions'

type Depense = {
  id: string
  label: string
  categorie: string
  montant: number
  payeur_prenom: string
  participants: string[]
  created_at: string
}

type Membre = { id: string; prenom: string; type: string }

const CATEGORIES: { key: string; emoji: string; label: string }[] = [
  { key: 'hebergement', emoji: '🏨', label: 'Hébergement' },
  { key: 'repas',       emoji: '🍽️', label: 'Repas' },
  { key: 'transport',   emoji: '🚕', label: 'Transport' },
  { key: 'activite',    emoji: '🎡', label: 'Activité' },
  { key: 'vol',         emoji: '✈️', label: 'Vol' },
  { key: 'courses',     emoji: '🛒', label: 'Courses' },
  { key: 'soiree',      emoji: '🎉', label: 'Soirée' },
  { key: 'shopping',    emoji: '🎁', label: 'Shopping' },
  { key: 'sante',       emoji: '💊', label: 'Santé' },
  { key: 'autre',       emoji: '💳', label: 'Autre' },
]

function getEmoji(categorie: string) {
  return CATEGORIES.find(c => c.key === categorie)?.emoji ?? '💳'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function calculerRemboursements(depenses: Depense[]) {
  const balances: Record<string, number> = {}
  for (const d of depenses) {
    const part = d.montant / d.participants.length
    if (!balances[d.payeur_prenom]) balances[d.payeur_prenom] = 0
    balances[d.payeur_prenom] += d.montant
    for (const p of d.participants) {
      if (!balances[p]) balances[p] = 0
      balances[p] -= part
    }
  }
  const transactions: { de: string; a: string; montant: number }[] = []
  const deb = Object.entries(balances).filter(([, v]) => v < -0.01).sort((a, b) => a[1] - b[1])
  const cred = Object.entries(balances).filter(([, v]) => v > 0.01).sort((a, b) => b[1] - a[1])
  let i = 0, j = 0
  while (i < deb.length && j < cred.length) {
    const [dNom, dVal] = deb[i]
    const [cNom, cVal] = cred[j]
    const m = Math.min(-dVal, cVal)
    transactions.push({ de: dNom, a: cNom, montant: Math.round(m * 100) / 100 })
    deb[i] = [dNom, dVal + m]
    cred[j] = [cNom, cVal - m]
    if (Math.abs(deb[i][1]) < 0.01) i++
    if (Math.abs(cred[j][1]) < 0.01) j++
  }
  return { balances, transactions }
}

export default function EntreAmisTab({
  voyageId, membres, depensesInitiales, budgetTotal,
}: {
  voyageId: string
  membres: Membre[]
  depensesInitiales: Depense[]
  budgetTotal: number
}) {
  const [depenses, setDepenses] = useState(depensesInitiales)
  const [showAll, setShowAll] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    label: '',
    categorie: 'repas',
    montant: '',
    payeur_prenom: '',
    participants: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0)
  const { balances, transactions } = calculerRemboursements(depenses)
  const visibles = showAll ? depenses : depenses.slice(0, 3)

  const COLORS = ['#534AB7', '#1D9E75', '#D97706', '#E11D48', '#2563EB', '#7C3AED']
  const colorFor = (prenom: string) => COLORS[membres.findIndex(m => m.prenom === prenom) % COLORS.length] ?? '#534AB7'

  function toggleParticipant(prenom: string) {
    setForm(f => ({
      ...f,
      participants: f.participants.includes(prenom)
        ? f.participants.filter(p => p !== prenom)
        : [...f.participants, prenom],
    }))
  }

  async function handleAjouter() {
    if (!form.label.trim() || !form.montant || form.participants.length === 0) return
    setSaving(true)
    setFormError(null)
    const result = await ajouterDepense(voyageId, {
      label: form.label,
      montant: parseFloat(form.montant),
      payeur_prenom: form.payeur_prenom,
      participants: form.participants,
      categorie: form.categorie,
    })
    if (result?.error) {
      setFormError(result.error)
    } else {
      setDepenses(prev => [{
        id: crypto.randomUUID(),
        label: form.label,
        categorie: form.categorie,
        montant: parseFloat(form.montant),
        payeur_prenom: form.payeur_prenom,
        participants: form.participants,
        created_at: new Date().toISOString(),
      }, ...prev])
      setForm({ label: '', categorie: 'repas', montant: '', payeur_prenom: '', participants: [] })
      setShowModal(false)
    }
    setSaving(false)
  }

  function handleSupprimer(id: string) {
    setDepenses(prev => prev.filter(d => d.id !== id))
    startTransition(() => supprimerDepense(id, voyageId))
  }

  return (
    <div className="flex flex-col gap-4">

      {/* En-tête participants + total */}
      <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wide">Total dépensé</p>
            <p className="text-white text-3xl font-bold mt-0.5">{totalDepenses.toFixed(2)}€</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            +
          </button>
        </div>

        {/* Participants avec solde */}
        {membres.length > 0 && (
          <div className="flex flex-col gap-2">
            {membres.map(m => {
              const bal = balances[m.prenom] ?? 0
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: colorFor(m.prenom) }}>
                    {m.prenom[0].toUpperCase()}
                  </div>
                  <span className="text-white font-semibold text-sm flex-1">{m.prenom}</span>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full`}
                    style={{
                      background: bal > 0.01 ? 'rgba(29,158,117,0.3)' : bal < -0.01 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)',
                      color: bal > 0.01 ? '#6EE7B7' : bal < -0.01 ? '#FCA5A5' : 'rgba(255,255,255,0.7)',
                    }}>
                    {bal > 0.01 ? `+${bal.toFixed(2)}€` : bal < -0.01 ? `${bal.toFixed(2)}€` : '0€'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Remboursements */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-3">💸 Remboursements</h3>
          <div className="flex flex-col gap-2">
            {transactions.map((t, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: '#EDE9FF' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: colorFor(t.de) }}>
                  {t.de[0]}
                </div>
                <p className="text-sm text-gray-700 flex-1">
                  <span className="font-semibold">{t.de}</span>
                  {' doit '}
                  <span className="font-bold" style={{ color: '#534AB7' }}>{t.montant.toFixed(2)}€</span>
                  {' à '}
                  <span className="font-semibold">{t.a}</span>
                </p>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: colorFor(t.a) }}>
                  {t.a[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des dépenses */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">🧾 Dépenses</h3>
          <span className="text-xs text-gray-400">{depenses.length} au total</span>
        </div>

        {depenses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-5xl mb-3">💳</div>
            <p className="text-sm text-gray-400 mb-5">Aucune dépense enregistrée</p>
            <button onClick={() => setShowModal(true)}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
              + Ajouter la première dépense
            </button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {visibles.map(d => {
                const part = d.montant / d.participants.length
                return (
                  <div key={d.id} className="flex items-start gap-4 px-5 py-5">
                    {/* Emoji catégorie */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-gray-50">
                      {getEmoji(d.categorie)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-base">{d.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(d.created_at)}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-bold text-gray-900">{d.montant.toFixed(2)}€</p>
                          <p className="text-xs text-gray-400">{part.toFixed(2)}€/pers.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs text-gray-500">Payé par</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: colorFor(d.payeur_prenom) }}>
                          {d.payeur_prenom}
                        </span>
                        <span className="text-xs text-gray-400">· Pour :</span>
                        {d.participants.map(p => (
                          <span key={p} className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${colorFor(p)}20`, color: colorFor(p) }}>
                            {p}
                          </span>
                        ))}
                      </div>

                      <button onClick={() => handleSupprimer(d.id)}
                        className="text-xs text-red-300 hover:text-red-500 transition mt-2">
                        Supprimer
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {depenses.length > 3 && (
              <button onClick={() => setShowAll(v => !v)}
                className="w-full py-4 text-sm font-semibold border-t border-gray-50 transition hover:bg-gray-50"
                style={{ color: '#534AB7' }}>
                {showAll ? 'Voir moins ↑' : `Voir toutes les dépenses (${depenses.length - 3} de plus) ↓`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Nouvelle dépense</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-300 text-2xl">×</button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Catégorie / Emoji */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Catégorie</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.key} type="button" onClick={() => setForm(f => ({ ...f, categorie: c.key }))}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 4, padding: '10px 4px', borderRadius: 14, transition: 'all 0.15s',
                        background: form.categorie === c.key ? '#EDE9FF' : '#F9FAFB',
                        border: `2px solid ${form.categorie === c.key ? '#534AB7' : 'transparent'}`,
                        minHeight: 70,
                      }}>
                      <span style={{ fontSize: 24 }}>{c.emoji}</span>
                      <span style={{ fontSize: 10, color: form.categorie === c.key ? '#534AB7' : '#6B7280', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Ex : Dîner au restaurant, Hôtel..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                  autoFocus />
              </div>

              {/* Montant */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Montant (€)</label>
                <input type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
              </div>

              {/* Qui a payé */}
              {membres.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Qui a payé ?</label>
                  <div className="flex flex-wrap gap-2">
                    {membres.map(m => (
                      <button key={m.id} type="button"
                        onClick={() => setForm(f => ({ ...f, payeur_prenom: m.prenom }))}
                        className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
                        style={{
                          background: form.payeur_prenom === m.prenom ? colorFor(m.prenom) : `${colorFor(m.prenom)}15`,
                          color: form.payeur_prenom === m.prenom ? 'white' : colorFor(m.prenom),
                        }}>
                        {m.prenom}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Participants */}
              {membres.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Répartir entre
                    {form.montant && form.participants.length > 0
                      ? ` · ${(parseFloat(form.montant) / form.participants.length).toFixed(2)}€/pers.`
                      : ''}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {membres.map(m => {
                      const sel = form.participants.includes(m.prenom)
                      return (
                        <button key={m.id} type="button" onClick={() => toggleParticipant(m.prenom)}
                          className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
                          style={{
                            background: sel ? colorFor(m.prenom) : `${colorFor(m.prenom)}15`,
                            color: sel ? 'white' : colorFor(m.prenom),
                          }}>
                          {sel ? '✓ ' : ''}{m.prenom}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  {formError}
                </div>
              )}

              <button onClick={handleAjouter}
                disabled={saving || !form.label.trim() || !form.montant || form.participants.length === 0}
                className="w-full py-3.5 rounded-2xl font-semibold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
                {saving ? 'Enregistrement...' : 'Ajouter la dépense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
