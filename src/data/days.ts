import type { TripDay } from '../types/trip';

export const TRIP_DAYS: TripDay[] = [
  {
    id: '2026-12-22',
    dayNumber: 1,
    weekdayShort: 'Mar.',
    weekdayFull: 'Mardi',
    dateShort: '22 déc.',
    dateLong: 'Mardi 22 décembre 2026',
    title: 'Arrivée à Mayfair & premières lumières',
    neighborhood: 'Heathrow → Mayfair',
  },
  {
    id: '2026-12-23',
    dayNumber: 2,
    weekdayShort: 'Mer.',
    weekdayFull: 'Mercredi',
    dateShort: '23 déc.',
    dateLong: 'Mercredi 23 décembre 2026',
    title: 'Magie de Hamleys & trésors du British Museum',
    neighborhood: 'Regent Street & Bloomsbury',
  },
  {
    id: '2026-12-24',
    dayNumber: 3,
    weekdayShort: 'Jeu.',
    weekdayFull: 'Jeudi',
    dateShort: '24 déc.',
    dateLong: 'Jeudi 24 décembre 2026',
    title: 'Winter Wonderland & réveillon à Mayfair',
    neighborhood: 'Hyde Park & Mayfair',
    isCritical: true,
    criticalBanner: {
      title: 'Veille de Noël — Horaires écourtés',
      message:
        'British Museum, NHM, Tour de Londres et Tower Bridge fermés. Supermarchés et commerces ferment tôt (16h–17h) et les transports s’arrêtent en soirée.',
    },
  },
  {
    id: '2026-12-25',
    dayNumber: 4,
    weekdayShort: 'Ven.',
    weekdayFull: 'Vendredi',
    dateShort: '25 déc.',
    dateLong: 'Vendredi 25 décembre 2026',
    title: 'Noël 100 % piéton dans le Londres royal',
    neighborhood: 'Mayfair, Green Park & West End',
    isCritical: true,
    criticalBanner: {
      title: 'Jour de Noël — Aucun transport en commun',
      message:
        'Zéro métro, zéro bus et grands musées fermés dans tout Londres. Journée 100 % piétonne et féerique au départ de Hertford Street.',
    },
  },
  {
    id: '2026-12-26',
    dayNumber: 5,
    weekdayShort: 'Sam.',
    weekdayFull: 'Samedi',
    dateShort: '26 déc.',
    dateLong: 'Samedi 26 décembre 2026',
    title: 'Boxing Day au chaud à Battersea Power Station',
    neighborhood: 'Battersea & Tamise',
    isCritical: true,
    criticalBanner: {
      title: 'Boxing Day — Musées majeurs fermés',
      message:
        'British Museum, Natural History Museum, Tour de Londres et Tower Bridge restent fermés. Service métro réduit : Battersea Power Station est ouvert et chauffé.',
    },
  },
  {
    id: '2026-12-27',
    dayNumber: 6,
    weekdayShort: 'Dim.',
    weekdayFull: 'Dimanche',
    dateShort: '27 déc.',
    dateLong: 'Dimanche 27 décembre 2026',
    title: 'Journée Tower Hamlets : Tour de Londres & Tower Bridge',
    neighborhood: 'Tower Hill & Tamise',
  },
  {
    id: '2026-12-28',
    dayNumber: 7,
    weekdayShort: 'Lun.',
    weekdayFull: 'Lundi',
    dateShort: '28 déc.',
    dateLong: 'Lundi 28 décembre 2026',
    title: 'Dinosaures & expériences à South Kensington',
    neighborhood: 'South Kensington',
    isCritical: true,
    criticalBanner: {
      title: 'Bank Holiday — Forte affluence musées',
      message:
        'Jour férié (substitution de Boxing Day). Les créneaux d’ouverture à 10h00 au Natural History Museum et au Science Museum sont impératifs.',
    },
  },
  {
    id: '2026-12-29',
    dayNumber: 8,
    weekdayShort: 'Mar.',
    weekdayFull: 'Mardi',
    dateShort: '29 déc.',
    dateLong: 'Mardi 29 décembre 2026',
    title: 'Young V&A & flânerie dans l’Est londonien',
    neighborhood: 'Bethnal Green & East London',
  },
  {
    id: '2026-12-30',
    dayNumber: 9,
    weekdayShort: 'Mer.',
    weekdayFull: 'Mercredi',
    dateShort: '30 déc.',
    dateLong: 'Mercredi 30 décembre 2026',
    title: 'Relève de la Garde & London Transport Museum',
    neighborhood: 'Buckingham & Covent Garden',
  },
  {
    id: '2026-12-31',
    dayNumber: 10,
    weekdayShort: 'Jeu.',
    weekdayFull: 'Jeudi',
    dateShort: '31 déc.',
    dateLong: 'Jeudi 31 décembre 2026',
    title: 'Bateau pirate de Kensington & réveillon au calme',
    neighborhood: 'Kensington Gardens & Mayfair',
    isCritical: true,
    criticalBanner: {
      title: 'Saint-Sylvestre — Fermetures autour de la Tamise',
      message:
        'Fermetures de rues autour de Westminster et de la Tamise dès la fin d’après-midi (feux d’artifice payants). Retour à Mayfair avant 17h00.',
    },
  },
  {
    id: '2027-01-01',
    dayNumber: 11,
    weekdayShort: 'Ven.',
    weekdayFull: 'Vendredi',
    dateShort: '1er jan.',
    dateLong: 'Vendredi 1er janvier 2027',
    title: 'Parade du Nouvel An & retour vers Casablanca',
    neighborhood: 'Piccadilly → Heathrow (AT801)',
    isCritical: true,
    criticalBanner: {
      title: 'Parade du 1er janvier — Aucun taxi ni Uber',
      message:
        'London New Year’s Day Parade dès 13h00 sur Piccadilly : axes routiers coupés autour de Mayfair. Rejoindre Heathrow en Piccadilly Line depuis Hyde Park Corner vers 13h45–14h00.',
    },
  },
];

export const DAY_MAP: Record<string, TripDay> = Object.fromEntries(
  TRIP_DAYS.map((day) => [day.id, day])
);
