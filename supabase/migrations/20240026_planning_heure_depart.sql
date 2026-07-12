-- Remplace l'heure limite d'enregistrement par l'heure de départ du vol sur les jours
-- spéciaux départ/retour (heure_limite_enregistrement reste en base, inutilisée).
alter table public.planning_jours_speciaux
  add column if not exists heure_depart time;
