'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supprimerVoyage } from '@/app/voyage/supprimerVoyage-action'

export default function DeleteVoyageButton({ voyageId, voyageNom }: { voyageId: string; voyageNom: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Supprimer "${voyageNom}" définitivement ?`)) return
    setLoading(true)
    const result = await supprimerVoyage(voyageId)
    if (result?.error) {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="absolute flex items-center justify-center transition disabled:opacity-50"
      style={{ top: 12, left: 12, padding: 8 }}
      title="Supprimer le voyage">
      <X size={14} color="white" />
    </button>
  )
}
