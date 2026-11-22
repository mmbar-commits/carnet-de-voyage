import type { ChecklistItem } from '../types/trip';

export const FLIGHT_INFO = {
  airline: 'Royal Air Maroc',
  baggageNote: 'Bagages cabine uniquement — aucun bagage en soute',
  outbound: {
    code: 'AT800',
    date: 'Mardi 22 décembre 2026',
    from: 'Casablanca (CMN)',
    fromTerminal: 'Terminal 1',
    departure: '13h05',
    to: 'Londres Heathrow (LHR)',
    toTerminal: 'Terminal 4',
    arrival: '15h25',
    gateNote: 'Porte affichée le jour J (~1h avant départ)',
    statusUrl: 'https://www.heathrow.com/fr/arrivals/terminal-4/flight-details/AT800',
  },
  inbound: {
    code: 'AT801',
    date: 'Vendredi 1er janvier 2027',
    from: 'Londres Heathrow (LHR)',
    fromTerminal: 'Terminal 4 (Zone E/F)',
    departure: '17h15',
    to: 'Casablanca (CMN)',
    toTerminal: 'Terminal 2',
    arrival: '21h30',
    gateNote: 'Porte annoncée à Heathrow T4 ~45–60 min avant départ',
    statusUrl: 'https://www.heathrow.com/fr/departures/terminal-4/flight-details/AT801',
  },
};

export const ACCOMMODATION_INFO = {
  label: 'Appartement Mayfair',
  street: 'Hertford Street, Mayfair',
  postcode: 'W1J 7SU',
  city: 'Londres, Royaume-Uni',
  fullAddress: 'Hertford Street, Mayfair, London W1J 7SU, UK',
  stations: [
    'Hyde Park Corner (Piccadilly Line — 5 min à pied, direct Heathrow)',
    'Green Park (Piccadilly, Jubilee, Victoria Lines — 7 min à pied)',
  ],
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hertford+Street+Mayfair+London+W1J+7SU',
};

export const TOWER_HAMLETS_MEMO = {
  title: 'Avantage Résidents Tower Hamlets (£1)',
  savingsSummary: '~£123 économisés sur la journée du 27 décembre',
  sites: [
    'Tour de Londres : £1 / pers. (au lieu de ~£35.80 adulte / £17.90 enfant)',
    'Tower Bridge : £1 / pers. (au lieu de £16 adulte / £8 enfant)',
  ],
  requiredDocs: [
    'Pièce d’identité officielle avec photo (passeport ou permis)',
    'Justificatif de résidence Tower Hamlets à jour (Idea Store card, facture récente, Council Tax ou relevé bancaire avec adresse)',
    'Présenter les originaux (ou PDF officiel clair) directement au guichet sur place le dimanche 27 décembre dès 10h00',
  ],
};

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-1',
    label: 'Passeports valides + autorisations ETA UK (4 voyageurs)',
    category: 'papiers',
    checked: false,
  },
  {
    id: 'chk-2',
    label: 'Justificatif résident Tower Hamlets + pièce d’identité (tarif £1)',
    category: 'papiers',
    checked: false,
  },
  {
    id: 'chk-3',
    label: 'Cartes bancaires sans frais GBP (1 carte Contactless par adulte pour le Tube)',
    category: 'papiers',
    checked: false,
  },
  {
    id: 'chk-4',
    label: 'Créneau 10h00 Natural History Museum (lun. 28 déc. Bank Holiday)',
    category: 'reservations',
    checked: false,
  },
  {
    id: 'chk-5',
    label: 'Créneau British Museum (23 déc.) + Wonderlab Science Museum (28 déc.)',
    category: 'reservations',
    checked: false,
  },
  {
    id: 'chk-6',
    label: 'Billets matinaux Winter Wonderland (24 déc.) & patinoire Battersea (26 déc.)',
    category: 'reservations',
    checked: false,
  },
  {
    id: 'chk-7',
    label: 'Billets London Transport Museum (mer. 30 déc.)',
    category: 'reservations',
    checked: false,
  },
  {
    id: 'chk-8',
    label: 'Valises cabine RAM (liquides < 100 ml en pochette transparente, zéro soute)',
    category: 'bagages',
    checked: false,
  },
  {
    id: 'chk-9',
    label: '2 adaptateurs électriques UK Type G + batterie externe téléphone',
    category: 'bagages',
    checked: false,
  },
  {
    id: 'chk-10',
    label: 'Imperméables, bonnets, gants & chaussures confortables (marche du 25 déc.)',
    category: 'enfants',
    checked: false,
  },
  {
    id: 'chk-11',
    label: 'Haut de rechange léger pour Adam (jeux d’eau The Garden au Science Museum)',
    category: 'enfants',
    checked: false,
  },
  {
    id: 'chk-12',
    label: 'Petits carnets / crayons & snacks pour l’avion AT800 et les files d’attente',
    category: 'enfants',
    checked: false,
  },
];

export const SUPABASE_SQL_SNIPPET = `create table if not exists public.trip_sync (
  family_code text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.trip_sync enable row level security;

create policy "Family code read/write"
  on public.trip_sync
  for all
  using (true)
  with check (true);

alter publication supabase_realtime add table public.trip_sync;`;
