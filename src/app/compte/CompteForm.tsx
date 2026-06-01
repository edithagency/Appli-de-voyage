'use client'

import { useState, useTransition } from 'react'
import { sauvegarderProfil } from './actions'

const PROFILS = [
  { value: 'solo',    label: 'Solo',      emoji: '🧳' },
  { value: 'couple',  label: 'En couple', emoji: '💑' },
  { value: 'famille', label: 'En famille',emoji: '👨‍👩‍👧' },
  { value: 'groupe',  label: 'En groupe', emoji: '🎉' },
]

const TYPES_VOYAGE = [
  { value: 'aventure',   label: 'Aventure',    emoji: '🏔️' },
  { value: 'plage',      label: 'Plage',       emoji: '🏖️' },
  { value: 'city-trip',  label: 'City-trip',   emoji: '🏙️' },
  { value: 'luxe',       label: 'Luxe',        emoji: '✨' },
]

export default function CompteForm({
  userId, initialPrenom, initialNom, initialProfil, initialTypeVoyage,
}: {
  userId: string
  initialPrenom: string
  initialNom: string
  initialProfil: string
  initialTypeVoyage: string
}) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prenom, setPrenom] = useState(initialPrenom)
  const [nom, setNom] = useState(initialNom)
  const [profil, setProfil] = useState(initialProfil)
  const [typeVoyage, setTypeVoyage] = useState(initialTypeVoyage)

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await sauvegarderProfil({ prenom, nom, profil_voyageur: profil, type_voyage_prefere: typeVoyage })
      if (result.error) setError(result.error)
      else setSaved(true)
    })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Infos personnelles */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-800">Informations personnelles</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Prénom</label>
            <input
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
              placeholder="Marie"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
            <input
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="Dupont"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
            />
          </div>
        </div>
      </div>

      {/* Profil voyageur */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
        <h2 className="font-semibold text-gray-800">Je voyage plutôt…</h2>
        <div className="grid grid-cols-2 gap-2">
          {PROFILS.map(p => (
            <button key={p.value} type="button" onClick={() => setProfil(p.value)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition"
              style={{
                borderColor: profil === p.value ? '#534AB7' : 'transparent',
                background: profil === p.value ? '#EDE9FF' : '#F9FAFB',
              }}>
              <span className="text-xl">{p.emoji}</span>
              <span className="text-sm font-semibold" style={{ color: profil === p.value ? '#534AB7' : '#374151' }}>
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Type de voyage préféré */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
        <h2 className="font-semibold text-gray-800">Mon style de voyage</h2>
        <div className="grid grid-cols-2 gap-2">
          {TYPES_VOYAGE.map(t => (
            <button key={t.value} type="button" onClick={() => setTypeVoyage(t.value)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition"
              style={{
                borderColor: typeVoyage === t.value ? '#534AB7' : 'transparent',
                background: typeVoyage === t.value ? '#EDE9FF' : '#F9FAFB',
              }}>
              <span className="text-xl">{t.emoji}</span>
              <span className="text-sm font-semibold" style={{ color: typeVoyage === t.value ? '#534AB7' : '#374151' }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm px-1">{error}</p>}
      {saved && <p className="text-green-600 text-sm px-1 font-medium">✓ Profil sauvegardé</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-full py-4 rounded-2xl font-semibold text-white disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}
      >
        {isPending ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  )
}
