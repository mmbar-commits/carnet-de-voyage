import { TRIP_DAYS } from '../data/days';

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

export const WEATHER_STORAGE_KEY = 'londres-noel-2026:weather:v1';
export const WEATHER_TTL_MS = 2 * 60 * 60 * 1000;

const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=-0.1276&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FLondon&forecast_days=16';

const TRIP_DAY_IDS = new Set(TRIP_DAYS.map((day) => day.id));

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

const SEASONAL_DEFAULTS: Record<string, DayWeather> = {
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

export function getDefaultSeasonalWeather(): Record<string, DayWeather> {
  const result: Record<string, DayWeather> = {};
  for (const day of TRIP_DAYS) {
    const preset = SEASONAL_DEFAULTS[day.id];
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

function isValidDayWeather(value: unknown): value is DayWeather {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DayWeather>;
  return (
    typeof candidate.dayId === 'string' &&
    TRIP_DAY_IDS.has(candidate.dayId) &&
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

function readWeatherCache(): WeatherCachePayload | null {
  try {
    const raw = window.localStorage.getItem(WEATHER_STORAGE_KEY);
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
      if (isValidDayWeather(entry) && entry.dayId === dayId) {
        forecasts[dayId] = entry;
      }
    }
    return { fetchedAt: parsed.fetchedAt, forecasts };
  } catch {
    return null;
  }
}

function writeWeatherCache(payload: WeatherCachePayload): void {
  try {
    window.localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

export function isWeatherCacheStale(now = Date.now()): boolean {
  const cache = readWeatherCache();
  if (!cache) return true;
  return now - cache.fetchedAt >= WEATHER_TTL_MS;
}

export function loadCachedOrSeasonalWeather(): Record<string, DayWeather> {
  const merged = getDefaultSeasonalWeather();
  const cache = readWeatherCache();
  if (cache) {
    for (const [dayId, entry] of Object.entries(cache.forecasts)) {
      if (TRIP_DAY_IDS.has(dayId)) {
        merged[dayId] = entry;
      }
    }
  }
  return merged;
}

export async function fetchOpenMeteoWeather(
  signal?: AbortSignal
): Promise<Record<string, DayWeather> | null> {
  try {
    const response = await fetch(OPEN_METEO_URL, {
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
      if (!TRIP_DAY_IDS.has(dayId)) return;

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

    writeWeatherCache({
      fetchedAt: Date.now(),
      forecasts,
    });

    const merged = getDefaultSeasonalWeather();
    for (const [dayId, entry] of Object.entries(forecasts)) {
      merged[dayId] = entry;
    }
    return merged;
  } catch {
    return null;
  }
}
