'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateValise, QuestionnaireValise } from '@/lib/utils/generateValise'

export async function genererValise(voyageId: string, questionnaire: QuestionnaireValise) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const items = generateValise(questionnaire)

  await supabase.from('valise_items')
    .delete()
    .eq('voyage_id', voyageId)
    .eq('membre_prenom', questionnaire.prenom)

  await supabase.from('valise_items').insert(
    items.map((item, i) => ({
      voyage_id: voyageId,
      membre_prenom: questionnaire.prenom,
      categorie: item.categorie,
      label: item.label,
      quantite: item.quantite ?? null,
      obligatoire: item.obligatoire,
      completed: false,
      ordre: i,
    }))
  )

  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}

export async function toggleValiseItem(itemId: string, completed: boolean) {
  const supabase = await createClient()
  await supabase.from('valise_items').update({ completed }).eq('id', itemId)
}

export async function supprimerValiseItem(itemId: string) {
  const supabase = await createClient()
  await supabase.from('valise_items').delete().eq('id', itemId)
}

export async function supprimerValise(voyageId: string, membrePrenom: string) {
  const supabase = await createClient()
  await supabase.from('valise_items')
    .delete()
    .eq('voyage_id', voyageId)
    .eq('membre_prenom', membrePrenom)
}

export async function ajouterValiseItem(voyageId: string, data: {
  membre_prenom: string
  label: string
  categorie: string
  quantite?: string
}) {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('valise_items').select('ordre').eq('voyage_id', voyageId).order('ordre', { ascending: false }).limit(1)
  const maxOrdre = items?.[0]?.ordre ?? 0

  const { error } = await supabase.from('valise_items').insert({
    voyage_id: voyageId,
    membre_prenom: data.membre_prenom,
    label: data.label,
    categorie: data.categorie,
    quantite: data.quantite || null,
    obligatoire: false,
    completed: false,
    ordre: maxOrdre + 1,
  })
  if (error) return { error: 'Erreur lors de l\'ajout.' }
  return { success: true }
}
