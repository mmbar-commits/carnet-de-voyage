import { getApproxRate } from './currencies';
import type {
  CurrencyCode,
  MemberRole,
  PracticalNote,
  TripDay,
  TripMeta,
  TripState,
  TripSummary,
} from '../types/trip';

export const DEFAULT_LONDON_TRIP_ID = 'LDN-NOEL-2026';

export const DEFAULT_LONDON_META: TripMeta = {
  title: 'Londres en Famille',
  subtitle: '22 déc. – 1er jan. · Mayfair',
  destination: 'Londres',
  monogramTop: 'LDN',
  monogramBottom: '26',
  startDate: '2026-12-22',
  endDate: '2027-01-01',
  lat: 51.5072,
  lng: -0.1276,
  timezone: 'Europe/London',
  isLondonDefault: true,
};

export const DEFAULT_CUSTOM_PAYMENT_METHODS: string[] = [
  'Carte bancaire',
  'Revolut',
  'Espèces',
];

export interface DestinationPreset {
  name: string;
  aliases: string[];
  lat: number;
  lng: number;
  timezone: string;
  defaultCurrency: CurrencyCode;
  monogram: string;
}

export const DESTINATION_PRESETS: DestinationPreset[] = [
  {
    name: 'Rome',
    aliases: ['rome', 'roma'],
    lat: 41.9028,
    lng: 12.4964,
    timezone: 'Europe/Rome',
    defaultCurrency: 'EUR',
    monogram: 'ROM',
  },
  {
    name: 'Paris',
    aliases: ['paris'],
    lat: 48.8566,
    lng: 2.3522,
    timezone: 'Europe/Paris',
    defaultCurrency: 'EUR',
    monogram: 'PAR',
  },
  {
    name: 'Tokyo',
    aliases: ['tokyo', 'tokio'],
    lat: 35.6762,
    lng: 139.6503,
    timezone: 'Asia/Tokyo',
    defaultCurrency: 'JPY',
    monogram: 'TYO',
  },
  {
    name: 'New York',
    aliases: ['new york', 'nyc', 'new-york', 'manhattan'],
    lat: 40.7128,
    lng: -74.006,
    timezone: 'America/New_York',
    defaultCurrency: 'USD',
    monogram: 'NYC',
  },
  {
    name: 'Marrakech',
    aliases: ['marrakech', 'marrakesh'],
    lat: 31.6295,
    lng: -7.9811,
    timezone: 'Africa/Casablanca',
    defaultCurrency: 'MAD',
    monogram: 'MRK',
  },
  {
    name: 'Barcelone',
    aliases: ['barcelone', 'barcelona'],
    lat: 41.3874,
    lng: 2.1686,
    timezone: 'Europe/Madrid',
    defaultCurrency: 'EUR',
    monogram: 'BCN',
  },
  {
    name: 'Lisbonne',
    aliases: ['lisbonne', 'lisbon', 'lisboa'],
    lat: 38.7223,
    lng: -9.1393,
    timezone: 'Europe/Lisbon',
    defaultCurrency: 'EUR',
    monogram: 'LIS',
  },
  {
    name: 'Dubaï',
    aliases: ['dubai', 'dubaï'],
    lat: 25.2048,
    lng: 55.2708,
    timezone: 'Asia/Dubai',
    defaultCurrency: 'AED',
    monogram: 'DXB',
  },
  {
    name: 'Londres',
    aliases: ['londres', 'london'],
    lat: 51.5072,
    lng: -0.1276,
    timezone: 'Europe/London',
    defaultCurrency: 'GBP',
    monogram: 'LDN',
  },
  {
    name: 'Istanbul',
    aliases: ['istanbul'],
    lat: 41.0082,
    lng: 28.9784,
    timezone: 'Europe/Istanbul',
    defaultCurrency: 'TRY',
    monogram: 'IST',
  },
  {
    name: 'Madrid',
    aliases: ['madrid'],
    lat: 40.4168,
    lng: -3.7038,
    timezone: 'Europe/Madrid',
    defaultCurrency: 'EUR',
    monogram: 'MAD',
  },
  {
    name: 'Amsterdam',
    aliases: ['amsterdam'],
    lat: 52.3676,
    lng: 4.9041,
    timezone: 'Europe/Amsterdam',
    defaultCurrency: 'EUR',
    monogram: 'AMS',
  },
  {
    name: 'Venise',
    aliases: ['venise', 'venice', 'venezia'],
    lat: 45.4408,
    lng: 12.3155,
    timezone: 'Europe/Rome',
    defaultCurrency: 'EUR',
    monogram: 'VCE',
  },
  {
    name: 'Florence',
    aliases: ['florence', 'firenze'],
    lat: 43.7696,
    lng: 11.2558,
    timezone: 'Europe/Rome',
    defaultCurrency: 'EUR',
    monogram: 'FLR',
  },
  {
    name: 'Milan',
    aliases: ['milan', 'milano'],
    lat: 45.4642,
    lng: 9.19,
    timezone: 'Europe/Rome',
    defaultCurrency: 'EUR',
    monogram: 'MIL',
  },
  {
    name: 'Montréal',
    aliases: ['montreal', 'montréal'],
    lat: 45.5017,
    lng: -73.5673,
    timezone: 'America/Toronto',
    defaultCurrency: 'CAD',
    monogram: 'YUL',
  },
  {
    name: 'Genève',
    aliases: ['geneve', 'genève', 'geneva'],
    lat: 46.2044,
    lng: 6.1432,
    timezone: 'Europe/Zurich',
    defaultCurrency: 'CHF',
    monogram: 'GVA',
  },
  {
    name: 'Zurich',
    aliases: ['zurich', 'zürich'],
    lat: 47.3769,
    lng: 8.5417,
    timezone: 'Europe/Zurich',
    defaultCurrency: 'CHF',
    monogram: 'ZRH',
  },
  {
    name: 'Bangkok',
    aliases: ['bangkok'],
    lat: 13.7563,
    lng: 100.5018,
    timezone: 'Asia/Bangkok',
    defaultCurrency: 'THB',
    monogram: 'BKK',
  },
  {
    name: 'Casablanca',
    aliases: ['casablanca', 'casa'],
    lat: 33.5731,
    lng: -7.5898,
    timezone: 'Africa/Casablanca',
    defaultCurrency: 'MAD',
    monogram: 'CMN',
  },
];

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function parseIsoDateUtc(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }
  return dt;
}

function toIsoDateUtc(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatFrenchDateShort(dt: Date): string {
  const dayNum = dt.getUTCDate();
  const monthShort = new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    timeZone: 'UTC',
  }).format(dt);
  const dayLabel = dayNum === 1 ? '1er' : String(dayNum);
  return `${dayLabel} ${monthShort}`;
}

function formatFrenchDateLong(dt: Date): string {
  const weekday = capitalizeFirst(
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(dt)
  );
  const dayNum = dt.getUTCDate();
  const dayLabel = dayNum === 1 ? '1er' : String(dayNum);
  const monthLong = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    timeZone: 'UTC',
  }).format(dt);
  return `${weekday} ${dayLabel} ${monthLong} ${dt.getUTCFullYear()}`;
}

export function formatTripSubtitle(
  startDate: string,
  endDate: string,
  destination: string
): string {
  const start = parseIsoDateUtc(startDate);
  const end = parseIsoDateUtc(endDate);
  const cleanDest = destination.trim() || 'Voyage';
  if (!start) return cleanDest;
  const startStr = formatFrenchDateShort(start);
  if (!end || toIsoDateUtc(end) === toIsoDateUtc(start)) {
    return `${startStr} · ${cleanDest}`;
  }
  const endStr = formatFrenchDateShort(end);
  return `${startStr} – ${endStr} · ${cleanDest}`;
}

export function buildTripDays(
  startDate: string,
  endDate: string,
  destination: string
): TripDay[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  const parsedStart = parseIsoDateUtc(startDate) ?? parseIsoDateUtc(todayIso)!;
  const parsedEnd = parseIsoDateUtc(endDate) ?? parsedStart;

  const first = parsedStart.getTime() <= parsedEnd.getTime() ? parsedStart : parsedEnd;
  const last = parsedStart.getTime() <= parsedEnd.getTime() ? parsedEnd : parsedStart;

  const diffDays = Math.round((last.getTime() - first.getTime()) / (24 * 60 * 60 * 1000));
  const totalDays = Math.max(1, Math.min(30, diffDays + 1));
  const cleanDest = destination.trim() || 'Destination';

  const weekdayShortFmt = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    timeZone: 'UTC',
  });
  const weekdayFullFmt = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    timeZone: 'UTC',
  });

  const days: TripDay[] = [];
  for (let i = 0; i < totalDays; i++) {
    const dt = new Date(first.getTime() + i * 24 * 60 * 60 * 1000);
    const id = toIsoDateUtc(dt);
    const rawWdShort = capitalizeFirst(weekdayShortFmt.format(dt));
    const weekdayShort = rawWdShort.endsWith('.') ? rawWdShort : `${rawWdShort}.`;
    const weekdayFull = capitalizeFirst(weekdayFullFmt.format(dt));
    const dateShort = formatFrenchDateShort(dt);
    const dateLong = formatFrenchDateLong(dt);

    let title = `Journée à ${cleanDest}`;
    if (totalDays > 1 && i === 0) {
      title = `Arrivée à ${cleanDest}`;
    } else if (totalDays > 1 && i === totalDays - 1) {
      title = `Dernière journée à ${cleanDest}`;
    }

    days.push({
      id,
      dayNumber: i + 1,
      weekdayShort,
      weekdayFull,
      dateShort,
      dateLong,
      title,
      neighborhood: cleanDest,
    });
  }

  return days;
}

export function buildMonogram(
  destination: string,
  startDate: string
): { top: string; bottom: string } {
  const normalized = stripAccents(destination).trim().toLowerCase();
  const preset = DESTINATION_PRESETS.find(
    (p) =>
      p.aliases.includes(normalized) ||
      stripAccents(p.name).toLowerCase() === normalized
  );

  let top: string;
  if (preset) {
    top = preset.monogram;
  } else {
    const words = stripAccents(destination)
      .toUpperCase()
      .replace(/[^A-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    if (words.length >= 3) {
      top = words
        .slice(0, 3)
        .map((w) => w[0])
        .join('');
    } else if (words.length === 2 && words[0].length >= 1 && words[1].length >= 2) {
      top = `${words[0][0]}${words[1].slice(0, 2)}`;
    } else {
      const letters = words.join('');
      top = (letters.slice(0, 3) || 'TRP').padEnd(3, 'X');
    }
  }

  const yearMatch = /^(\d{4})/.exec(startDate.trim());
  const fullYear = yearMatch ? yearMatch[1] : String(new Date().getFullYear());
  const bottom = fullYear.slice(-2);

  return { top: top.toUpperCase().slice(0, 3), bottom };
}

export function findPresetDestination(query: string): DestinationPreset | null {
  const cleaned = stripAccents(query).trim().toLowerCase();
  if (!cleaned) return null;
  const exact = DESTINATION_PRESETS.find(
    (p) =>
      p.aliases.includes(cleaned) ||
      stripAccents(p.name).toLowerCase() === cleaned
  );
  if (exact) return exact;
  return (
    DESTINATION_PRESETS.find(
      (p) =>
        p.aliases.some((alias) => cleaned.includes(alias)) ||
        cleaned.includes(stripAccents(p.name).toLowerCase())
    ) ?? null
  );
}

interface OpenMeteoGeoResponse {
  results?: Array<{
    name?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }>;
}

export async function geocodeDestination(
  query: string
): Promise<{ name: string; lat: number; lng: number; timezone: string } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const fallback = findPresetDestination(trimmed);

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3500);
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=1&language=fr&format=json`;
    const response = await fetch(url, { method: 'GET', signal: controller.signal });
    window.clearTimeout(timer);

    if (response.ok) {
      const data = (await response.json()) as OpenMeteoGeoResponse;
      const hit = data.results?.[0];
      if (
        hit &&
        typeof hit.latitude === 'number' &&
        typeof hit.longitude === 'number' &&
        Number.isFinite(hit.latitude) &&
        Number.isFinite(hit.longitude)
      ) {
        return {
          name: hit.name?.trim() || trimmed,
          lat: hit.latitude,
          lng: hit.longitude,
          timezone: hit.timezone?.trim() || fallback?.timezone || 'UTC',
        };
      }
    }
  } catch {
    // Fall back to local preset list gracefully (offline or timeout)
  }

  if (fallback) {
    return {
      name: fallback.name,
      lat: fallback.lat,
      lng: fallback.lng,
      timezone: fallback.timezone,
    };
  }

  return null;
}

export function generateTripCode(destination: string, startDate: string): string {
  const slug = stripAccents(destination)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8) || 'TRIP';
  const yearMatch = /^(\d{4})/.exec(startDate.trim());
  const year = yearMatch ? yearMatch[1] : String(new Date().getFullYear());
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${slug}-${year}-${suffix}`;
}

export interface CreateBlankTripInput {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  lat: number;
  lng: number;
  timezone: string;
  tripCurrency: CurrencyCode;
  homeCurrency: CurrencyCode;
  people: string[];
}

export function createBlankTripState(
  input: CreateBlankTripInput,
  stateVersion = 6
): TripState {
  const cleanDest = input.destination.trim() || 'Destination';
  const cleanTitle = input.title.trim() || `${cleanDest} en Famille`;
  const days = buildTripDays(input.startDate, input.endDate, cleanDest);
  const actualStart = days[0]?.id ?? input.startDate;
  const actualEnd = days[days.length - 1]?.id ?? input.endDate;
  const monogram = buildMonogram(cleanDest, actualStart);
  const subtitle = formatTripSubtitle(actualStart, actualEnd, cleanDest);
  const homePerTrip = getApproxRate(input.tripCurrency, input.homeCurrency);
  const eurPerTrip = getApproxRate(input.tripCurrency, 'EUR');
  const cleanPeople =
    input.people.length > 0 ? input.people : ['Famille'];

  const practicalNotes: PracticalNote[] = [
    {
      id: 'note-transport',
      title: 'Vols / Transports',
      content: `Numéros de vol ou de train, horaires et transferts vers ${cleanDest}.`,
    },
    {
      id: 'note-accommodation',
      title: 'Hébergement',
      content: `Adresse de l’hôtel ou de l’appartement à ${cleanDest}, check-in et codes d’accès.`,
      mapsQuery: cleanDest,
    },
  ];

  return {
    version: stateVersion,
    updatedAt: new Date().toISOString(),
    meta: {
      title: cleanTitle,
      subtitle,
      destination: cleanDest,
      monogramTop: monogram.top,
      monogramBottom: monogram.bottom,
      startDate: actualStart,
      endDate: actualEnd,
      lat: input.lat,
      lng: input.lng,
      timezone: input.timezone || 'UTC',
      isLondonDefault: false,
    },
    days,
    steps: [],
    memories: {},
    expenses: [],
    checklist: [
      {
        id: 'chk-passports',
        label: 'Passeports, pièces d’identité & visas éventuels',
        category: 'papiers',
        checked: false,
      },
      {
        id: 'chk-bookings',
        label: `Confirmations transports & hébergement (${cleanDest})`,
        category: 'reservations',
        checked: false,
      },
      {
        id: 'chk-cards',
        label: `Cartes bancaires sans frais (${input.tripCurrency}) & plafonds vérifiés`,
        category: 'papiers',
        checked: false,
      },
      {
        id: 'chk-luggage',
        label: 'Bagages, adaptateurs & trousse pharmacie',
        category: 'bagages',
        checked: false,
      },
    ],
    rates: {
      madPerGbp: homePerTrip,
      eurPerGbp: eurPerTrip,
    },
    currencies: {
      tripCurrency: input.tripCurrency,
      homeCurrency: input.homeCurrency,
    },
    people: [...cleanPeople],
    paymentMethods: [...DEFAULT_CUSTOM_PAYMENT_METHODS],
    practicalNotes,
  };
}

export function createSkeletonTripState(
  code: string,
  stateVersion = 6
): TripState {
  const today = new Date().toISOString().slice(0, 10);
  const skeleton = createBlankTripState(
    {
      title: code,
      destination: code,
      startDate: today,
      endDate: today,
      lat: 48.8566,
      lng: 2.3522,
      timezone: 'UTC',
      tripCurrency: 'EUR',
      homeCurrency: 'MAD',
      people: ['Famille'],
    },
    stateVersion
  );
  // Set epoch timestamp so any remote state immediately wins on first pull
  return {
    ...skeleton,
    updatedAt: '1970-01-01T00:00:00.000Z',
  };
}

export function buildTripSummary(
  id: string,
  state: TripState,
  role?: MemberRole
): TripSummary {
  return {
    id,
    title: state.meta.title,
    subtitle: state.meta.subtitle,
    destination: state.meta.destination,
    monogramTop: state.meta.monogramTop,
    monogramBottom: state.meta.monogramBottom,
    startDate: state.meta.startDate,
    endDate: state.meta.endDate,
    ...(role ? { role } : {}),
  };
}
