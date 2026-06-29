'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plane, Wrench, Lock, User } from 'lucide-react'

const TABS = [
  { href: '/dashboard', icon: Plane, label: 'Voyages' },
  { href: '/outils', icon: Wrench, label: 'Outils' },
  { href: '/coffre-fort', icon: Lock, label: 'Coffre-fort' },
  { href: '/compte', icon: User, label: 'Compte' },
]

const HIDDEN_PREFIXES = ['/', '/auth', '/join', '/voyage']

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
    <div
      className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 36px)' }}
    >
      <nav
        className="pointer-events-auto flex items-center justify-between gap-1 px-3 py-2.5"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 9999,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-center gap-1.5 transition-all overflow-hidden"
              style={{
                borderRadius: 9999,
                padding: active ? '8px 14px' : '8px',
                background: active ? 'rgba(54,166,178,0.12)' : 'transparent',
                boxShadow: active ? '0 0 6px 1px rgba(54,166,178,0.3)' : 'none',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} color={active ? '#36A6B2' : '#9CA3AF'} className="shrink-0" />
              {active && (
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', color: '#36A6B2', whiteSpace: 'nowrap' }}>
                  {label.toUpperCase()}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
