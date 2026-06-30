-- ============================================================
-- Passe l'invitation d'un lien par participant à un lien unique
-- par voyage : la personne qui le reçoit choisit qui elle est
-- dans la liste des participants pas encore rejoints.
-- L'ancien token par membre (voyage_membres.token_invitation)
-- reste en base mais n'est plus utilisé par l'application.
-- ============================================================

alter table public.voyages add column if not exists token_invitation text unique default encode(gen_random_bytes(16), 'hex');
alter table public.voyages add column if not exists token_expire_at timestamptz default (now() + interval '30 days');

-- Les voyages déjà existants n'ont pas reçu la valeur par défaut (elle ne
-- s'applique qu'aux nouvelles lignes) : on la calcule à la main pour eux.
update public.voyages set token_invitation = encode(gen_random_bytes(16), 'hex') where token_invitation is null;
update public.voyages set token_expire_at = now() + interval '30 days' where token_expire_at is null;
