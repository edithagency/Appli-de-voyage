'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function sauvegarderProfil(data: {
  prenom: string
  nom: string
  emoji_avatar: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { error } = await supabase.from('users').update({
    prenom: data.prenom || null,
    nom: data.nom || null,
    emoji_avatar: data.emoji_avatar || null,
  }).eq('id', user.id)

  if (error) return { error: 'Erreur lors de la sauvegarde.' }
  revalidatePath('/compte')
  return { success: true }
}
