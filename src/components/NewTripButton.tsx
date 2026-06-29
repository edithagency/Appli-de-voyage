'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NewTripButton() {
  const pathname = usePathname()
  if (pathname !== '/dashboard') return null

  return (
    <Link href="/voyage/nouveau"
      className="absolute w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-light shadow-lg z-10"
      style={{ background: '#004850', right: 40, bottom: 112 }}>
      +
    </Link>
  )
}
