'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera } from 'lucide-react'
import { uploadAvatar } from './actions'

export default function AvatarUploader({
  initialAvatarUrl, fallbackLetter,
}: {
  initialAvatarUrl: string | null
  fallbackLetter: string
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadAvatar(formData)
      if (result.error) { setError(result.error); return }
      if (result.avatarUrl) setAvatarUrl(result.avatarUrl)
      router.refresh()
    } catch {
      setError("La connexion a échoué pendant l'envoi (photo trop lourde ou réseau coupé). Réessaie avec une image plus légère.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
        className="relative w-20 h-20 rounded-full disabled:opacity-70">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : fallbackLetter}
        </div>
        <span className="absolute bottom-0 right-0 flex items-center justify-center w-7 h-7 rounded-full border-2 border-white"
          style={{ background: '#36A6B2' }}>
          <Camera size={14} color="white" />
        </span>
      </button>

      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp"
        className="hidden" onChange={handlePhotoChange} />

      {uploading && <p className="text-xs text-gray-400">Envoi...</p>}
      {error && <p className="text-xs text-red-500 text-center max-w-xs">{error}</p>}
    </div>
  )
}
