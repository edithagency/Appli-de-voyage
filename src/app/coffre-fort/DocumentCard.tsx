'use client'

import { useState } from 'react'
import { supprimerDocument, getSignedUrl } from './actions'

type Doc = {
  id: string
  type: string
  nom_fichier: string
  storage_path: string
  date_expiration: string | null
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
  autorisation_sortie_territoire: { label: 'AST', emoji: '📄' },
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

export default function DocumentCard({ doc }: { doc: Doc }) {
  const [deleting, setDeleting] = useState(false)
  const [opening, setOpening] = useState(false)
  const meta = TYPE_LABELS[doc.type] ?? { label: doc.type, emoji: '📎' }
  const expStatus = expirationStatus(doc.date_expiration)

  async function handleOpen() {
    setOpening(true)
    const url = await getSignedUrl(doc.storage_path)
    if (url) window.open(url, '_blank')
    setOpening(false)
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce document ?')) return
    setDeleting(true)
    await supprimerDocument(doc.id, doc.storage_path)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
      {/* Icône */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: expStatus ? expStatus.bg : '#F3F4F6' }}>
        {meta.emoji}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{meta.label}</span>
          {doc.membre && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {doc.membre.prenom}
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

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0">
        <button onClick={handleOpen} disabled={opening}
          className="text-xs px-3 py-1.5 rounded-xl font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
          {opening ? '...' : '👁️'}
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50">
          {deleting ? '...' : '🗑️'}
        </button>
      </div>
    </div>
  )
}
