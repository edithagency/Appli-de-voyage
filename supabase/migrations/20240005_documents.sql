-- Table documents
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  membre_id uuid references public.membres_foyer(id) on delete set null,
  voyage_id uuid references public.voyages(id) on delete set null,
  type text check (type in (
    'passeport','carte_identite','visa','billet_avion',
    'reservation_hotel','assurance','carnet_vaccins',
    'autorisation_sortie_territoire','ordonnance','autre'
  )) not null,
  nom_fichier text not null,
  storage_path text not null,
  date_expiration date,
  created_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy "documents: accès propre" on public.documents
  for all using (auth.uid() = user_id);

-- Bucket privé pour les documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- RLS Storage : chaque user accède uniquement à son dossier
create policy "storage documents: lecture propre" on storage.objects
  for select using (
    bucket_id = 'documents' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage documents: upload propre" on storage.objects
  for insert with check (
    bucket_id = 'documents' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage documents: suppression propre" on storage.objects
  for delete using (
    bucket_id = 'documents' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );
