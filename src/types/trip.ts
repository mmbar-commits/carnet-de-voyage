export type TabId = 'planning' | 'carnet' | 'activites' | 'budget' | 'infos';

export type Language = 'fr' | 'en';

export type BookingStatus =
  | 'a_reserver'
  | 'reserve'
  | 'sur_place'
  | 'entree_libre';

export type ExpenseCategory = 'activites' | 'repas' | 'transports' | 'shopping';

export type ActivityTag = 'gratuit' | 'resident_th' | 'interieur' | 'top_4_ans';

export type KidCompatibility = 'Top' | 'Adapté' | 'Calme';

export interface CriticalBanner {
  title: string;
  message: string;
}

export interface TripDay {
  id: string;
  dayNumber: number;
  weekdayShort: string;
  weekdayFull: string;
  dateShort: string;
  dateLong: string;
  title: string;
  neighborhood: string;
  isCritical?: boolean;
  criticalBanner?: CriticalBanner;
}

export type StepKind = 'activite' | 'repas';

export interface TripStep {
  id: string;
  dayId: string;
  order: number;
  kind?: StepKind;
  timeStart: string;
  timeEnd?: string;
  title: string;
  location: string;
  transport?: string;
  description: string;
  ayaRating: KidCompatibility;
  ayaNote: string;
  adamRating: KidCompatibility;
  adamNote: string;
  bookingStatus: BookingStatus;
  done: boolean;
  costGbp?: number;
  costNote?: string;
  isTowerHamletsBenefit?: boolean;
  fullPriceGbp?: number;
  tags?: ActivityTag[];
  bonusActivityId?: string;
}

export interface DayRouteStop {
  label: string;
  query: string;
  lat: number;
  lng: number;
}

export interface DayRoute {
  mode: 'w' | 'r';
  stops: DayRouteStop[];
}

export interface JournalDayContent {
  dayId: string;
  subtitle: string;
  morning: string;
  lunchTitle: string;
  lunch: string;
  afternoon: string;
  logisticsNote: string;
  marginQuote: string;
  route: DayRoute;
}

export interface JournalMemory {
  dayId: string;
  note: string;
  updatedAt?: string;
}

export interface BonusActivity {
  id: string;
  title: string;
  neighborhood: string;
  transport: string;
  duration: string;
  suggestedTime: string;
  description: string;
  ayaRating: KidCompatibility;
  ayaNote: string;
  adamRating: KidCompatibility;
  adamNote: string;
  costGbp: number;
  costLabel: string;
  bookingStatus: BookingStatus;
  tags: ActivityTag[];
}

export type DisplayCurrency = 'GBP' | 'MAD';

export interface Expense {
  id: string;
  dayId: string; // TripDay.id or 'global'
  title: string;
  category: ExpenseCategory;
  amountGbp: number;
  paid: boolean;
  paymentMethod?: string;
  person?: string;
  note?: string;
  linkedStepId?: string;
  isTowerHamletsBenefit?: boolean;
  savedGbp?: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'papiers' | 'reservations' | 'bagages' | 'enfants';
  checked: boolean;
}

export interface ExchangeRates {
  madPerGbp: number;
  eurPerGbp: number;
}

export interface SyncStatus {
  mode: 'local' | 'supabase_ready' | 'syncing' | 'synced' | 'error';
  familyCode: string;
  lastSyncedAt?: string;
  errorMessage?: string;
}

export interface TripState {
  version: number;
  updatedAt: string;
  steps: TripStep[];
  memories: Record<string, JournalMemory>;
  expenses: Expense[];
  checklist: ChecklistItem[];
  rates: ExchangeRates;
  people: string[];
}
