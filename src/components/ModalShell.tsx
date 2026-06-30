'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function ModalShell({
  open, onClose, title, children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  // document.getElementById doit attendre le commit (effet), pas le render :
  // au tout premier rendu de l'app, #modal-root n'existe pas encore dans le DOM réel.
  useEffect(() => {
    setPortalTarget(document.getElementById('modal-root'))
  }, [])

  if (!open || !portalTarget) return null

  // Portail vers #modal-root (sibling de .phone-screen dans layout.tsx) : .phone-screen passe en
  // transform dès 640px, ce qui en fait son propre contexte d'empilement, donc un z-index posé ici
  // ne peut jamais dépasser la nav/bouton + qui vivent hors de .phone-screen. Rendre la modale au
  // même niveau qu'eux (en absolute, pas fixed) règle ça.
  return createPortal(
    <div
      className="absolute inset-0 z-50 flex items-center justify-center py-14 px-7"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md flex flex-col"
        style={{ maxHeight: '100%', boxShadow: '0 25px 70px -10px rgba(0,0,0,0.35)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* En-tête fixe — ne scrolle pas */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h3 className="font-bold uppercase" style={{ color: '#004850', fontSize: 18, letterSpacing: '-0.02em' }}>
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Contenu — seule zone scrollable */}
        <div className="overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>,
    portalTarget
  )
}
