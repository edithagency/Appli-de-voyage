'use client'

import { useRef, useState } from 'react'
import { Phone } from 'lucide-react'

export type PaysOutil = {
  code: string
  nom_fr: string
  emoji: string | null
  urgence_police: string | null
  urgence_ambulance: string | null
  urgence_ambassade_france: string | null
  urgence_autres: { label: string; numero: string }[] | null
  ambassade_info: { adresse?: string; tel_urgence?: string } | null
  sante_details: { trousse_medicale?: string[] } | null
  phrases_essentielles: { fr: string; langue_locale: string; phonetique: string }[] | null
  budget_estimations?: Record<string, Record<string, number>> | null
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const HANDLE_W = 60
const HANDLE_H = 36
const PAD = 4
const COLOR = '#36A6B2'

function SlideToCall({ number }: { number: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [travel, setTravel] = useState(0)
  const startXRef = useRef(0)
  const calledRef = useRef(false)

  const triggered = dragging ? dragOffset > travel * 0.85 : false

  function onDown(e: React.PointerEvent) {
    const w = trackRef.current?.getBoundingClientRect().width ?? 0
    const t = Math.max(0, w - HANDLE_W - PAD * 2)
    setTravel(t)
    startXRef.current = e.clientX
    setDragOffset(0)
    calledRef.current = false
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onMove(e: React.PointerEvent) {
    if (!dragging) return
    setDragOffset(Math.min(travel, Math.max(0, e.clientX - startXRef.current)))
  }

  function onUp() {
    if (!dragging) return
    setDragging(false)
    if (triggered && !calledRef.current) {
      calledRef.current = true
      window.location.href = `tel:${number}`
    }
    setDragOffset(0)
  }

  const handleLeft = dragging ? `${PAD + dragOffset}px` : `${PAD}px`

  return (
    <div
      ref={trackRef}
      className="relative w-full select-none flex items-center justify-center"
      style={{
        height: HANDLE_H + PAD * 2,
        borderRadius: 9999,
        background: triggered ? COLOR : `${COLOR}0D`,
        border: triggered ? 'none' : `1px solid ${COLOR}26`,
        boxShadow: triggered ? `0 0 24px 6px ${COLOR}59, 0 4px 14px ${COLOR}40` : 'none',
        transition: dragging ? 'none' : 'background 0.2s, box-shadow 0.3s, border 0.2s',
        cursor: 'grab',
        touchAction: 'none',
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={() => { setDragging(false); setDragOffset(0) }}
    >
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: triggered ? 'white' : COLOR,
        letterSpacing: '0.01em',
        transition: 'color 0.2s',
        userSelect: 'none',
      }}>
        {triggered ? 'APPEL EN COURS…' : 'APPELER'}
      </span>

      <div style={{
        position: 'absolute',
        top: PAD,
        left: handleLeft,
        width: HANDLE_W,
        height: HANDLE_H,
        borderRadius: 9999,
        background: 'white',
        boxShadow: triggered
          ? `0 6px 16px rgba(0,0,0,0.16), 0 0 22px 6px ${COLOR}80`
          : `0 4px 12px rgba(0,0,0,0.12), 0 0 16px 3px ${COLOR}4D`,
        transition: dragging ? 'none' : 'left 0.2s, box-shadow 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {triggered
          ? <Phone size={15} color={COLOR} />
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke={COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        }
      </div>
    </div>
  )
}

export default function NumerosUrgence({ pays, defaultPaysCode }: { pays: PaysOutil[]; defaultPaysCode?: string | null }) {
  const defaultPays = pays.find(x => x.code === defaultPaysCode) ?? null
  const [code, setCode] = useState(defaultPaysCode ?? '')
  const [search, setSearch] = useState(defaultPays ? `${defaultPays.emoji} ${defaultPays.nom_fr}` : '')
  const [showDropdown, setShowDropdown] = useState(false)

  const paysFiltered = pays.filter(p =>
    norm(p.nom_fr).includes(norm(search))
  ).slice(0, 6)

  function handleSelect(p: PaysOutil) {
    setCode(p.code)
    setSearch(`${p.emoji} ${p.nom_fr}`)
    setShowDropdown(false)
  }

  const p = pays.find(x => x.code === code) ?? null

  return (
    <div className="flex flex-col gap-3" style={{ minHeight: 220 }}>
      <div className="relative">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Destination</p>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowDropdown(true); setCode('') }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Rechercher un pays..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
        />
        {showDropdown && search.length > 0 && paysFiltered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            {paysFiltered.map(p => (
              <button
                key={p.code}
                type="button"
                onMouseDown={() => handleSelect(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm"
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-gray-800">{p.nom_fr}</span>
                {code === p.code && <span className="ml-auto text-[#36A6B2]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {p && (
        <div className="flex flex-col gap-3">
          {[
            { label: 'Police', number: p.urgence_police, emoji: '🚔' },
            { label: 'Ambulance', number: p.urgence_ambulance, emoji: '🚑' },
            { label: 'Ambassade FR', number: p.urgence_ambassade_france, emoji: '🇫🇷' },
          ].map(u => (
            <div key={u.label} className="bg-gray-50 rounded-2xl px-4 pt-3 pb-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{u.emoji} {u.label}</span>
                <span className="text-lg font-bold text-[#004850]">{u.number ?? '–'}</span>
              </div>
              {u.number
                ? <SlideToCall number={u.number} />
                : <div style={{ height: HANDLE + PAD * 2, borderRadius: 9999, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="text-xs text-gray-300 font-semibold">Non disponible</span>
                  </div>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
