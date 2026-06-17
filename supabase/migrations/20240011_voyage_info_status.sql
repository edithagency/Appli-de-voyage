-- ============================================================
-- Suivi de l'état "vérifié / géré" de chaque carte Info du
-- voyage (visa, vaccins, bagages, devise...). Une fois cochée,
-- la carte passe en niveaux de gris côté front. La progression
-- de la page Infos est calculée à partir de cette table.
-- ============================================================

create table public.voyage_info_status (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  participant_id uuid references public.voyage_participants(id) on delete cascade,
  info_id text not null,
  completed boolean default false not null,
  completed_at timestamptz,
  updated_at timestamptz default now()
);

-- Une seule ligne par (voyage, carte, participant) — et par (voyage, carte)
-- quand participant_id est nul (organisateur / mode A / solo).
create unique index voyage_info_status_unique_participant
  on public.voyage_info_status (voyage_id, info_id, participant_id)
  where participant_id is not null;

create unique index voyage_info_status_unique_sans_participant
  on public.voyage_info_status (voyage_id, info_id)
  where participant_id is null;

alter table public.voyage_info_status enable row level security;

create policy "info_status: organisateur" on public.voyage_info_status
  for all using (
    exists (
      select 1 from public.voyages
      where voyages.id = voyage_info_status.voyage_id
      and voyages.user_id = auth.uid()
    )
  );

create policy "info_status: participants" on public.voyage_info_status
  for all using (
    exists (
      select 1 from public.voyage_participants
      where voyage_id = voyage_info_status.voyage_id
      and user_id = auth.uid()
    )
  );
