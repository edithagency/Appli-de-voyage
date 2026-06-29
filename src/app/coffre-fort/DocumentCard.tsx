'use client'

import { useState } from 'react'
import { Eye, X } from 'lucide-react'
import { supprimerDocument, getSignedUrl } from './actions'

type Doc = {
  id: string
  type: string
  nom_fichier: string
  storage_path: string
  date_expiration: string | null
  voyage_id: string | null
  membre: { prenom: string } | null
}

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  passeport: { label: 'Passeport', emoji: '🛂' },
  carte_identite: { label: "Carte d'identité", emoji: '🪪' },
  visa: { label: 'Visa', emoji: '📋' },
  billet_avion: { label: "Billet d'avion", emoji: '✈️' },
  reservation_hotel: { label: 'Hôtel', emoji: '🏨' },
  assurance: { label: 'Assurance', emoji: '🛡️' },
  carnet_vaccins: { label: 'Vaccins', emoji: '💉' },
  autorisation_sortie_territoire: { label: 'Visites', emoji: '🎫' },
  ordonnance: { label: 'Ordonnance', emoji: '💊' },
  autre: { label: 'Autre', emoji: '📎' },
}

function expirationStatus(dateStr: string | null): { color: string; bg: string; label: string } | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { color: '#DC2626', bg: '#FEE2E2', label: 'Expiré' }
  if (diffDays < 180) return { color: '#D97706', bg: '#FEF3C7', label: `Expire dans ${diffDays}j` }
  return { color: '#1D9E75', bg: '#D1FAE5', label: `Valide jusqu'au ${new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}` }
}

export default function DocumentCard({ doc, voyageNom, shared }: { doc: Doc; voyageNom?: string; shared?: boolean }) {
  const [deleting, setDeleting] = useState(false)
  const [opening, setOpening] = useState(false)
  const meta = TYPE_LABELS[doc.type] ?? { label: doc.type, emoji: '📎' }
  const expStatus = expirationStatus(doc.date_expiration)
  const isPermanent = !doc.voyage_id

  async function handleOpen() {
    setOpening(true)
    const url = await getSignedUrl(doc.storage_path)
    if (url) window.open(url, '_blank')
    setOpening(false)
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce document ?')) return
    setDeleting(true)
    await supprimerDocument(doc.id, doc.storage_path, doc.voyage_id)
  }

  return (
    <div className="relative rounded-2xl pl-3 pr-10 py-2.5 flex items-center gap-3" style={{
      background: isPermanent ? '#EFF6FF' : '#FFFBEB',
      boxShadow: isPermanent
        ? '0 4px 14px rgba(0,0,0,0.06), 0 0 14px 2px rgba(59,130,246,0.18)'
        : '0 4px 14px rgba(0,0,0,0.06), 0 0 14px 2px rgba(245,158,11,0.18)',
    }}>
      {/* Supprimer */}
      {!shared && (
        <button onClick={handleDelete} disabled={deleting}
          className="absolute top-1.5 left-1.5 flex items-center justify-center rounded-full disabled:opacity-50"
          style={{ width: 20, height: 20, background: 'rgba(0,0,0,0.06)' }}>
          <X size={11} color="#6B7280" />
        </button>
      )}

      {/* Icône */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 mt-2"
        style={{ background: 'white' }}>
        {meta.emoji}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0 mt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{meta.label}</span>
          {doc.membre && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white text-blue-600">
              {doc.membre.prenom}
            </span>
          )}
          {voyageNom && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white text-amber-700">
              ✈️ {voyageNom}
            </span>
          )}
          {shared && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white text-purple-500">
              Partagé
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.nom_fichier}</p>
        {expStatus && (
          <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: expStatus.bg, color: expStatus.color }}>
            {expStatus.label}
          </span>
        )}
      </div>

      {/* Voir */}
      <button onClick={handleOpen} disabled={opening}
        className="absolute right-3 flex items-center justify-center rounded-full disabled:opacity-50"
        style={{ top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, background: 'white' }}>
        <Eye size={14} color="#374151" />
      </button>
    </div>
  )
}
