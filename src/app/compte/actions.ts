'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function sauvegarderProfil(data: {
  prenom: string
  nom: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { error } = await supabase.from('users').update({
    prenom: data.prenom || null,
    nom: data.nom || null,
  }).eq('id', user.id)

  if (error) return { error: 'Erreur lors de la sauvegarde.' }
  revalidatePath('/compte')
  return { success: true }
}

const AVATAR_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadAvatar(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non connecté.' }

    const file = formData.get('file') as File
    if (!file || file.size === 0) return { error: 'Aucune image sélectionnée.' }
    if (file.size > 5 * 1024 * 1024) return { error: 'Image trop lourde (max 5 Mo).' }

    const ext = (file.name.split('.').pop() ?? '').toLowerCase()
    if (!AVATAR_EXTENSIONS.includes(ext) || !AVATAR_TYPES.includes(file.type)) {
      return { error: 'Image JPG, PNG ou WEBP uniquement.' }
    }

    // Best-effort : retire les anciennes variantes (extension différente) avant l'upload
    await supabase.storage.from('avatars').remove(AVATAR_EXTENSIONS.map(e => `${user.id}/avatar.${e}`))

    const storagePath = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(storagePath, file, { contentType: file.type, upsert: true })

    if (uploadError) return { error: `Erreur lors de l'upload : ${uploadError.message}` }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(storagePath)
    const avatarUrl = `${publicUrl}?v=${Date.now()}`

    const { error: dbError } = await supabase.from('users').update({ avatar_url: avatarUrl }).eq('id', user.id)
    if (dbError) return { error: `Erreur lors de l'enregistrement : ${dbError.message}` }

    revalidatePath('/compte')
    return { success: true, avatarUrl }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur inattendue lors de l'upload." }
  }
}

export async function supprimerAvatar() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non connecté.' }

    await supabase.storage.from('avatars').remove(AVATAR_EXTENSIONS.map(e => `${user.id}/avatar.${e}`))
    const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', user.id)
    if (error) return { error: 'Erreur lors de la suppression.' }

    revalidatePath('/compte')
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur inattendue lors de la suppression.' }
  }
}

export async function changerMotDePasse(nouveauMotDePasse: string) {
  try {
    if (nouveauMotDePasse.length < 8) {
      return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non connecté.' }

    const { error } = await supabase.auth.updateUser({ password: nouveauMotDePasse })
    if (error) return { error: error.message }

    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur inattendue.' }
  }
}

export async function exporterDonnees() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non connecté.' }

    const [{ data: profil }, { data: voyagesOrganises }, { data: participations }] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('voyages').select('*').eq('user_id', user.id),
      supabase.from('voyage_membres').select('*').eq('user_id', user.id),
    ])

    return {
      success: true,
      data: {
        exporte_le: new Date().toISOString(),
        compte: { id: user.id, email: user.email, cree_le: user.created_at },
        profil,
        voyages_organises: voyagesOrganises ?? [],
        participations: participations ?? [],
      },
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur inattendue.' }
  }
}
