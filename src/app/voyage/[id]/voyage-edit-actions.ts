'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function modifierVoyage(voyageId: string, data: {
  nom: string
  destination: string
  date_depart: string
  date_retour: string
  membres_ids: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  if (!data.nom || !data.destination || !data.date_depart || !data.date_retour) {
    return { error: 'Tous les champs sont requis.' }
  }

  if (data.date_retour <= data.date_depart) {
    return { error: 'La date de retour doit être après le départ.' }
  }

  const { error } = await supabase
    .from('voyages')
    .update({
      nom: data.nom,
      destination: data.destination,
      date_depart: data.date_depart,
      date_retour: data.date_retour,
      membres_ids: data.membres_ids,
    })
    .eq('id', voyageId)
    .eq('user_id', user.id)

  if (error) return { error: 'Erreur lors de la modification.' }

  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}
