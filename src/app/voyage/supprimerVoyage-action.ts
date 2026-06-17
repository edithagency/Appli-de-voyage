'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function supprimerVoyage(voyageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  // Supprime les documents associés (fichiers Storage + lignes en base)
  // pour éviter de laisser des fichiers orphelins.
  const { data: documents } = await supabase
    .from('documents')
    .select('id, storage_path')
    .eq('voyage_id', voyageId)
    .eq('user_id', user.id)

  if (documents && documents.length > 0) {
    await supabase.storage.from('documents').remove(documents.map(d => d.storage_path))
    await supabase.from('documents').delete().eq('voyage_id', voyageId).eq('user_id', user.id)
  }

  const { error } = await supabase.from('voyages').delete().eq('id', voyageId).eq('user_id', user.id)
  if (error) return { error: 'Erreur lors de la suppression du voyage.' }

  redirect('/dashboard')
}
