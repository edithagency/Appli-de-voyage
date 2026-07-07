'use client'

import { usePathname } from 'next/navigation'

export default function NewTripButton() {
  const pathname = usePathname()
  if (pathname !== '/dashboard') return null

  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-trip-modal'))}
      className="absolute w-14 h-14 rounded-full flex items-center justify-center text-2xl font-light shadow-lg z-10"
      style={{ background: 'white', border: '2px solid #36A6B2', color: '#36A6B2', right: 40, bottom: 112 }}>
      +
    </button>
  )
}
