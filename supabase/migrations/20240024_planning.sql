-- ============================================================
-- Onglet Planning : itinéraire jour par jour (hébergement,
-- transport, activités, repas, notes libres).
-- Accès : tout adulte membre du voyage peut lire/écrire (un
-- enfant n'a jamais de session propre — vm.user_id = auth.uid()
-- n'est donc jamais vrai pour lui, ce qui suffit à le cantonner
-- hors de ces tables sans règle d'âge séparée).
-- ============================================================

create table public.planning_jours (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  date date not null,
  notes_libres text,
  created_at timestamptz default now(),
  unique (voyage_id, date)
);

create table public.planning_activites (
  id uuid default gen_random_uuid() primary key,
  jour_id uuid references public.planning_jours(id) on delete cascade not null,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  activite_favori_id uuid references public.activites(id) on delete set null,
  nom text not null,
  lieu text,
  adresse text,
  heure_prevue time,
  prix_estime text,
  statut_reservation text check (statut_reservation in ('libre', 'a_reserver', 'reserve')) not null default 'a_reserver',
  added_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now()
);

create table public.planning_hebergements (
  id uuid default gen_random_uuid() primary key,
  jour_id uuid references public.planning_jours(id) on delete cascade not null,
  nom text not null,
  adresse text,
  numero_confirmation text,
  petit_dej_inclus boolean not null default false,
  check_in boolean not null default false,
  check_out boolean not null default false,
  created_at timestamptz default now()
);

create table public.planning_transports (
  id uuid default gen_random_uuid() primary key,
  jour_id uuid references public.planning_jours(id) on delete cascade not null,
  type text check (type in ('vol', 'train', 'bus', 'voiture', 'taxi', 'bateau', 'autre')) not null,
  compagnie text,
  reference text,
  heure_depart time,
  heure_arrivee time,
  depart_de text,
  arrivee_a text,
  created_at timestamptz default now()
);

create table public.planning_repas (
  id uuid default gen_random_uuid() primary key,
  jour_id uuid references public.planning_jours(id) on delete cascade not null,
  nom_restaurant text not null,
  moment text check (moment in ('matin', 'midi', 'soir')) not null,
  reserve boolean not null default false,
  created_at timestamptz default now()
);

alter table public.planning_jours enable row level security;
alter table public.planning_activites enable row level security;
alter table public.planning_hebergements enable row level security;
alter table public.planning_transports enable row level security;
alter table public.planning_repas enable row level security;

create policy "planning_jours: adultes du voyage" on public.planning_jours
  for all using (
    exists (
      select 1 from public.voyage_membres vm
      where vm.voyage_id = planning_jours.voyage_id and vm.user_id = auth.uid()
    )
  );

create policy "planning_activites: adultes du voyage" on public.planning_activites
  for all using (
    exists (
      select 1 from public.voyage_membres vm
      where vm.voyage_id = planning_activites.voyage_id and vm.user_id = auth.uid()
    )
  );

create policy "planning_hebergements: adultes du voyage" on public.planning_hebergements
  for all using (
    exists (
      select 1 from public.planning_jours pj
      join public.voyage_membres vm on vm.voyage_id = pj.voyage_id
      where pj.id = planning_hebergements.jour_id and vm.user_id = auth.uid()
    )
  );

create policy "planning_transports: adultes du voyage" on public.planning_transports
  for all using (
    exists (
      select 1 from public.planning_jours pj
      join public.voyage_membres vm on vm.voyage_id = pj.voyage_id
      where pj.id = planning_transports.jour_id and vm.user_id = auth.uid()
    )
  );

create policy "planning_repas: adultes du voyage" on public.planning_repas
  for all using (
    exists (
      select 1 from public.planning_jours pj
      join public.voyage_membres vm on vm.voyage_id = pj.voyage_id
      where pj.id = planning_repas.jour_id and vm.user_id = auth.uid()
    )
  );
