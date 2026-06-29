'use client'

import { useRef, useState } from 'react'

const TRACK_WIDTH = 56
const HANDLE_SIZE = 22
const PADDING = 3
const TRAVEL = TRACK_WIDTH - HANDLE_SIZE - PADDING * 2

export default function SlideToggle({
  completed, onToggle, color,
}: {
  completed: boolean
  onToggle: () => void
  color: string
}) {
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startXRef = useRef(0)
  const startOffsetRef = useRef(0)

  const offset = dragging ? dragOffset : (completed ? TRAVEL : 0)
  const willComplete = dragging ? dragOffset > TRAVEL / 2 : completed

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    startXRef.current = e.clientX
    startOffsetRef.current = completed ? TRAVEL : 0
    setDragOffset(startOffsetRef.current)
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return
    const delta = e.clientX - startXRef.current
    setDragOffset(Math.min(TRAVEL, Math.max(0, startOffsetRef.current + delta)))
  }

  function endDrag() {
    if (!dragging) return
    setDragging(false)
    if (willComplete !== completed) onToggle()
  }

  return (
    <div
      onClick={e => e.stopPropagation()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={() => setDragging(false)}
      className="relative shrink-0 select-none"
      style={{
        width: TRACK_WIDTH,
        height: HANDLE_SIZE + PADDING * 2,
        borderRadius: 9999,
        background: willComplete ? color : '#E5E7EB',
        transition: dragging ? 'none' : 'background 0.2s',
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <div style={{
        position: 'absolute',
        top: PADDING,
        left: PADDING,
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        transform: `translateX(${offset}px)`,
        transition: dragging ? 'none' : 'transform 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {willComplete && (
          <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  )
}
