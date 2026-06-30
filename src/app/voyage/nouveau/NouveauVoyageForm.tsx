'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Link2, User, Baby, Check, X } from 'lucide-react'
import { creerVoyage } from '../actions'

type Pays = { code: string; nom_fr: string; emoji: string | null }

type Participant = {
  prenom: string
  type: 'adulte' | 'enfant'
}

const MODE_GESTION = [
  {
    value: 'organisateur',
    label: 'Je gère tout',
    icon: Target,
    desc: "Je m'occupe des valises, documents et dépenses pour tout le groupe.",
  },
  {
    value: 'partage',
    label: 'On gère ensemble',
    icon: Link2,
    desc: 'Chacun gère sa valise. Je partage un lien à chaque participant.',
  },
]

export default function NouveauVoyageForm({ pays, onClose }: {
  pays: Pays[]
  onClose?: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  // Step 1 — infos de base
  const [search, setSearch] = useState('')
  const [selectedPays, setSelectedPays] = useState<Pays | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [nom, setNom] = useState('')
  const [dateDepart, setDateDepart] = useState('')
  const [dateRetour, setDateRetour] = useState('')

  // Step 2 — participants
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newPrenom, setNewPrenom] = useState('')
  const [newType, setNewType] = useState<'adulte' | 'enfant'>('adulte')

  // Step 3 — mode de gestion
  const [modeGestion, setModeGestion] = useState<'organisateur' | 'partage' | ''>('')

  const paysFiltered = pays.filter(p =>
    p.nom_fr.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6)

  const today = new Date().toISOString().split('T')[0]
  const aDesParticipants = participants.length > 0

  function handleSelectPays(p: Pays) {
    setSelectedPays(p)
    setSearch(p.nom_fr)
    setShowDropdown(false)
  }

  function ajouterParticipant() {
    const prenom = newPrenom.trim()
    if (!prenom) return
    setParticipants(prev => [...prev, { prenom, type: newType }])
    setNewPrenom('')
    setNewType('adulte')
  }

  function supprimerParticipant(index: number) {
    setParticipants(prev => prev.filter((_, i) => i !== index))
  }

  function validerStep1() {
    if (!nom.trim()) return setError('Le nom du voyage est requis.')
    if (!search.trim()) return setError('La destination est requise.')
    if (!dateDepart) return setError('La date de départ est requise.')
    if (!dateRetour) return setError('La date de retour est requise.')
    if (dateRetour <= dateDepart) return setError('La date de retour doit être après le départ.')
    setError(null)
    setStep(2)
  }

  function validerStep2() {
    setError(null)
    if (aDesParticipants) {
      setStep(3)
    } else {
      handleSubmit()
    }
  }

  function handleSubmit() {
    const mode = modeGestion
    if (aDesParticipants && !mode) return setError('Choisis un mode de gestion.')
    setError(null)

    startTransition(async () => {
      const result = await creerVoyage({
        nom: nom.trim(),
        destination: search.trim(),
        pays_code: selectedPays?.code ?? null,
        date_depart: dateDepart,
        date_retour: dateRetour,
        mode_gestion: aDesParticipants ? (mode as 'organisateur' | 'partage') : null,
        participants,
      })
      if (result?.error) {
        setError(result.error)
      } else if (result?.voyageId) {
        onClose?.()
        router.push(`/voyage/${result.voyageId}`)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barre de progression */}
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(step / (aDesParticipants ? 3 : 2)) * 100}%`,
            background: '#36A6B2',
          }}
        />
      </div>

      {/* ───── STEP 1 — Infos générales ───── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nom du voyage</p>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="Ex : Vacances au Japon 2025"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
            />
          </div>

          <div className="relative">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Destination</p>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true); setSelectedPays(null) }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="Rechercher un pays..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
            />
            {showDropdown && search.length > 0 && paysFiltered.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
                {paysFiltered.map(p => (
                  <button
                    key={p.code}
                    type="button"
                    onMouseDown={() => handleSelectPays(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition text-sm"
                  >
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-gray-800">{p.nom_fr}</span>
                    {selectedPays?.code === p.code && <span className="ml-auto text-[#36A6B2]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Départ</p>
              <input
                type="date"
                value={dateDepart}
                min={today}
                onChange={e => setDateDepart(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Retour</p>
              <input
                type="date"
                value={dateRetour}
                min={dateDepart || today}
                onChange={e => setDateRetour(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="button"
            onClick={validerStep1}
            className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}
          >
            CONTINUER
          </button>
        </div>
      )}

      {/* ───── STEP 2 — Qui voyage ? ───── */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Qui part avec toi ?</p>
            <p className="text-sm text-gray-400 mb-4">Si tu pars seul(e), laisse la case vide. Sinon, ajoute chaque participant.</p>

            {/* Liste des participants ajoutés */}
            {participants.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-2xl border border-blue-100">
                    {p.type === 'enfant' ? <Baby size={18} color="#36A6B2" /> : <User size={18} color="#36A6B2" />}
                    <span className="font-medium text-gray-800 flex-1 text-sm">{p.prenom}</span>
                    <span className="text-xs text-gray-400 capitalize">{p.type}</span>
                    <button
                      type="button"
                      onClick={() => supprimerParticipant(i)}
                      className="text-gray-300 hover:text-red-400 transition ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire ajout participant — adulte/enfant toujours disponible */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrenom}
                  onChange={e => setNewPrenom(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), ajouterParticipant())}
                  placeholder="Prénom"
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
                />
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as 'adulte' | 'enfant')}
                  className="shrink-0 px-3 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] transition text-sm"
                >
                  <option value="adulte">Adulte</option>
                  <option value="enfant">Enfant</option>
                </select>
              </div>
              <button
                type="button"
                onClick={ajouterParticipant}
                className="w-full px-4 py-2.5 rounded-2xl font-semibold text-white text-sm"
                style={{ background: '#36A6B2' }}
              >
                + Ajouter
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm px-1">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep(1); setError(null) }}
              className="flex-1 py-3 rounded-2xl font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 transition"
            >
              ← Retour
            </button>
            <button
              type="button"
              onClick={validerStep2}
              disabled={isPending}
              className="flex-1 py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}
            >
              {isPending ? 'Création...' : aDesParticipants ? 'CONTINUER' : '✈️ Créer le voyage'}
            </button>
          </div>
        </div>
      )}

      {/* ───── STEP 3 — Mode de gestion ───── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Comment vous organisez-vous ?</p>
            <p className="text-sm text-gray-400 mb-4">Tu pourras changer d&apos;avis plus tard.</p>
            <div className="flex flex-col gap-3">
              {MODE_GESTION.map(m => {
                const Icon = m.icon
                const active = modeGestion === m.value
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModeGestion(m.value as 'organisateur' | 'partage')}
                    className="flex items-start gap-4 p-4 rounded-2xl text-left transition"
                    style={{
                      border: `2px solid ${active ? '#36A6B2' : 'transparent'}`,
                      background: active ? '#DBEAFE' : '#F9FAFB',
                    }}
                  >
                    <Icon size={22} color="#36A6B2" className="mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-xs text-gray-800">{m.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                    </div>
                    {active && <Check size={16} color="#36A6B2" className="mt-0.5 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Récap participants */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Participants</p>
              <div className="flex flex-wrap gap-2">
                {participants.map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#36A6B2] text-xs font-semibold">
                    {p.type === 'enfant' ? <Baby size={14} /> : <User size={14} />} {p.prenom}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm px-1">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep(2); setError(null) }}
              className="flex-1 py-3 rounded-2xl font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 transition"
            >
              ← Retour
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isPending}
              className="flex-1 py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}
            >
              {isPending ? 'Création...' : '✈️ Créer le voyage'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
