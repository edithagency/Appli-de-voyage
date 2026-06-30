'use client'

import { useEffect, useState } from 'react'
import ModalShell from '@/components/ModalShell'
import NouveauVoyageForm from '../voyage/nouveau/NouveauVoyageForm'

type Pays = { code: string; nom_fr: string; emoji: string | null }

export default function NouveauVoyageModal({ pays }: { pays: Pays[] }) {
  const [open, setOpen] = useState(false)
  // Le step vit ici (pas dans NouveauVoyageForm) pour piloter la flèche retour de l'en-tête.
  // NouveauVoyageForm se démonte à la fermeture (ModalShell ne rend pas ses children quand
  // open=false), mais ce composant-ci ne se démonte jamais : il faut donc remettre step à 1
  // nous-mêmes à chaque ouverture/fermeture, sinon une réouverture reprendrait à la dernière étape.
  const [step, setStep] = useState(1)

  useEffect(() => {
    function handler() { setStep(1); setOpen(true) }
    window.addEventListener('open-trip-modal', handler)
    return () => window.removeEventListener('open-trip-modal', handler)
  }, [])

  function handleClose() {
    setOpen(false)
    setStep(1)
  }

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      title="Ajouter un voyage"
    >
      <NouveauVoyageForm pays={pays} onClose={handleClose} step={step} setStep={setStep} />
    </ModalShell>
  )
}
