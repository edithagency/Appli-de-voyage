-- Ajout type_voyage et mode_gestion sur la table voyages
alter table public.voyages
  add column if not exists type_voyage text check (type_voyage in ('solo', 'couple', 'famille', 'amis')),
  add column if not exists mode_gestion text check (mode_gestion in ('A', 'B'));

-- Table voyage_participants
create table public.voyage_participants (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  prenom text not null,
  type text check (type in ('adulte', 'enfant')) not null default 'adulte',
  role text check (role in ('organisateur', 'participant')) not null default 'participant',
  statut text check (statut in ('en_attente', 'lien_copie', 'rejoint')) not null default 'en_attente',
  token_invitation text unique default encode(gen_random_bytes(16), 'hex'),
  rejoint_le timestamptz,
  created_at timestamptz default now()
);

alter table public.voyage_participants enable row level security;

-- L'organisateur (propriétaire du voyage) peut tout faire
create policy "participants: organisateur full access" on public.voyage_participants
  for all using (
    auth.uid() = (select user_id from public.voyages where id = voyage_id)
  );

-- Un participant peut voir les participants de son voyage (une fois rejoint)
create policy "participants: lecture si membre" on public.voyage_participants
  for select using (
    auth.uid() = user_id
    or auth.uid() = (select user_id from public.voyages where id = voyage_id)
  );

-- Un participant peut se lier à son token (update user_id + statut)
create policy "participants: rejoindre par token" on public.voyage_participants
  for update using (
    token_invitation is not null and statut != 'rejoint'
  )
  with check (
    auth.uid() = user_id
  );
