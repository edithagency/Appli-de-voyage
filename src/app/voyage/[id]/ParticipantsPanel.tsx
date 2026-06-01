'use client'

import { useState } from 'react'

type Participant = {
  id: string
  prenom: string
  type: string
  statut: 'en_attente' | 'lien_copie' | 'rejoint'
  token_invitation: string
}

const STATUT_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  en_attente: { label: 'Pas encore invité', color: '#9CA3AF', bg: '#F3F4F6' },
  lien_copie: { label: 'Lien envoyé', color: '#D97706', bg: '#FEF3C7' },
  rejoint: { label: 'A rejoint ✓', color: '#065F46', bg: '#D1FAE5' },
}

export default function ParticipantsPanel({
  participants,
  modeGestion,
  voyageId,
}: {
  participants: Participant[]
  modeGestion: 'A' | 'B'
  voyageId: string
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/rejoindre/`
    : '/rejoindre/'

  async function copierLien(participant: Participant) {
    const lien = `${baseUrl}${participant.token_invitation}`
    await navigator.clipboard.writeText(lien)
    setCopiedId(participant.id)
    setTimeout(() => setCopiedId(null), 2000)

    // Marquer comme lien_copie si pas encore rejoint
    if (participant.statut === 'en_attente') {
      await fetch(`/api/participants/${participant.id}/lien-copie`, { method: 'POST' })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">Participants</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {modeGestion === 'B'
              ? "Partage le lien à chaque participant pour qu'il rejoigne le voyage."
              : 'Membres du groupe — tu gères tout pour eux.'}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${modeGestion === 'A' ? 'bg-purple-100 text-[#534AB7]' : 'bg-blue-50 text-blue-600'}`}>
          Mode {modeGestion === 'A' ? '🎯 Gestion unique' : '🔗 Partagé'}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {participants.map(p => {
          const statut = STATUT_LABEL[p.statut]
          return (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <span className="text-lg">{p.type === 'enfant' ? '👶' : '🧑'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{p.prenom}</p>
                {modeGestion === 'B' ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: statut.bg, color: statut.color }}>
                    {statut.label}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 capitalize">{p.type}</span>
                )}
              </div>

              {/* Bouton copier le lien — Mode B seulement */}
              {modeGestion === 'B' && p.statut !== 'rejoint' && (
                <button
                  type="button"
                  onClick={() => copierLien(p)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  style={{
                    background: copiedId === p.id ? '#D1FAE5' : '#EDE9FF',
                    color: copiedId === p.id ? '#065F46' : '#534AB7',
                  }}
                >
                  {copiedId === p.id ? '✓ Copié !' : p.statut === 'lien_copie' ? '🔄 Renvoyer' : '🔗 Copier le lien'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Résumé */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
        {modeGestion === 'B' ? (
          <>
            <span>{participants.filter(p => p.statut === 'rejoint').length}/{participants.length} ont rejoint</span>
            {participants.filter(p => p.statut === 'en_attente').length > 0 && (
              <span className="text-amber-500">
                {participants.filter(p => p.statut === 'en_attente').length} en attente d'invitation
              </span>
            )}
          </>
        ) : (
          <span>{participants.length} membre{participants.length > 1 ? 's' : ''} dans le voyage</span>
        )}
      </div>
    </div>
  )
}
