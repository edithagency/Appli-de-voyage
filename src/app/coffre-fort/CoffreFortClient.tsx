'use client'

import { useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'
import DocumentCard from './DocumentCard'
import DocumentUploadModal from '@/components/DocumentUploadModal'

type Doc = {
  id: string
  type: string
  nom_fichier: string
  storage_path: string
  date_expiration: string | null
  voyage_id: string | null
  membre: { prenom: string } | null
  _shared?: boolean
}
type Membre = { id: string; prenom: string; type: string }
type Voyage = { id: string; nom: string; emoji: string }

const poppins = Poppins({ subsets: ['latin'], weight: ['700'] })

const TYPE_LABELS: Record<string, string> = {
  passeport: 'Passeport', carte_identite: "Carte d'identité", visa: 'Visa',
  billet_avion: "Billet d'avion", reservation_hotel: 'Hôtel', assurance: 'Assurance',
  carnet_vaccins: 'Vaccins', autorisation_sortie_territoire: 'Visites',
  ordonnance: 'Ordonnance', autre: 'Autre',
}

export default function CoffreFortClient({ docs, membres, voyages }: {
  docs: Doc[]
  membres: Membre[]
  voyages: Voyage[]
}) {
  const [filtre, setFiltre] = useState('tous')
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const handler = () => setModalOpen(true)
    window.addEventListener('open-upload-modal', handler)
    return () => window.removeEventListener('open-upload-modal', handler)
  }, [])

  const voyageMap = Object.fromEntries(voyages.map(v => [v.id, v.nom]))
  const voyagesAvecDocs = voyages.filter(v => docs.some(d => d.voyage_id === v.id))
  const hasPermanents = docs.some(d => !d.voyage_id)

  const pills = [
    { key: 'tous', label: 'Tous' },
    ...(hasPermanents ? [{ key: 'permanents', label: '📌 Permanents' }] : []),
    ...voyagesAvecDocs.map(v => ({ key: v.id, label: `${v.emoji} ${v.nom}` })),
  ]

  const filteredDocs = filtre === 'tous' ? docs
    : filtre === 'permanents' ? docs.filter(d => !d.voyage_id)
    : docs.filter(d => d.voyage_id === filtre)

  const alertes = docs.filter(d => {
    if (!d.date_expiration) return false
    const diff = Math.ceil((new Date(d.date_expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return diff < 180
  })

  const presetVoyageId = filtre !== 'tous' && filtre !== 'permanents' ? filtre : undefined
  const presetPermanent = filtre === 'permanents'

  return (
    <main className="max-w-2xl mx-auto px-5 pt-4 pb-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className={`font-bold uppercase ${poppins.className}`} style={{ color: '#004850', fontSize: 30, letterSpacing: '-0.03em' }}>Mes documents</h1>
        <DocumentUploadModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          membres={membres}
          voyages={voyages}
          presetVoyageId={presetVoyageId}
          presetPermanent={presetPermanent}
        />
      </div>

      {/* Pills filtre */}
      {pills.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {pills.map(pill => (
            <button
              key={pill.key}
              onClick={() => setFiltre(pill.key)}
              className="shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold border transition"
              style={{
                background: filtre === pill.key ? '#36A6B2' : 'white',
                color: filtre === pill.key ? 'white' : '#374151',
                borderColor: filtre === pill.key ? '#36A6B2' : '#E5E7EB',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      )}

      {/* Alertes expiration */}
      {alertes.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="font-semibold text-amber-800 text-sm mb-2">
            ⚠️ {alertes.length} document{alertes.length > 1 ? 's' : ''} à renouveler
          </h2>
          <div className="flex flex-col gap-1">
            {alertes.map(d => {
              const diff = Math.ceil((new Date(d.date_expiration!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <p key={d.id} className="text-xs text-amber-700">
                  {TYPE_LABELS[d.type] ?? d.type}
                  {d.membre?.prenom ? ` (${d.membre.prenom})` : ''} — {diff < 0 ? 'Expiré' : `expire dans ${diff} jours`}
                </p>
              )
            })}
          </div>
        </div>
      )}

      {/* Liste */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">
            {filtre === 'permanents' ? '📌' : filtre !== 'tous' ? '✈️' : '🔒'}
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {filtre === 'permanents'
              ? 'Aucun document permanent'
              : filtre !== 'tous'
              ? 'Aucun document pour ce voyage'
              : 'Aucun document'}
          </h2>
          <p className="text-gray-400 text-sm">
            {filtre === 'permanents'
              ? "Ajoute tes passeports, cartes d'identité et carnets de vaccins."
              : filtre !== 'tous'
              ? 'Ajoute tes billets, réservations et assurances pour ce voyage.'
              : 'Stocke tes passeports, visas, billets et assurances en sécurité.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredDocs.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              voyageNom={filtre === 'tous' && doc.voyage_id ? voyageMap[doc.voyage_id] : undefined}
              shared={doc._shared}
            />
          ))}
        </div>
      )}
    </main>
  )
}
