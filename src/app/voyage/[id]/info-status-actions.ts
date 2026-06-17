'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleInfoStatus(
  voyageId: string,
  infoId: string,
  completed: boolean,
  voyageMembreId: string
) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('voyage_info_status')
    .select('id')
    .eq('voyage_membre_id', voyageMembreId)
    .eq('info_id', infoId)
    .maybeSingle()

  const payload = { completed, completed_at: completed ? new Date().toISOString() : null }

  const { error } = existing
    ? await supabase.from('voyage_info_status').update(payload).eq('id', existing.id)
    : await supabase.from('voyage_info_status').insert({
        voyage_id: voyageId, voyage_membre_id: voyageMembreId, info_id: infoId, ...payload,
      })

  if (error) return { error: 'Erreur lors de la mise à jour.' }
  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}
