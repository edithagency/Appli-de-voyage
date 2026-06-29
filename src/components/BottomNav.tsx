'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plane, Wrench, Lock, User } from 'lucide-react'

const TABS = [
  { href: '/dashboard', icon: Plane, label: 'VOYAGES' },
  { href: '/outils', icon: Wrench, label: 'OUTILS' },
  { href: '/coffre-fort', icon: Lock, label: 'COFFRE-FORT' },
  { href: '/compte', icon: User, label: 'COMPTE' },
]

const HIDDEN_PREFIXES = ['/', '/auth', '/join', '/voyage']

export default function BottomNav() {
  const pathname = usePathname()

  // Masquer sur les pages publiques (landing, auth, onboarding)
  const hidden = HIDDEN_PREFIXES.some(p =>
    p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')
  )
  if (hidden) return null

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/voyage')
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Dégradé blanc au-dessus */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.98) 100%)',
        zIndex: 39,
        pointerEvents: 'none',
      }} />

      {/* Navbar */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom) + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        background: 'white',
        borderRadius: 9999,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0,0,0,0.06)',
        width: 'auto',
        minWidth: 280,
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = isActive(tab.href)
          return (
            <Link key={tab.href} href={tab.href}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: active ? 6 : 0,
                padding: '8px 16px',
                borderRadius: 9999,
                background: active ? '#36A6B2' : 'transparent',
                transition: 'all 0.2s ease',
              }}>
                {/* Icône */}
                <div style={{ color: active ? 'white' : '#9CA3AF', display: 'flex' }}>
                  <Icon size={22} />
                </div>
                {/* Label uniquement si actif */}
                {active && (
                  <span style={{
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}>
                    {tab.label}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
