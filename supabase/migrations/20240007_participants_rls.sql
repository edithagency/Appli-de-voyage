-- Colonne participant_id sur checklist_items (checklist personnelle Mode B)
alter table public.checklist_items
  add column if not exists participant_id uuid references public.voyage_participants(id) on delete cascade;

-- Colonne compagnie_aerienne sur voyage_participants (vol perso Mode B)
alter table public.voyage_participants
  add column if not exists compagnie_aerienne text;

-- Permettre aux participants de lire le voyage
create policy "voyages: lecture participants" on public.voyages
  for select using (
    exists (
      select 1 from public.voyage_participants
      where voyage_id = voyages.id
      and user_id = auth.uid()
    )
  );

-- Permettre aux participants d'accéder aux checklist_items de leur voyage
create policy "checklist: accès participants" on public.checklist_items
  for all using (
    exists (
      select 1 from public.voyage_participants
      where voyage_id = checklist_items.voyage_id
      and user_id = auth.uid()
    )
  );

-- Permettre aux participants d'accéder aux valise_items de leur voyage
create policy "valise: accès participants" on public.valise_items
  for all using (
    exists (
      select 1 from public.voyage_participants
      where voyage_id = valise_items.voyage_id
      and user_id = auth.uid()
    )
  );

-- Permettre aux participants d'accéder aux dépenses de leur voyage
create policy "depenses: accès participants" on public.depenses
  for all using (
    exists (
      select 1 from public.voyage_participants
      where voyage_id = depenses.voyage_id
      and user_id = auth.uid()
    )
  );
