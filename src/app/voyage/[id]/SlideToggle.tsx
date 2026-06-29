'use client'

import { useRef, useState } from 'react'

const PADDING = 3

export default function SlideToggle({
  completed, onToggle, color, trackWidth = 56, handleSize = 22,
}: {
  completed: boolean
  onToggle: () => void
  color: string
  trackWidth?: number
  handleSize?: number
}) {
  const travel = trackWidth - handleSize - PADDING * 2
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startXRef = useRef(0)
  const startOffsetRef = useRef(0)

  const offset = dragging ? dragOffset : (completed ? travel : 0)
  const willComplete = dragging ? dragOffset > travel / 2 : completed

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    startXRef.current = e.clientX
    startOffsetRef.current = completed ? travel : 0
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

  return (
    <div
      onClick={e => e.stopPropagation()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={() => setDragging(false)}
      className="relative shrink-0 select-none"
      style={{
        width: trackWidth,
        height: handleSize + PADDING * 2,
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
        width: handleSize,
        height: handleSize,
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
          <svg width={handleSize * 0.4} height={handleSize * 0.32} viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  )
}
