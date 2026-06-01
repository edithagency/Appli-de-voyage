'use client'

import { useState, useTransition } from 'react'
import { ajouterMembre, modifierMembre, supprimerMembre } from './actions'

type Membre = {
  id: string
  prenom: string
  type: string
  date_naissance: string | null
  groupe_sanguin: string | null
  allergies: string | null
  medicaments: string | null
}

const GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function age(dateNaissance: string | null): string {
  if (!dateNaissance) return ''
  const ans = Math.floor((Date.now() - new Date(dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  return `${ans} ans`
}

const EMPTY_FORM = { prenom: '', type: 'adulte' as 'adulte' | 'enfant', date_naissance: '', groupe_sanguin: '', allergies: '', medicaments: '' }

export default function FamilleClient({ userId, membresInitiaux }: { userId: string; membresInitiaux: Membre[] }) {
  const [membres, setMembres] = useState(membresInitiaux)
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [showMedical, setShowMedical] = useState(false)

  function openAjouter() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowMedical(false)
    setError(null)
    setShowModal(true)
  }

  function openEditer(m: Membre) {
    setForm({
      prenom: m.prenom,
      type: m.type as 'adulte' | 'enfant',
      date_naissance: m.date_naissance ?? '',
      groupe_sanguin: m.groupe_sanguin ?? '',
      allergies: m.allergies ?? '',
      medicaments: m.medicaments ?? '',
    })
    setEditingId(m.id)
    setShowMedical(!!(m.groupe_sanguin || m.allergies || m.medicaments))
    setError(null)
    setShowModal(true)
  }

  function handleSave() {
    if (!form.prenom.trim()) return setError('Le prénom est requis.')
    setError(null)
    startTransition(async () => {
      const data = {
        prenom: form.prenom.trim(),
        type: form.type,
        date_naissance: form.date_naissance || undefined,
        groupe_sanguin: form.groupe_sanguin || undefined,
        allergies: form.allergies || undefined,
        medicaments: form.medicaments || undefined,
      }
      if (editingId) {
        const result = await modifierMembre(editingId, data)
        if (result?.error) return setError(result.error)
        setMembres(prev => prev.map(m => m.id === editingId ? { ...m, ...data, date_naissance: data.date_naissance ?? null, groupe_sanguin: data.groupe_sanguin ?? null, allergies: data.allergies ?? null, medicaments: data.medicaments ?? null } : m))
      } else {
        const result = await ajouterMembre(data)
        if (result?.error) return setError(result.error)
        setMembres(prev => [...prev, { id: crypto.randomUUID(), ...data, date_naissance: data.date_naissance ?? null, groupe_sanguin: data.groupe_sanguin ?? null, allergies: data.allergies ?? null, medicaments: data.medicaments ?? null }])
      }
      setShowModal(false)
    })
  }

  function handleSupprimer(id: string) {
    if (!confirm('Supprimer ce membre ?')) return
    setMembres(prev => prev.filter(m => m.id !== id))
    startTransition(async () => { await supprimerMembre(id) })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mon foyer</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {membres.length === 0 ? 'Aucun membre ajouté' : `${membres.length} membre${membres.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={openAjouter}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
          + Ajouter
        </button>
      </div>

      {/* Liste */}
      {membres.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 py-16 text-center">
          <div className="text-5xl mb-4">👨‍👩‍👧</div>
          <p className="text-gray-800 font-semibold mb-2">Aucun membre ajouté</p>
          <p className="text-sm text-gray-400 mb-6 px-8">
            Ajoute les membres de ton foyer pour gérer leur valise et documents en voyage.
          </p>
          <button onClick={openAjouter}
            className="px-6 py-3 rounded-2xl font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
            + Ajouter un membre
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {membres.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
                style={{ background: m.type === 'enfant' ? 'linear-gradient(135deg, #1D9E75, #10B981)' : 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
                {m.prenom[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{m.prenom}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: m.type === 'enfant' ? '#D1FAE5' : '#EDE9FF', color: m.type === 'enfant' ? '#065F46' : '#534AB7' }}>
                    {m.type === 'enfant' ? '👶 Enfant' : '🧑 Adulte'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {m.date_naissance && <span className="text-xs text-gray-400">{age(m.date_naissance)}</span>}
                  {m.groupe_sanguin && <span className="text-xs text-gray-400">🩸 {m.groupe_sanguin}</span>}
                  {m.allergies && <span className="text-xs text-amber-600">⚠️ Allergies</span>}
                  {m.medicaments && <span className="text-xs text-blue-500">💊 Médicaments</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEditer(m)}
                  className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#534AB7] hover:bg-purple-50 transition text-sm">
                  ✏️
                </button>
                <button onClick={() => handleSupprimer(m.id)}
                  className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition font-bold">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 text-lg">
                  {editingId ? 'Modifier le membre' : 'Ajouter un membre'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-300 text-2xl leading-none">×</button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Prénom */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Prénom</label>
                  <input
                    value={form.prenom}
                    onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                    placeholder="Ex : Léa"
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([{ value: 'adulte', label: 'Adulte', emoji: '🧑' }, { value: 'enfant', label: 'Enfant', emoji: '👶' }] as const).map(t => (
                      <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, type: t.value }))}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition"
                        style={{ borderColor: form.type === t.value ? '#534AB7' : 'transparent', background: form.type === t.value ? '#EDE9FF' : '#F9FAFB' }}>
                        <span className="text-xl">{t.emoji}</span>
                        <span className="font-semibold text-sm" style={{ color: form.type === t.value ? '#534AB7' : '#374151' }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date de naissance */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date de naissance <span className="font-normal normal-case">(optionnel)</span></label>
                  <input
                    type="date"
                    value={form.date_naissance}
                    onChange={e => setForm(f => ({ ...f, date_naissance: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                  />
                </div>

                {/* Infos médicales (toggle) */}
                <button type="button" onClick={() => setShowMedical(v => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-left"
                  style={{ color: '#534AB7' }}>
                  <span>{showMedical ? '▼' : '▶'}</span>
                  Informations médicales
                  <span className="text-xs text-gray-400 font-normal">(optionnel)</span>
                </button>

                {showMedical && (
                  <div className="flex flex-col gap-3 pl-4 border-l-2 border-purple-100">
                    {/* Groupe sanguin */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Groupe sanguin</label>
                      <div className="flex flex-wrap gap-2">
                        {GROUPES_SANGUINS.map(g => (
                          <button key={g} type="button"
                            onClick={() => setForm(f => ({ ...f, groupe_sanguin: f.groupe_sanguin === g ? '' : g }))}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
                            style={{
                              background: form.groupe_sanguin === g ? '#534AB7' : '#F3F4F6',
                              color: form.groupe_sanguin === g ? 'white' : '#374151',
                            }}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Allergies */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Allergies</label>
                      <textarea
                        value={form.allergies}
                        onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
                        placeholder="Ex : Arachides, pénicilline..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none"
                      />
                    </div>

                    {/* Médicaments */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Médicaments réguliers</label>
                      <textarea
                        value={form.medicaments}
                        onChange={e => setForm(f => ({ ...f, medicaments: e.target.value }))}
                        placeholder="Ex : Doliprane 500mg matin et soir..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none"
                      />
                    </div>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white disabled:opacity-40 mt-1"
                  style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
                  {isPending ? 'Sauvegarde...' : editingId ? 'Modifier' : 'Ajouter au foyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
