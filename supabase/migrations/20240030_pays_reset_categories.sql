-- ============================================================
-- Repart d'une page blanche pour toutes les destinations : seules
-- ces catégories sont conservées dans l'onglet Infos —
-- Important : Sécurité, Passeport, Visa, Santé, Assurance, Douane
-- Pratique  : Internet, Argent, Électricité, Numéros d'urgence
-- Les catégories retirées (Zones à éviter, Vols & Aéroports,
-- Trousse médicale, Liens officiels) sont vidées avec le reste.
-- ============================================================

-- Garde-fou (voir 20240027) : s'assurer que ces colonnes existent bien.
alter table public.pays
  add column if not exists liens_officiels jsonb default '[]',
  add column if not exists entree_details jsonb,
  add column if not exists sante_details jsonb,
  add column if not exists argent_notes text,
  add column if not exists zones_deconseillees jsonb,
  add column if not exists reseau_mobile_info text,
  add column if not exists transport_info jsonb,
  add column if not exists assurance_info text,
  add column if not exists urgence_autres jsonb,
  add column if not exists ambassade_info jsonb;

update public.pays set
  -- Sécurité
  niveau_securite = 'vert',
  infos_securite = null,
  zones_deconseillees = '[]'::jsonb,

  -- Passeport / Visa
  visa_requis_france = false,
  visa_details = null,
  entree_details = null,

  -- Santé
  vaccins_recommandes = null,
  sante_details = null,

  -- Assurance
  assurance_info = null,

  -- Douane
  douane_infos = null,

  -- Internet
  reseau_mobile_info = null,

  -- Argent
  devise = null,
  symbole_devise = null,
  taux_change_approx = null,
  argent_notes = null,

  -- Électricité
  type_prise_electrique = null,

  -- Numéros d'urgence
  urgence_police = null,
  urgence_ambulance = null,
  urgence_ambassade_france = null,
  urgence_autres = '[]'::jsonb,
  ambassade_info = null,

  -- Catégories retirées de l'onglet Infos
  transport_info = null,
  liens_officiels = '[]'::jsonb;
