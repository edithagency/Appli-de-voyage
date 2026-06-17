-- ============================================================
-- Persistance côté serveur du type de bagage choisi par personne
-- (cabine/soute/etc.), auparavant stocké uniquement en localStorage.
-- ============================================================

create table if not exists public.valise_bagages (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  membre_prenom text not null,
  bagages text[] not null default '{}',
  updated_at timestamptz default now(),
  unique (voyage_id, membre_prenom)
);

alter table public.valise_bagages enable row level security;

drop policy if exists "valise_bagages: organisateur" on public.valise_bagages;
create policy "valise_bagages: organisateur" on public.valise_bagages
  for all using (
    exists (
      select 1 from public.voyages
      where voyages.id = valise_bagages.voyage_id
      and voyages.user_id = auth.uid()
    )
  );

drop policy if exists "valise_bagages: participants" on public.valise_bagages;
create policy "valise_bagages: participants" on public.valise_bagages
  for all using (
    exists (
      select 1 from public.voyage_participants
      where voyage_id = valise_bagages.voyage_id
      and user_id = auth.uid()
    )
  );
