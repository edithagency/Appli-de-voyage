'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function ajouterMembre(data: {
  prenom: string
  type: 'adulte' | 'enfant'
  date_naissance?: string
  groupe_sanguin?: string
  allergies?: string
  medicaments?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { error } = await supabase.from('membres_foyer').insert({
    user_id: user.id,
    prenom: data.prenom,
    type: data.type,
    date_naissance: data.date_naissance || null,
    groupe_sanguin: data.groupe_sanguin || null,
    allergies: data.allergies || null,
    medicaments: data.medicaments || null,
  })

  if (error) return { error: 'Erreur lors de l\'ajout.' }
  revalidatePath('/famille')
  return { success: true }
}

export async function modifierMembre(id: string, data: {
  prenom: string
  type: 'adulte' | 'enfant'
  date_naissance?: string
  groupe_sanguin?: string
  allergies?: string
  medicaments?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { error } = await supabase.from('membres_foyer').update({
    prenom: data.prenom,
    type: data.type,
    date_naissance: data.date_naissance || null,
    groupe_sanguin: data.groupe_sanguin || null,
    allergies: data.allergies || null,
    medicaments: data.medicaments || null,
  }).eq('id', id).eq('user_id', user.id)

  if (error) return { error: 'Erreur lors de la modification.' }
  revalidatePath('/famille')
  return { success: true }
}

export async function supprimerMembre(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { error } = await supabase.from('membres_foyer')
    .delete().eq('id', id).eq('user_id', user.id)

  if (error) return { error: 'Erreur lors de la suppression.' }
  revalidatePath('/famille')
  return { success: true }
}
