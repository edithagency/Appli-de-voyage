'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import DeviseGenerique from './DeviseGenerique'
import TailleConverter from './TailleConverter'
import DecalageHoraire from './DecalageHoraire'
import ReglesBagages from './ReglesBagages'
import ComparateurCartes from './ComparateurCartes'
import TrousseMedicale from './TrousseMedicale'
import PhrasesEssentielles from './PhrasesEssentielles'
import NumerosUrgence from './NumerosUrgence'
import EtSiPartaisDemain from './EtSiPartaisDemain'
import PermisGuide from './PermisGuide'
import MedicamentsTraducteur from './MedicamentsTraducteur'

const OUTILS = [
  {
    id: 'devises',
    emoji: '💱',
    titre: 'Convertisseur de devises',
    description: 'Convertit instantanément entre 28 devises mondiales',
    premium: false,
  },
  {
    id: 'tailles',
    emoji: '👕',
    titre: 'Convertisseur de tailles',
    description: 'Chaussures et vêtements EU / UK / US / IT',
    premium: false,
  },
  {
    id: 'horaire',
    emoji: '🕐',
    titre: 'Décalage horaire',
    description: 'Heure locale en temps réel dans 30 villes',
    premium: false,
  },
  {
    id: 'bagages',
    emoji: '🧳',
    titre: 'Règles bagages',
    description: 'Dimensions et poids par compagnie aérienne',
    premium: false,
  },
  {
    id: 'cartes',
    emoji: '💳',
    titre: 'Comparateur cartes bancaires',
    description: "Frais à l'étranger · Revolut, Wise, N26...",
    premium: false,
  },
  {
    id: 'medical',
    emoji: '💊',
    titre: 'Trousse médicale',
    description: 'Liste médicaments par destination et profil',
    premium: false,
  },
  {
    id: 'phrases',
    emoji: '🗣️',
    titre: 'Phrases essentielles',
    description: '20 phrases vitales dans la langue locale',
    premium: false,
  },
  {
    id: 'urgences',
    emoji: '🚨',
    titre: "Numéros d'urgence",
    description: 'Police · Ambulance · Ambassade par pays',
    premium: false,
  },
  {
    id: 'demain',
    emoji: '⚡',
    titre: 'Et si je partais demain ?',
    description: 'Vérifier ma préparation instantanément',
    premium: false,
  },
  {
    id: 'permis',
    emoji: '🚗',
    titre: 'Guide permis international',
    description: "Validité du permis FR par pays + comment obtenir un permis international",
    premium: true,
  },
  {
    id: 'medicaments',
    emoji: '💉',
    titre: 'Traducteur de médicaments',
    description: 'Nom générique + équivalents locaux par pays',
    premium: true,
  },
]

export default function OutilsPage() {
  const [openTool, setOpenTool] = useState<string | null>(null)

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF', paddingBottom: 100 }}>
      <header className="bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto pt-5 sm:pt-11 pb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-bon-vol.png" alt="Bon Vol" className="h-7" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {OUTILS.map(outil => {
          const isOpen = openTool === outil.id
          return (
            <div key={outil.id}
              onClick={() => setOpenTool(outil.id)}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #F0F0F0',
                cursor: 'pointer',
              }}>
              <span style={{ fontSize: 36 }}>{outil.emoji}</span>

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', margin: 0 }}>
                  {outil.titre}
                </p>
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: '2px 0 0' }}>
                  {outil.description}
                </p>
              </div>

              {outil.premium && (
                <span style={{
                  background: '#FEF3C7',
                  color: '#B45309',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 9999,
                  whiteSpace: 'nowrap',
                }}>Premium</span>
              )}

              {isOpen ? <ChevronUp size={18} color="#D1D5DB" /> : <ChevronDown size={18} color="#D1D5DB" />}
            </div>
          )
        })}
      </main>

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed',
        bottom: openTool ? 0 : '-100%',
        left: 0, right: 0,
        zIndex: 50,
        background: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: '24px 20px 100px',
        maxHeight: '85vh',
        overflowY: 'auto',
        transition: 'bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          width: 40, height: 4,
          background: '#E5E7EB',
          borderRadius: 9999,
          margin: '0 auto 20px',
        }} />
        <button onClick={() => setOpenTool(null)} style={{
          position: 'absolute', top: 16, right: 16,
          background: '#F3F4F6', borderRadius: '50%',
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <X size={16} color="#6B7280" />
        </button>

        {openTool === 'devises' && <DeviseGenerique />}
        {openTool === 'tailles' && <TailleConverter />}
        {openTool === 'horaire' && <DecalageHoraire />}
        {openTool === 'bagages' && <ReglesBagages />}
        {openTool === 'cartes' && <ComparateurCartes />}
        {openTool === 'medical' && <TrousseMedicale />}
        {openTool === 'phrases' && <PhrasesEssentielles />}
        {openTool === 'urgences' && <NumerosUrgence />}
        {openTool === 'demain' && <EtSiPartaisDemain />}
        {openTool === 'permis' && <PermisGuide />}
        {openTool === 'medicaments' && <MedicamentsTraducteur />}
      </div>
    </div>
  )
}
