'use client'

import { useState, useTransition } from 'react'
import { retirerParticipant, renouvelerInvitation } from './participants-actions'

type Membre = {
  id: string
  prenom: string
  type: string
  statut_invitation: 'pending' | 'lien_copie' | 'joined'
  token_invitation: string
  token_expire_at: string | null
}

const STATUT_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pas encore invité', color: '#9CA3AF', bg: '#F3F4F6' },
  lien_copie: { label: 'Lien envoyé', color: '#D97706', bg: '#FEF3C7' },
  joined: { label: 'A rejoint ✓', color: '#065F46', bg: '#D1FAE5' },
}

export default function ParticipantsPanel({
  participants: membresInitiaux,
  modeGestion,
  voyageId,
  showHeader = true,
}: {
  participants: Membre[]
  modeGestion: 'organisateur' | 'partage'
  voyageId: string
  showHeader?: boolean
}) {
  const [membres, setMembres] = useState(membresInitiaux)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [renewingId, setRenewingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/`
    : '/join/'

  async function copierLien(membre: Membre) {
    const lien = `${baseUrl}${membre.token_invitation}`
    await navigator.clipboard.writeText(lien)
    setCopiedId(membre.id)
    setTimeout(() => setCopiedId(null), 2000)

    if (membre.statut_invitation === 'pending') {
      await fetch(`/api/participants/${membre.id}/lien-copie`, { method: 'POST' })
    }
  }

  function handleRetirer(membre: Membre) {
    if (!confirm(`Retirer ${membre.prenom} du voyage ?`)) return
    setMembres(prev => prev.filter(p => p.id !== membre.id))
    startTransition(() => { retirerParticipant(membre.id, voyageId) })
  }

  function isExpired(membre: Membre) {
    if (membre.statut_invitation === 'joined' || !membre.token_expire_at) return false
    return new Date(membre.token_expire_at).getTime() < Date.now()
  }

  async function handleRenouveler(membre: Membre) {
    setRenewingId(membre.id)
    const result = await renouvelerInvitation(membre.id, voyageId)
    setRenewingId(null)

    if (result.error) {
      alert(result.error)
      return
    }

    setMembres(prev => prev.map(p => p.id === membre.id
      ? { ...p, token_invitation: result.token!, token_expire_at: result.tokenExpireAt!, statut_invitation: 'pending' }
      : p
    ))
  }

  return (
    <div className={showHeader ? 'bg-white rounded-2xl border border-gray-200 p-5' : ''}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Participants</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {modeGestion === 'partage'
                ? "Partage le lien à chaque participant pour qu'il rejoigne le voyage."
                : 'Membres du groupe — tu gères tout pour eux.'}
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${modeGestion === 'organisateur' ? 'bg-yellow-100 text-[#147046]' : 'bg-blue-50 text-blue-600'}`}>
            Mode {modeGestion === 'organisateur' ? '🎯 Gestion unique' : '🔗 Partagé'}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {membres.map(p => {
          const expired = isExpired(p)
          const statut = expired ? { label: '⏰ Lien expiré', color: '#9F1239', bg: '#FFE4E6' } : STATUT_LABEL[p.statut_invitation]
          return (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <span className="text-lg">{p.type === 'enfant' ? '👶' : '🧑'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{p.prenom}</p>
                {modeGestion === 'partage' ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: statut.bg, color: statut.color }}>
                    {statut.label}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 capitalize">{p.type}</span>
                )}
              </div>

              {/* Bouton copier le lien / renouveler — mode partagé seulement */}
              {modeGestion === 'partage' && p.statut_invitation !== 'joined' && (
                expired ? (
                  <button
                    type="button"
                    onClick={() => handleRenouveler(p)}
                    disabled={renewingId === p.id}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    style={{ background: '#FFE4E6', color: '#9F1239' }}
                  >
                    {renewingId === p.id ? '...' : '🔄 Renouveler'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => copierLien(p)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    style={{
                      background: copiedId === p.id ? '#D1FAE5' : '#F6F08F',
                      color: copiedId === p.id ? '#065F46' : '#147046',
                    }}
                  >
                    {copiedId === p.id ? '✓ Copié !' : p.statut_invitation === 'lien_copie' ? '🔄 Renvoyer' : '🔗 Copier le lien'}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => handleRetirer(p)}
                title={`Retirer ${p.prenom}`}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 transition text-base leading-none">
                ×
              </button>
            </div>
          )
        })}
      </div>

      {/* Résumé */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
        {modeGestion === 'partage' ? (
          <>
            <span>{membres.filter(p => p.statut_invitation === 'joined').length}/{membres.length} ont rejoint</span>
            {membres.filter(p => p.statut_invitation === 'pending').length > 0 && (
              <span className="text-amber-500">
                {membres.filter(p => p.statut_invitation === 'pending').length} en attente d'invitation
              </span>
            )}
          </>
        ) : (
          <span>{membres.length} membre{membres.length > 1 ? 's' : ''} dans le voyage</span>
        )}
      </div>
    </div>
  )
}
