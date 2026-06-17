-- ============================================================
-- Tables manquantes référencées par le code et par les policies
-- de 20240007 (valise_items, depenses), budget_total sur voyages,
-- et expiration des tokens d'invitation.
-- Utilise "if not exists" / "drop policy if exists" pour rester
-- compatible avec une base existante où ces objets ont déjà été
-- créés manuellement.
-- ============================================================

-- ----------------------------------------------------------
-- Table valise_items
-- ----------------------------------------------------------
create table if not exists public.valise_items (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  membre_prenom text not null,
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
    exists (
      select 1 from public.voyages
      where voyages.id = valise_items.voyage_id
      and voyages.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- Table depenses
-- ----------------------------------------------------------
create table if not exists public.depenses (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  label text not null,
  montant numeric not null,
  payeur_prenom text not null,
  participants text[] default '{}',
  categorie text default 'autre',
  created_at timestamptz default now()
);

alter table public.depenses enable row level security;

drop policy if exists "depenses: organisateur" on public.depenses;
create policy "depenses: organisateur" on public.depenses
  for all using (
    exists (
      select 1 from public.voyages
      where voyages.id = depenses.voyage_id
      and voyages.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- Budget total du voyage (Tricount)
-- ----------------------------------------------------------
alter table public.voyages
  add column if not exists budget_total numeric default 0;

-- ----------------------------------------------------------
-- Expiration des tokens d'invitation (7 jours)
-- ----------------------------------------------------------
alter table public.voyage_participants
  add column if not exists token_expire_at timestamptz default (now() + interval '7 days');
