import type { Language, TransportMode } from '../types/trip';

export type { TransportMode };

export interface TransportModeOption {
  id: TransportMode;
  labelFr: string;
  labelEn: string;
}

export const TRANSPORT_MODES: TransportModeOption[] = [
  { id: 'avion', labelFr: 'Avion', labelEn: 'Flight' },
  { id: 'train', labelFr: 'Train', labelEn: 'Train' },
  { id: 'metro', labelFr: 'Métro', labelEn: 'Metro' },
  { id: 'voiture', labelFr: 'Voiture', labelEn: 'Car' },
  { id: 'taxi', labelFr: 'Taxi / VTC', labelEn: 'Taxi / Ride' },
  { id: 'bus', labelFr: 'Bus / Car', labelEn: 'Bus / Coach' },
  { id: 'ferry', labelFr: 'Bateau', labelEn: 'Ferry' },
  { id: 'marche', labelFr: 'À pied', labelEn: 'Walk' },
  { id: 'autre', labelFr: 'Autre', labelEn: 'Other' },
];

const TRANSPORT_MODE_MAP: Record<TransportMode, TransportModeOption> =
  Object.fromEntries(
    TRANSPORT_MODES.map((mode) => [mode.id, mode])
  ) as Record<TransportMode, TransportModeOption>;

export function isValidTransportMode(value: unknown): value is TransportMode {
  return typeof value === 'string' && value in TRANSPORT_MODE_MAP;
}

export function getTransportModeLabel(
  mode: TransportMode,
  lang: Language
): string {
  const option = TRANSPORT_MODE_MAP[mode] ?? TRANSPORT_MODE_MAP.autre;
  return lang === 'fr' ? option.labelFr : option.labelEn;
}
