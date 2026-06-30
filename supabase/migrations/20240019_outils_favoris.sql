-- ============================================================
-- Favoris sur la page Outils : un outil peut être épinglé en haut
-- de la liste. Synchronisé entre appareils via cette table (les
-- visiteurs non connectés utilisent le localStorage côté client,
-- géré entièrement par l'app, pas par cette migration).
-- ============================================================

create table if not exists public.outils_favoris (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  outil_id text not null,
  created_at timestamptz default now(),
  unique (user_id, outil_id)
);

alter table public.outils_favoris enable row level security;

drop policy if exists "outils_favoris: propre accès" on public.outils_favoris;
create policy "outils_favoris: propre accès" on public.outils_favoris
  for all using (auth.uid() = user_id);
