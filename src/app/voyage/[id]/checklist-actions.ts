'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateChecklist } from '@/lib/utils/generateChecklist'

export async function genererChecklist(voyageId: string, participantId?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  // RLS permet l'accès si organisateur ou participant
  const { data: voyage } = await supabase
    .from('voyages')
    .select('*, pays:pays_code(*)')
    .eq('id', voyageId)
    .single()

  if (!voyage) return { error: 'Voyage introuvable.' }

  const isOrganisateur = voyage.user_id === user.id

  let membres: { id: string; prenom: string; type: string; date_naissance: string | null }[] = []

  if (isOrganisateur && voyage.mode_gestion === 'A') {
    // Mode A : utiliser voyage_participants (inclut enfants avec leur type)
    const { data: participants } = await supabase
      .from('voyage_participants')
      .select('id, prenom, type')
      .eq('voyage_id', voyageId)
      .eq('role', 'participant')
    // Ajouter l'organisateur + les participants
    const { data: orgProfile } = await supabase.from('users').select('prenom').eq('id', user.id).single()
    membres = [
      { id: user.id, prenom: orgProfile?.prenom ?? 'Organisateur', type: 'adulte', date_naissance: null },
      ...(participants ?? []).map(p => ({ id: p.id, prenom: p.prenom, type: p.type, date_naissance: null })),
    ]
  } else if (voyage.membres_ids?.length > 0 && isOrganisateur) {
    // Ancien système : membres_foyer
    const { data } = await supabase.from('membres_foyer').select('*').in('id', voyage.membres_ids)
    membres = data ?? []
  }

  const duree = Math.ceil(
    (new Date(voyage.date_retour).getTime() - new Date(voyage.date_depart).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Pour Mode A avec voyage_participants, on n'utilise pas membre_id (FK vers membres_foyer)
  const rawItems = generateChecklist(voyage.pays as any, membres, duree)
  const useParticipantIds = isOrganisateur && voyage.mode_gestion === 'A'
  const items = useParticipantIds
    ? rawItems.map(item => ({ ...item, membre_id: null })) // FK membres_foyer non applicable
    : rawItems

  if (participantId) {
    // Mode B : checklist personnelle du participant (ne supprime que les siennes)
    await supabase.from('checklist_items')
      .delete()
      .eq('voyage_id', voyageId)
      .eq('participant_id', participantId)
    await supabase.from('checklist_items').insert(
      items.map(item => ({ ...item, voyage_id: voyageId, participant_id: participantId }))
    )
  } else {
    // Mode A / Solo : checklist partagée (sans participant_id)
    await supabase.from('checklist_items')
      .delete()
      .eq('voyage_id', voyageId)
      .is('participant_id', null)
    await supabase.from('checklist_items').insert(
      items.map(item => ({ ...item, voyage_id: voyageId }))
    )
  }

  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}

export async function toggleItem(itemId: string, completed: boolean, voyageId: string) {
  const supabase = await createClient()
  await supabase
    .from('checklist_items')
    .update({ completed })
    .eq('id', itemId)
  revalidatePath(`/voyage/${voyageId}`)
}

export async function ajouterItem(voyageId: string, data: {
  label: string
  categorie: string
  description: string
  obligatoire: boolean
  membre_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  // Récupère le max ordre actuel
  const { data: items } = await supabase
    .from('checklist_items')
    .select('ordre')
    .eq('voyage_id', voyageId)
    .order('ordre', { ascending: false })
    .limit(1)

  const maxOrdre = items?.[0]?.ordre ?? 0

  const { error } = await supabase.from('checklist_items').insert({
    voyage_id: voyageId,
    label: data.label,
    categorie: data.categorie,
    description: data.description || null,
    obligatoire: data.obligatoire,
    completed: false,
    ordre: maxOrdre + 1,
    membre_id: data.membre_id || null,
  })

  if (error) return { error: 'Erreur lors de l\'ajout.' }
  return { success: true }
}

export async function supprimerChecklist(voyageId: string) {
  const supabase = await createClient()
  await supabase.from('checklist_items').delete().eq('voyage_id', voyageId)
  revalidatePath(`/voyage/${voyageId}`)
}

export async function supprimerItem(itemId: string, voyageId: string) {
  const supabase = await createClient()
  await supabase.from('checklist_items').delete().eq('id', itemId)
  revalidatePath(`/voyage/${voyageId}`)
}
