'use server'

import { createClient } from '@/lib/supabase/server'

export async function toggleFavoriOutil(outilId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: existing } = await supabase
    .from('outils_favoris')
    .select('id')
    .eq('user_id', user.id)
    .eq('outil_id', outilId)
    .maybeSingle()

  if (existing) {
    await supabase.from('outils_favoris').delete().eq('id', existing.id)
  } else {
    await supabase.from('outils_favoris').insert({ user_id: user.id, outil_id: outilId })
  }

  return { success: true }
}
