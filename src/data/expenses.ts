import type { Expense } from '../types/trip';

export const PAYMENT_METHODS = [
  'Amex Mehdi',
  'Revolut Mehdi',
  'Revolut Aïda',
  'Cash',
] as const;

export const INITIAL_EXPENSES: Expense[] = [
  // Dépenses globales
  {
    id: 'exp-global-flights',
    dayId: 'global',
    title: 'Billets d’avion Royal Air Maroc (AT800 / AT801)',
    category: 'transports',
    amountGbp: 618.96,
    paid: true,
    paymentMethod: 'Amex Mehdi',
    person: 'Famille',
    note: '4 voyageurs · bagages cabine uniquement',
  },
  {
    id: 'exp-global-tube',
    dayId: 'global',
    title: 'Transports TfL (Contactless 2 adultes, 11 jours)',
    category: 'transports',
    amountGbp: 145,
    paid: false,
    note: 'Plafond journalier Zone 1–2 (£8.50/j × 2) + Heathrow Piccadilly Line. Enfants < 11 ans gratuits.',
  },
  {
    id: 'exp-global-eta',
    dayId: 'global',
    title: 'Formalités / Assurance voyage famille',
    category: 'transports',
    amountGbp: 64,
    paid: true,
    note: 'ETA UK (£16 × 4 si applicable) / frais pré-départ déjà réglés.',
  },

  // Jour 1 — 22 déc.
  {
    id: 'exp-22-groceries',
    dayId: '2026-12-22',
    title: 'Courses d’arrivée (petit-déjeuner & goûters)',
    category: 'repas',
    amountGbp: 45,
    paid: false,
    note: 'Little Waitrose / Tesco Express Mayfair',
  },
  {
    id: 'exp-22-dinner',
    dayId: '2026-12-22',
    title: 'Dîner léger du premier soir',
    category: 'repas',
    amountGbp: 48,
    paid: false,
    note: 'Pizza / burgers près de Green Park',
  },

  // Jour 2 — 23 déc.
  {
    id: 'exp-23-lunch',
    dayId: '2026-12-23',
    title: 'Déjeuner Soho / Bloomsbury & goûter',
    category: 'repas',
    amountGbp: 62,
    paid: false,
    note: 'Entre Hamleys et le British Museum',
  },
  {
    id: 'exp-23-hamleys',
    dayId: '2026-12-23',
    title: 'Souvenirs enfants à Hamleys',
    category: 'shopping',
    amountGbp: 40,
    paid: false,
    note: 'Un petit jouet souvenir pour Aya et Adam',
  },

  // Jour 3 — 24 déc.
  {
    id: 'exp-24-ww',
    dayId: '2026-12-24',
    title: 'Hyde Park Winter Wonderland',
    category: 'activites',
    amountGbp: 75,
    paid: false,
    linkedStepId: 'step-24-1',
    note: 'Entrée matinale + jetons manèges & chocolats chauds',
  },
  {
    id: 'exp-24-reveillon',
    dayId: '2026-12-24',
    title: 'Courses du réveillon & journée du 25 déc.',
    category: 'repas',
    amountGbp: 95,
    paid: false,
    note: 'M&S Foodhall / Waitrose avant 16h00 (couvre le 24 soir + tout le 25)',
  },

  // Jour 4 — 25 déc.
  {
    id: 'exp-25-coffee',
    dayId: '2026-12-25',
    title: 'Chocolats chauds / extras balade de Noël',
    category: 'repas',
    amountGbp: 18,
    paid: false,
    note: 'Repas principaux pris à l’appartement',
  },

  // Jour 5 — 26 déc.
  {
    id: 'exp-26-battersea',
    dayId: '2026-12-26',
    title: 'Battersea Power Station — Patinoire Glide',
    category: 'activites',
    amountGbp: 52,
    paid: false,
    linkedStepId: 'step-26-1',
    note: 'Session patinoire famille face à la Tamise',
  },
  {
    id: 'exp-26-lunch',
    dayId: '2026-12-26',
    title: 'Déjeuner & pause sucrée à Battersea',
    category: 'repas',
    amountGbp: 68,
    paid: false,
    note: 'Turbine Hall / Arcade Food Hall',
  },

  // Jour 6 — 27 déc. (Tower Hamlets!)
  {
    id: 'exp-27-tower',
    dayId: '2026-12-27',
    title: 'Tour de Londres (Tarif Résident Tower Hamlets)',
    category: 'activites',
    amountGbp: 3,
    paid: false,
    linkedStepId: 'step-27-1',
    isTowerHamletsBenefit: true,
    savedGbp: 86.5,
    note: '£1/pers. au lieu de ~£89.50 plein tarif famille !',
  },
  {
    id: 'exp-27-bridge',
    dayId: '2026-12-27',
    title: 'Tower Bridge (Tarif Résident Tower Hamlets)',
    category: 'activites',
    amountGbp: 3,
    paid: false,
    linkedStepId: 'step-27-2',
    isTowerHamletsBenefit: true,
    savedGbp: 37,
    note: '£1/pers. au lieu de ~£40 plein tarif famille !',
  },
  {
    id: 'exp-27-lunch',
    dayId: '2026-12-27',
    title: 'Déjeuner à St Katharine Docks',
    category: 'repas',
    amountGbp: 65,
    paid: false,
    note: 'Pause au chaud entre la Tour et le Pont',
  },

  // Jour 7 — 28 déc.
  {
    id: 'exp-28-science',
    dayId: '2026-12-28',
    title: 'Science Museum — Billets Wonderlab',
    category: 'activites',
    amountGbp: 34,
    paid: false,
    linkedStepId: 'step-28-2',
    note: 'NHM et The Garden gratuits ; billets Wonderlab pour Aya + adulte(s)',
  },
  {
    id: 'exp-28-lunch',
    dayId: '2026-12-28',
    title: 'Déjeuner & goûter South Kensington',
    category: 'repas',
    amountGbp: 60,
    paid: false,
    note: 'Exhibition Road / Comptoir Libanais',
  },

  // Jour 8 — 29 déc.
  {
    id: 'exp-29-lunch',
    dayId: '2026-12-29',
    title: 'Déjeuner & douceurs dans l’Est londonien',
    category: 'repas',
    amountGbp: 55,
    paid: false,
    note: 'Young V&A gratuit — café Victoria Park / Spitalfields',
  },

  // Jour 9 — 30 déc.
  {
    id: 'exp-30-ltm',
    dayId: '2026-12-30',
    title: 'London Transport Museum (2 adultes, enfants gratuits)',
    category: 'activites',
    amountGbp: 49,
    paid: false,
    linkedStepId: 'step-30-3',
    note: 'Pass annuel 2 adultes (£24.50 × 2), Aya & Adam gratuits',
  },
  {
    id: 'exp-30-lunch',
    dayId: '2026-12-30',
    title: 'Déjeuner Covent Garden / Seven Dials Market',
    category: 'repas',
    amountGbp: 64,
    paid: false,
    note: 'Halles couvertes de Seven Dials',
  },

  // Jour 10 — 31 déc.
  {
    id: 'exp-31-lunch',
    dayId: '2026-12-31',
    title: 'Déjeuner Kensington & courses réveillon du 31',
    category: 'repas',
    amountGbp: 78,
    paid: false,
    note: 'Memorial Playground gratuit + dîner festif à Mayfair',
  },

  // Jour 11 — 1er jan.
  {
    id: 'exp-01-airport',
    dayId: '2027-01-01',
    title: 'Goûter & souvenirs de fin de séjour à Heathrow',
    category: 'shopping',
    amountGbp: 35,
    paid: false,
    note: 'Avant l’embarquement du vol RAM AT801 (17h15)',
  },
];
