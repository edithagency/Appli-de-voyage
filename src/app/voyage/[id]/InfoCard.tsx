'use client'

import { Paperclip } from 'lucide-react'
import SlideToggle from './SlideToggle'
import ModalShell from '@/components/ModalShell'

export default function InfoCard({
  id, title, gradient, photo, photoFait, expandedId, onToggle, completed = false, onToggleDone, docType, onAjouterDocument, extraHeader, labelIdle, labelDone, useModal = false, children,
}: {
  id: string
  title: string
  gradient: string
  photo?: string
  // Variante déjà grisée + logo Bon Vol, affichée quand le toggle est sur "Fait".
  photoFait?: string
  expandedId: string | null
  onToggle: (id: string) => void
  completed?: boolean
  onToggleDone?: (id: string) => void
  docType?: string
  onAjouterDocument?: (docType: string) => void
  extraHeader?: React.ReactNode
  labelIdle?: string
  labelDone?: string
  // Test : ouvre le contenu dans une modale (comme "nouvelle dépense"/"ajouter un voyage")
  // au lieu de le déplier dans la grille.
  useModal?: boolean
  children: React.ReactNode
}) {
  const expanded = expandedId === id
  const spaceIndex = title.indexOf(' ')
  const label = spaceIndex === -1 ? title : title.slice(spaceIndex + 1)
  const imageSrc = completed && photoFait ? photoFait : photo
  const grayscale = completed && !photoFait ? 'grayscale(1)' : 'none'

  const visual = imageSrc && (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: grayscale, transition: 'filter 0.3s' }} />
  )

  const body = (
    <>
      {children}
      {extraHeader}
      {onToggleDone && (
        <SlideToggle
          completed={completed}
          onToggle={() => onToggleDone(id)}
          color="#36A6B2"
          labelIdle={labelIdle}
          labelDone={labelDone}
        />
      )}
      {completed && docType && onAjouterDocument && (
        <button onClick={() => onAjouterDocument(docType)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition"
          style={{ background: '#DBEAFE', color: '#36A6B2' }}>
          <Paperclip size={14} color="#9CA3AF" />
          Ajouter mon document
        </button>
      )}
    </>
  )

  if (useModal) {
    return (
      <>
        <div
          onClick={() => onToggle(id)}
          data-info-id={id}
          className="relative rounded-xl cursor-pointer bg-white border border-gray-200 hover:border-gray-300 overflow-hidden transition-colors">
          <div className="relative bg-gray-100" style={{ height: 74 }}>
            {visual}
          </div>
          <div className="flex items-center justify-center px-2 py-1.5" style={{ height: 36 }}>
            <p className={`text-xs font-bold uppercase leading-snug text-center line-clamp-2 transition-colors ${completed ? 'text-gray-400' : 'text-[#004850]'}`} style={{ letterSpacing: '-0.02em' }}>{label}</p>
          </div>
        </div>
        <ModalShell open={expanded} onClose={() => onToggle(id)} title={label} verticalPadding={90}>
          <div className="flex flex-col gap-2.5">{body}</div>
        </ModalShell>
      </>
    )
  }

  return (
    <div
      onClick={() => onToggle(id)}
      data-info-id={id}
      className={`relative rounded-xl cursor-pointer bg-white border overflow-hidden transition-colors ${expanded ? 'col-span-2 border-[#36A6B2]' : 'border-gray-200 hover:border-gray-300'}`}>

      {/* Image (2/3) — case vide en attendant les visuels par destination, masquée à l'ouverture */}
      {!expanded && (
        <div className="relative bg-gray-100" style={{ height: 100 }}>
          {visual}
        </div>
      )}

      {/* Titre (1/3, ou en tête de carte ouverte) */}
      <div className={`flex items-center justify-center px-2 ${expanded ? 'py-3' : 'py-1.5'}`} style={{ height: expanded ? undefined : 36 }}>
        <p className={`font-bold uppercase leading-snug text-center line-clamp-2 transition-colors ${expanded ? 'text-lg' : 'text-xs'} ${completed ? 'text-gray-400' : 'text-[#004850]'}`} style={{ letterSpacing: '-0.02em' }}>{label}</p>
      </div>

      {expanded && (
        <div className="mx-3 pt-3 pb-3 flex flex-col gap-2.5 border-t border-gray-100" onClick={e => e.stopPropagation()}>
          {body}
        </div>
      )}
    </div>
  )
}
