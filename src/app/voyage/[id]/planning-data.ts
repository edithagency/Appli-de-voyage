import { createClient } from '@/lib/supabase/server'

function listeDates(dateDepart: string, dateRetour: string) {
  const dates: string[] = []
  const cur = new Date(dateDepart)
  const fin = new Date(dateRetour)
  while (cur <= fin) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

// Les jours du voyage sont générés automatiquement (un planning_jours par date entre
// date_depart et date_retour) — jamais besoin de les créer à la main.
export async function getPlanningData(voyageId: string, dateDepart: string, dateRetour: string) {
  const supabase = await createClient()
  const dates = listeDates(dateDepart, dateRetour)

  await supabase
    .from('planning_jours')
    .upsert(
      dates.map(date => ({ voyage_id: voyageId, date })),
      { onConflict: 'voyage_id,date', ignoreDuplicates: true }
    )

  const { data: jours } = await supabase
    .from('planning_jours')
    .select('id, date, ville, ville_lat, ville_lon, resume_jour, notes_libres')
    .eq('voyage_id', voyageId)
    .order('date')

  const jourIds = (jours ?? []).map(j => j.id)
  const idsOrDummy = jourIds.length > 0 ? jourIds : ['00000000-0000-0000-0000-000000000000']

  const [{ data: activites }, { data: hebergements }, { data: transports }, { data: repas }, { data: joursSpeciaux }, { data: documents }] = await Promise.all([
    supabase.from('planning_activites')
      .select('id, jour_id, nom, lieu, adresse, heure_prevue, prix_estime, statut_reservation, activite_favori_id, document_id, added_by, ajouteur:users!added_by(prenom, emoji_avatar)')
      .in('jour_id', idsOrDummy)
      .order('heure_prevue', { nullsFirst: false }),
    supabase.from('planning_hebergements').select('*').in('jour_id', idsOrDummy),
    supabase.from('planning_transports').select('*').in('jour_id', idsOrDummy).order('heure_depart', { nullsFirst: false }),
    supabase.from('planning_repas').select('*').in('jour_id', idsOrDummy),
    supabase.from('planning_jours_speciaux').select('*').eq('voyage_id', voyageId),
    supabase.from('documents').select('id, nom_fichier, type').eq('voyage_id', voyageId).order('created_at', { ascending: false }),
  ])

  const activitesNormalisees = (activites ?? []).map(a => {
    const ajouteur = Array.isArray(a.ajouteur) ? a.ajouteur[0] : a.ajouteur
    return { ...a, ajouteurPrenom: ajouteur?.prenom ?? null, ajouteurEmoji: ajouteur?.emoji_avatar ?? null }
  })

  return {
    jours: jours ?? [],
    activites: activitesNormalisees,
    hebergements: hebergements ?? [],
    transports: transports ?? [],
    repas: repas ?? [],
    jourDepart: (joursSpeciaux ?? []).find(j => j.type === 'depart') ?? null,
    jourRetour: (joursSpeciaux ?? []).find(j => j.type === 'retour') ?? null,
    documentsVoyage: documents ?? [],
  }
}
