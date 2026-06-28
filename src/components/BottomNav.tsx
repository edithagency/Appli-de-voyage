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
        className="pointer-events-auto inline-flex items-center gap-2 mx-4 px-5 py-2.5 rounded-full max-w-[360px]"
        style={{
          background: 'rgba(255, 254, 237, 0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        }}
      >
        {TABS.map(({ href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200"
            >
              <Icon
                size={24}
                strokeWidth={active ? 2 : 1.75}
                color="#36A6B2"
                fill={active ? '#36A6B2' : 'none'}
              />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
