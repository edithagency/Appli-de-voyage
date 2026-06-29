-- Photo de profil : colonne + bucket public dédié aux avatars
alter table public.users add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- RLS Storage : chaque user ne peut écrire/supprimer que dans son propre dossier
-- (bucket public donc la lecture passe par l'URL publique, sans RLS)
create policy "storage avatars: upload propre" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage avatars: mise à jour propre" on storage.objects
  for update using (
    bucket_id = 'avatars' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage avatars: suppression propre" on storage.objects
  for delete using (
    bucket_id = 'avatars' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );
