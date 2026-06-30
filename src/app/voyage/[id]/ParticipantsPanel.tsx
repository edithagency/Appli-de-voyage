'use client'

import { useState, useTransition } from 'react'
import { Check, Link2, RefreshCw, X, Baby, User } from 'lucide-react'
import { retirerParticipant, renouvelerLienVoyage } from './participants-actions'

type Membre = {
  id: string
  prenom: string
  type: string
  statut_invitation: 'pending' | 'lien_copie' | 'joined'
}

export default function ParticipantsPanel({
  participants: membresInitiaux,
  modeGestion,
  voyageId,
  voyageToken,
  voyageTokenExpireAt,
  showHeader = true,
}: {
  participants: Membre[]
  modeGestion: 'organisateur' | 'partage'
  voyageId: string
  voyageToken: string
  voyageTokenExpireAt: string | null
  showHeader?: boolean
}) {
  const [membres, setMembres] = useState(membresInitiaux)
  const [token, setToken] = useState(voyageToken)
  const [tokenExpireAt, setTokenExpireAt] = useState(voyageTokenExpireAt)
  const [copied, setCopied] = useState(false)
  const [renewing, setRenewing] = useState(false)
  const [, startTransition] = useTransition()

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/` : '/join/'
  const lien = `${baseUrl}${token}`
  const expired = tokenExpireAt ? new Date(tokenExpireAt).getTime() < Date.now() : false

  async function copierLien() {
    await navigator.clipboard.writeText(lien)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRenouveler() {
    setRenewing(true)
    const result = await renouvelerLienVoyage(voyageId)
    setRenewing(false)
    if (result.error) { alert(result.error); return }
    setToken(result.token!)
    setTokenExpireAt(result.tokenExpireAt!)
  }

  function handleRetirer(membre: Membre) {
    if (!confirm(`Retirer ${membre.prenom} du voyage ?`)) return
    setMembres(prev => prev.filter(p => p.id !== membre.id))
    startTransition(() => { retirerParticipant(membre.id, voyageId) })
  }

  return (
    <div className={showHeader ? 'bg-white rounded-2xl border border-gray-200 p-5' : ''}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Participants</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {modeGestion === 'partage'
                ? 'Partage ce lien : chacun choisit qui il est en le rejoignant.'
                : 'Membres du groupe — tu gères tout pour eux.'}
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${modeGestion === 'organisateur' ? 'bg-blue-100 text-[#36A6B2]' : 'bg-blue-50 text-blue-600'}`}>
            Mode {modeGestion === 'organisateur' ? 'Gestion unique' : 'Partagé'}
          </span>
        </div>
      )}

      {/* Lien unique du voyage — un seul lien pour tous, mode partagé seulement */}
      {modeGestion === 'partage' && (
        <div className="mb-4">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-200 mb-2">
            <p className="text-xs text-gray-500 flex-1 truncate">{lien}</p>
          </div>
          {expired ? (
            <button type="button" onClick={handleRenouveler} disabled={renewing}
              className="w-full py-2.5 rounded-2xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{ background: '#FFE4E6', color: '#9F1239' }}>
              <RefreshCw size={14} /> {renewing ? '...' : 'RENOUVELER LE LIEN EXPIRÉ'}
            </button>
          ) : (
            <button type="button" onClick={copierLien}
              className="w-full py-2.5 rounded-2xl font-semibold text-sm border transition flex items-center justify-center gap-1.5"
              style={{
                background: copied ? '#D1FAE5' : 'white',
                color: copied ? '#065F46' : '#36A6B2',
                borderColor: copied ? '#D1FAE5' : '#36A6B2',
              }}>
              {copied ? <><Check size={14} /> LIEN COPIÉ</> : <><Link2 size={14} /> COPIER LE LIEN D&apos;INVITATION</>}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {membres.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
            {p.type === 'enfant' ? <Baby size={18} color="#36A6B2" /> : <User size={18} color="#36A6B2" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm">{p.prenom}</p>
              {modeGestion === 'partage' ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: p.statut_invitation === 'joined' ? '#D1FAE5' : '#F3F4F6',
                    color: p.statut_invitation === 'joined' ? '#065F46' : '#9CA3AF',
                  }}>
                  {p.statut_invitation === 'joined' ? 'A rejoint' : 'En attente'}
                </span>
              ) : (
                <span className="text-xs text-gray-400 capitalize">{p.type}</span>
              )}
            </div>
            <button type="button" onClick={() => handleRetirer(p)} title={`Retirer ${p.prenom}`}
              className="shrink-0 text-gray-300 hover:text-red-400 transition">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Résumé */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
        {modeGestion === 'partage' ? (
          <span>{membres.filter(p => p.statut_invitation === 'joined').length}/{membres.length} ont rejoint</span>
        ) : (
          <span>{membres.length} membre{membres.length > 1 ? 's' : ''} dans le voyage</span>
        )}
      </div>
    </div>
  )
}
