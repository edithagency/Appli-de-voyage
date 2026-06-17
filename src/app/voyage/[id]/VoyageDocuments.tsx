'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supprimerDocument, getSignedUrl } from '@/app/coffre-fort/actions'
import DocumentUploadModal from '@/components/DocumentUploadModal'

type Doc = {
  id: string
  type: string
  nom_fichier: string
  storage_path: string
  date_expiration: string | null
  voyage_id: string | null
  membre: { prenom: string } | null
}

type Membre = { id: string; prenom: string; type: string }

const TYPES = [
  { value: 'passeport', label: 'Passeport', emoji: '🛂' },
  { value: 'carte_identite', label: "Carte d'identité", emoji: '🪪' },
  { value: 'visa', label: 'Visa', emoji: '📋' },
  { value: 'billet_avion', label: "Billet d'avion", emoji: '✈️' },
  { value: 'reservation_hotel', label: 'Hôtel', emoji: '🏨' },
  { value: 'assurance', label: 'Assurance', emoji: '🛡️' },
  { value: 'carnet_vaccins', label: 'Vaccins', emoji: '💉' },
  { value: 'autorisation_sortie_territoire', label: 'Visites', emoji: '🎫' },
  { value: 'ordonnance', label: 'Ordonnance', emoji: '💊' },
  { value: 'autre', label: 'Autre', emoji: '📎' },
]

function expirationStatus(dateStr: string | null) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { color: '#DC2626', bg: '#FEE2E2', label: 'Expiré' }
  if (diff < 180) return { color: '#D97706', bg: '#FEF3C7', label: `${diff}j` }
  return { color: '#1D9E75', bg: '#D1FAE5', label: '✓ Valide' }
}

function DocItem({ doc, onDelete }: { doc: Doc; onDelete: (id: string, path: string, voyageId: string | null) => void }) {
  const [opening, setOpening] = useState(false)
  const meta = TYPES.find(t => t.value === doc.type) ?? { emoji: '📎', label: doc.type }
  const exp = expirationStatus(doc.date_expiration)

  async function handleOpen() {
    setOpening(true)
    const url = await getSignedUrl(doc.storage_path)
    if (url) window.open(url, '_blank')
    setOpening(false)
  }

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
        style={{ background: exp ? exp.bg : '#F3F4F6' }}>
        {meta.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">{meta.label}</span>
          {doc.membre && <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 text-green-700">{doc.membre.prenom}</span>}
          {doc.voyage_id
            ? <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Ce voyage</span>
            : <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Permanent</span>
          }
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">{doc.nom_fichier}</p>
        {exp && <span className="text-xs font-semibold" style={{ color: exp.color }}>{exp.label}</span>}
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={handleOpen} disabled={opening}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-base transition"
          style={{ background: '#F6F08F', color: '#147046' }}>
          {opening ? '…' : '👁️'}
        </button>
        <button onClick={() => onDelete(doc.id, doc.storage_path, doc.voyage_id)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-base bg-red-50 text-red-400 hover:bg-red-100 transition">
          🗑️
        </button>
      </div>
    </div>
  )
}

export default function VoyageDocuments({
  documents, membres, voyageId, presetType
}: {
  documents: Doc[]
  membres: Membre[]
  voyageId: string
  presetType?: { type: string; nonce: number } | null
}) {
  const router = useRouter()
  const [docs, setDocs] = useState(documents)
  useEffect(() => { setDocs(documents) }, [documents])

  const [showModal, setShowModal] = useState(false)
  const [modalPresetType, setModalPresetType] = useState<string | undefined>()

  useEffect(() => {
    if (presetType) {
      setModalPresetType(presetType.type)
      setShowModal(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetType?.nonce])

  const permanents = docs.filter(d => !d.voyage_id)
  const voyageDocs = docs.filter(d => d.voyage_id === voyageId)

  async function handleDelete(id: string, path: string, docVoyageId: string | null) {
    if (!confirm('Supprimer ce document ?')) return
    setDocs(prev => prev.filter(d => d.id !== id))
    await supprimerDocument(id, path, docVoyageId)
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">🔒 Documents</h2>
        <button onClick={() => { setModalPresetType(undefined); setShowModal(true) }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #147046, #25C490)' }}>
          <span>+</span> Ajouter
        </button>
      </div>

      <div className="px-5">
        {voyageDocs.length > 0 && (
          <div className="py-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Ce voyage</p>
            {voyageDocs.map(d => <DocItem key={d.id} doc={d} onDelete={handleDelete} />)}
          </div>
        )}
        {permanents.length > 0 && (
          <div className="py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Documents permanents</p>
            {permanents.map(d => <DocItem key={d.id} doc={d} onDelete={handleDelete} />)}
          </div>
        )}
        {docs.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-5xl mb-3">📁</div>
            <p className="text-sm text-gray-400">Aucun document pour ce voyage</p>
          </div>
        )}
      </div>

      <DocumentUploadModal
        open={showModal}
        onClose={() => setShowModal(false)}
        membres={membres}
        voyages={[{ id: voyageId, nom: 'Ce voyage' }]}
        presetVoyageId={voyageId}
        presetType={modalPresetType}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
