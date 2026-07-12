'use client'

import { Fragment, useState } from 'react'
import { Plane, MapPin, FileText, LayoutGrid, Earth } from 'lucide-react'
import PlanningJourSheet, {
  type Jour, type Hebergement, type Transport, type ActivitePlanning, type Repas, type ActiviteFavorite, type JourSpecial,
} from './PlanningJourSheet'
import PlanningRecap from './PlanningRecap'
import type { DocumentVoyage } from './LienDocument'

function formatDateJourMois(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function PlanningSection({
  voyageId, voyageNom, jours, hebergements, transports, activites, repas, activitesFavorites,
  jourDepart, jourRetour, documentsVoyage,
}: {
  voyageId: string
  voyageNom: string
  jours: Jour[]
  hebergements: Hebergement[]
  transports: Transport[]
  activites: ActivitePlanning[]
  repas: Repas[]
  activitesFavorites: ActiviteFavorite[]
  jourDepart: JourSpecial
  jourRetour: JourSpecial
  documentsVoyage: DocumentVoyage[]
}) {
  const [openJourId, setOpenJourId] = useState<string | null>(null)
  const [showRecap, setShowRecap] = useState(false)

  const openJourIndex = jours.findIndex(j => j.id === openJourId)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button onClick={() => setShowRecap(true)}
          className="py-2 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition"
          style={{ background: '#F0FAFA', border: '1px solid #36A6B2', color: '#36A6B2' }}>
          <FileText size={14} /> Récap complet
        </button>
        <div className="flex items-center gap-1.5">
          <button className="flex items-center justify-center rounded-full p-2 transition"
            style={{ background: '#F0FAFA', border: '1px solid #36A6B2', color: '#36A6B2' }}>
            <LayoutGrid size={16} />
          </button>
          <button className="flex items-center justify-center rounded-full p-2 transition"
            style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', color: '#9CA3AF' }}>
            <Earth size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {jours.map((jour, index) => {
          const h = hebergements.filter(x => x.jour_id === jour.id)
          const t = transports.filter(x => x.jour_id === jour.id)
          const a = activites.filter(x => x.jour_id === jour.id)
          const r = repas.filter(x => x.jour_id === jour.id)
          const total = h.length + t.length + a.length + r.length
          const estPremierJour = index === 0
          const estDernierJour = index === jours.length - 1
          const villePrecedente = index > 0 ? jours[index - 1].ville : null
          const changementVille = villePrecedente && jour.ville && villePrecedente !== jour.ville

          return (
            <Fragment key={jour.id}>
              {changementVille && (
                <div className="col-span-2 flex items-center justify-center gap-2 py-1">
                  <div className="shrink-0" style={{ width: 20, height: 1, background: '#E5E7EB' }} />
                  <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: '#F8F9FA' }}>
                    <Plane size={11} color="#6B7280" />
                    <span className="text-xs font-medium text-gray-500">{villePrecedente} → {jour.ville}</span>
                  </div>
                  <div className="shrink-0" style={{ width: 20, height: 1, background: '#E5E7EB' }} />
                </div>
              )}

              <div
                onClick={() => setOpenJourId(jour.id)}
                className="relative rounded-xl cursor-pointer bg-white border border-gray-200 hover:border-gray-300 overflow-hidden transition-colors flex flex-col items-center justify-center gap-1 px-2 py-3.5"
                style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                {estPremierJour && (
                  <span className="absolute top-1.5 left-1.5 text-white font-bold rounded-full px-1.5 py-0.5" style={{ background: '#36A6B2', fontSize: 9 }}>DÉPART</span>
                )}
                {estDernierJour && !estPremierJour && (
                  <span className="absolute top-1.5 left-1.5 text-white font-bold rounded-full px-1.5 py-0.5" style={{ background: '#534AB7', fontSize: 9 }}>RETOUR</span>
                )}
                {total > 0 && (
                  <span className="absolute top-1.5 right-1.5 rounded-full" style={{ width: 6, height: 6, background: '#36A6B2' }} />
                )}
                <p className="text-xs font-bold uppercase text-center text-[#004850]" style={{ letterSpacing: '-0.02em' }}>Jour {index + 1}</p>
                <p className="text-[11px] text-gray-400 italic capitalize text-center">{formatDateJourMois(jour.date)}</p>
                {jour.ville && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5 max-w-full truncate">
                    <MapPin size={10} className="shrink-0" />{jour.ville}
                  </span>
                )}
              </div>
            </Fragment>
          )
        })}
      </div>

      {openJourId && openJourIndex !== -1 && (
        <PlanningJourSheet
          voyageId={voyageId}
          voyageNom={voyageNom}
          jour={jours[openJourIndex]}
          jourIndex={openJourIndex}
          estPremierJour={openJourIndex === 0}
          estDernierJour={openJourIndex === jours.length - 1}
          jourDepart={jourDepart}
          jourRetour={jourRetour}
          hebergements={hebergements.filter(h => h.jour_id === openJourId)}
          transports={transports.filter(t => t.jour_id === openJourId)}
          activites={activites.filter(a => a.jour_id === openJourId)}
          repas={repas.filter(r => r.jour_id === openJourId)}
          activitesFavorites={activitesFavorites}
          documentsVoyage={documentsVoyage}
          onClose={() => setOpenJourId(null)}
        />
      )}

      {showRecap && (
        <PlanningRecap
          voyageNom={voyageNom}
          jours={jours}
          hebergements={hebergements}
          transports={transports}
          activites={activites}
          repas={repas}
          onClose={() => setShowRecap(false)}
        />
      )}
    </div>
  )
}
