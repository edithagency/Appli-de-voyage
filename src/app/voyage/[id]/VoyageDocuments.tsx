'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DocumentUploadModal from '@/components/DocumentUploadModal'
import DocumentCard from '@/app/coffre-fort/DocumentCard'

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

export default function VoyageDocuments({
  documents, membres, voyageId, presetType
}: {
  documents: Doc[]
  membres: Membre[]
  voyageId: string
  presetType?: { type: string; nonce: number } | null
}) {
  const router = useRouter()

  const [showModal, setShowModal] = useState(false)
  const [modalPresetType, setModalPresetType] = useState<string | undefined>()

  useEffect(() => {
    if (presetType) {
      setModalPresetType(presetType.type)
      setShowModal(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetType?.nonce])

  const permanents = documents.filter(d => !d.voyage_id)
  const voyageDocs = documents.filter(d => d.voyage_id === voyageId)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">🔒 Documents</h2>
        <button onClick={() => { setModalPresetType(undefined); setShowModal(true) }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #36A6B2, #8BD4DC)' }}>
          <span>+</span> Ajouter
        </button>
      </div>

      <div className="px-5">
        {voyageDocs.length > 0 && (
          <div className="py-4 flex flex-col gap-2">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Ce voyage</p>
            {voyageDocs.map(d => <DocumentCard key={d.id} doc={d} />)}
          </div>
        )}
        {permanents.length > 0 && (
          <div className="py-4 flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Documents permanents</p>
            {permanents.map(d => <DocumentCard key={d.id} doc={d} />)}
          </div>
        )}
        {documents.length === 0 && (
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
