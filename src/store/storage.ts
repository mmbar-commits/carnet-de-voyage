import { isValidCurrencyCode } from '../data/currencies';
import { TRIP_DAYS } from '../data/days';
import { INITIAL_EXPENSES, PAYMENT_METHODS } from '../data/expenses';
import { INITIAL_CHECKLIST } from '../data/infos';
import { INITIAL_STEPS } from '../data/steps';
import { isValidTransportMode } from '../data/transports';
import {
  buildMonogram,
  buildTripDays,
  DEFAULT_CUSTOM_PAYMENT_METHODS,
  DEFAULT_LONDON_META,
  DEFAULT_LONDON_TRIP_ID,
  formatTripSubtitle,
} from '../data/tripFactory';
import type {
  ExchangeRates,
  Language,
  LanguagePreference,
  PracticalNote,
  TripCurrencies,
  TripDay,
  TripMeta,
  TripState,
  TripStep,
  TripSummary,
} from '../types/trip';

export const STATE_VERSION = 6;
export const STORAGE_KEY = `carnet-de-voyage:state:v${STATE_VERSION}`;
const LEGACY_KEYS = [
  'londres-noel-2026:state:v6',
  'londres-noel-2026:state:v5',
  'londres-noel-2026:state:v4',
  'londres-noel-2026:state:v3',
  'londres-noel-2026:state:v2',
  'londres-noel-2026:state:v1',
];
export const TRIPS_INDEX_KEY = 'carnet-de-voyage:trips:index:v1';
export const FAMILY_CODE_KEY = 'carnet-de-voyage:family-code';
export const SELECTED_DAY_KEY = 'carnet-de-voyage:selected-day';
export const LANGUAGE_KEY = 'carnet-de-voyage:lang';
const LEGACY_LANGUAGE_KEY = 'londres-noel-2026:lang';

export const DEFAULT_RATES: ExchangeRates = {
  madPerGbp: 12.6,
  eurPerGbp: 1.18,
};

export const DEFAULT_CURRENCIES: TripCurrencies = {
  tripCurrency: 'GBP',
  homeCurrency: 'MAD',
};

export const DEFAULT_PEOPLE: string[] = ['Famille', 'Mehdi', 'Aïda', 'Aya', 'Adam'];

export const DEFAULT_UPDATED_AT = '1970-01-01T00:00:00.000Z';

export function createDefaultState(): TripState {
  return {
    version: STATE_VERSION,
    updatedAt: DEFAULT_UPDATED_AT,
    meta: { ...DEFAULT_LONDON_META },
    days: TRIP_DAYS.map((day) => ({ ...day })),
    steps: INITIAL_STEPS.map((step) => ({ ...step })),
    memories: {},
    expenses: INITIAL_EXPENSES.map((expense) => ({ ...expense })),
    checklist: INITIAL_CHECKLIST.map((item) => ({ ...item })),
    rates: { ...DEFAULT_RATES },
    currencies: { ...DEFAULT_CURRENCIES },
    people: [...DEFAULT_PEOPLE],
    paymentMethods: [...PAYMENT_METHODS],
    practicalNotes: [],
  };
}

export function getDefaultLondonSummary(): TripSummary {
  return {
    id: DEFAULT_LONDON_TRIP_ID,
    title: DEFAULT_LONDON_META.title,
    subtitle: DEFAULT_LONDON_META.subtitle,
    destination: DEFAULT_LONDON_META.destination,
    monogramTop: DEFAULT_LONDON_META.monogramTop,
    monogramBottom: DEFAULT_LONDON_META.monogramBottom,
    startDate: DEFAULT_LONDON_META.startDate,
    endDate: DEFAULT_LONDON_META.endDate,
  };
}

export function isValidTripState(value: unknown): value is TripState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<TripState>;
  return (
    typeof candidate.version === 'number' &&
    Array.isArray(candidate.steps) &&
    Array.isArray(candidate.expenses) &&
    Array.isArray(candidate.checklist) &&
    typeof candidate.memories === 'object' &&
    candidate.memories !== null &&
    typeof candidate.rates === 'object' &&
    candidate.rates !== null
  );
}

function timeToMinutes(timeStr: string): number {
  const match = /(\d{1,2})\s*[h:]\s*(\d{2})?/i.exec(timeStr || '');
  if (!match) return 9999;
  const h = Number(match[1]);
  const m = match[2] ? Number(match[2]) : 0;
  return h * 60 + m;
}

function sanitizePracticalNotes(raw: unknown): PracticalNote[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (n): n is PracticalNote =>
        Boolean(
          n &&
            typeof n === 'object' &&
            typeof (n as Partial<PracticalNote>).id === 'string' &&
            typeof (n as Partial<PracticalNote>).title === 'string' &&
            typeof (n as Partial<PracticalNote>).content === 'string'
        )
    )
    .map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      ...(typeof n.mapsQuery === 'string' && n.mapsQuery.trim()
        ? { mapsQuery: n.mapsQuery }
        : {}),
    }));
}

function sanitizeDays(raw: unknown): TripDay[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (d): d is TripDay =>
      Boolean(
        d &&
          typeof d === 'object' &&
          typeof (d as Partial<TripDay>).id === 'string' &&
          typeof (d as Partial<TripDay>).dayNumber === 'number'
      )
  );
}

export function migrateTripState(
  parsed: TripState,
  familyCodeHint?: string
): TripState {
  const rawMeta = (parsed as Partial<TripState>).meta;
  const isLondon = rawMeta
    ? Boolean(rawMeta.isLondonDefault)
    : familyCodeHint === DEFAULT_LONDON_TRIP_ID;

  let expenses = parsed.expenses;
  let steps: TripStep[] = parsed.steps;
  let people: string[] =
    Array.isArray(parsed.people) && parsed.people.length > 0
      ? parsed.people
      : [...DEFAULT_PEOPLE];

  if (isLondon) {
    // v1 -> v2: ensure pre-paid RAM flight tickets expense exists
    if (parsed.version < 2) {
      const flightExp = INITIAL_EXPENSES.find((e) => e.id === 'exp-global-flights');
      if (flightExp && !expenses.some((e) => e.id === flightExp.id)) {
        expenses = [{ ...flightExp }, ...expenses];
      }
    }

    // v2 -> v3: add breakfast / lunch / dinner meal steps chronologically while preserving user edits
    if (parsed.version < 3) {
      const existingIds = new Set(steps.map((s) => s.id));
      const upgraded: TripStep[] = steps.map((s) =>
        s.id === 'step-30-2' ? { ...s, kind: 'repas' } : s
      );

      const newMeals = INITIAL_STEPS.filter(
        (s) => s.kind === 'repas' && !existingIds.has(s.id)
      ).map((s) => ({ ...s }));

      const merged = [...upgraded, ...newMeals];

      const byDay = new Map<string, TripStep[]>();
      for (const step of merged) {
        const list = byDay.get(step.dayId) ?? [];
        list.push(step);
        byDay.set(step.dayId, list);
      }

      const normalized: TripStep[] = [];
      for (const dayList of byDay.values()) {
        dayList.sort((a, b) => {
          const diff = timeToMinutes(a.timeStart) - timeToMinutes(b.timeStart);
          return diff !== 0 ? diff : a.order - b.order;
        });
        dayList.forEach((step, idx) => {
          normalized.push({ ...step, order: idx + 1 });
        });
      }

      steps = normalized;
    }

    // v3 -> v4: ensure people list exists and default flight expense has person = 'Famille' if unset
    if (parsed.version < 4) {
      if (!Array.isArray(parsed.people) || parsed.people.length === 0) {
        people = [...DEFAULT_PEOPLE];
      }
      expenses = expenses.map((e) =>
        e.id === 'exp-global-flights' && !e.person ? { ...e, person: 'Famille' } : e
      );
    }
  }

  steps = steps.map((step) => {
    if (step.kind !== 'transport') return step;
    return {
      ...step,
      kind: 'transport',
      transportMode: isValidTransportMode(step.transportMode)
        ? step.transportMode
        : 'autre',
    };
  });

  const rawCurrencies = (parsed as Partial<TripState>).currencies;
  const currencies: TripCurrencies = {
    tripCurrency: isValidCurrencyCode(rawCurrencies?.tripCurrency)
      ? rawCurrencies.tripCurrency
      : DEFAULT_CURRENCIES.tripCurrency,
    homeCurrency: isValidCurrencyCode(rawCurrencies?.homeCurrency)
      ? rawCurrencies.homeCurrency
      : DEFAULT_CURRENCIES.homeCurrency,
  };

  const validDays = sanitizeDays((parsed as Partial<TripState>).days);

  let meta: TripMeta;
  let days: TripDay[];

  if (isLondon) {
    meta = {
      ...DEFAULT_LONDON_META,
      ...(rawMeta ?? {}),
      isLondonDefault: true,
    };
    days = validDays.length > 0 ? validDays : TRIP_DAYS.map((d) => ({ ...d }));
  } else {
    const fallbackDest =
      rawMeta?.destination?.trim() || familyCodeHint || 'Voyage';
    const fallbackStart =
      rawMeta?.startDate ||
      validDays[0]?.id ||
      new Date().toISOString().slice(0, 10);
    const fallbackEnd =
      rawMeta?.endDate ||
      validDays[validDays.length - 1]?.id ||
      fallbackStart;
    const monogram = buildMonogram(fallbackDest, fallbackStart);

    days =
      validDays.length > 0
        ? validDays
        : buildTripDays(fallbackStart, fallbackEnd, fallbackDest);

    meta = {
      title: rawMeta?.title?.trim() || fallbackDest,
      subtitle:
        rawMeta?.subtitle?.trim() ||
        formatTripSubtitle(fallbackStart, fallbackEnd, fallbackDest),
      destination: fallbackDest,
      monogramTop: rawMeta?.monogramTop?.trim() || monogram.top,
      monogramBottom: rawMeta?.monogramBottom?.trim() || monogram.bottom,
      startDate: fallbackStart,
      endDate: fallbackEnd,
      lat:
        typeof rawMeta?.lat === 'number' && Number.isFinite(rawMeta.lat)
          ? rawMeta.lat
          : 48.8566,
      lng:
        typeof rawMeta?.lng === 'number' && Number.isFinite(rawMeta.lng)
          ? rawMeta.lng
          : 2.3522,
      timezone: rawMeta?.timezone?.trim() || 'UTC',
      isLondonDefault: false,
    };
  }

  const rawPaymentMethods = (parsed as Partial<TripState>).paymentMethods;
  const paymentMethods = Array.isArray(rawPaymentMethods)
    ? rawPaymentMethods.filter(
        (m): m is string => typeof m === 'string' && m.trim().length > 0
      )
    : isLondon
      ? [...PAYMENT_METHODS]
      : [...DEFAULT_CUSTOM_PAYMENT_METHODS];

  const practicalNotes = sanitizePracticalNotes(
    (parsed as Partial<TripState>).practicalNotes
  );

  return {
    ...(isLondon ? createDefaultState() : {}),
    ...parsed,
    version: STATE_VERSION,
    updatedAt:
      typeof parsed.updatedAt === 'string' && parsed.updatedAt
        ? parsed.updatedAt
        : DEFAULT_UPDATED_AT,
    meta,
    days,
    steps,
    memories: parsed.memories ?? {},
    expenses,
    checklist: parsed.checklist ?? [],
    people,
    paymentMethods,
    practicalNotes,
    currencies,
    rates: {
      madPerGbp:
        typeof parsed.rates.madPerGbp === 'number' && parsed.rates.madPerGbp > 0
          ? parsed.rates.madPerGbp
          : DEFAULT_RATES.madPerGbp,
      eurPerGbp:
        typeof parsed.rates.eurPerGbp === 'number' && parsed.rates.eurPerGbp > 0
          ? parsed.rates.eurPerGbp
          : DEFAULT_RATES.eurPerGbp,
    },
  };
}

export function loadTripState(): TripState {
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const legacyKey of LEGACY_KEYS) {
        const candidate = window.localStorage.getItem(legacyKey);
        if (candidate) {
          raw = candidate;
          break;
        }
      }
    }
    if (!raw) return createDefaultState();
    const parsed: unknown = JSON.parse(raw);
    if (!isValidTripState(parsed)) {
      return createDefaultState();
    }
    return migrateTripState(parsed, DEFAULT_LONDON_TRIP_ID);
  } catch {
    return createDefaultState();
  }
}

export function saveTripState(state: TripState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or private mode errors gracefully
  }
}

function getTripStorageKey(code: string): string {
  return code === DEFAULT_LONDON_TRIP_ID
    ? STORAGE_KEY
    : `carnet-de-voyage:trip:${code}`;
}

export function loadTripStateForCode(code: string): TripState | null {
  if (!code || code === DEFAULT_LONDON_TRIP_ID) {
    return loadTripState();
  }
  try {
    const raw = window.localStorage.getItem(getTripStorageKey(code));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidTripState(parsed)) return null;
    return migrateTripState(parsed, code);
  } catch {
    return null;
  }
}

export function saveTripStateForCode(code: string, state: TripState): void {
  try {
    window.localStorage.setItem(getTripStorageKey(code), JSON.stringify(state));
  } catch {
    // Ignore storage quota or private mode errors gracefully
  }
}

function isValidTripSummary(value: unknown): value is TripSummary {
  if (!value || typeof value !== 'object') return false;
  const c = value as Partial<TripSummary>;
  return (
    typeof c.id === 'string' &&
    c.id.length > 0 &&
    typeof c.title === 'string' &&
    typeof c.destination === 'string' &&
    typeof c.monogramTop === 'string' &&
    typeof c.monogramBottom === 'string'
  );
}

export function loadTripsIndex(): TripSummary[] {
  try {
    const raw = window.localStorage.getItem(TRIPS_INDEX_KEY);
    if (!raw) return [getDefaultLondonSummary()];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [getDefaultLondonSummary()];
    const valid = parsed.filter(isValidTripSummary);
    if (valid.length === 0) return [getDefaultLondonSummary()];
    return valid;
  } catch {
    return [getDefaultLondonSummary()];
  }
}

export function saveTripsIndex(list: TripSummary[]): void {
  try {
    window.localStorage.setItem(TRIPS_INDEX_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }
}

export function upsertTripSummary(summary: TripSummary): TripSummary[] {
  const existing = loadTripsIndex();
  const idx = existing.findIndex((item) => item.id === summary.id);
  let next: TripSummary[];
  if (idx >= 0) {
    next = existing.map((item, i) =>
      i === idx
        ? {
            ...item,
            ...summary,
            role: summary.role ?? item.role,
          }
        : item
    );
  } else {
    next = [...existing, summary];
  }
  saveTripsIndex(next);
  return next;
}

export function removeTripFromIndex(tripId: string): TripSummary[] {
  const existing = loadTripsIndex();
  const filtered = existing.filter((item) => item.id !== tripId);
  const next = filtered.length > 0 ? filtered : [getDefaultLondonSummary()];
  saveTripsIndex(next);
  return next;
}

// ---------------------------------------------------------------------------
// Per-user scoped storage (strict multi-user privacy isolation)
// ---------------------------------------------------------------------------

const USER_STORAGE_PREFIX = 'carnet-de-voyage:u:';

function getUserPrefix(userId: string): string {
  return `${USER_STORAGE_PREFIX}${userId}:`;
}

function getUserTripsIndexKey(userId: string): string {
  return `${getUserPrefix(userId)}trips:index:v1`;
}

function getUserTripStateKey(userId: string, code: string): string {
  return `${getUserPrefix(userId)}trip:${code}`;
}

export function loadUserTripsIndex(userId: string): TripSummary[] {
  if (!userId) return [];
  try {
    const raw = window.localStorage.getItem(getUserTripsIndexKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTripSummary);
  } catch {
    return [];
  }
}

export function saveUserTripsIndex(userId: string, list: TripSummary[]): void {
  if (!userId) return;
  try {
    window.localStorage.setItem(getUserTripsIndexKey(userId), JSON.stringify(list));
  } catch {
    // Ignore storage quota or private mode errors gracefully
  }
}

export function loadUserTripState(userId: string, code: string): TripState | null {
  if (!userId || !code) return null;
  try {
    const raw = window.localStorage.getItem(getUserTripStateKey(userId, code));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidTripState(parsed)) return null;
    return migrateTripState(parsed, code);
  } catch {
    return null;
  }
}

export function saveUserTripState(userId: string, code: string, state: TripState): void {
  if (!userId || !code) return;
  try {
    window.localStorage.setItem(
      getUserTripStateKey(userId, code),
      JSON.stringify(state)
    );
  } catch {
    // Ignore storage quota or private mode errors gracefully
  }
}

export function removeUserCachedTrip(userId: string, code: string): void {
  if (!userId || !code) return;
  try {
    window.localStorage.removeItem(getUserTripStateKey(userId, code));
    const current = loadUserTripsIndex(userId);
    const filtered = current.filter((item) => item.id !== code);
    saveUserTripsIndex(userId, filtered);
  } catch {
    // Ignore storage access errors gracefully
  }
}

export function clearUserCachedTrips(userId?: string | null): void {
  try {
    const userPrefix = userId ? getUserPrefix(userId) : null;
    const legacyUserPrefix = userId ? `londres-noel-2026:u:${userId}:` : null;
    const keysToRemove = new Set<string>([
      STORAGE_KEY,
      ...LEGACY_KEYS,
      TRIPS_INDEX_KEY,
      FAMILY_CODE_KEY,
      SELECTED_DAY_KEY,
      'londres-noel-2026:trips:index:v1',
      'londres-noel-2026:family-code',
      'londres-noel-2026:selected-day',
    ]);

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (
        (userPrefix && key.startsWith(userPrefix)) ||
        (legacyUserPrefix && key.startsWith(legacyUserPrefix)) ||
        key.startsWith('carnet-de-voyage:trip:') ||
        key.startsWith('carnet-de-voyage:state:') ||
        key.startsWith('carnet-de-voyage:trips:') ||
        key.startsWith('londres-noel-2026:trip:') ||
        key.startsWith('londres-noel-2026:state:') ||
        key.startsWith('londres-noel-2026:trips:')
      ) {
        keysToRemove.add(key);
      }
    }

    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors gracefully
  }
}

export function loadFamilyCode(): string {
  try {
    return window.localStorage.getItem(FAMILY_CODE_KEY) || DEFAULT_LONDON_TRIP_ID;
  } catch {
    return DEFAULT_LONDON_TRIP_ID;
  }
}

export function saveFamilyCode(code: string): void {
  try {
    window.localStorage.setItem(FAMILY_CODE_KEY, code);
  } catch {
    // Ignore
  }
}

export function loadSelectedDay(fallbackDayId: string): string {
  try {
    return window.localStorage.getItem(SELECTED_DAY_KEY) || fallbackDayId;
  } catch {
    return fallbackDayId;
  }
}

export function saveSelectedDay(dayId: string): void {
  try {
    window.localStorage.setItem(SELECTED_DAY_KEY, dayId);
  } catch {
    // Ignore
  }
}

export function detectDeviceLanguage(): Language {
  if (typeof navigator === 'undefined') return 'fr';
  const candidates =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];

  for (const raw of candidates) {
    const normalized = String(raw || '').trim().toLowerCase();
    if (normalized.startsWith('fr')) return 'fr';
    if (normalized.startsWith('en')) return 'en';
  }
  return 'fr';
}

export function resolveLanguage(pref: LanguagePreference): Language {
  return pref === 'auto' ? detectDeviceLanguage() : pref;
}

export function loadLanguagePreference(): LanguagePreference {
  try {
    const val =
      window.localStorage.getItem(LANGUAGE_KEY) ??
      window.localStorage.getItem(LEGACY_LANGUAGE_KEY);
    if (val === 'fr' || val === 'en') return val;
    return 'auto';
  } catch {
    return 'auto';
  }
}

export function saveLanguagePreference(pref: LanguagePreference): void {
  try {
    window.localStorage.setItem(LANGUAGE_KEY, pref);
  } catch {
    // Ignore
  }
}

export function loadLanguage(): Language {
  return resolveLanguage(loadLanguagePreference());
}

export function saveLanguage(lang: Language): void {
  saveLanguagePreference(lang);
}
