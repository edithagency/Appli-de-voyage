'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/dashboard', emoji: '🏠', label: 'Voyages' },
  { href: '/outils', emoji: '🛠️', label: 'Outils' },
  { href: '/coffre-fort', emoji: '🔒', label: 'Documents' },
]

const HIDDEN_PREFIXES = ['/', '/auth', '/join']

export default function BottomNav() {
  const path = usePathname()

  // Masquer sur les pages publiques (landing, auth, onboarding)
  const hidden = HIDDEN_PREFIXES.some(p =>
    p === '/' ? path === '/' : path === p || path.startsWith(p + '/')
  )
  if (hidden) return null

  function isActive(href: string) {
    if (href === '/dashboard') return path === '/dashboard' || path.startsWith('/voyage')
    return path === href || path.startsWith(href + '/')
  }

  return (
    <nav
      className="bg-white border-t border-gray-100 flex-shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
        {TABS.map(tab => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-6 py-2"
            >
              <span className="text-xl">{tab.emoji}</span>
              <span className="text-xs font-semibold" style={{ color: active ? '#36A6B2' : '#9CA3AF' }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
