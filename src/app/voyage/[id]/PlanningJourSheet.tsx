'use client'

import { useState } from 'react'
import { Plane, Train, Bus, Car, Ship, Navigation, Building2, MapPin, Utensils, FileText, Check } from 'lucide-react'
import {
  modifierJour, mettreAJourJourSpecial,
  ajouterHebergement, modifierHebergement, supprimerHebergement,
  ajouterTransport, modifierTransport, supprimerTransport,
  ajouterActivitePlanning, modifierActivitePlanning, supprimerActivitePlanning,
  ajouterRepas, modifierRepas, supprimerRepas,
} from './planning-actions'
import LienDocument, { type DocumentVoyage } from './LienDocument'
import ModalShell from '@/components/ModalShell'
import CityAutocomplete, { type LieuResult } from '@/components/CityAutocomplete'

export type Jour = { id: string; date: string; ville: string | null; ville_lat: number | null; ville_lon: number | null; resume_jour: string | null; notes_libres: string | null }
export type Hebergement = {
  id: string; jour_id: string; nom: string; adresse: string | null; numero_confirmation: string | null
  type_hebergement: string | null; heure_checkin: string | null; heure_checkout: string | null
  petit_dej_inclus: boolean; check_in: boolean; check_out: boolean; document_id: string | null
}
export type Transport = {
  id: string; jour_id: string; type: string; compagnie: string | null; reference: string | null
  heure_depart: string | null; heure_arrivee: string | null; depart_de: string | null; arrivee_a: string | null
  aeroport_depart: string | null; terminal_depart: string | null; aeroport_arrivee: string | null; terminal_arrivee: string | null
  heure_limite_enregistrement: string | null; document_id: string | null
}
export type ActivitePlanning = {
  id: string; jour_id: string; nom: string; lieu: string | null; adresse: string | null
  heure_prevue: string | null; prix_estime: string | null
  statut_reservation: 'libre' | 'a_reserver' | 'reserve'
  activite_favori_id: string | null; document_id: string | null
  ajouteurPrenom: string | null; ajouteurEmoji: string | null
}
export type Repas = { id: string; jour_id: string; nom_restaurant: string; moment: 'matin' | 'midi' | 'soir'; reserve: boolean; document_id: string | null }
export type JourSpecial = {
  aeroport_depart: string | null; terminal_depart: string | null
  aeroport_arrivee: string | null; terminal_arrivee: string | null
  heure_depart: string | null
} | null
export type ActiviteFavorite = { id: string; titre: string; ville: string }

type TransportType = 'vol' | 'train' | 'bus' | 'voiture' | 'taxi' | 'bateau' | 'autre'

const TRANSPORT_TYPES: { value: TransportType; label: string; icon: typeof Plane }[] = [
  { value: 'vol', label: 'Vol', icon: Plane },
  { value: 'train', label: 'Train', icon: Train },
  { value: 'bus', label: 'Bus', icon: Bus },
  { value: 'voiture', label: 'Voiture', icon: Car },
  { value: 'taxi', label: 'Taxi', icon: Car },
  { value: 'bateau', label: 'Bateau', icon: Ship },
  { value: 'autre', label: 'Autre', icon: Navigation },
]

function formatDateLongue(date: string) {
  const label = new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36A6B2] mb-2'
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'

function Section({ icon: Icon, color, title, action, children }: { icon: typeof Plane; color: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} color={color} />
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// ───────────────────────────── Sections spéciales départ / retour ─────────────────────────────

function SectionSpeciale({
  type, voyageId, jourSpecial,
}: {
  type: 'depart' | 'retour'
  voyageId: string
  jourSpecial: JourSpecial
}) {
  const [form, setForm] = useState({
    aeroport_depart: jourSpecial?.aeroport_depart ?? '',
    terminal_depart: jourSpecial?.terminal_depart ?? '',
    aeroport_arrivee: jourSpecial?.aeroport_arrivee ?? '',
    terminal_arrivee: jourSpecial?.terminal_arrivee ?? '',
    heure_depart: jourSpecial?.heure_depart ?? '',
  })
  const isDepart = type === 'depart'
  const color = isDepart ? '#36A6B2' : '#534AB7'

  function handleBlur() {
    mettreAJourJourSpecial(voyageId, type, {
      aeroport_depart: form.aeroport_depart || null,
      terminal_depart: form.terminal_depart || null,
      aeroport_arrivee: form.aeroport_arrivee || null,
      terminal_arrivee: form.terminal_arrivee || null,
      heure_depart: form.heure_depart || null,
    })
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: isDepart ? '#F0FAFA' : '#F5F4FF', border: `1px solid ${isDepart ? '#CBE8EB' : '#DCD9F5'}` }}>
      <div className="flex items-center gap-2 mb-3.5">
        <Plane size={16} color={color} />
        <p className="font-bold text-sm" style={{ color }}>{isDepart ? 'Départ' : 'Retour'}</p>
      </div>

      <input className={inputCls} placeholder="Aéroport de départ (ex: Paris CDG)" value={form.aeroport_depart} onChange={e => setForm(f => ({ ...f, aeroport_depart: e.target.value }))} onBlur={handleBlur} />
      <input className={inputCls} placeholder="Terminal (ex: Terminal 2E)" value={form.terminal_depart} onChange={e => setForm(f => ({ ...f, terminal_depart: e.target.value }))} onBlur={handleBlur} />
      <input className={inputCls} placeholder="Aéroport d'arrivée" value={form.aeroport_arrivee} onChange={e => setForm(f => ({ ...f, aeroport_arrivee: e.target.value }))} onBlur={handleBlur} />
      <input className={inputCls} placeholder="Terminal d'arrivée" value={form.terminal_arrivee} onChange={e => setForm(f => ({ ...f, terminal_arrivee: e.target.value }))} onBlur={handleBlur} />

      <div>
        <label className={labelCls}>Heure de départ</label>
        <input type="time" className={inputCls} value={form.heure_depart} onChange={e => setForm(f => ({ ...f, heure_depart: e.target.value }))} onBlur={handleBlur} />
      </div>
    </div>
  )
}

// ───────────────────────────── Items éditables ─────────────────────────────

function TransportItem({ transport, voyageId, documents, voyageNom, onDelete }: {
  transport: Transport; voyageId: string; documents: DocumentVoyage[]; voyageNom: string; onDelete: () => void
}) {
  const [form, setForm] = useState({
    compagnie: transport.compagnie ?? '', reference: transport.reference ?? '',
    depart_de: transport.depart_de ?? '', arrivee_a: transport.arrivee_a ?? '',
    heure_depart: transport.heure_depart ?? '', heure_arrivee: transport.heure_arrivee ?? '',
    aeroport_depart: transport.aeroport_depart ?? '', terminal_depart: transport.terminal_depart ?? '',
    aeroport_arrivee: transport.aeroport_arrivee ?? '', terminal_arrivee: transport.terminal_arrivee ?? '',
    heure_limite_enregistrement: transport.heure_limite_enregistrement ?? '',
  })

  function maj(champ: keyof typeof form, valeur: string) {
    setForm(f => ({ ...f, [champ]: valeur }))
  }
  function save() {
    modifierTransport(transport.id, voyageId, {
      compagnie: form.compagnie || null, reference: form.reference || null,
      depart_de: form.depart_de || null, arrivee_a: form.arrivee_a || null,
      heure_depart: form.heure_depart || null, heure_arrivee: form.heure_arrivee || null,
      aeroport_depart: form.aeroport_depart || null, terminal_depart: form.terminal_depart || null,
      aeroport_arrivee: form.aeroport_arrivee || null, terminal_arrivee: form.terminal_arrivee || null,
      heure_limite_enregistrement: form.heure_limite_enregistrement || null,
    })
  }

  return (
    <div className="rounded-xl p-3" style={{ background: '#F8F9FA' }}>
      <div className="flex gap-1.5 mb-2.5 flex-wrap">
        {TRANSPORT_TYPES.map(t => (
          <button key={t.value} type="button" onClick={() => modifierTransport(transport.id, voyageId, { type: t.value })}
            className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition"
            style={{
              border: transport.type === t.value ? '2px solid #36A6B2' : '1px solid #E5E7EB',
              background: transport.type === t.value ? '#F0FAFA' : 'white',
              color: transport.type === t.value ? '#36A6B2' : '#6B7280',
            }}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input className={inputCls} placeholder="De" value={form.depart_de} onChange={e => maj('depart_de', e.target.value)} onBlur={save} />
        <input className={inputCls} placeholder="À" value={form.arrivee_a} onChange={e => maj('arrivee_a', e.target.value)} onBlur={save} />
        <input type="time" className={inputCls} value={form.heure_depart} onChange={e => maj('heure_depart', e.target.value)} onBlur={save} />
        <input type="time" className={inputCls} value={form.heure_arrivee} onChange={e => maj('heure_arrivee', e.target.value)} onBlur={save} />
      </div>

      {transport.type === 'vol' && (
        <>
          <input className={inputCls} placeholder="Compagnie (ex: Air France)" value={form.compagnie} onChange={e => maj('compagnie', e.target.value)} onBlur={save} />
          <input className={inputCls} placeholder="Numéro de vol (ex: AF165)" value={form.reference} onChange={e => maj('reference', e.target.value)} onBlur={save} />
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Aéroport départ" value={form.aeroport_depart} onChange={e => maj('aeroport_depart', e.target.value)} onBlur={save} />
            <input className={inputCls} placeholder="Terminal départ" value={form.terminal_depart} onChange={e => maj('terminal_depart', e.target.value)} onBlur={save} />
            <input className={inputCls} placeholder="Aéroport arrivée" value={form.aeroport_arrivee} onChange={e => maj('aeroport_arrivee', e.target.value)} onBlur={save} />
            <input className={inputCls} placeholder="Terminal arrivée" value={form.terminal_arrivee} onChange={e => maj('terminal_arrivee', e.target.value)} onBlur={save} />
          </div>
          <div>
            <label className={labelCls}>Heure limite enregistrement</label>
            <input type="time" className={inputCls} value={form.heure_limite_enregistrement} onChange={e => maj('heure_limite_enregistrement', e.target.value)} onBlur={save} />
          </div>
        </>
      )}

      {transport.type !== 'vol' && (
        <input className={inputCls} placeholder="Référence / numéro de confirmation" value={form.reference} onChange={e => maj('reference', e.target.value)} onBlur={save} />
      )}

      <LienDocument voyageId={voyageId} voyageNom={voyageNom} documentId={transport.document_id} documents={documents}
        onLink={id => modifierTransport(transport.id, voyageId, { document_id: id })} />

      <button onClick={onDelete} className="text-xs mt-2.5 font-semibold" style={{ color: '#E24B4A' }}>Supprimer</button>
    </div>
  )
}

function HebergementItem({ hebergement, voyageId, documents, voyageNom, onDelete }: {
  hebergement: Hebergement; voyageId: string; documents: DocumentVoyage[]; voyageNom: string; onDelete: () => void
}) {
  const [form, setForm] = useState({
    nom: hebergement.nom, adresse: hebergement.adresse ?? '', numero_confirmation: hebergement.numero_confirmation ?? '',
    heure_checkin: hebergement.heure_checkin ?? '', heure_checkout: hebergement.heure_checkout ?? '',
  })

  function maj(champ: keyof typeof form, valeur: string) {
    setForm(f => ({ ...f, [champ]: valeur }))
  }
  function save() {
    modifierHebergement(hebergement.id, voyageId, {
      nom: form.nom, adresse: form.adresse || null, numero_confirmation: form.numero_confirmation || null,
      heure_checkin: form.heure_checkin || null, heure_checkout: form.heure_checkout || null,
    })
  }

  const TYPES = ['hotel', 'airbnb', 'hostel', 'habitant', 'autre'] as const

  return (
    <div className="rounded-xl p-3" style={{ background: '#F8F9FA' }}>
      <div className="flex gap-1.5 mb-2.5 flex-wrap">
        {TYPES.map(type => (
          <button key={type} type="button" onClick={() => modifierHebergement(hebergement.id, voyageId, { type_hebergement: type })}
            className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition"
            style={{
              border: hebergement.type_hebergement === type ? '2px solid #534AB7' : '1px solid #E5E7EB',
              background: hebergement.type_hebergement === type ? '#F5F4FF' : 'white',
              color: hebergement.type_hebergement === type ? '#534AB7' : '#6B7280',
            }}>
            {type}
          </button>
        ))}
      </div>

      <input className={inputCls} placeholder="Nom du logement" value={form.nom} onChange={e => maj('nom', e.target.value)} onBlur={save} />
      <input className={inputCls} placeholder="Adresse" value={form.adresse} onChange={e => maj('adresse', e.target.value)} onBlur={save} />
      <input className={inputCls} placeholder="Numéro de confirmation" value={form.numero_confirmation} onChange={e => maj('numero_confirmation', e.target.value)} onBlur={save} />

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className={labelCls}>Check-in</label>
          <input type="time" className={inputCls} value={form.heure_checkin} onChange={e => maj('heure_checkin', e.target.value)} onBlur={save} />
        </div>
        <div>
          <label className={labelCls}>Check-out</label>
          <input type="time" className={inputCls} value={form.heure_checkout} onChange={e => maj('heure_checkout', e.target.value)} onBlur={save} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {([['check_in', 'Check-in ce jour'], ['check_out', 'Check-out ce jour'], ['petit_dej_inclus', 'Petit déjeuner inclus']] as const).map(([champ, label]) => (
          <button key={champ} type="button"
            onClick={() => modifierHebergement(hebergement.id, voyageId, { [champ]: !hebergement[champ] })}
            className="flex items-center gap-2 text-left">
            <span className="flex items-center justify-center shrink-0" style={{
              width: 18, height: 18, borderRadius: 5,
              border: hebergement[champ] ? 'none' : '1.5px solid #D1D5DB',
              background: hebergement[champ] ? '#534AB7' : 'white',
            }}>
              {hebergement[champ] && <Check size={12} color="white" />}
            </span>
            <span className="text-sm text-gray-700">{label}</span>
          </button>
        ))}
      </div>

      <LienDocument voyageId={voyageId} voyageNom={voyageNom} documentId={hebergement.document_id} documents={documents}
        onLink={id => modifierHebergement(hebergement.id, voyageId, { document_id: id })} />

      <button onClick={onDelete} className="text-xs mt-2.5 font-semibold" style={{ color: '#E24B4A' }}>Supprimer</button>
    </div>
  )
}

function ActiviteItem({ activite, voyageId, documents, voyageNom, onDelete }: {
  activite: ActivitePlanning; voyageId: string; documents: DocumentVoyage[]; voyageNom: string; onDelete: () => void
}) {
  const [form, setForm] = useState({
    nom: activite.nom, lieu: activite.lieu ?? '', heure_prevue: activite.heure_prevue ?? '', prix_estime: activite.prix_estime ?? '',
  })

  function maj(champ: keyof typeof form, valeur: string) {
    setForm(f => ({ ...f, [champ]: valeur }))
  }
  function save() {
    modifierActivitePlanning(activite.id, voyageId, {
      nom: form.nom, lieu: form.lieu || null, heure_prevue: form.heure_prevue || null, prix_estime: form.prix_estime || null,
    })
  }

  const STATUTS = [
    { value: 'libre', label: 'Entrée libre', color: '#1D9E75' },
    { value: 'a_reserver', label: 'À réserver', color: '#E8A838' },
    { value: 'reserve', label: 'Réservé', color: '#534AB7' },
  ] as const

  return (
    <div className="rounded-xl p-3" style={{ background: '#F8F9FA' }}>
      <input className={inputCls} placeholder="Nom de l'activité" value={form.nom} onChange={e => maj('nom', e.target.value)} onBlur={save} />
      <input className={inputCls} placeholder="Lieu / adresse" value={form.lieu} onChange={e => maj('lieu', e.target.value)} onBlur={save} />

      <div className="grid grid-cols-2 gap-2">
        <input type="time" className={inputCls} value={form.heure_prevue} onChange={e => maj('heure_prevue', e.target.value)} onBlur={save} />
        <input className={inputCls} placeholder="Prix estimé (€)" value={form.prix_estime} onChange={e => maj('prix_estime', e.target.value)} onBlur={save} />
      </div>

      <div className="flex gap-1.5 flex-wrap mb-1">
        {STATUTS.map(s => (
          <button key={s.value} type="button" onClick={() => modifierActivitePlanning(activite.id, voyageId, { statut_reservation: s.value })}
            className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition"
            style={{
              border: activite.statut_reservation === s.value ? `2px solid ${s.color}` : '1px solid #E5E7EB',
              background: activite.statut_reservation === s.value ? `${s.color}15` : 'white',
              color: activite.statut_reservation === s.value ? s.color : '#6B7280',
            }}>
            {activite.statut_reservation === s.value && s.value === 'reserve' && <Check size={11} />} {s.label}
          </button>
        ))}
      </div>

      {activite.ajouteurPrenom && (
        <p className="text-xs text-gray-400 mt-1">Ajouté par {activite.ajouteurEmoji ?? ''} {activite.ajouteurPrenom}</p>
      )}

      <LienDocument voyageId={voyageId} voyageNom={voyageNom} documentId={activite.document_id} documents={documents}
        onLink={id => modifierActivitePlanning(activite.id, voyageId, { document_id: id })} />

      <button onClick={onDelete} className="text-xs mt-2.5 font-semibold" style={{ color: '#E24B4A' }}>Supprimer</button>
    </div>
  )
}

function RepasItem({ repas, voyageId, documents, voyageNom, onDelete }: {
  repas: Repas; voyageId: string; documents: DocumentVoyage[]; voyageNom: string; onDelete: () => void
}) {
  const [nom, setNom] = useState(repas.nom_restaurant)

  return (
    <div className="rounded-xl p-3" style={{ background: '#F8F9FA' }}>
      <input className={inputCls} placeholder="Nom du restaurant" value={nom}
        onChange={e => setNom(e.target.value)}
        onBlur={() => modifierRepas(repas.id, voyageId, { nom_restaurant: nom })} />

      <div className="flex gap-1.5 mb-2">
        {(['matin', 'midi', 'soir'] as const).map(m => (
          <button key={m} type="button" onClick={() => modifierRepas(repas.id, voyageId, { moment: m })}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition"
            style={{ background: repas.moment === m ? '#E86B3A' : 'white', color: repas.moment === m ? 'white' : '#6B7280', border: repas.moment === m ? 'none' : '1px solid #E5E7EB' }}>
            {m}
          </button>
        ))}
      </div>

      <button type="button" onClick={() => modifierRepas(repas.id, voyageId, { reserve: !repas.reserve })}
        className="flex items-center gap-2">
        <span className="flex items-center justify-center shrink-0" style={{
          width: 18, height: 18, borderRadius: 5,
          border: repas.reserve ? 'none' : '1.5px solid #D1D5DB',
          background: repas.reserve ? '#E86B3A' : 'white',
        }}>
          {repas.reserve && <Check size={12} color="white" />}
        </span>
        <span className="text-sm text-gray-700">Réservation faite</span>
      </button>

      <LienDocument voyageId={voyageId} voyageNom={voyageNom} documentId={repas.document_id} documents={documents}
        onLink={id => modifierRepas(repas.id, voyageId, { document_id: id })} />

      <button onClick={onDelete} className="text-xs mt-2.5 font-semibold" style={{ color: '#E24B4A' }}>Supprimer</button>
    </div>
  )
}

// ───────────────────────────── Sheet principale ─────────────────────────────

export default function PlanningJourSheet({
  voyageId, voyageNom, jour, jourIndex, estPremierJour, estDernierJour, jourDepart, jourRetour,
  hebergements, transports, activites, repas, activitesFavorites, documentsVoyage, onClose,
}: {
  voyageId: string
  voyageNom: string
  jour: Jour
  jourIndex: number
  estPremierJour: boolean
  estDernierJour: boolean
  jourDepart: JourSpecial
  jourRetour: JourSpecial
  hebergements: Hebergement[]
  transports: Transport[]
  activites: ActivitePlanning[]
  repas: Repas[]
  activitesFavorites: ActiviteFavorite[]
  documentsVoyage: DocumentVoyage[]
  onClose: () => void
}) {
  const [ville, setVille] = useState(jour.ville ?? '')
  const [resume, setResume] = useState(jour.resume_jour ?? '')
  const [notes, setNotes] = useState(jour.notes_libres ?? '')
  const [showFavoris, setShowFavoris] = useState(false)

  function saveVille() { modifierJour(jour.id, voyageId, { ville: ville || null }) }
  function handleSelectVille(r: LieuResult) {
    setVille(r.label)
    modifierJour(jour.id, voyageId, { ville: r.label, ville_lat: r.lat, ville_lon: r.lon })
  }
  function saveResume() { modifierJour(jour.id, voyageId, { resume_jour: resume || null }) }
  function saveNotes() { modifierJour(jour.id, voyageId, { notes_libres: notes || null }) }

  async function handleAjouterActivite(favori?: ActiviteFavorite) {
    setShowFavoris(false)
    if (favori) {
      await ajouterActivitePlanning(jour.id, voyageId, { nom: favori.titre, lieu: favori.ville, activite_favori_id: favori.id })
    } else {
      await ajouterActivitePlanning(jour.id, voyageId)
    }
  }

  return (
    <ModalShell open onClose={onClose} title={`Jour ${jourIndex + 1} — ${formatDateLongue(jour.date)}`} verticalPadding={90}>
      <div className="flex flex-col gap-5">
          <div>
            <label className={labelCls}>Ville</label>
            <CityAutocomplete
              className={inputCls}
              placeholder="Ex: Bangkok, Chiang Mai..."
              value={ville}
              onChange={setVille}
              onSelect={handleSelectVille}
              onBlur={saveVille}
            />
          </div>

          <div>
            <label className={labelCls}>Résumé du jour (optionnel)</label>
            <input className={inputCls} placeholder="Ex: Journée temples et marché flottant" value={resume} onChange={e => setResume(e.target.value)} onBlur={saveResume} />
          </div>

          {estPremierJour && (
            <SectionSpeciale type="depart" voyageId={voyageId} jourSpecial={jourDepart} />
          )}

          <Section icon={Plane} color="#36A6B2" title="Transport"
            action={<button onClick={() => ajouterTransport(jour.id, voyageId)} className="text-xs font-semibold" style={{ color: '#36A6B2' }}>+ Ajouter</button>}>
            <div className="flex flex-col gap-2.5">
              {transports.map(t => (
                <TransportItem key={t.id} transport={t} voyageId={voyageId} voyageNom={voyageNom} documents={documentsVoyage} onDelete={() => supprimerTransport(t.id, voyageId)} />
              ))}
            </div>
          </Section>

          <Section icon={Building2} color="#534AB7" title="Hébergement"
            action={hebergements.length === 0 && <button onClick={() => ajouterHebergement(jour.id, voyageId)} className="text-xs font-semibold" style={{ color: '#534AB7' }}>+ Ajouter</button>}>
            <div className="flex flex-col gap-2.5">
              {hebergements.map(h => (
                <HebergementItem key={h.id} hebergement={h} voyageId={voyageId} voyageNom={voyageNom} documents={documentsVoyage} onDelete={() => supprimerHebergement(h.id, voyageId)} />
              ))}
            </div>
          </Section>

          <Section icon={MapPin} color="#1D9E75" title="Activités"
            action={
              <div className="flex gap-3">
                <button onClick={() => setShowFavoris(v => !v)} className="text-xs font-semibold" style={{ color: '#1D9E75' }}>Depuis mes favoris</button>
                <button onClick={() => handleAjouterActivite()} className="text-xs font-semibold" style={{ color: '#1D9E75' }}>+ Ajouter</button>
              </div>
            }>
            {showFavoris && (
              <div className="rounded-xl bg-gray-50 p-2 flex flex-col gap-1 max-h-40 overflow-y-auto mb-1">
                {activitesFavorites.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">Aucun favori dans l&apos;onglet Activités.</p>
                ) : activitesFavorites.map(f => (
                  <button key={f.id} type="button" onClick={() => handleAjouterActivite(f)}
                    className="text-left px-2.5 py-2 rounded-lg text-sm hover:bg-white transition">
                    <span className="font-medium text-gray-800">{f.titre}</span>
                    <span className="text-gray-400"> · {f.ville}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {activites.map(a => (
                <ActiviteItem key={a.id} activite={a} voyageId={voyageId} voyageNom={voyageNom} documents={documentsVoyage} onDelete={() => supprimerActivitePlanning(a.id, voyageId)} />
              ))}
            </div>
          </Section>

          <Section icon={Utensils} color="#E86B3A" title="Repas"
            action={<button onClick={() => ajouterRepas(jour.id, voyageId)} className="text-xs font-semibold" style={{ color: '#E86B3A' }}>+ Ajouter</button>}>
            <div className="flex flex-col gap-2.5">
              {repas.map(r => (
                <RepasItem key={r.id} repas={r} voyageId={voyageId} voyageNom={voyageNom} documents={documentsVoyage} onDelete={() => supprimerRepas(r.id, voyageId)} />
              ))}
            </div>
          </Section>

          {estDernierJour && (
            <SectionSpeciale type="retour" voyageId={voyageId} jourSpecial={jourRetour} />
          )}

          <Section icon={FileText} color="#9CA3AF" title="Notes">
            <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Infos pratiques, rappels, idées..."
              value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes} />
          </Section>
      </div>
    </ModalShell>
  )
}
