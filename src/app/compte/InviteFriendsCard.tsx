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
      className="relative w-full overflow-hidden rounded-2xl px-5 py-5 flex items-center gap-4 text-left transition active:scale-[0.99]"
      style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
      <span className="flex items-center justify-center w-12 h-12 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.25)' }}>
        <UserPlus size={22} color="white" />
      </span>
      <span className="flex-1">
        <span className="block font-bold text-white text-base">Invite tes amis</span>
        <span className="block text-white/80 text-xs mt-0.5">
          {copied ? 'Lien copié !' : 'Partage Bon Vol avec ton entourage'}
        </span>
      </span>
    </button>
  )
}
