-- ============================================================
-- Refonte cohérence "voyage partagé" :
-- 1. Suppression de la catégorisation type_voyage / profil_voyageur
--    (solo/couple/famille/amis) : n'apportait plus de valeur, le
--    vrai distinguant est désormais uniquement solo vs partagé
--    + mode_gestion (A/B), avec adulte/enfant toujours disponible.
-- 2. Unification de la clé d'identification "personnelle" sur
--    voyage_participants.id partout (checklist le faisait déjà,
--    valise utilisait membre_prenom en texte libre).
--
-- Écrit sans bloc DO/PLpgSQL pour rester compatible avec tous les
-- éditeurs SQL. Chaque instruction est idempotente (rejouable sans
-- erreur). Si une table valise_items/valise_bagages existante avait
-- des données liées à membre_prenom, elles redeviennent "perso"
-- (participant_id = null) — à régénérer si besoin via l'app.
-- ============================================================

-- ----------------------------------------------------------
-- 1. Suppression des colonnes de catégorisation
-- ----------------------------------------------------------
alter table public.voyages drop column if exists type_voyage;
alter table public.users drop column if exists profil_voyageur;

-- ----------------------------------------------------------
-- 2. valise_items : schéma final (créée directement si absente)
-- ----------------------------------------------------------
create table if not exists public.valise_items (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  participant_id uuid references public.voyage_participants(id) on delete cascade,
  categorie text check (categorie in ('vetements', 'hygiene', 'electronique', 'medicaments', 'documents', 'divers')) not null,
  label text not null,
  quantite text,
  obligatoire boolean default false,
  completed boolean default false,
  ordre integer default 0,
  created_at timestamptz default now()
);

alter table public.valise_items enable row level security;

drop policy if exists "valise_items: organisateur" on public.valise_items;
create policy "valise_items: organisateur" on public.valise_items
  for all using (
    exists (select 1 from public.voyages where voyages.id = valise_items.voyage_id and voyages.user_id = auth.uid())
  );

drop policy if exists "valise_items: participants" on public.valise_items;
create policy "valise_items: participants" on public.valise_items
  for all using (
    exists (select 1 from public.voyage_participants where voyage_id = valise_items.voyage_id and user_id = auth.uid())
  );

alter table public.valise_items add column if not exists participant_id uuid references public.voyage_participants(id) on delete cascade;
alter table public.valise_items drop column if exists membre_prenom;

-- ----------------------------------------------------------
-- 3. valise_bagages : schéma final (créée directement si absente)
-- ----------------------------------------------------------
create table if not exists public.valise_bagages (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  participant_id uuid references public.voyage_participants(id) on delete cascade,
  bagages text[] not null default '{}',
  updated_at timestamptz default now()
);

alter table public.valise_bagages enable row level security;

drop policy if exists "valise_bagages: organisateur" on public.valise_bagages;
create policy "valise_bagages: organisateur" on public.valise_bagages
  for all using (
    exists (select 1 from public.voyages where voyages.id = valise_bagages.voyage_id and voyages.user_id = auth.uid())
  );

drop policy if exists "valise_bagages: participants" on public.valise_bagages;
create policy "valise_bagages: participants" on public.valise_bagages
  for all using (
    exists (select 1 from public.voyage_participants where voyage_id = valise_bagages.voyage_id and user_id = auth.uid())
  );

alter table public.valise_bagages add column if not exists participant_id uuid references public.voyage_participants(id) on delete cascade;
alter table public.valise_bagages drop constraint if exists valise_bagages_voyage_id_membre_prenom_key;
alter table public.valise_bagages drop column if exists membre_prenom;

create unique index if not exists valise_bagages_unique_participant
  on public.valise_bagages (voyage_id, participant_id)
  where participant_id is not null;

create unique index if not exists valise_bagages_unique_sans_participant
  on public.valise_bagages (voyage_id)
  where participant_id is null;
