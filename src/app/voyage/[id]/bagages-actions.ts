'use server'

import { createClient } from '@/lib/supabase/server'

export async function sauvegarderCompagnie(voyageId: string, compagnieId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('voyages')
    .update({ compagnie_aerienne: compagnieId })
    .eq('id', voyageId)
    .eq('user_id', user.id)
}

export async function sauvegarderCompagnieParticipant(participantId: string, compagnieId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('voyage_participants')
    .update({ compagnie_aerienne: compagnieId })
    .eq('id', participantId)
    .eq('user_id', user.id)
}