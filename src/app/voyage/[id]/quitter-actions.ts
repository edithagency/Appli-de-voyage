'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function quitterVoyage(membreId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase.from('voyage_membres')
    .update({ user_id: null, statut_invitation: 'pending', rejoint_le: null })
    .eq('id', membreId)
    .eq('user_id', user.id)

  redirect('/dashboard')
}
