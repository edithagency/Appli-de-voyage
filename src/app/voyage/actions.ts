'use server'

import { createClient } from '@/lib/supabase/server'

type ParticipantInput = { prenom: string; type: 'adulte' | 'enfant' }

type CreerVoyageInput = {
  nom: string
  destination: string
  pays_code: string | null
  date_depart: string
  date_retour: string
  mode_gestion: 'organisateur' | 'partage' | null
  participants: ParticipantInput[]
}

export async function creerVoyage(input: CreerVoyageInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { nom, destination, pays_code, date_depart, date_retour, mode_gestion, participants } = input

  if (!nom || !destination || !date_depart || !date_retour) {
    return { error: 'Tous les champs sont requis.' }
  }
  const today = new Date().toISOString().slice(0, 10)
  if (date_depart < today) {
    return { error: 'La date de départ ne peut pas être dans le passé.' }
  }
  if (date_retour <= date_depart) {
    return { error: 'La date de retour doit être après la date de départ.' }
  }

  // S'assurer que le profil utilisateur existe (FK sur voyages.user_id)
  await supabase.from('users').upsert({
    id: user.id,
    email: user.email!,
    prenom: user.user_metadata?.prenom ?? null,
    nom: user.user_metadata?.nom ?? null,
    emoji_avatar: user.user_metadata?.emoji_avatar ?? null,
  }, { onConflict: 'id', ignoreDuplicates: true })

  const { data: voyage, error } = await supabase
    .from('voyages')
    .insert({
      user_id: user.id,
      nom,
      destination,
      pays_code: pays_code || null,
      date_depart,
      date_retour,
      mode_gestion: participants.length > 0 ? mode_gestion : 'solo',
    })
    .select('id')
    .single()

  if (error || !voyage) {
    return { error: error?.message ?? 'Erreur lors de la création du voyage.' }
  }

  // L'organisateur est toujours un voyage_membre (y compris en solo)
  const { data: orgProfile } = await supabase.from('users').select('prenom').eq('id', user.id).single()
  const orgPrenom = orgProfile?.prenom ?? user.user_metadata?.prenom ?? 'Organisateur'

  const { data: membresInseres } = await supabase.from('voyage_membres').insert([
    {
      voyage_id: voyage.id,
      user_id: user.id,
      prenom: orgPrenom,
      type: 'adulte' as const,
      role: 'organisateur' as const,
      statut_invitation: 'joined' as const,
      rejoint_le: new Date().toISOString(),
    },
    ...participants.map(p => ({
      voyage_id: voyage.id,
      prenom: p.prenom,
      type: p.type,
      role: 'membre' as const,
      statut_invitation: 'pending' as const,
    })),
  ]).select('id')

  // Chaque membre démarre avec sa propre valise/checklist
  if (membresInseres && membresInseres.length > 0) {
    await supabase.from('checklist_valises').insert(
      membresInseres.map(m => ({ voyage_id: voyage.id, voyage_membre_id: m.id }))
    )
  }

  return { voyageId: voyage.id }
}
