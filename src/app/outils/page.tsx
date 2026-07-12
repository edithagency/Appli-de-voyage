import { createClient } from '@/lib/supabase/server'
import OutilsClient from './OutilsClient'

export default async function OutilsPage({
  searchParams,
}: {
  searchParams: Promise<{ pays?: string; open?: string }>
}) {
  const { pays: paysParam, open } = await searchParams
  const supabase = await createClient()

  // Numéros d'urgence et Trousse médicale partagent ces mêmes champs avec
  // l'onglet Infos voyage — un seul jeu de données, affiché différemment.
  const { data: pays } = await supabase
    .from('pays')
    .select(`
      code, nom_fr, emoji,
      urgence_police, urgence_ambulance, urgence_ambassade_france, urgence_autres, ambassade_info,
      sante_details, phrases_essentielles
    `)
    .order('nom_fr')

  // Colonne ajoutée par la migration 20240020 — requête séparée pour ne pas
  // casser les autres outils si la migration n'a pas encore été appliquée.
  const { data: budgetRows } = await supabase
    .from('pays')
    .select('code, budget_estimations')
  const budgetMap: Record<string, Record<string, Record<string, number>> | null> = {}
  if (budgetRows) budgetRows.forEach(r => { budgetMap[r.code] = (r.budget_estimations as Record<string, Record<string, number>>) ?? null })

  const paysWithBudget = (pays ?? []).map(p => ({ ...p, budget_estimations: budgetMap[p.code] ?? null }))

  // Page accessible sans compte : les favoris ne se chargent depuis Supabase
  // que si l'utilisateur est connecté, sinon OutilsClient retombe sur le
  // localStorage (pas de sync entre appareils dans ce cas).
  const { data: { user } } = await supabase.auth.getUser()
  let favorisInitiaux: string[] = []
  if (user) {
    const { data: favoris } = await supabase
      .from('outils_favoris')
      .select('outil_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    favorisInitiaux = (favoris ?? []).map(f => f.outil_id)
  }

  return (
    <OutilsClient
      pays={paysWithBudget}
      defaultPaysCode={paysParam ?? null}
      autoOpenTool={open ?? null}
      isLoggedIn={!!user}
      favorisInitiaux={favorisInitiaux}
    />
  )
}
