'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  IdCard, BookUser, FileCheck2, Plane, Building2, Shield, Syringe,
  Ticket, Pill, Paperclip, Pin, Check, X,
} from 'lucide-react'
import { uploadDocument } from '@/app/coffre-fort/actions'

const TYPES = [
  { value: 'passeport', label: 'Passeport', icon: IdCard },
  { value: 'carte_identite', label: "Carte d'identité", icon: BookUser },
  { value: 'visa', label: 'Visa', icon: FileCheck2 },
  { value: 'billet_avion', label: "Billet d'avion", icon: Plane },
  { value: 'reservation_hotel', label: 'Hôtel', icon: Building2 },
  { value: 'assurance', label: 'Assurance', icon: Shield },
  { value: 'carnet_vaccins', label: 'Carnet de vaccins', icon: Syringe },
  { value: 'autorisation_sortie_territoire', label: 'Visites', icon: Ticket },
  { value: 'ordonnance', label: 'Ordonnance', icon: Pill },
  { value: 'autre', label: 'Autre', icon: Paperclip },
]

const TYPES_AVEC_EXPIRATION = ['passeport', 'carte_identite', 'visa', 'assurance']
// Ces types sont personnels par défaut (permanent) sauf si on est dans le contexte d'un voyage
const TYPES_PERMANENTS = ['passeport', 'carte_identite', 'carnet_vaccins']

type Membre = { id: string; prenom: string; type: string; voyage_id?: string | null }
type Voyage = { id: string; nom: string }

type Props = {
  open: boolean
  onClose: () => void
  membres: Membre[]
  voyages: Voyage[]
  presetVoyageId?: string     // pré-lie à ce voyage
  presetPermanent?: boolean   // force mode permanent
  presetType?: string         // pré-sélectionne un type (intégration checklist)
  onSuccess?: () => void
}

export default function DocumentUploadModal({
  open, onClose, membres, voyages,
  presetVoyageId, presetPermanent, presetType, onSuccess,
}: Props) {
  const defaultPermanent = presetPermanent ?? (!presetVoyageId && !voyages.length === false ? true : !presetVoyageId)

  const [type, setType] = useState(presetType ?? 'passeport')
  const [membreId, setMembreId] = useState('tous')
  const [permanent, setPermanent] = useState(defaultPermanent)
  const [voyageId, setVoyageId] = useState(presetVoyageId ?? voyages[0]?.id ?? '')
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  // Quand presetType change (ex: depuis la checklist) → mettre à jour le type
  useEffect(() => {
    if (open && presetType) setType(presetType)
  }, [open, presetType])

  // document.getElementById doit attendre le commit (effet), pas le render :
  // au tout premier rendu de l'app, #modal-root n'existe pas encore dans le DOM réel.
  useEffect(() => {
    setPortalTarget(document.getElementById('modal-root'))
  }, [])

  if (!open || !portalTarget) return null

  function handleTypeChange(t: string) {
    setType(t)
    // Si pas de voyage imposé, les types personnels basculent en permanent
    if (!presetVoyageId && TYPES_PERMANENTS.includes(t)) setPermanent(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    // Gérer voyage_id via état (pas via le formulaire HTML)
    if (permanent || !voyageId) {
      fd.delete('voyage_id')
    } else {
      fd.set('voyage_id', voyageId)
    }

    // Gérer membre_id via état
    if (membreId !== 'tous') fd.set('membre_id', membreId)
    else fd.delete('membre_id')

    const result = await uploadDocument(fd)
    if (result?.error) {
      setError(result.error)
    } else {
      onClose()
      onSuccess?.()
    }
    setLoading(false)
  }

  const needsExpiration = TYPES_AVEC_EXPIRATION.includes(type)
  const singleVoyage = voyages.length === 1
  // Pour un document lié à un voyage, ne propose que les participants de CE voyage.
  // (les membres sans voyage_id viennent d'un contexte déjà scopé à un seul voyage : pas de filtrage à faire)
  const membresDisponibles = permanent
    ? membres
    : membres.filter(m => m.voyage_id == null || m.voyage_id === voyageId)

  // Portail vers #modal-root (sibling de .phone-screen dans layout.tsx) : .phone-screen passe en
  // transform dès 640px, ce qui en fait son propre contexte d'empilement, donc un z-index posé ici
  // ne peut jamais dépasser la nav/bouton + qui vivent hors de .phone-screen. Rendre la modale au
  // même niveau qu'eux (en absolute, pas fixed) règle ça.
  return createPortal(
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-10"
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
            Ajouter un document
          </h3>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Contenu — seule zone scrollable */}
        <div className="overflow-y-auto px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input type="hidden" name="type" value={type} />

            {/* Type */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type de document</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(t => {
                  const Icon = t.icon
                  const active = type === t.value
                  return (
                    <button key={t.value} type="button" onClick={() => handleTypeChange(t.value)}
                      className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-left transition-all"
                      style={{
                        borderRadius: 18,
                        border: `2px solid ${active ? '#36A6B2' : 'transparent'}`,
                        background: active ? '#DBEAFE' : '#F9FAFB',
                        color: active ? '#36A6B2' : '#6B7280',
                      }}>
                      <Icon size={16} />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Fichier */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fichier</p>
              <label
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-dashed cursor-pointer transition-all"
                style={{ borderColor: fileName ? '#EAB308' : '#E5E7EB', background: fileName ? '#FFFDD8' : '#FAFAFA' }}
              >
                {fileName ? <Check size={28} color="#CA8A04" /> : <Paperclip size={28} color="#9CA3AF" />}
                <span className="text-sm text-gray-500 text-center">{fileName ?? 'PDF, JPG ou PNG · max 10 Mo'}</span>
                <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" required className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f && f.size > 10 * 1024 * 1024) {
                      setError('Fichier trop lourd (max 10 Mo).')
                      setFileName(null)
                      e.target.value = ''
                      return
                    }
                    setError(null)
                    setFileName(f?.name ?? null)
                  }} />
              </label>
            </div>

            {/* Nom */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nom (optionnel)</p>
              <input type="text" name="nom"
                placeholder="Ex : Hôtel Ibis Bangkok, Billets Air France…"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]" />
            </div>

            {/* Associer à : Personnel vs Voyage — d'abord, pour pouvoir filtrer "Pour qui ?" ensuite */}
            {voyages.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Associer à</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setPermanent(true); setMembreId('tous') }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition"
                    style={{
                      borderColor: permanent ? '#36A6B2' : '#E5E7EB',
                      background: permanent ? '#DBEAFE' : 'white',
                      color: permanent ? '#36A6B2' : '#9CA3AF',
                    }}>
                    <Pin size={14} /> Personnel
                  </button>
                  <button type="button" onClick={() => { setPermanent(false); setMembreId('tous') }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition"
                    style={{
                      borderColor: !permanent ? '#36A6B2' : '#E5E7EB',
                      background: !permanent ? '#DBEAFE' : 'white',
                      color: !permanent ? '#36A6B2' : '#9CA3AF',
                    }}>
                    <Plane size={14} /> {singleVoyage ? voyages[0].nom : 'Un voyage'}
                  </button>
                </div>
                {/* Dropdown voyage uniquement si plusieurs choix */}
                {!permanent && !singleVoyage && (
                  <select
                    value={voyageId}
                    onChange={e => { setVoyageId(e.target.value); setMembreId('tous') }}
                    className="w-full mt-2 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]"
                  >
                    {voyages.map(v => (
                      <option key={v.id} value={v.id}>{v.nom}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Pour qui — filtré aux participants du voyage choisi ci-dessus (ou tout le monde si Personnel) */}
            {membresDisponibles.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pour qui ?</p>
                <div className="flex flex-wrap gap-2">
                  {[{ id: 'tous', prenom: 'Tout le monde' }, ...membresDisponibles].map(m => (
                    <button key={m.id} type="button" onClick={() => setMembreId(m.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: membreId === m.id ? '#36A6B2' : '#DBEAFE',
                        color: membreId === m.id ? 'white' : '#36A6B2',
                      }}>
                      {m.prenom}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date d'expiration */}
            {needsExpiration && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date d'expiration</p>
                <input type="date" name="date_expiration"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#36A6B2]" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
              {loading ? 'Enregistrement…' : 'Enregistrer le document'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    portalTarget
  )
}
