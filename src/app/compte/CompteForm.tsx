'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sauvegarderProfil, uploadAvatar, supprimerAvatar } from './actions'

const EMOJIS = ['🐼', '🦊', '🐶', '🐱', '🦁', '🐯', '🐨', '🐸', '🐵', '🦄', '🐙', '🦋', '🐝', '🦉', '🐢', '🦜', '🐳', '🦦', '🐧', '🦒']

export default function CompteForm({
  userId, initialPrenom, initialNom, initialEmoji, initialAvatarUrl,
}: {
  userId: string
  initialPrenom: string
  initialNom: string
  initialEmoji: string
  initialAvatarUrl: string | null
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prenom, setPrenom] = useState(initialPrenom)
  const [nom, setNom] = useState(initialNom)
  const [emoji, setEmoji] = useState(initialEmoji || EMOJIS[0])
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError(null)
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('file', file)
    const result = await uploadAvatar(formData)
    setUploadingPhoto(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (result.error) { setPhotoError(result.error); return }
    if (result.avatarUrl) setAvatarUrl(result.avatarUrl)
    router.refresh()
  }

  async function handleRemovePhoto() {
    setPhotoError(null)
    setUploadingPhoto(true)
    const result = await supprimerAvatar()
    setUploadingPhoto(false)
    if (result.error) { setPhotoError(result.error); return }
    setAvatarUrl(null)
    router.refresh()
  }

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

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden shrink-0"
            style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : emoji}
          </div>
          <div className="flex flex-col gap-1.5">
            <button type="button" disabled={uploadingPhoto} onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold px-3 py-1.5 rounded-full disabled:opacity-50 transition"
              style={{ background: '#DBEAFE', color: '#36A6B2' }}>
              {uploadingPhoto ? 'Envoi...' : avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
            </button>
            {avatarUrl && (
              <button type="button" disabled={uploadingPhoto} onClick={handleRemovePhoto}
                className="text-xs text-gray-400 hover:text-red-400 transition text-left">
                Retirer la photo
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp"
              className="hidden" onChange={handlePhotoChange} />
          </div>
        </div>

        {photoError && <p className="text-red-500 text-xs">{photoError}</p>}

        <p className="text-xs text-gray-400">Ou choisis un emoji :</p>
        <div className="grid grid-cols-5 gap-2">
          {EMOJIS.map(e => (
            <button key={e} type="button" onClick={() => setEmoji(e)}
              className="w-full aspect-square rounded-xl flex items-center justify-center text-xl border transition"
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
