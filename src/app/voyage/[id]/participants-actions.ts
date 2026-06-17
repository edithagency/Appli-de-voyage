'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function creerInvitation(voyageId: string, prenom: string, type: 'adulte' | 'enfant') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: voyage } = await supabase.from('voyages').select('user_id, mode_gestion').eq('id', voyageId).single()
  if (!voyage || voyage.user_id !== user.id) return { error: 'Action non autorisée.' }

  // Un voyage solo qui reçoit son premier membre devient un voyage géré (organisateur par défaut)
  if (voyage.mode_gestion === 'solo') {
    await supabase.from('voyages').update({ mode_gestion: 'organisateur' }).eq('id', voyageId)
  }

  const { data, error } = await supabase
    .from('voyage_membres')
    .insert({ voyage_id: voyageId, prenom, type, role: 'membre', statut_invitation: 'pending' })
    .select('id, token_invitation, token_expire_at, statut_invitation')
    .single()

  if (error || !data) return { error: "Erreur lors de la création de l'invitation." }

  // Chaque membre démarre avec sa propre valise/checklist
  await supabase.from('checklist_valises').insert({ voyage_id: voyageId, voyage_membre_id: data.id })

  revalidatePath(`/voyage/${voyageId}`)
  return { success: true, membre: data }
}

export async function retirerParticipant(membreId: string, voyageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: voyage } = await supabase.from('voyages').select('user_id').eq('id', voyageId).single()
  if (!voyage || voyage.user_id !== user.id) return { error: 'Action non autorisée.' }

  // La suppression de voyage_membres cascade sur checklist_valises (et donc checklist_items) et voyage_info_status
  const { error } = await supabase.from('voyage_membres')
    .delete()
    .eq('id', membreId)
    .eq('voyage_id', voyageId)

  if (error) return { error: 'Erreur lors du retrait du participant.' }

  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}

export async function renouvelerInvitation(membreId: string, voyageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: voyage } = await supabase.from('voyages').select('user_id').eq('id', voyageId).single()
  if (!voyage || voyage.user_id !== user.id) return { error: 'Action non autorisée.' }

  const token = randomBytes(16).toString('hex')
  const tokenExpireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from('voyage_membres')
    .update({ token_invitation: token, token_expire_at: tokenExpireAt, statut_invitation: 'pending' })
    .eq('id', membreId)
    .eq('voyage_id', voyageId)

  if (error) return { error: 'Erreur lors du renouvellement.' }

  revalidatePath(`/voyage/${voyageId}`)
  return { success: true, token, tokenExpireAt }
}
