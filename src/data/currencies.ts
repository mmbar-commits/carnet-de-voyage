import type { CurrencyCode } from '../types/trip';

export type { CurrencyCode };

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  labelFr: string;
  labelEn: string;
  decimals?: number;
  symbolPosition?: 'prefix' | 'suffix' | 'locale';
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  {
    code: 'GBP',
    symbol: '£',
    labelFr: 'Livre sterling',
    labelEn: 'British Pound',
    decimals: 2,
    symbolPosition: 'prefix',
  },
  {
    code: 'MAD',
    symbol: 'MAD',
    labelFr: 'Dirham marocain',
    labelEn: 'Moroccan Dirham',
    decimals: 0,
    symbolPosition: 'suffix',
  },
  {
    code: 'EUR',
    symbol: '€',
    labelFr: 'Euro',
    labelEn: 'Euro',
    decimals: 2,
    symbolPosition: 'locale',
  },
  {
    code: 'USD',
    symbol: '$',
    labelFr: 'Dollar américain',
    labelEn: 'US Dollar',
    decimals: 2,
    symbolPosition: 'prefix',
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    labelFr: 'Franc suisse',
    labelEn: 'Swiss Franc',
    decimals: 2,
    symbolPosition: 'suffix',
  },
  {
    code: 'CAD',
    symbol: 'CA$',
    labelFr: 'Dollar canadien',
    labelEn: 'Canadian Dollar',
    decimals: 2,
    symbolPosition: 'prefix',
  },
  {
    code: 'JPY',
    symbol: '¥',
    labelFr: 'Yen japonais',
    labelEn: 'Japanese Yen',
    decimals: 0,
    symbolPosition: 'prefix',
  },
  {
    code: 'AED',
    symbol: 'AED',
    labelFr: 'Dirham des Émirats',
    labelEn: 'UAE Dirham',
    decimals: 2,
    symbolPosition: 'suffix',
  },
  {
    code: 'TRY',
    symbol: '₺',
    labelFr: 'Livre turque',
    labelEn: 'Turkish Lira',
    decimals: 2,
    symbolPosition: 'prefix',
  },
  {
    code: 'THB',
    symbol: '฿',
    labelFr: 'Baht thaïlandais',
    labelEn: 'Thai Baht',
    decimals: 2,
    symbolPosition: 'prefix',
  },
  {
    code: 'AUD',
    symbol: 'A$',
    labelFr: 'Dollar australien',
    labelEn: 'Australian Dollar',
    decimals: 2,
    symbolPosition: 'prefix',
  },
  {
    code: 'DKK',
    symbol: 'kr',
    labelFr: 'Couronne danoise',
    labelEn: 'Danish Krone',
    decimals: 2,
    symbolPosition: 'suffix',
  },
  {
    code: 'SEK',
    symbol: 'kr',
    labelFr: 'Couronne suédoise',
    labelEn: 'Swedish Krona',
    decimals: 2,
    symbolPosition: 'suffix',
  },
  {
    code: 'NOK',
    symbol: 'kr',
    labelFr: 'Couronne norvégienne',
    labelEn: 'Norwegian Krone',
    decimals: 2,
    symbolPosition: 'suffix',
  },
];

const CURRENCY_MAP: Record<CurrencyCode, CurrencyOption> = Object.fromEntries(
  CURRENCY_OPTIONS.map((opt) => [opt.code, opt])
) as Record<CurrencyCode, CurrencyOption>;

/**
 * Approximate units per 1 GBP for sensible default exchange rate suggestions
 * (e.g., GBP -> MAD = 12.6, EUR -> MAD = 10.8, USD -> MAD = 9.9).
 */
const APPROX_UNITS_PER_GBP: Record<CurrencyCode, number> = {
  GBP: 1,
  MAD: 12.6,
  EUR: 12.6 / 10.8,
  USD: 12.6 / 9.9,
  CHF: 1.12,
  CAD: 1.75,
  JPY: 195,
  AED: 4.67,
  TRY: 44,
  THB: 43.5,
  AUD: 1.95,
  DKK: 8.7,
  SEK: 13.4,
  NOK: 13.9,
};

export function isValidCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && value in CURRENCY_MAP;
}

export function getCurrencyOption(code: CurrencyCode): CurrencyOption {
  return CURRENCY_MAP[code] ?? CURRENCY_MAP.GBP;
}

export function getCurrencyChipLabel(code: CurrencyCode): string {
  const opt = getCurrencyOption(code);
  if (opt.symbol === opt.code) return opt.code;
  return `${opt.symbol} ${opt.code}`;
}

export function formatCurrencyAmount(
  amount: number,
  code: CurrencyCode,
  locale: string
): string {
  const opt = getCurrencyOption(code);
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const sign = isNegative ? '-' : '';
  const maxDecimals = opt.decimals ?? 2;

  let formattedNumber: string;
  if (maxDecimals === 0) {
    formattedNumber = Math.round(abs).toLocaleString(locale);
  } else {
    const isWhole = Math.abs(abs - Math.round(abs)) < 1e-9;
    formattedNumber = abs.toLocaleString(locale, {
      minimumFractionDigits: isWhole ? 0 : maxDecimals,
      maximumFractionDigits: maxDecimals,
    });
  }

  const pos = opt.symbolPosition ?? 'prefix';
  if (pos === 'suffix') {
    return `${sign}${formattedNumber} ${opt.symbol}`;
  }
  if (pos === 'locale') {
    if (locale.toLowerCase().startsWith('fr')) {
      return `${sign}${formattedNumber} ${opt.symbol}`;
    }
    return `${sign}${opt.symbol}${formattedNumber}`;
  }
  return `${sign}${opt.symbol}${formattedNumber}`;
}

export function getApproxRate(from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return 1;
  const fromPerGbp = APPROX_UNITS_PER_GBP[from] ?? 1;
  const toPerGbp = APPROX_UNITS_PER_GBP[to] ?? 1;
  const raw = toPerGbp / fromPerGbp;

  if (raw >= 100) {
    return Math.round(raw * 10) / 10;
  }
  if (raw >= 1) {
    return Math.round(raw * 100) / 100;
  }
  if (raw >= 0.05) {
    return Math.round(raw * 1000) / 1000;
  }
  return Math.round(raw * 10000) / 10000;
}
