'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'

export default function InviteFriendsCard() {
  const [copied, setCopied] = useState(false)

  async function handleInvite() {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://bonvol.app'
    const shareData = {
      title: 'Bon Vol',
      text: "Je prépare mes voyages avec Bon Vol, rejoins-moi !",
      url,
    }
    if (navigator.share) {
      try { await navigator.share(shareData); return } catch { /* annulé, on ignore */ }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" onClick={handleInvite}
      className="relative w-full overflow-hidden rounded-2xl border border-gray-100 px-5 py-5 flex items-center gap-4 text-left transition active:scale-[0.99]"
      style={{ background: 'linear-gradient(to right, white 35%, #8BD4DC 100%)' }}>
      <span className="flex items-center justify-center w-12 h-12 rounded-full shrink-0" style={{ background: 'rgba(54,166,178,0.12)' }}>
        <UserPlus size={22} color="#36A6B2" />
      </span>
      <span className="flex-1">
        <span className="block font-bold text-gray-900 text-base">Invite tes amis</span>
        <span className="block text-gray-500 text-xs mt-0.5">
          {copied ? 'Lien copié !' : 'Partage Bon Vol avec ton entourage'}
        </span>
      </span>
    </button>
  )
}
