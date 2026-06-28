'use client'

import { useState, useTransition } from 'react'
import { sauvegarderProfil } from './actions'

const EMOJIS = ['🐼', '🦊', '🐶', '🐱', '🦁', '🐯', '🐨', '🐸', '🐵', '🦄', '🐙', '🦋', '🐝', '🦉', '🐢', '🦜', '🐳', '🦦', '🐧', '🦒']

export default function CompteForm({
  userId, initialPrenom, initialNom, initialEmoji,
}: {
  userId: string
  initialPrenom: string
  initialNom: string
  initialEmoji: string
}) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prenom, setPrenom] = useState(initialPrenom)
  const [nom, setNom] = useState(initialNom)
  const [emoji, setEmoji] = useState(initialEmoji || EMOJIS[0])

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await sauvegarderProfil({ prenom, nom, emoji_avatar: emoji })
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
            <input
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="Dupont"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]"
            />
          </div>
        </div>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
        <h2 className="font-semibold text-gray-800">Mon avatar</h2>
        <div className="grid grid-cols-5 gap-2">
          {EMOJIS.map(e => (
            <button key={e} type="button" onClick={() => setEmoji(e)}
              className="w-full aspect-square rounded-xl flex items-center justify-center text-xl border-2 transition"
              style={{
                borderColor: emoji === e ? '#36A6B2' : 'transparent',
                background: emoji === e ? '#DBEAFE' : '#F9FAFB',
              }}>
              {e}
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
        style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}
      >
        {isPending ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  )
}
