-- ============================================================
-- Ajoute les coordonnées de la ville d'un jour de planning
-- (recherche libre type "décalage horaire", pas de liste figée),
-- utiles plus tard pour la vue carte.
-- ============================================================

alter table public.planning_jours
  add column if not exists ville_lat double precision,
  add column if not exists ville_lon double precision;
