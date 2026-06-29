'use client'

import { useRef, useState } from 'react'

const HANDLE_SIZE = 40
const PADDING = 4

export default function SlideToggle({
  completed, onToggle, color, labelIdle = 'Glisser pour marquer comme géré', labelDone = 'Géré',
}: {
  completed: boolean
  onToggle: () => void
  color: string
  labelIdle?: string
  labelDone?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [travel, setTravel] = useState(0)
  const startXRef = useRef(0)
  const startOffsetRef = useRef(0)

  const willComplete = dragging ? dragOffset > travel / 2 : completed

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    const trackWidth = trackRef.current?.getBoundingClientRect().width ?? 0
    const t = Math.max(0, trackWidth - HANDLE_SIZE - PADDING * 2)
    setTravel(t)
    startXRef.current = e.clientX
    startOffsetRef.current = completed ? t : 0
    setDragOffset(startOffsetRef.current)
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return
    const delta = e.clientX - startXRef.current
    setDragOffset(Math.min(travel, Math.max(0, startOffsetRef.current + delta)))
  }

  function endDrag() {
    if (!dragging) return
    setDragging(false)
    if (willComplete !== completed) onToggle()
  }

  const handleLeft = dragging
    ? `${dragOffset}px`
    : completed
      ? `calc(100% - ${HANDLE_SIZE + PADDING}px)`
      : `${PADDING}px`

  return (
    <div
      ref={trackRef}
      onClick={e => e.stopPropagation()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={() => setDragging(false)}
      className="relative w-full select-none flex items-center justify-center"
      style={{
        height: HANDLE_SIZE + PADDING * 2,
        borderRadius: 9999,
        background: willComplete ? color : `${color}0D`,
        border: willComplete ? 'none' : `1px solid ${color}26`,
        boxShadow: willComplete ? `0 0 24px 6px ${color}59, 0 4px 14px ${color}40` : 'none',
        transition: dragging ? 'none' : 'background 0.2s, box-shadow 0.3s, border 0.2s',
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: willComplete ? 'white' : color,
        transition: 'color 0.2s',
        letterSpacing: '0.01em',
      }}>
        {willComplete ? `✓ ${labelDone}` : labelIdle}
      </span>

      <div style={{
        position: 'absolute',
        top: PADDING,
        left: handleLeft,
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        borderRadius: '50%',
        background: 'white',
        boxShadow: willComplete
          ? `0 2px 8px rgba(0,0,0,0.18), 0 0 10px 2px ${color}66`
          : '0 1px 4px rgba(0,0,0,0.15)',
        transition: dragging ? 'none' : 'left 0.2s, box-shadow 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {willComplete ? (
          <svg width="14" height="11" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  )
}
