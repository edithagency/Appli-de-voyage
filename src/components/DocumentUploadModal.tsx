'use client'

import { useState, useEffect } from 'react'
import {
  IdCard, BookUser, FileCheck2, Plane, Building2, Shield, Syringe,
  Ticket, Pill, Paperclip, Pin, Check, Camera,
} from 'lucide-react'
import { uploadDocument } from '@/app/coffre-fort/actions'
import ModalShell from './ModalShell'

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
  const [type, setType] = useState(presetType ?? '')
  const [membreId, setMembreId] = useState('tous')
  // null = rien choisi : on ne présélectionne jamais "Permanent" ni "Un voyage",
  // même si presetVoyageId/presetPermanent donnent un indice de contexte.
  const [permanent, setPermanent] = useState<boolean | null>(presetPermanent ?? null)
  const [voyageId, setVoyageId] = useState(presetVoyageId ?? voyages[0]?.id ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Réinitialise tout à chaque ouverture : sans ça, React garde le state du composant
  // (il n'est jamais démonté, juste rendu en null) et une fermeture/réouverture rouvrait
  // sur la dernière sélection au lieu d'un formulaire vierge.
  useEffect(() => {
    if (!open) return
    setType(presetType ?? '')
    setMembreId('tous')
    setPermanent(presetPermanent ?? null)
    setVoyageId(presetVoyageId ?? voyages[0]?.id ?? '')
    setFile(null)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function handleTypeChange(t: string) {
    setType(t)
    // Si pas de voyage imposé, les types personnels basculent en permanent
    if (!presetVoyageId && TYPES_PERMANENTS.includes(t)) setPermanent(true)
  }

  function handleFilePick(f: File | undefined) {
    if (f && f.size > 10 * 1024 * 1024) {
      setError('Fichier trop lourd (max 10 Mo).')
      setFile(null)
      return
    }
    setError(null)
    setFile(f ?? null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!type) {
      setError('Choisis un type de document.')
      return
    }
    if (!file) {
      setError('Sélectionne un fichier ou prends une photo.')
      return
    }
    // S'il n'y a aucun voyage à proposer, le document est forcément permanent (rien à choisir).
    const isPermanent = voyages.length === 0 ? true : permanent
    if (isPermanent === null) {
      setError('Choisis Permanent ou un voyage.')
      return
    }
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set('file', file)

    // Gérer voyage_id via état (pas via le formulaire HTML)
    if (isPermanent || !voyageId) {
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
  // "Pour qui ?" ne s'affiche que pour un document de voyage (un permanent est forcément pour toi) ;
  // dans ce cas, ne propose que les participants de CE voyage.
  // (les membres sans voyage_id viennent d'un contexte déjà scopé à un seul voyage : pas de filtrage à faire)
  const membresDisponibles = membres.filter(m => m.voyage_id == null || m.voyage_id === voyageId)

  return (
    <ModalShell open={open} onClose={onClose} title="Ajouter un document">
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
          {file ? (
            <label
              className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-dashed cursor-pointer transition-all"
              style={{ borderColor: '#EAB308', background: '#FFFDD8' }}
            >
              <Check size={28} color="#CA8A04" />
              <span className="text-sm text-gray-500 text-center">{file.name}</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,image/*" className="hidden"
                onChange={e => handleFilePick(e.target.files?.[0])} />
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <label
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-dashed cursor-pointer transition-all"
                style={{ borderColor: '#E5E7EB', background: '#FAFAFA' }}
              >
                <Paperclip size={24} color="#9CA3AF" />
                <span className="text-xs text-gray-500 text-center">Ajouter un fichier</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                  onChange={e => handleFilePick(e.target.files?.[0])} />
              </label>
              <label
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-dashed cursor-pointer transition-all"
                style={{ borderColor: '#E5E7EB', background: '#FAFAFA' }}
              >
                <Camera size={24} color="#9CA3AF" />
                <span className="text-xs text-gray-500 text-center">Prendre une photo</span>
                <input type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => handleFilePick(e.target.files?.[0])} />
              </label>
            </div>
          )}
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
                  borderColor: permanent === true ? '#36A6B2' : '#E5E7EB',
                  background: permanent === true ? '#DBEAFE' : 'white',
                  color: permanent === true ? '#36A6B2' : '#9CA3AF',
                }}>
                <Pin size={14} /> Permanent
              </button>
              <button type="button" onClick={() => { setPermanent(false); setMembreId('tous') }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition"
                style={{
                  borderColor: permanent === false ? '#36A6B2' : '#E5E7EB',
                  background: permanent === false ? '#DBEAFE' : 'white',
                  color: permanent === false ? '#36A6B2' : '#9CA3AF',
                }}>
                <Plane size={14} /> {singleVoyage ? voyages[0].nom : 'Un voyage'}
              </button>
            </div>
            {/* Dropdown voyage uniquement si plusieurs choix */}
            {permanent === false && !singleVoyage && (
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

        {/* Pour qui — uniquement pour un document de voyage : un permanent est forcément pour toi */}
        {permanent === false && membresDisponibles.length > 0 && (
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
          {loading ? 'Enregistrement…' : 'ENREGISTRER'}
        </button>
      </form>
    </ModalShell>
  )
}
