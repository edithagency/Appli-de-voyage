'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function supprimerVoyage(voyageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  await supabase.from('voyages').delete().eq('id', voyageId).eq('user_id', user.id)
  redirect('/dashboard')
}
