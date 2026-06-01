-- Table users (extension du profil auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  prenom text,
  nom text,
  profil_voyageur text check (profil_voyageur in ('solo', 'famille', 'couple', 'groupe')),
  type_voyage_prefere text check (type_voyage_prefere in ('aventure', 'plage', 'city-trip', 'luxe')),
  created_at timestamptz default now()
);

-- Table membres_foyer
create table public.membres_foyer (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  prenom text not null,
  date_naissance date,
  type text check (type in ('adulte', 'enfant')) not null,
  groupe_sanguin text,
  allergies text,
  medicaments text,
  created_at timestamptz default now()
);

-- RLS
alter table public.users enable row level security;
alter table public.membres_foyer enable row level security;

create policy "users: lecture propre" on public.users
  for select using (auth.uid() = id);

create policy "users: modification propre" on public.users
  for update using (auth.uid() = id);

create policy "users: insertion propre" on public.users
  for insert with check (auth.uid() = id);

create policy "membres: lecture propre" on public.membres_foyer
  for all using (auth.uid() = user_id);

-- Trigger : crée le profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, prenom, nom)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'nom'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
