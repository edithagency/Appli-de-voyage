'use server'

import { createClient } from '@/lib/supabase/server'
import { ORGANISATEUR_SENTINEL } from '@/lib/utils/participants'

type ParticipantInput = {
  prenom: string
  type: 'adulte' | 'enfant'
  dateNaissance?: string | null
  // Enfant uniquement : prénom d'un adulte du groupe, ou ORGANISATEUR_SENTINEL.
  parentRef?: string | null
}

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

  const adultes = participants.filter(p => p.type === 'adulte')
  const enfants = participants.filter(p => p.type === 'enfant')

  // 1) Organisateur + adultes d'abord : les enfants ont besoin de leurs ids pour parent_id.
  const { data: membresAdultesInseres } = await supabase.from('voyage_membres').insert([
    {
      voyage_id: voyage.id,
      user_id: user.id,
      prenom: orgPrenom,
      type: 'adulte' as const,
      role: 'organisateur' as const,
      statut_invitation: 'joined' as const,
      rejoint_le: new Date().toISOString(),
    },
    ...adultes.map(p => ({
      voyage_id: voyage.id,
      prenom: p.prenom,
      type: 'adulte' as const,
      role: 'membre' as const,
      statut_invitation: 'pending' as const,
    })),
  ]).select('id, prenom')

  const parentIdByRef: Record<string, string> = {}
  if (membresAdultesInseres) {
    parentIdByRef[ORGANISATEUR_SENTINEL] = membresAdultesInseres[0].id
    adultes.forEach((p, i) => { parentIdByRef[p.prenom] = membresAdultesInseres[i + 1].id })
  }

  // 2) Enfants : jamais de compte ni d'invitation ; parent_id résolu ci-dessus.
  let membresEnfantsInseres: { id: string }[] | null = null
  if (enfants.length > 0) {
    ;({ data: membresEnfantsInseres } = await supabase.from('voyage_membres').insert(
      enfants.map(p => ({
        voyage_id: voyage.id,
        prenom: p.prenom,
        type: 'enfant' as const,
        role: 'membre' as const,
        user_id: null,
        token_invitation: null,
        statut_invitation: 'na' as const,
        date_naissance: p.dateNaissance || null,
        parent_id: p.parentRef ? (parentIdByRef[p.parentRef] ?? null) : null,
      }))
    ).select('id'))
  }

  const membresInseres = [...(membresAdultesInseres ?? []), ...(membresEnfantsInseres ?? [])]

  // Chaque membre démarre avec sa propre valise/checklist
  if (membresInseres.length > 0) {
    await supabase.from('checklist_valises').insert(
      membresInseres.map(m => ({ voyage_id: voyage.id, voyage_membre_id: m.id }))
    )
  }

  return { voyageId: voyage.id }
}
