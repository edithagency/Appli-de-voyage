-- ============================================================
-- Enrichit l'onglet Planning : ville + résumé par jour, détails
-- transport/hébergement (aéroports, terminaux, type de logement),
-- documents liés (transport/hébergement/activité/repas), et une
-- table dédiée aux jours spéciaux départ/retour.
-- ============================================================

alter table public.planning_jours
  add column if not exists ville text,
  add column if not exists resume_jour text;

alter table public.planning_transports
  add column if not exists document_id uuid references public.documents(id) on delete set null,
  add column if not exists aeroport_depart text,
  add column if not exists terminal_depart text,
  add column if not exists aeroport_arrivee text,
  add column if not exists terminal_arrivee text,
  add column if not exists heure_limite_enregistrement time;

alter table public.planning_hebergements
  add column if not exists document_id uuid references public.documents(id) on delete set null,
  add column if not exists type_hebergement text check (type_hebergement in ('hotel', 'airbnb', 'hostel', 'habitant', 'autre')),
  add column if not exists heure_checkin time,
  add column if not exists heure_checkout time;

alter table public.planning_activites
  add column if not exists document_id uuid references public.documents(id) on delete set null;

alter table public.planning_repas
  add column if not exists document_id uuid references public.documents(id) on delete set null;

create table public.planning_jours_speciaux (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  type text check (type in ('depart', 'retour')) not null,
  aeroport_depart text,
  terminal_depart text,
  aeroport_arrivee text,
  terminal_arrivee text,
  heure_limite_enregistrement time,
  documents_checklist jsonb not null default '[]',
  created_at timestamptz default now(),
  unique (voyage_id, type)
);

alter table public.planning_jours_speciaux enable row level security;

-- Même accès que le reste du planning : tout adulte membre du voyage (un enfant n'a
-- jamais de session, donc jamais de user_id correspondant — aucune règle d'âge séparée
-- n'est nécessaire pour l'exclure).
create policy "planning_jours_speciaux: adultes du voyage" on public.planning_jours_speciaux
  for all using (
    exists (
      select 1 from public.voyage_membres vm
      where vm.voyage_id = planning_jours_speciaux.voyage_id and vm.user_id = auth.uid()
    )
  );
