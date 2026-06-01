'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { modifierVoyage } from './voyage-edit-actions'
import { supprimerVoyage } from '../supprimerVoyage-action'
import { createClient } from '@/lib/supabase/client'

type Membre = { id: string; prenom: string; type: string }

type Voyage = {
  id: string
  nom: string
  destination: string
  date_depart: string
  date_retour: string
  membres_ids: string[]
}

export default function VoyageEditButton({
  voyage, membres
}: {
  voyage: Voyage
  membres: Membre[]
}) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [nom, setNom] = useState(voyage.nom)
  const [destination, setDestination] = useState(voyage.destination)
  const [dateDepart, setDateDepart] = useState(voyage.date_depart)
  const [dateRetour, setDateRetour] = useState(voyage.date_retour)
  const [membresIds, setMembresIds] = useState<string[]>(voyage.membres_ids ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showAddMembre, setShowAddMembre] = useState(false)
  const [newPrenom, setNewPrenom] = useState('')
  const [newDate, setNewDate] = useState('')
  const [addingMembre, setAddingMembre] = useState(false)
  const [localMembres, setLocalMembres] = useState<Membre[]>(membres)

  function toggleMembre(id: string) {
    setMembresIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  async function handleAddMembre() {
    if (!newPrenom.trim()) return
    setAddingMembre(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAddingMembre(false); return }

    const age = newDate
      ? (Date.now() - new Date(newDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      : 99
    const type = age < 18 ? 'enfant' : 'adulte'

    const { data } = await supabase.from('membres_foyer').insert({
      user_id: user.id, prenom: newPrenom, date_naissance: newDate || null, type
    }).select('id, prenom, type').single()

    if (data) {
      setLocalMembres(prev => [...prev, data])
      setMembresIds(prev => [...prev, data.id])
    }
    setNewPrenom('')
    setNewDate('')
    setShowAddMembre(false)
    setAddingMembre(false)
  }

  async function handleSave() {
    setError(null)
    setLoading(true)
    const result = await modifierVoyage(voyage.id, {
      nom, destination, date_depart: dateDepart, date_retour: dateRetour, membres_ids: membresIds
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
      <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8 }}>
        {/* Modifier */}
        <button
          onClick={() => setShowEdit(true)}
          style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, backdropFilter: 'blur(4px)' }}
          title="Modifier le voyage">
          ✏️
        </button>
        {/* Partager */}
        <button
          onClick={() => setShowShare(true)}
          style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, backdropFilter: 'blur(4px)' }}
          title="Partager">
          🔗
        </button>
      </div>

      {/* Modal édition */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Modifier le voyage</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-300 text-2xl">×</button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom du voyage</label>
                <input value={nom} onChange={e => setNom(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Destination</label>
                <input value={destination} onChange={e => setDestination(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Départ</label>
                  <input type="date" value={dateDepart} onChange={e => setDateDepart(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Retour</label>
                  <input type="date" value={dateRetour} onChange={e => setDateRetour(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Participants</label>
                <div className="flex flex-col gap-2">
                  {localMembres.map(m => (
                    <div key={m.id} onClick={() => toggleMembre(m.id)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition"
                      style={{ background: membresIds.includes(m.id) ? '#EDE9FF' : '#F9FAFB', border: `1.5px solid ${membresIds.includes(m.id) ? '#534AB7' : 'transparent'}` }}>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: membresIds.includes(m.id) ? '#534AB7' : '#D1D5DB', background: membresIds.includes(m.id) ? '#534AB7' : 'white' }}>
                        {membresIds.includes(m.id) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{m.prenom}</span>
                      <span className="text-xs text-gray-400 ml-auto capitalize">{m.type}</span>
                    </div>
                  ))}

                  {/* Ajouter un participant */}
                  {showAddMembre ? (
                    <div className="flex flex-col gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="grid grid-cols-2 gap-2">
                        <input value={newPrenom} onChange={e => setNewPrenom(e.target.value)}
                          placeholder="Prénom"
                          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={handleAddMembre} disabled={addingMembre || !newPrenom.trim()}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                          style={{ background: '#534AB7' }}>
                          {addingMembre ? '...' : '✓ Ajouter'}
                        </button>
                        <button type="button" onClick={() => setShowAddMembre(false)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-500">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowAddMembre(true)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-xs font-semibold text-gray-400 hover:border-[#534AB7] hover:text-[#534AB7] transition">
                      + Ajouter un participant
                    </button>
                  )}
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

              <button onClick={handleSave} disabled={loading}
                className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
                {loading ? 'Enregistrement...' : '✓ Sauvegarder'}
              </button>

              <button
                onClick={async () => {
                  if (!confirm('Supprimer définitivement ce voyage et toutes ses données ?')) return
                  await supprimerVoyage(voyage.id)
                }}
                className="w-full py-3 rounded-2xl font-semibold border-2 border-red-200 text-red-500 hover:bg-red-50 transition">
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
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Partager ce voyage</h3>
              <button onClick={() => setShowShare(false)} className="text-gray-300 text-2xl">×</button>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-500">Partage ce lien avec les autres voyageurs pour qu'ils puissent accéder au voyage.</p>

              <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 flex-1 truncate">{typeof window !== 'undefined' ? window.location.href : ''}</p>
              </div>

              <button onClick={handleCopy}
                className="w-full py-3 rounded-2xl font-semibold text-white transition"
                style={{ background: copied ? '#1D9E75' : 'linear-gradient(135deg, #534AB7, #6B63C8)' }}>
                {copied ? '✓ Lien copié !' : '🔗 Copier le lien'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
