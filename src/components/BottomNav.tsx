'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plane, Wrench, Lock, User } from 'lucide-react'

const TABS = [
  { href: '/dashboard', icon: Plane },
  { href: '/outils', icon: Wrench },
  { href: '/coffre-fort', icon: Lock },
  { href: '/compte', icon: User },
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
        className="pointer-events-auto inline-flex items-center gap-1 mx-4 px-2.5 py-2.5 rounded-2xl max-w-[320px]"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        {TABS.map(({ href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="relative flex items-center justify-center w-12 h-11 rounded-xl transition-all duration-200"
              style={{ background: active ? 'rgba(54, 166, 178, 0.12)' : 'transparent' }}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.25 : 1.75}
                color={active ? '#36A6B2' : '#9CA3AF'}
                fill="none"
              />
              {active && (
                <span
                  className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 rounded-full"
                  style={{ width: 4, height: 4, background: '#36A6B2' }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
