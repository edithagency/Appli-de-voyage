-- Les participants peuvent LIRE les documents voyage-spécifiques des voyages qu'ils ont rejoints.
-- Les permanents (voyage_id IS NULL) restent privés — ce sont des documents personnels.
create policy "documents: lecture participants voyage" on public.documents
  for select using (
    voyage_id is not null and
    exists (
      select 1 from public.voyage_participants
      where voyage_participants.voyage_id = documents.voyage_id
        and voyage_participants.user_id = auth.uid()
        and voyage_participants.statut = 'rejoint'
    )
  );

-- Les participants peuvent générer une signed URL pour les fichiers des docs ci-dessus.
-- La policy de lecture propre existante reste active pour les propres fichiers.
create policy "storage documents: lecture participants" on storage.objects
  for select using (
    bucket_id = 'documents' and
    exists (
      select 1 from public.documents d
      join public.voyage_participants vp on vp.voyage_id = d.voyage_id
      where d.storage_path = storage.objects.name
        and d.voyage_id is not null
        and vp.user_id = auth.uid()
        and vp.statut = 'rejoint'
    )
  );
