'use server'

import { createClient } from '@/lib/supabase/server'

export async function toggleWishlistActivite(voyageId: string, activiteId: string, add: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  if (add) {
    const { data: membre } = await supabase
      .from('voyage_membres')
      .select('id')
      .eq('voyage_id', voyageId)
      .eq('user_id', user.id)
      .maybeSingle()

    const { error } = await supabase
      .from('activite_wishlist')
      .insert({ voyage_id: voyageId, activite_id: activiteId, ajoute_par: membre?.id ?? null })
    if (error && error.code !== '23505') return { error: error.message }
  } else {
    const { error } = await supabase
      .from('activite_wishlist')
      .delete()
      .eq('voyage_id', voyageId)
      .eq('activite_id', activiteId)
    if (error) return { error: error.message }
  }

  return { success: true }
}
