-- ============================================================
-- Enrichit voyage_membres pour les enfants : date de naissance
-- (affichage de l'âge) et parent responsable. Les enfants ne
-- reçoivent jamais de lien d'invitation ('na' au lieu de
-- 'pending'/'joined').
-- ============================================================

alter table public.voyage_membres
  add column if not exists date_naissance date,
  add column if not exists parent_id uuid references public.voyage_membres(id) on delete set null;

alter table public.voyage_membres drop constraint if exists voyage_membres_statut_invitation_check;
alter table public.voyage_membres add constraint voyage_membres_statut_invitation_check
  check (statut_invitation in ('pending', 'lien_copie', 'joined', 'declined', 'na'));
