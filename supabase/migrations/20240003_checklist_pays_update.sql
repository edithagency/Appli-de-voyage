-- Enrichissement de la table pays
alter table public.pays
  add column if not exists taxe_touristique_montant text,
  add column if not exists taxe_touristique_mode text, -- 'en_ligne_avant', 'hotel', 'aeroport', 'aucune'
  add column if not exists taxe_touristique_notes text,
  add column if not exists vaccin_obligatoire_nom text,
  add column if not exists autorisation_enfant_seul_parent boolean default false,
  add column if not exists autorisation_enfant_details text,
  add column if not exists esta_requis boolean default false;

-- Mise à jour des données pays avec les infos précises

-- Bali/Indonésie : VOA + taxe 150k IDR
update public.pays set
  visa_requis_france = true,
  visa_details = 'Visa on arrival (VOA) : 35 USD à l''aéroport, valable 30 jours, renouvelable une fois (25 USD supplémentaires). Alternative : e-visa en ligne sur immigration-online.com (~50 USD, 24h).',
  taxe_touristique_montant = '150 000 IDR (~10 USD) par séjour',
  taxe_touristique_mode = 'en_ligne_avant',
  taxe_touristique_notes = 'Payable avant ou à l''aéroport via lovebali.baliprov.go.id. Paiement unique par séjour (pas par nuit). Conserve le QR code de confirmation.',
  vaccins_recommandes = 'Hépatite A, typhoïde, rage recommandés. Fièvre jaune si transit par zone endémique.',
  douane_infos = 'Maximum 500 USD en espèces sans déclaration. Alcool : 1L autorisé. Drogues : tolérance zéro (peines sévères). Antiquités : restriction d''exportation.',
  autorisation_enfant_seul_parent = true,
  autorisation_enfant_details = 'Si un seul parent voyage avec un enfant mineur : autorisation parentale écrite (en anglais) + copie du passeport de l''autre parent.'
where code = 'ID';

-- Sénégal : fièvre jaune obligatoire
update public.pays set
  vaccins_obligatoires = 'Fièvre jaune OBLIGATOIRE (certificat international à présenter à l''arrivée). Vacciner au moins 10 jours avant le départ.',
  vaccin_obligatoire_nom = 'fievre_jaune',
  vaccins_recommandes = 'Paludisme (traitement préventif obligatoire), hépatite A, typhoïde.',
  autorisation_enfant_seul_parent = true,
  autorisation_enfant_details = 'Autorisation parentale requise si un seul parent. Enfants : vaccin fièvre jaune obligatoire également.'
where code = 'SN';

-- États-Unis : ESTA obligatoire + enfant seul parent
update public.pays set
  esta_requis = true,
  visa_requis_france = false,
  visa_details = 'ESTA obligatoire (16 USD). À demander en ligne sur esta.cbp.dhs.gov au moins 72h avant. Valable 2 ans.',
  taxe_touristique_mode = 'hotel',
  taxe_touristique_notes = 'Taxe de séjour variable selon l''État et la ville (3–15%), intégrée à la note d''hôtel.',
  douane_infos = 'Franchise : 800 USD d''achats hors taxes. Produits alimentaires très réglementés (fruits, viandes, produits laitiers interdits). Alcool : 1L. Drogues : interdiction totale.',
  autorisation_enfant_seul_parent = true,
  autorisation_enfant_details = 'Si un seul parent voyage avec un enfant : lettre d''autorisation notariée (en anglais) + copie du passeport de l''autre parent fortement recommandée.'
where code = 'US';

-- Mexique : autorisation enfant si 1 parent
update public.pays set
  autorisation_enfant_seul_parent = true,
  autorisation_enfant_details = 'Si un seul parent : autorisation parentale notariée (traduction espagnole recommandée). Mineurs voyageant seuls : autorisation des deux parents.'
where code = 'MX';

-- Italie : taxe de séjour à l'hôtel
update public.pays set
  taxe_touristique_montant = '3 à 5€ par personne par nuit',
  taxe_touristique_mode = 'hotel',
  taxe_touristique_notes = 'Applicable dans la plupart des grandes villes (Rome, Milan, Florence, Venise...). À payer directement à l''établissement. Non incluse dans le prix affiché.'
where code = 'IT';

-- Maroc : taxe hôtelière locale
update public.pays set
  taxe_touristique_montant = '1 à 2€ par nuit (selon l''établissement)',
  taxe_touristique_mode = 'hotel',
  taxe_touristique_notes = 'Taxe de séjour locale appliquée par certains hôtels et riads. À payer sur place. Pas de paiement préalable requis.'
where code = 'MA';

-- Portugal : taxe hôtelière locale
update public.pays set
  taxe_touristique_montant = '1 à 2€ par nuit (selon la ville)',
  taxe_touristique_mode = 'hotel',
  taxe_touristique_notes = 'Taxe de séjour locale dans certaines villes (Lisbonne, Porto). À payer à l''établissement.'
where code = 'PT';

-- Table checklist_items
create table public.checklist_items (
  id uuid default gen_random_uuid() primary key,
  voyage_id uuid references public.voyages(id) on delete cascade not null,
  membre_id uuid references public.membres_foyer(id) on delete set null,
  categorie text check (categorie in ('documents', 'sante', 'bagages', 'argent', 'logistique', 'avant_depart')) not null,
  label text not null,
  description text,
  obligatoire boolean default false,
  completed boolean default false,
  ordre integer default 0,
  created_at timestamptz default now()
);

alter table public.checklist_items enable row level security;

create policy "checklist: accès via voyage" on public.checklist_items
  for all using (
    exists (
      select 1 from public.voyages
      where voyages.id = checklist_items.voyage_id
      and voyages.user_id = auth.uid()
    )
  );
