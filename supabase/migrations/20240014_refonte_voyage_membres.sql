-- ============================================================
-- Refonte complète du modèle voyage/membres.
-- Remplace voyage_participants par voyage_membres, fusionne
-- checklist+valise en checklist_valises/checklist_items,
-- passe documents/depenses/activite_wishlist sur le nouveau
-- modèle. Voir /Users/edith/.claude/plans/harmonic-greeting-snowglobe.md
-- pour le contexte complet et les écarts volontaires.
-- ============================================================

-- ----------------------------------------------------------
-- 0. Détacher les policies sur les tables CONSERVÉES qui
--    référencent voyage_participants (avant de le supprimer)
-- ----------------------------------------------------------
drop policy if exists "documents: lecture participants voyage" on public.documents;
drop policy if exists "depenses: accès participants" on public.depenses;
drop policy if exists "voyages: lecture participants" on public.voyages;
drop policy if exists "storage documents: lecture participants" on storage.objects;

-- ----------------------------------------------------------
-- 1. Suppression des anciennes tables remplacées — y compris les
--    tables NOUVELLES de cette même migration, pour que le script
--    entier soit rejouable sans erreur si une tentative précédente
--    s'est arrêtée en cours de route (ex: voyage_membres déjà créée).
-- ----------------------------------------------------------
drop table if exists public.voyage_info_status cascade;
drop table if exists public.checklist_items cascade;
drop table if exists public.checklist_valises cascade;
drop table if exists public.valise_bagages cascade;
drop table if exists public.valise_items cascade;
drop table if exists public.membres_foyer cascade;
drop table if exists public.voyage_participants cascade;
drop table if exists public.voyage_membres cascade;

-- ----------------------------------------------------------
-- 2. users : emoji avatar, retrait du style de voyage
-- ----------------------------------------------------------
alter table public.users add column if not exists emoji_avatar text;
alter table public.users drop column if exists type_voyage_prefere;

-- ----------------------------------------------------------
-- 3. voyage_membres (remplace voyage_participants) — créé avant
--    la policy voyages qui le référence
-- ----------------------------------------------------------
create table public.voyage_membres (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  prenom text not null,
  type text check (type in ('adulte', 'enfant')) not null default 'adulte',
  role text check (role in ('organisateur', 'membre')) not null default 'membre',
  statut_invitation text check (statut_invitation in ('pending', 'lien_copie', 'joined', 'declined')) not null default 'pending',
  token_invitation text unique default encode(gen_random_bytes(16), 'hex'),
  token_expire_at timestamptz default (now() + interval '7 days'),
  rejoint_le timestamptz,
  compagnie_aerienne text,
  created_at timestamptz default now()
);

alter table public.voyage_membres enable row level security;

drop policy if exists "voyage_membres: organisateur full access" on public.voyage_membres;
create policy "voyage_membres: organisateur full access" on public.voyage_membres
  for all using (
    auth.uid() = (select user_id from public.voyages where id = voyage_membres.voyage_id)
  );

drop policy if exists "voyage_membres: lecture si membre du voyage" on public.voyage_membres;
create policy "voyage_membres: lecture si membre du voyage" on public.voyage_membres
  for select using (
    auth.uid() = user_id
    or auth.uid() = (select user_id from public.voyages where id = voyage_membres.voyage_id)
    or exists (
      select 1 from public.voyage_membres vm2
      where vm2.voyage_id = voyage_membres.voyage_id and vm2.user_id = auth.uid()
    )
  );

drop policy if exists "voyage_membres: rejoindre par token" on public.voyage_membres;
create policy "voyage_membres: rejoindre par token" on public.voyage_membres
  for update using (
    token_invitation is not null and statut_invitation != 'joined'
  )
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------
-- 4. voyages : mode_gestion devient solo/organisateur/partage
--    (on retire l'ancienne contrainte AVANT de réécrire les valeurs,
--    sinon l'UPDATE ci-dessous viole la contrainte ('A','B') encore active)
-- ----------------------------------------------------------
alter table public.voyages drop constraint if exists voyages_mode_gestion_check;

update public.voyages set mode_gestion = case
  when mode_gestion = 'A' then 'organisateur'
  when mode_gestion = 'B' then 'partage'
  when mode_gestion in ('solo', 'organisateur', 'partage') then mode_gestion
  else 'solo'
end;

alter table public.voyages alter column mode_gestion set default 'solo';
update public.voyages set mode_gestion = 'solo' where mode_gestion is null;
alter table public.voyages alter column mode_gestion set not null;
alter table public.voyages add constraint voyages_mode_gestion_check
  check (mode_gestion in ('solo', 'organisateur', 'partage'));

drop policy if exists "voyages: lecture membres" on public.voyages;
create policy "voyages: lecture membres" on public.voyages
  for select using (
    exists (select 1 from public.voyage_membres where voyage_id = voyages.id and user_id = auth.uid())
  );

-- ----------------------------------------------------------
-- 5. checklist_valises + checklist_items (fusion checklist + valise)
-- ----------------------------------------------------------
create table public.checklist_valises (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  voyage_membre_id uuid references public.voyage_membres(id) on delete cascade not null,
  nom text not null default 'Ma valise',
  bagages_types text[] not null default '{}',
  created_at timestamptz default now(),
  unique (voyage_membre_id)
);

create table public.checklist_items (
  id uuid default gen_random_uuid() primary key,
  valise_id uuid references public.checklist_valises(id) on delete cascade not null,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  categorie text check (categorie in ('documents', 'sante', 'bagages', 'argent', 'logistique', 'avant_depart')) not null,
  sous_categorie text check (sous_categorie in ('vetements', 'hygiene', 'electronique', 'medicaments', 'documents', 'divers')),
  label text not null,
  description text,
  quantite text,
  obligatoire boolean default false,
  completed boolean default false,
  completed_by uuid references public.users(id) on delete set null,
  ordre integer default 0,
  created_at timestamptz default now()
);

alter table public.checklist_valises enable row level security;
alter table public.checklist_items enable row level security;

-- Checklist/valise : toujours strictement perso, sauf override organisateur
drop policy if exists "checklist_valises: organisateur mode organisateur" on public.checklist_valises;
create policy "checklist_valises: organisateur mode organisateur" on public.checklist_valises
  for all using (
    exists (
      select 1 from public.voyages v
      where v.id = checklist_valises.voyage_id and v.user_id = auth.uid() and v.mode_gestion = 'organisateur'
    )
  );

drop policy if exists "checklist_valises: propre valise" on public.checklist_valises;
create policy "checklist_valises: propre valise" on public.checklist_valises
  for all using (
    exists (
      select 1 from public.voyage_membres vm
      where vm.id = checklist_valises.voyage_membre_id and vm.user_id = auth.uid()
    )
  );

drop policy if exists "checklist_items: organisateur mode organisateur" on public.checklist_items;
create policy "checklist_items: organisateur mode organisateur" on public.checklist_items
  for all using (
    exists (
      select 1 from public.voyages v
      where v.id = checklist_items.voyage_id and v.user_id = auth.uid() and v.mode_gestion = 'organisateur'
    )
  );

drop policy if exists "checklist_items: propre valise" on public.checklist_items;
create policy "checklist_items: propre valise" on public.checklist_items
  for all using (
    exists (
      select 1 from public.checklist_valises cv
      join public.voyage_membres vm on vm.id = cv.voyage_membre_id
      where cv.id = checklist_items.valise_id and vm.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- 5b. voyage_info_status : progression "géré" des cartes Infos, par membre
-- ----------------------------------------------------------
create table public.voyage_info_status (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  voyage_membre_id uuid references public.voyage_membres(id) on delete cascade not null,
  info_id text not null,
  completed boolean default false not null,
  completed_at timestamptz,
  updated_at timestamptz default now(),
  unique (voyage_membre_id, info_id)
);

alter table public.voyage_info_status enable row level security;

drop policy if exists "voyage_info_status: organisateur mode organisateur" on public.voyage_info_status;
create policy "voyage_info_status: organisateur mode organisateur" on public.voyage_info_status
  for all using (
    exists (
      select 1 from public.voyages v
      where v.id = voyage_info_status.voyage_id and v.user_id = auth.uid() and v.mode_gestion = 'organisateur'
    )
  );

drop policy if exists "voyage_info_status: propre statut" on public.voyage_info_status;
create policy "voyage_info_status: propre statut" on public.voyage_info_status
  for all using (
    exists (
      select 1 from public.voyage_membres vm
      where vm.id = voyage_info_status.voyage_membre_id and vm.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- 6. documents : uploaded_by / belongs_to (voyage_membres)
-- ----------------------------------------------------------
alter table public.documents rename column user_id to uploaded_by;
alter table public.documents add column if not exists belongs_to uuid references public.voyage_membres(id) on delete set null;
alter table public.documents drop column if exists membre_id;

drop policy if exists "documents: accès propre" on public.documents;
drop policy if exists "documents: lecture participants voyage" on public.documents;
drop policy if exists "documents: uploader" on public.documents;
drop policy if exists "documents: organisateur mode organisateur" on public.documents;
drop policy if exists "documents: lecture mode partage" on public.documents;

create policy "documents: uploader" on public.documents
  for all using (auth.uid() = uploaded_by);

create policy "documents: organisateur mode organisateur" on public.documents
  for all using (
    voyage_id is not null and exists (
      select 1 from public.voyages v
      where v.id = documents.voyage_id and v.user_id = auth.uid() and v.mode_gestion = 'organisateur'
    )
  );

create policy "documents: lecture mode partage" on public.documents
  for select using (
    voyage_id is not null and exists (
      select 1 from public.voyages v
      join public.voyage_membres vm on vm.voyage_id = v.id
      where v.id = documents.voyage_id and v.mode_gestion = 'partage' and vm.user_id = auth.uid()
    )
  );

drop policy if exists "storage documents: lecture mode partage" on storage.objects;
create policy "storage documents: lecture mode partage" on storage.objects
  for select using (
    bucket_id = 'documents' and
    exists (
      select 1 from public.documents d
      join public.voyages v on v.id = d.voyage_id
      join public.voyage_membres vm on vm.voyage_id = v.id
      where d.storage_path = storage.objects.name
        and v.mode_gestion = 'partage'
        and vm.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- 7. activite_wishlist : qui a ajouté quoi
-- ----------------------------------------------------------
alter table public.activite_wishlist add column if not exists ajoute_par uuid references public.voyage_membres(id) on delete set null;

drop policy if exists "activite_wishlist: createur voyage" on public.activite_wishlist;
create policy "activite_wishlist: createur voyage" on public.activite_wishlist
  for all using (
    exists (select 1 from public.voyages v where v.id = activite_wishlist.voyage_id and v.user_id = auth.uid())
  );

drop policy if exists "activite_wishlist: membres mode partage" on public.activite_wishlist;
create policy "activite_wishlist: membres mode partage" on public.activite_wishlist
  for all using (
    exists (
      select 1 from public.voyages v
      join public.voyage_membres vm on vm.voyage_id = v.id
      where v.id = activite_wishlist.voyage_id and v.mode_gestion = 'partage' and vm.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- 8. depenses : payeur/participants par voyage_membre
-- ----------------------------------------------------------
alter table public.depenses add column if not exists payeur_membre_id uuid references public.voyage_membres(id) on delete set null;
alter table public.depenses add column if not exists participants_membre_ids uuid[] default '{}';
alter table public.depenses drop column if exists payeur_prenom;
alter table public.depenses drop column if exists participants;

drop policy if exists "depenses: createur voyage" on public.depenses;
create policy "depenses: createur voyage" on public.depenses
  for all using (
    exists (select 1 from public.voyages v where v.id = depenses.voyage_id and v.user_id = auth.uid())
  );

drop policy if exists "depenses: membres mode partage" on public.depenses;
create policy "depenses: membres mode partage" on public.depenses
  for all using (
    exists (
      select 1 from public.voyages v
      join public.voyage_membres vm on vm.voyage_id = v.id
      where v.id = depenses.voyage_id and v.mode_gestion = 'partage' and vm.user_id = auth.uid()
    )
  );
