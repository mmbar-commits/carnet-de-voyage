import { INITIAL_EXPENSES } from '../data/expenses';
import { INITIAL_CHECKLIST } from '../data/infos';
import { INITIAL_STEPS } from '../data/steps';
import type { ExchangeRates, TripState } from '../types/trip';

export const STATE_VERSION = 2;
export const STORAGE_KEY = `londres-noel-2026:state:v${STATE_VERSION}`;
const LEGACY_V1_KEY = 'londres-noel-2026:state:v1';
export const FAMILY_CODE_KEY = 'londres-noel-2026:family-code';
export const SELECTED_DAY_KEY = 'londres-noel-2026:selected-day';

export const DEFAULT_RATES: ExchangeRates = {
  madPerGbp: 12.6,
  eurPerGbp: 1.18,
};

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

export function loadTripState(): TripState {
  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY);
    const raw = rawV2 ?? window.localStorage.getItem(LEGACY_V1_KEY);
    if (!raw) return createDefaultState();
    const parsed: unknown = JSON.parse(raw);
    if (!isValidTripState(parsed)) {
      return createDefaultState();
    }

    let expenses = parsed.expenses;
    if (!rawV2) {
      const flightExp = INITIAL_EXPENSES.find((e) => e.id === 'exp-global-flights');
      if (flightExp && !expenses.some((e) => e.id === flightExp.id)) {
        expenses = [{ ...flightExp }, ...expenses];
      }
    }

    return {
      ...createDefaultState(),
      ...parsed,
      expenses,
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
