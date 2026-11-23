import type { TripDay } from '../types/trip';

export type WeatherKind =
  | 'sun'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm';

export interface DayWeather {
  dayId: string;
  kind: WeatherKind;
  minC: number;
  maxC: number;
  rainPct: number;
  isForecast: boolean;
  updatedAt?: string;
}

export interface WeatherTripMeta {
  lat: number;
  lng: number;
  timezone: string;
  isLondonDefault?: boolean;
}

export const WEATHER_TTL_MS = 2 * 60 * 60 * 1000;

export function getWeatherStorageKey(tripId: string): string {
  return `londres-noel-2026:weather:v2:${tripId || 'LDN-NOEL-2026'}`;
}

const VALID_KINDS: ReadonlySet<WeatherKind> = new Set([
  'sun',
  'partly_cloudy',
  'cloudy',
  'fog',
  'drizzle',
  'rain',
  'snow',
  'storm',
]);

interface WeatherCachePayload {
  fetchedAt: number;
  forecasts: Record<string, DayWeather>;
}

interface OpenMeteoDailyResponse {
  daily?: {
    time?: string[];
    weather_code?: Array<number | null>;
    temperature_2m_max?: Array<number | null>;
    temperature_2m_min?: Array<number | null>;
    precipitation_probability_max?: Array<number | null>;
  };
}

const LONDON_SEASONAL_DEFAULTS: Record<string, DayWeather> = {
  '2026-12-22': {
    dayId: '2026-12-22',
    kind: 'partly_cloudy',
    minC: 4,
    maxC: 9,
    rainPct: 25,
    isForecast: false,
  },
  '2026-12-23': {
    dayId: '2026-12-23',
    kind: 'cloudy',
    minC: 5,
    maxC: 9,
    rainPct: 35,
    isForecast: false,
  },
  '2026-12-24': {
    dayId: '2026-12-24',
    kind: 'drizzle',
    minC: 4,
    maxC: 8,
    rainPct: 45,
    isForecast: false,
  },
  '2026-12-25': {
    dayId: '2026-12-25',
    kind: 'partly_cloudy',
    minC: 4,
    maxC: 9,
    rainPct: 20,
    isForecast: false,
  },
  '2026-12-26': {
    dayId: '2026-12-26',
    kind: 'cloudy',
    minC: 5,
    maxC: 9,
    rainPct: 35,
    isForecast: false,
  },
  '2026-12-27': {
    dayId: '2026-12-27',
    kind: 'partly_cloudy',
    minC: 5,
    maxC: 10,
    rainPct: 25,
    isForecast: false,
  },
  '2026-12-28': {
    dayId: '2026-12-28',
    kind: 'drizzle',
    minC: 4,
    maxC: 8,
    rainPct: 40,
    isForecast: false,
  },
  '2026-12-29': {
    dayId: '2026-12-29',
    kind: 'cloudy',
    minC: 4,
    maxC: 9,
    rainPct: 30,
    isForecast: false,
  },
  '2026-12-30': {
    dayId: '2026-12-30',
    kind: 'partly_cloudy',
    minC: 5,
    maxC: 9,
    rainPct: 25,
    isForecast: false,
  },
  '2026-12-31': {
    dayId: '2026-12-31',
    kind: 'cloudy',
    minC: 4,
    maxC: 8,
    rainPct: 35,
    isForecast: false,
  },
  '2027-01-01': {
    dayId: '2027-01-01',
    kind: 'drizzle',
    minC: 4,
    maxC: 8,
    rainPct: 40,
    isForecast: false,
  },
};

export function mapWmoToKind(code: number): WeatherKind {
  if (code === 0) return 'sun';
  if (code === 1 || code === 2) return 'partly_cloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code === 95 || code === 96 || code === 99) return 'storm';
  return 'cloudy';
}

export function getDefaultSeasonalWeather(
  days: TripDay[],
  meta: WeatherTripMeta
): Record<string, DayWeather> {
  if (!meta.isLondonDefault) {
    return {};
  }
  const result: Record<string, DayWeather> = {};
  for (const day of days) {
    const preset = LONDON_SEASONAL_DEFAULTS[day.id];
    result[day.id] = preset
      ? { ...preset }
      : {
          dayId: day.id,
          kind: 'cloudy',
          minC: 4,
          maxC: 9,
          rainPct: 30,
          isForecast: false,
        };
  }
  return result;
}

function isValidDayWeather(
  value: unknown,
  validDayIds: ReadonlySet<string>
): value is DayWeather {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DayWeather>;
  return (
    typeof candidate.dayId === 'string' &&
    validDayIds.has(candidate.dayId) &&
    typeof candidate.kind === 'string' &&
    VALID_KINDS.has(candidate.kind as WeatherKind) &&
    typeof candidate.minC === 'number' &&
    Number.isFinite(candidate.minC) &&
    typeof candidate.maxC === 'number' &&
    Number.isFinite(candidate.maxC) &&
    typeof candidate.rainPct === 'number' &&
    Number.isFinite(candidate.rainPct) &&
    typeof candidate.isForecast === 'boolean'
  );
}

function readWeatherCache(
  tripId: string,
  validDayIds: ReadonlySet<string>
): WeatherCachePayload | null {
  try {
    const raw = window.localStorage.getItem(getWeatherStorageKey(tripId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WeatherCachePayload>;
    if (
      typeof parsed.fetchedAt !== 'number' ||
      !Number.isFinite(parsed.fetchedAt) ||
      !parsed.forecasts ||
      typeof parsed.forecasts !== 'object'
    ) {
      return null;
    }
    const forecasts: Record<string, DayWeather> = {};
    for (const [dayId, entry] of Object.entries(parsed.forecasts)) {
      if (isValidDayWeather(entry, validDayIds) && entry.dayId === dayId) {
        forecasts[dayId] = entry;
      }
    }
    return { fetchedAt: parsed.fetchedAt, forecasts };
  } catch {
    return null;
  }
}

function writeWeatherCache(tripId: string, payload: WeatherCachePayload): void {
  try {
    window.localStorage.setItem(
      getWeatherStorageKey(tripId),
      JSON.stringify(payload)
    );
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

export function isWeatherCacheStale(
  tripId: string,
  days: TripDay[],
  now = Date.now()
): boolean {
  const validDayIds = new Set(days.map((d) => d.id));
  const cache = readWeatherCache(tripId, validDayIds);
  if (!cache) return true;
  return now - cache.fetchedAt >= WEATHER_TTL_MS;
}

export function loadCachedOrSeasonalWeather(
  tripId: string,
  days: TripDay[],
  meta: WeatherTripMeta
): Record<string, DayWeather> {
  const validDayIds = new Set(days.map((d) => d.id));
  const merged = getDefaultSeasonalWeather(days, meta);
  const cache = readWeatherCache(tripId, validDayIds);
  if (cache) {
    for (const [dayId, entry] of Object.entries(cache.forecasts)) {
      if (validDayIds.has(dayId)) {
        merged[dayId] = entry;
      }
    }
  }
  return merged;
}

export async function fetchOpenMeteoWeather(
  tripId: string,
  days: TripDay[],
  meta: WeatherTripMeta,
  signal?: AbortSignal
): Promise<Record<string, DayWeather> | null> {
  if (!Number.isFinite(meta.lat) || !Number.isFinite(meta.lng)) {
    return null;
  }

  const validDayIds = new Set(days.map((d) => d.id));
  const tz = meta.timezone?.trim() || 'auto';
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
    String(meta.lat)
  )}&longitude=${encodeURIComponent(
    String(meta.lng)
  )}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${encodeURIComponent(
    tz
  )}&forecast_days=16`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal,
    });
    if (!response.ok) return null;

    const data = (await response.json()) as OpenMeteoDailyResponse;
    const daily = data.daily;
    if (!daily || !Array.isArray(daily.time)) return null;

    const updatedAt = new Date().toISOString();
    const forecasts: Record<string, DayWeather> = {};

    daily.time.forEach((dayId, idx) => {
      if (!validDayIds.has(dayId)) return;

      const rawCode = daily.weather_code?.[idx];
      const rawMin = daily.temperature_2m_min?.[idx];
      const rawMax = daily.temperature_2m_max?.[idx];
      const rawRain = daily.precipitation_probability_max?.[idx];

      if (
        typeof rawCode !== 'number' ||
        typeof rawMin !== 'number' ||
        typeof rawMax !== 'number'
      ) {
        return;
      }

      const rainPct =
        typeof rawRain === 'number' && Number.isFinite(rawRain)
          ? Math.max(0, Math.min(100, Math.round(rawRain)))
          : 0;

      forecasts[dayId] = {
        dayId,
        kind: mapWmoToKind(rawCode),
        minC: Math.round(rawMin),
        maxC: Math.round(rawMax),
        rainPct,
        isForecast: true,
        updatedAt,
      };
    });

    writeWeatherCache(tripId, {
      fetchedAt: Date.now(),
      forecasts,
    });

    const merged = getDefaultSeasonalWeather(days, meta);
    for (const [dayId, entry] of Object.entries(forecasts)) {
      merged[dayId] = entry;
    }
    return merged;
  } catch {
    return null;
  }
}
