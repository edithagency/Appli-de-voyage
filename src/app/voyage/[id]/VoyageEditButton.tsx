'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Share2 } from 'lucide-react'
import { modifierVoyage } from './voyage-edit-actions'
import { supprimerVoyage } from '../supprimerVoyage-action'
import { creerInvitation, retirerParticipant } from './participants-actions'
import ParticipantsPanel from './ParticipantsPanel'

type Membre = {
  id: string
  prenom: string
  type: string
  statut_invitation: 'pending' | 'lien_copie' | 'joined'
  token_invitation: string
  token_expire_at: string | null
}

type Voyage = {
  id: string
  nom: string
  destination: string
  date_depart: string
  date_retour: string
}

export default function VoyageEditButton({
  voyage, membres: membresInitiaux, modeGestion,
}: {
  voyage: Voyage
  membres: Membre[]
  modeGestion: 'organisateur' | 'partage' | 'solo'
}) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [nom, setNom] = useState(voyage.nom)
  const [destination, setDestination] = useState(voyage.destination)
  const [dateDepart, setDateDepart] = useState(voyage.date_depart)
  const [dateRetour, setDateRetour] = useState(voyage.date_retour)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [membres, setMembres] = useState(membresInitiaux)
  const [newPrenom, setNewPrenom] = useState('')
  const [newType, setNewType] = useState<'adulte' | 'enfant'>('adulte')
  const [addingMembre, setAddingMembre] = useState(false)

  const modeEffectif = modeGestion === 'solo' ? 'organisateur' : modeGestion

  async function handleAjouterMembre(prenom: string, type: 'adulte' | 'enfant') {
    if (!prenom.trim()) return
    setAddingMembre(true)
    const result = await creerInvitation(voyage.id, prenom.trim(), type)
    setAddingMembre(false)
    if (result.error || !result.membre) {
      setError(result.error ?? "Erreur lors de l'ajout du participant.")
      return
    }
    setMembres(prev => [...prev, {
      id: result.membre!.id,
      prenom: prenom.trim(),
      type,
      statut_invitation: result.membre!.statut_invitation as Membre['statut_invitation'],
      token_invitation: result.membre!.token_invitation,
      token_expire_at: result.membre!.token_expire_at,
    }])
    setNewPrenom('')
    setNewType('adulte')
    router.refresh()
  }

  function handleRetirerMembre(membre: Membre) {
    if (!confirm(`Retirer ${membre.prenom} du voyage ?`)) return
    setMembres(prev => prev.filter(p => p.id !== membre.id))
    retirerParticipant(membre.id, voyage.id).then(() => router.refresh())
  }

  async function handleSave() {
    setError(null)
    setLoading(true)
    const result = await modifierVoyage(voyage.id, {
      nom, destination, date_depart: dateDepart, date_retour: dateRetour,
    })
    if (result?.error) {
      setError(result.error)
    } else {
      setShowEdit(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Boutons sur l'image */}
      <div style={{ display: 'flex', gap: 8 }}>
        {/* Modifier */}
        <button
          onClick={() => setShowEdit(true)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}
          title="Modifier le voyage">
          <Pencil size={16} color="white" />
        </button>
        {/* Partager */}
        <button
          onClick={() => setShowShare(true)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}
          title="Partager">
          <Share2 size={16} color="white" />
        </button>
      </div>

      {/* Modal édition */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Modifier le voyage</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-300 text-2xl">×</button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom du voyage</label>
                <input value={nom} onChange={e => setNom(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#36A6B2]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Destination</label>
                <input value={destination} onChange={e => setDestination(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#36A6B2]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Départ</label>
                  <input type="date" value={dateDepart} onChange={e => setDateDepart(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Retour</label>
                  <input type="date" value={dateRetour} onChange={e => setDateRetour(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Participants</label>
                <div className="flex flex-col gap-2">
                  {membres.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <span className="text-lg">{p.type === 'enfant' ? '👶' : '🧑'}</span>
                      <span className="text-sm font-medium text-gray-800 flex-1">{p.prenom}</span>
                      <span className="text-xs text-gray-400 capitalize">{p.type}</span>
                      <button type="button" onClick={() => handleRetirerMembre(p)}
                        className="text-gray-300 hover:text-red-400 transition text-sm ml-1">
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Ajout manuel */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPrenom}
                      onChange={e => setNewPrenom(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAjouterMembre(newPrenom, newType))}
                      placeholder="Prénom"
                      className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] text-sm"
                    />
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value as 'adulte' | 'enfant')}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] text-sm"
                    >
                      <option value="adulte">Adulte</option>
                      <option value="enfant">Enfant</option>
                    </select>
                    <button
                      type="button"
                      disabled={addingMembre || !newPrenom.trim()}
                      onClick={() => handleAjouterMembre(newPrenom, newType)}
                      className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
                      style={{ background: '#36A6B2' }}
                    >
                      {addingMembre ? '...' : '+ Ajouter'}
                    </button>
                  </div>
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

              <button onClick={handleSave} disabled={loading}
                className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
                {loading ? 'Enregistrement...' : '✓ Sauvegarder'}
              </button>

              <button
                onClick={async () => {
                  if (!confirm('Supprimer définitivement ce voyage et toutes ses données ?')) return
                  setError(null)
                  const result = await supprimerVoyage(voyage.id)
                  if (result?.error) setError(result.error)
                }}
                className="w-full py-3 rounded-2xl font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition">
                🗑️ Supprimer ce voyage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal partage */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Partager ce voyage</h3>
              <button onClick={() => setShowShare(false)} className="text-gray-300 text-2xl">×</button>
            </div>

            {membres.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {modeEffectif === 'partage'
                    ? "Partage le lien à chaque participant pour qu'il rejoigne le voyage."
                    : 'Membres du groupe — tu gères tout pour eux.'}
                </p>
                <ParticipantsPanel
                  participants={membres}
                  modeGestion={modeEffectif}
                  voyageId={voyage.id}
                  showHeader={false}
                />
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-500">Ajoute d&apos;abord des participants depuis &quot;✏️ Modifier le voyage&quot;, puis partage-leur un lien d&apos;invitation ici.</p>

                <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-500 flex-1 truncate">{typeof window !== 'undefined' ? window.location.href : ''}</p>
                </div>

                <button onClick={handleCopy}
                  className="w-full py-3 rounded-2xl font-semibold text-white transition"
                  style={{ background: copied ? '#1D9E75' : 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
                  {copied ? '✓ Lien copié !' : '🔗 Copier le lien'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
