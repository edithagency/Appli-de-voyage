'use client'

import { useState } from 'react'
import { X, Plane, Train, Bus, Car, Ship, Navigation, Building2, MapPin, Utensils, FileText, Copy, Check } from 'lucide-react'
import type { Jour, Hebergement, Transport, ActivitePlanning, Repas } from './PlanningJourSheet'

const TRANSPORT_ICONS: Record<string, typeof Plane> = {
  vol: Plane, train: Train, bus: Bus, voiture: Car, taxi: Car, bateau: Ship, autre: Navigation,
}
const TRANSPORT_LABELS: Record<string, string> = {
  vol: 'Vol', train: 'Train', bus: 'Bus', voiture: 'Voiture', taxi: 'Taxi', bateau: 'Bateau', autre: 'Transport',
}

function formatDateLongue(date: string) {
  const label = new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function texteJour(jour: Jour, index: number, h: Hebergement[], t: Transport[], a: ActivitePlanning[], r: Repas[]) {
  const lignes = [`Jour ${index + 1} — ${formatDateLongue(jour.date)}${jour.ville ? ` (${jour.ville})` : ''}`]
  for (const transport of t) {
    const label = transport.type === 'vol' ? `Vol ${transport.compagnie ?? ''} ${transport.reference ?? ''}`.trim() : TRANSPORT_LABELS[transport.type]
    const trajet = transport.depart_de && transport.arrivee_a ? ` · ${transport.depart_de} → ${transport.arrivee_a}` : ''
    lignes.push(`  ${label}${trajet}${transport.heure_depart ? ` · ${transport.heure_depart}` : ''}`)
  }
  for (const heb of h) {
    lignes.push(`  ${heb.nom}${heb.heure_checkin ? ` · Check-in ${heb.heure_checkin}` : ''}${heb.petit_dej_inclus ? ' · Petit déj inclus' : ''}`)
  }
  for (const act of [...a].sort((x, y) => (x.heure_prevue ?? '').localeCompare(y.heure_prevue ?? ''))) {
    lignes.push(`  ${act.heure_prevue ? `${act.heure_prevue} · ` : ''}${act.nom}${act.statut_reservation === 'reserve' ? ' · Réservé' : act.statut_reservation === 'a_reserver' ? ' · À réserver' : ''}`)
  }
  for (const repas of r) {
    lignes.push(`  ${repas.moment} · ${repas.nom_restaurant}${repas.reserve ? ' · Réservé' : ''}`)
  }
  if (jour.notes_libres) lignes.push(`  Notes : ${jour.notes_libres}`)
  return lignes.join('\n')
}

function RecapLigne({ icon: Icon, color, children }: { icon: typeof Plane; color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2" style={{ padding: '5px 0' }}>
      <Icon size={13} color={color} className="shrink-0 mt-0.5" />
      <span className="text-sm text-gray-700 leading-snug">{children}</span>
    </div>
  )
}

export default function PlanningRecap({
  voyageNom, jours, hebergements, transports, activites, repas, onClose,
}: {
  voyageNom: string
  jours: Jour[]
  hebergements: Hebergement[]
  transports: Transport[]
  activites: ActivitePlanning[]
  repas: Repas[]
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const parJour = (jourId: string) => ({
    h: hebergements.filter(x => x.jour_id === jourId),
    t: transports.filter(x => x.jour_id === jourId),
    a: [...activites.filter(x => x.jour_id === jourId)].sort((x, y) => (x.heure_prevue ?? '').localeCompare(y.heure_prevue ?? '')),
    r: repas.filter(x => x.jour_id === jourId),
  })

  async function copierRecap() {
    const texte = [voyageNom, '', ...jours.map((j, i) => {
      const { h, t, a, r } = parJour(j.id)
      return texteJour(j, i, h, t, a, r)
    })].join('\n\n')
    await navigator.clipboard.writeText(texte)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl flex flex-col" style={{ maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0 border-b border-gray-100">
          <p className="font-bold text-gray-900 text-lg">Récap — {voyageNom}</p>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-2">
          {jours.map((j, i) => {
            const { h, t, a, r } = parJour(j.id)
            return (
              <div key={j.id} className="mb-3">
                <div className="rounded-xl px-3.5 py-2.5 mb-2 flex items-center gap-2.5" style={{ background: '#F8F9FA' }}>
                  <p className="font-bold text-gray-900" style={{ fontSize: 14 }}>Jour {i + 1} — {formatDateLongue(j.date)}</p>
                  {j.ville && (
                    <span className="flex items-center gap-1 ml-auto shrink-0">
                      <MapPin size={11} color="#9CA3AF" />
                      <span className="text-xs text-gray-400">{j.ville}</span>
                    </span>
                  )}
                </div>

                {t.map(transport => (
                  <RecapLigne key={transport.id} icon={TRANSPORT_ICONS[transport.type] ?? Car} color="#36A6B2">
                    {transport.type === 'vol' ? `Vol ${transport.compagnie ?? ''} ${transport.reference ?? ''}`.trim() : TRANSPORT_LABELS[transport.type]}
                    {transport.depart_de && ` · ${transport.depart_de} → ${transport.arrivee_a}`}
                    {transport.heure_depart && ` · ${transport.heure_depart}`}
                  </RecapLigne>
                ))}

                {h.map(heb => (
                  <RecapLigne key={heb.id} icon={Building2} color="#534AB7">
                    {heb.nom}
                    {heb.check_in && ' · Check-in'}
                    {heb.check_out && ' · Check-out'}
                    {heb.petit_dej_inclus && ' · Petit déj inclus'}
                    {heb.heure_checkin && ` · ${heb.heure_checkin}`}
                  </RecapLigne>
                ))}

                {a.map(act => (
                  <RecapLigne key={act.id} icon={MapPin} color="#1D9E75">
                    {act.heure_prevue && `${act.heure_prevue} · `}{act.nom}
                    {act.statut_reservation === 'reserve' && <Check size={12} className="inline ml-1" color="#1D9E75" />}
                    {act.statut_reservation === 'a_reserver' && ' · À réserver'}
                  </RecapLigne>
                ))}

                {r.map(repas => (
                  <RecapLigne key={repas.id} icon={Utensils} color="#E86B3A">
                    <span className="capitalize">{repas.moment}</span> · {repas.nom_restaurant}
                    {repas.reserve && <Check size={12} className="inline ml-1" color="#E86B3A" />}
                  </RecapLigne>
                ))}

                {j.notes_libres && (
                  <RecapLigne icon={FileText} color="#9CA3AF">{j.notes_libres}</RecapLigne>
                )}
              </div>
            )
          })}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button onClick={copierRecap}
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 text-white"
            style={{ background: copied ? '#1D9E75' : '#36A6B2' }}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copié' : 'Copier le récap'}
          </button>
        </div>
      </div>
    </div>
  )
}
