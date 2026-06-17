'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateChecklist } from '@/lib/utils/generateChecklist'
import { generateValise, QuestionnaireValise } from '@/lib/utils/generateValise'

const CATEGORIES_ADMIN = ['documents', 'sante', 'argent', 'logistique', 'avant_depart'] as const

// Génère les items administratifs (documents/santé/argent/logistique/avant-départ) pour une valise
export async function genererChecklist(valiseId: string, voyageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const [{ data: voyage }, { data: valise }, { data: tousLesMembres }] = await Promise.all([
    supabase.from('voyages').select('*, pays:pays_code(*)').eq('id', voyageId).single(),
    supabase.from('checklist_valises').select('id, voyage_membre_id').eq('id', valiseId).single(),
    supabase.from('voyage_membres').select('id, type').eq('voyage_id', voyageId),
  ])
  if (!voyage || !valise) return { error: 'Voyage introuvable.' }

  const { data: membre } = await supabase.from('voyage_membres').select('type').eq('id', valise.voyage_membre_id).single()
  if (!membre) return { error: 'Membre introuvable.' }

  const nbAdultes = (tousLesMembres ?? []).filter(m => m.type === 'adulte').length
  const nbEnfants = (tousLesMembres ?? []).filter(m => m.type === 'enfant').length

  const duree = Math.ceil(
    (new Date(voyage.date_retour).getTime() - new Date(voyage.date_depart).getTime()) / (1000 * 60 * 60 * 24)
  )

  const items = generateChecklist(
    voyage.pays as any,
    { prenom: '', type: membre.type as 'adulte' | 'enfant' },
    { nbAdultes, nbEnfants },
    duree
  )

  await supabase.from('checklist_items').delete().eq('valise_id', valiseId).in('categorie', CATEGORIES_ADMIN)
  await supabase.from('checklist_items').insert(items.map(item => ({ ...item, valise_id: valiseId, voyage_id: voyageId })))

  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}

// Génère les articles de valise (catégorie bagages, sous-catégorisés)
export async function genererValise(valiseId: string, voyageId: string, questionnaire: QuestionnaireValise) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const items = generateValise(questionnaire)

  await supabase.from('checklist_items').delete().eq('valise_id', valiseId).eq('categorie', 'bagages')
  await supabase.from('checklist_items').insert(
    items.map((item, i) => ({
      valise_id: valiseId,
      voyage_id: voyageId,
      categorie: 'bagages' as const,
      sous_categorie: item.categorie,
      label: item.label,
      quantite: item.quantite ?? null,
      obligatoire: item.obligatoire,
      completed: false,
      ordre: i,
    }))
  )

  await supabase.from('checklist_valises').update({ bagages_types: questionnaire.bagages }).eq('id', valiseId)

  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}

export async function toggleItem(itemId: string, completed: boolean, voyageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await supabase
    .from('checklist_items')
    .update({ completed, completed_by: completed ? (user?.id ?? null) : null })
    .eq('id', itemId)
  revalidatePath(`/voyage/${voyageId}`)
}

export async function ajouterItem(valiseId: string, voyageId: string, data: {
  label: string
  categorie: string
  sous_categorie?: string | null
  description?: string
  quantite?: string
  obligatoire: boolean
}) {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('checklist_items')
    .select('ordre')
    .eq('valise_id', valiseId)
    .order('ordre', { ascending: false })
    .limit(1)

  const maxOrdre = items?.[0]?.ordre ?? 0

  const { error } = await supabase.from('checklist_items').insert({
    valise_id: valiseId,
    voyage_id: voyageId,
    label: data.label,
    categorie: data.categorie,
    sous_categorie: data.sous_categorie || null,
    description: data.description || null,
    quantite: data.quantite || null,
    obligatoire: data.obligatoire,
    completed: false,
    ordre: maxOrdre + 1,
  })

  if (error) return { error: 'Erreur lors de l\'ajout.' }
  return { success: true }
}

export async function supprimerCategorie(valiseId: string, voyageId: string, categorie: string) {
  const supabase = await createClient()
  await supabase.from('checklist_items').delete().eq('valise_id', valiseId).eq('categorie', categorie)
  revalidatePath(`/voyage/${voyageId}`)
}

export async function supprimerItem(itemId: string, voyageId: string) {
  const supabase = await createClient()
  await supabase.from('checklist_items').delete().eq('id', itemId)
  revalidatePath(`/voyage/${voyageId}`)
}

export async function modifierItem(itemId: string, voyageId: string, data: {
  label: string
  description?: string
  quantite?: string
  obligatoire: boolean
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('checklist_items')
    .update({
      label: data.label,
      description: data.description || null,
      quantite: data.quantite || null,
      obligatoire: data.obligatoire,
    })
    .eq('id', itemId)

  if (error) return { error: 'Erreur lors de la modification.' }
  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}

export async function deplacerItem(
  itemId: string,
  voyageId: string,
  valiseId: string,
  categorie: string,
  direction: 'haut' | 'bas'
) {
  const supabase = await createClient()

  const { data: items } = await supabase.from('checklist_items')
    .select('id, ordre')
    .eq('valise_id', valiseId)
    .eq('categorie', categorie)
    .order('ordre')

  if (!items) return { error: 'Erreur lors du déplacement.' }

  const index = items.findIndex(i => i.id === itemId)
  const targetIndex = direction === 'haut' ? index - 1 : index + 1
  if (index === -1 || targetIndex < 0 || targetIndex >= items.length) return { error: 'Déplacement impossible.' }

  const current = items[index]
  const target = items[targetIndex]

  await supabase.from('checklist_items').update({ ordre: target.ordre }).eq('id', current.id)
  await supabase.from('checklist_items').update({ ordre: current.ordre }).eq('id', target.id)

  revalidatePath(`/voyage/${voyageId}`)
  return { success: true }
}
