import { isValidCurrencyCode } from '../data/currencies';
import { INITIAL_EXPENSES } from '../data/expenses';
import { INITIAL_CHECKLIST } from '../data/infos';
import { INITIAL_STEPS } from '../data/steps';
import type {
  ExchangeRates,
  Language,
  TripCurrencies,
  TripState,
  TripStep,
} from '../types/trip';

export const STATE_VERSION = 5;
export const STORAGE_KEY = `londres-noel-2026:state:v${STATE_VERSION}`;
const LEGACY_KEYS = [
  'londres-noel-2026:state:v4',
  'londres-noel-2026:state:v3',
  'londres-noel-2026:state:v2',
  'londres-noel-2026:state:v1',
];
export const FAMILY_CODE_KEY = 'londres-noel-2026:family-code';
export const SELECTED_DAY_KEY = 'londres-noel-2026:selected-day';
export const LANGUAGE_KEY = 'londres-noel-2026:lang';

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
    steps: INITIAL_STEPS.map((step) => ({ ...step })),
    memories: {},
    expenses: INITIAL_EXPENSES.map((expense) => ({ ...expense })),
    checklist: INITIAL_CHECKLIST.map((item) => ({ ...item })),
    rates: { ...DEFAULT_RATES },
    currencies: { ...DEFAULT_CURRENCIES },
    people: [...DEFAULT_PEOPLE],
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

export function migrateTripState(parsed: TripState): TripState {
  let expenses = parsed.expenses;
  let steps: TripStep[] = parsed.steps;
  let people: string[] =
    Array.isArray(parsed.people) && parsed.people.length > 0
      ? parsed.people
      : [...DEFAULT_PEOPLE];

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

  const rawCurrencies = (parsed as Partial<TripState>).currencies;
  const currencies: TripCurrencies = {
    tripCurrency: isValidCurrencyCode(rawCurrencies?.tripCurrency)
      ? rawCurrencies.tripCurrency
      : DEFAULT_CURRENCIES.tripCurrency,
    homeCurrency: isValidCurrencyCode(rawCurrencies?.homeCurrency)
      ? rawCurrencies.homeCurrency
      : DEFAULT_CURRENCIES.homeCurrency,
  };

  return {
    ...createDefaultState(),
    ...parsed,
    steps,
    expenses,
    people,
    currencies,
    version: STATE_VERSION,
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
    return migrateTripState(parsed);
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

export function loadFamilyCode(): string {
  try {
    return window.localStorage.getItem(FAMILY_CODE_KEY) || 'LDN-NOEL-2026';
  } catch {
    return 'LDN-NOEL-2026';
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

export function loadLanguage(): Language {
  try {
    const val = window.localStorage.getItem(LANGUAGE_KEY);
    return val === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

export function saveLanguage(lang: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // Ignore
  }
}
