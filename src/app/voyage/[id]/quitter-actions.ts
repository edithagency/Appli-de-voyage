'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function quitterVoyage(participantId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase.from('voyage_participants')
    .update({ user_id: null, statut: 'en_attente', rejoint_le: null })
    .eq('id', participantId)
    .eq('user_id', user.id)

  redirect('/dashboard')
}
