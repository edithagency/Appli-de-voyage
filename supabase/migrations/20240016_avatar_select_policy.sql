-- L'upload avec upsert:true fait une vérification interne qui nécessite une
-- policy SELECT sur storage.objects (pas seulement INSERT), sans quoi Supabase
-- renvoie "new row violates row-level security policy" sur l'upload lui-même.
-- Le bucket étant public, on autorise la lecture à tout le monde.
create policy "storage avatars: lecture publique" on storage.objects
  for select using (bucket_id = 'avatars');
