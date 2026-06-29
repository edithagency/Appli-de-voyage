'use client'

import SlideToggle from './SlideToggle'

export default function InfoCard({
  id, title, gradient, photo, expandedId, onToggle, completed = false, onToggleDone, docType, onAjouterDocument, extraHeader, children,
}: {
  id: string
  title: string
  gradient: string
  photo?: string
  expandedId: string | null
  onToggle: (id: string) => void
  completed?: boolean
  onToggleDone?: (id: string) => void
  docType?: string
  onAjouterDocument?: (docType: string) => void
  extraHeader?: React.ReactNode
  children: React.ReactNode
}) {
  const expanded = expandedId === id
  const spaceIndex = title.indexOf(' ')
  const emoji = spaceIndex === -1 ? title : title.slice(0, spaceIndex)
  const label = spaceIndex === -1 ? title : title.slice(spaceIndex + 1)
  const grayscale = completed ? 'grayscale(1)' : 'none'

  return (
    <div
      onClick={() => onToggle(id)}
      data-info-id={id}
      className={`relative rounded-xl cursor-pointer bg-white border transition-colors ${photo ? 'overflow-hidden' : ''} ${expanded ? 'col-span-3 border-[#36A6B2]' : 'border-gray-200 hover:border-gray-300'}`}>

      {photo ? (
        <>
          <div className="relative" style={{ aspectRatio: expanded ? '16/9' : '1/1' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: grayscale, transition: 'filter 0.3s' }} />
          </div>
          <div className={expanded ? 'px-3 py-3' : 'px-2 py-2.5 text-center'}>
            <p className={`font-semibold leading-snug transition-colors ${completed ? 'text-gray-400' : 'text-gray-800'} ${expanded ? 'text-base' : 'line-clamp-2 text-xs'}`}>{label}</p>
          </div>
        </>
      ) : expanded ? (
        <div className="flex items-center gap-2.5 px-3 py-3">
          <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all" style={{ background: '#DBEAFE', filter: grayscale }}>
            {emoji}
          </div>
          <p className={`font-semibold leading-snug text-base transition-colors ${completed ? 'text-gray-400' : 'text-gray-800'}`}>{label}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-2 px-2 py-3">
          <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all" style={{ background: '#DBEAFE', filter: grayscale }}>
            {emoji}
          </div>
          <p className={`font-semibold leading-snug line-clamp-2 text-xs transition-colors ${completed ? 'text-gray-400' : 'text-gray-800'}`}>{label}</p>
        </div>
      )}

      {expanded && (
        <div className="mx-3 pt-3 pb-3 flex flex-col gap-2.5 border-t border-gray-100" onClick={e => e.stopPropagation()}>
          {completed && docType && onAjouterDocument && (
            <button onClick={() => onAjouterDocument(docType)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition"
              style={{ background: '#DBEAFE', color: '#36A6B2' }}>
              📎 Ajouter le document
            </button>
          )}
          {extraHeader}
          {children}
          {onToggleDone && (
            <div className="px-2">
              <SlideToggle completed={completed} onToggle={() => onToggleDone(id)} color="#36A6B2" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
