'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveMembres } from '../actions'

type Membre = { prenom: string; date_naissance: string; type: 'adulte' | 'enfant' }

function getType(dateNaissance: string): 'adulte' | 'enfant' {
  if (!dateNaissance) return 'adulte'
  const age = (Date.now() - new Date(dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return age < 18 ? 'enfant' : 'adulte'
}

export default function OnboardingStep3() {
  const router = useRouter()
  const [membres, setMembres] = useState<Membre[]>([{ prenom: '', date_naissance: '', type: 'adulte' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addMembre() {
    setMembres(m => [...m, { prenom: '', date_naissance: '', type: 'adulte' }])
  }

  function removeMembre(i: number) {
    setMembres(m => m.filter((_, idx) => idx !== i))
  }

  function update(i: number, field: keyof Membre, value: string) {
    setMembres(m => m.map((membre, idx) => {
      if (idx !== i) return membre
      const updated = { ...membre, [field]: value }
      if (field === 'date_naissance') updated.type = getType(value)
      return updated
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const valides = membres.filter(m => m.prenom.trim())
    const result = await saveMembres(valides)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-2 w-8 rounded-full bg-[#534AB7]" />
        ))}
        <span className="text-xs text-gray-400 ml-1">3 / 3</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Ton foyer</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Ajoute les personnes avec qui tu voyages souvent. On détecte automatiquement si c'est un enfant.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {membres.map((m, i) => (
          <div key={i} className="flex flex-col gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {m.type === 'enfant' ? '👶 Enfant' : '🧑 Adulte'}
              </span>
              {membres.length > 1 && (
                <button type="button" onClick={() => removeMembre(i)}
                  className="text-xs text-red-400 hover:text-red-600">
                  Supprimer
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Prénom"
                value={m.prenom}
                onChange={e => update(i, 'prenom', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
              />
              <input
                type="date"
                value={m.date_naissance}
                onChange={e => update(i, 'date_naissance', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={addMembre}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-[#534AB7] hover:text-[#534AB7] transition text-sm">
          + Ajouter une personne
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
          {loading ? 'Enregistrement...' : 'Terminer et accéder au dashboard →'}
        </button>
      </form>

      <button onClick={() => router.push('/dashboard')}
        className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 mt-3">
        Passer pour l'instant
      </button>
    </div>
  )
}
