-- ============================================================
-- Un enfant n'a jamais sa propre session : c'est toujours un
-- adulte connecté qui coche ses cases Infos, remplit sa
-- valise/checklist depuis SA propre interface. N'importe quel
-- adulte du voyage peut gérer n'importe quel enfant du voyage
-- (pas seulement un parent désigné). Les policies RLS qui ne
-- vérifiaient que vm.user_id = auth.uid() bloquaient donc tout
-- adulte en mode partagé agissant pour un enfant (dont user_id
-- est toujours null). On les étend : un enfant est gérable par
-- tout adulte membre du même voyage.
-- ============================================================

-- Traçabilité : qui a coché la case (peut différer du membre concerné).
alter table public.voyage_info_status
  add column if not exists completed_by uuid references public.users(id) on delete set null;

drop policy if exists "voyage_info_status: propre statut" on public.voyage_info_status;
create policy "voyage_info_status: propre statut" on public.voyage_info_status
  for all using (
    exists (
      select 1 from public.voyage_membres vm
      where vm.id = voyage_info_status.voyage_membre_id
      and (
        vm.user_id = auth.uid()
        or (
          vm.type = 'enfant'
          and exists (
            select 1 from public.voyage_membres adulte
            where adulte.voyage_id = vm.voyage_id and adulte.user_id = auth.uid()
          )
        )
      )
    )
  );

drop policy if exists "checklist_valises: propre valise" on public.checklist_valises;
create policy "checklist_valises: propre valise" on public.checklist_valises
  for all using (
    exists (
      select 1 from public.voyage_membres vm
      where vm.id = checklist_valises.voyage_membre_id
      and (
        vm.user_id = auth.uid()
        or (
          vm.type = 'enfant'
          and exists (
            select 1 from public.voyage_membres adulte
            where adulte.voyage_id = vm.voyage_id and adulte.user_id = auth.uid()
          )
        )
      )
    )
  );

drop policy if exists "checklist_items: propre valise" on public.checklist_items;
create policy "checklist_items: propre valise" on public.checklist_items
  for all using (
    exists (
      select 1 from public.checklist_valises cv
      join public.voyage_membres vm on vm.id = cv.voyage_membre_id
      where cv.id = checklist_items.valise_id
      and (
        vm.user_id = auth.uid()
        or (
          vm.type = 'enfant'
          and exists (
            select 1 from public.voyage_membres adulte
            where adulte.voyage_id = vm.voyage_id and adulte.user_id = auth.uid()
          )
        )
      )
    )
  );
