'use server'

import { createClient } from '@/lib/supabase/server'

type ParticipantInput = { prenom: string; type: 'adulte' | 'enfant' }

type CreerVoyageInput = {
  nom: string
  destination: string
  pays_code: string | null
  date_depart: string
  date_retour: string
  type_voyage: string
  mode_gestion: string | null
  participants: ParticipantInput[]
}

export async function creerVoyage(input: CreerVoyageInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { nom, destination, pays_code, date_depart, date_retour, type_voyage, mode_gestion, participants } = input

  if (!nom || !destination || !date_depart || !date_retour) {
    return { error: 'Tous les champs sont requis.' }
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
      type_voyage: type_voyage || null,
      mode_gestion: mode_gestion || null,
    })
    .select('id')
    .single()

  if (error || !voyage) {
    return { error: error?.message ?? 'Erreur lors de la création du voyage.' }
  }

  // Créer les participants (Mode A ou B)
  if (participants.length > 0) {
    const { data: orgProfile } = await supabase.from('users').select('prenom').eq('id', user.id).single()
    const orgPrenom = orgProfile?.prenom ?? user.user_metadata?.prenom ?? 'Organisateur'

    await supabase.from('voyage_participants').insert([
      // L'organisateur lui-même (role = 'organisateur', pour que les participants voient son prénom)
      {
        voyage_id: voyage.id,
        user_id: user.id,
        prenom: orgPrenom,
        type: 'adulte' as const,
        role: 'organisateur' as const,
        statut: 'rejoint' as const,
        rejoint_le: new Date().toISOString(),
      },
      // Les autres participants
      ...participants.map(p => ({
        voyage_id: voyage.id,
        prenom: p.prenom,
        type: p.type,
        role: 'participant' as const,
        statut: 'en_attente' as const,
      })),
    ])
  }

  return { voyageId: voyage.id }
}
