'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Paperclip, X, FileText, Upload } from 'lucide-react'
import DocumentUploadModal from '@/components/DocumentUploadModal'

export type DocumentVoyage = { id: string; nom_fichier: string; type: string }

export default function LienDocument({
  voyageId, voyageNom, documentId, documents, onLink,
}: {
  voyageId: string
  voyageNom: string
  documentId: string | null
  documents: DocumentVoyage[]
  onLink: (id: string | null) => void
}) {
  const router = useRouter()
  const [showPicker, setShowPicker] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const docLie = documents.find(d => d.id === documentId) ?? null

  return (
    <div className="mt-2.5" onClick={e => e.stopPropagation()}>
      {docLie ? (
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: '#EEF2FF' }}>
          <Paperclip size={13} color="#534AB7" />
          <span className="text-xs flex-1 truncate" style={{ color: '#534AB7' }}>{docLie.nom_fichier}</span>
          <button onClick={() => onLink(null)} className="text-gray-400 hover:text-gray-600 shrink-0"><X size={13} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
          <Paperclip size={13} /> Lier un document
        </button>
      )}

      {showPicker && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowPicker(false)}>
          <div className="bg-white rounded-t-3xl w-full p-5 max-h-[60vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <p className="font-bold text-gray-900 mb-4" style={{ fontSize: 16 }}>Choisir un document</p>

            {documents.length === 0 && (
              <p className="text-sm text-gray-400 mb-3">Aucun document pour ce voyage pour le moment.</p>
            )}

            <div className="flex flex-col">
              {documents.map(doc => (
                <button key={doc.id} type="button"
                  onClick={() => { onLink(doc.id); setShowPicker(false) }}
                  className="flex items-center gap-2.5 py-2.5 border-b border-gray-100 text-left last:border-0">
                  <FileText size={16} color="#534AB7" className="shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{doc.nom_fichier}</p>
                    <p className="text-xs text-gray-400">{doc.type}</p>
                  </div>
                </button>
              ))}
            </div>

            <button type="button" onClick={() => setShowUpload(true)}
              className="w-full py-3 rounded-xl mt-3 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ border: '1.5px dashed #D1D5DB', color: '#6B7280' }}>
              <Upload size={15} /> Uploader un nouveau document
            </button>
          </div>
        </div>
      )}

      <DocumentUploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        membres={[]}
        voyages={[{ id: voyageId, nom: voyageNom }]}
        presetVoyageId={voyageId}
        presetPermanent={false}
        onSuccess={() => { setShowUpload(false); router.refresh() }}
      />
    </div>
  )
}
