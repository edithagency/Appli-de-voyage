'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ───────────────────────────── Jour ─────────────────────────────

export async function modifierJour(jourId: string, voyageId: string, data: { ville?: string | null; ville_lat?: number | null; ville_lon?: number | null; resume_jour?: string | null; notes_libres?: string | null }) {
  const supabase = await createClient()
  await supabase.from('planning_jours').update(data).eq('id', jourId)
  revalidatePath(`/voyage/${voyageId}`)
}

// ───────────────────────────── Jours spéciaux (départ / retour) ─────────────────────────────

export async function mettreAJourJourSpecial(voyageId: string, type: 'depart' | 'retour', data: {
  aeroport_depart?: string | null
  terminal_depart?: string | null
  aeroport_arrivee?: string | null
  terminal_arrivee?: string | null
  heure_depart?: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('planning_jours_speciaux')
    .upsert({ voyage_id: voyageId, type, ...data }, { onConflict: 'voyage_id,type' })
  if (error) return { error: 'Erreur lors de la mise à jour.' }
  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}

// ───────────────────────────── Hébergements ─────────────────────────────

export async function ajouterHebergement(jourId: string, voyageId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('planning_hebergements').insert({ jour_id: jourId, nom: '' }).select('id').single()
  if (error || !data) return { error: "Erreur lors de l'ajout de l'hébergement." }
  revalidatePath(`/voyage/${voyageId}`)
  return { success: true, id: data.id }
}

export async function modifierHebergement(id: string, voyageId: string, data: Partial<{
  nom: string
  adresse: string | null
  numero_confirmation: string | null
  type_hebergement: 'hotel' | 'airbnb' | 'hostel' | 'habitant' | 'autre' | null
  heure_checkin: string | null
  heure_checkout: string | null
  petit_dej_inclus: boolean
  check_in: boolean
  check_out: boolean
  document_id: string | null
}>) {
  const supabase = await createClient()
  await supabase.from('planning_hebergements').update(data).eq('id', id)
  revalidatePath(`/voyage/${voyageId}`)
}

export async function supprimerHebergement(id: string, voyageId: string) {
  const supabase = await createClient()
  await supabase.from('planning_hebergements').delete().eq('id', id)
  revalidatePath(`/voyage/${voyageId}`)
}

// ───────────────────────────── Transports ─────────────────────────────

export async function ajouterTransport(jourId: string, voyageId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('planning_transports').insert({ jour_id: jourId, type: 'vol' }).select('id').single()
  if (error || !data) return { error: "Erreur lors de l'ajout du transport." }
  revalidatePath(`/voyage/${voyageId}`)
  return { success: true, id: data.id }
}

export async function modifierTransport(id: string, voyageId: string, data: Partial<{
  type: 'vol' | 'train' | 'bus' | 'voiture' | 'taxi' | 'bateau' | 'autre'
  compagnie: string | null
  reference: string | null
  heure_depart: string | null
  heure_arrivee: string | null
  depart_de: string | null
  arrivee_a: string | null
  aeroport_depart: string | null
  terminal_depart: string | null
  aeroport_arrivee: string | null
  terminal_arrivee: string | null
  heure_limite_enregistrement: string | null
  document_id: string | null
}>) {
  const supabase = await createClient()
  await supabase.from('planning_transports').update(data).eq('id', id)
  revalidatePath(`/voyage/${voyageId}`)
}

export async function supprimerTransport(id: string, voyageId: string) {
  const supabase = await createClient()
  await supabase.from('planning_transports').delete().eq('id', id)
  revalidatePath(`/voyage/${voyageId}`)
}

// ───────────────────────────── Activités ─────────────────────────────

export async function ajouterActivitePlanning(jourId: string, voyageId: string, data?: {
  nom?: string
  lieu?: string | null
  activite_favori_id?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: inserted, error } = await supabase.from('planning_activites').insert({
    jour_id: jourId,
    voyage_id: voyageId,
    nom: data?.nom ?? '',
    lieu: data?.lieu ?? null,
    activite_favori_id: data?.activite_favori_id ?? null,
    statut_reservation: 'a_reserver',
    added_by: user.id,
  }).select('id').single()
  if (error || !inserted) return { error: "Erreur lors de l'ajout de l'activité." }
  revalidatePath(`/voyage/${voyageId}`)
  return { success: true, id: inserted.id }
}

// Depuis l'onglet Activités : "Ajouter au programme" — copie nom/lieu, statut par défaut à_reserver.
export async function assignerActiviteAuJour(voyageId: string, jourId: string, activite: { id: string; titre: string; ville: string }) {
  return ajouterActivitePlanning(jourId, voyageId, {
    nom: activite.titre,
    lieu: activite.ville,
    activite_favori_id: activite.id,
  })
}

export async function modifierActivitePlanning(id: string, voyageId: string, data: Partial<{
  nom: string
  lieu: string | null
  adresse: string | null
  heure_prevue: string | null
  prix_estime: string | null
  statut_reservation: 'libre' | 'a_reserver' | 'reserve'
  document_id: string | null
}>) {
  const supabase = await createClient()
  await supabase.from('planning_activites').update(data).eq('id', id)
  revalidatePath(`/voyage/${voyageId}`)
}

export async function supprimerActivitePlanning(id: string, voyageId: string) {
  const supabase = await createClient()
  await supabase.from('planning_activites').delete().eq('id', id)
  revalidatePath(`/voyage/${voyageId}`)
}

// ───────────────────────────── Repas ─────────────────────────────

export async function ajouterRepas(jourId: string, voyageId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('planning_repas').insert({ jour_id: jourId, nom_restaurant: '', moment: 'midi' }).select('id').single()
  if (error || !data) return { error: "Erreur lors de l'ajout du repas." }
  revalidatePath(`/voyage/${voyageId}`)
  return { success: true, id: data.id }
}

export async function modifierRepas(id: string, voyageId: string, data: Partial<{
  nom_restaurant: string
  moment: 'matin' | 'midi' | 'soir'
  reserve: boolean
  document_id: string | null
}>) {
  const supabase = await createClient()
  await supabase.from('planning_repas').update(data).eq('id', id)
  revalidatePath(`/voyage/${voyageId}`)
}

export async function supprimerRepas(id: string, voyageId: string) {
  const supabase = await createClient()
  await supabase.from('planning_repas').delete().eq('id', id)
  revalidatePath(`/voyage/${voyageId}`)
}
