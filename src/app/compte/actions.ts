'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function sauvegarderProfil(data: {
  prenom: string
  nom: string
  profil_voyageur: string
  type_voyage_prefere: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { error } = await supabase.from('users').update({
    prenom: data.prenom || null,
    nom: data.nom || null,
    profil_voyageur: data.profil_voyageur || null,
    type_voyage_prefere: data.type_voyage_prefere || null,
  }).eq('id', user.id)

  if (error) return { error: 'Erreur lors de la sauvegarde.' }
  revalidatePath('/compte')
  return { success: true }
}
