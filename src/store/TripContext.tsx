import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { TRIP_DAYS } from '../data/days';
import {
  buildMonogram,
  buildTripSummary,
  createBlankTripState,
  createSkeletonTripState,
  DEFAULT_LONDON_TRIP_ID,
  generateTripCode,
  type CreateBlankTripInput,
} from '../data/tripFactory';
import type {
  AuthUser,
  BonusActivity,
  BookingStatus,
  ChecklistItem,
  ExchangeRates,
  Expense,
  ExpenseCategory,
  Language,
  LanguagePreference,
  MemberRole,
  PracticalNote,
  SyncStatus,
  TabId,
  TripAccessRole,
  TripCurrencies,
  TripDay,
  TripMember,
  TripMeta,
  TripState,
  TripStep,
  TripSummary,
} from '../types/trip';
import {
  clearUserCachedTrips,
  createDefaultState,
  DEFAULT_RATES,
  DEFAULT_UPDATED_AT,
  detectDeviceLanguage,
  isValidTripState,
  loadFamilyCode,
  loadLanguagePreference,
  loadSelectedDay,
  loadTripsIndex,
  loadTripStateForCode,
  loadUserTripsIndex,
  loadUserTripState,
  migrateTripState,
  saveFamilyCode,
  saveLanguagePreference,
  saveSelectedDay,
  saveTripStateForCode,
  saveUserTripsIndex,
  saveUserTripState,
  STATE_VERSION,
  upsertTripSummary,
} from './storage';
import {
  claimTripAsAdmin,
  deleteTripMember,
  fetchMyTripsCatalog,
  getCurrentAuthUser,
  inviteOrUpdateMember,
  isSupabaseConfigured,
  normalizeFamilyCode,
  pullRemoteState,
  pushRemoteState,
  resolveTripAccess,
  sendPasswordResetEmail,
  signInWithGoogleOAuth,
  signInWithMagicLink,
  signInWithPassword,
  signOutAuth,
  signUpWithPassword,
  subscribeAuthState,
  subscribeToFamilySync,
  syncUserLanguageMetadata,
  updateTripMemberRole,
  updateUserPassword,
} from './sync';
import {
  fetchOpenMeteoWeather,
  isWeatherCacheStale,
  loadCachedOrSeasonalWeather,
  type DayWeather,
} from './weather';

const BOOKING_CYCLE: BookingStatus[] = [
  'a_reserver',
  'reserve',
  'sur_place',
  'entree_libre',
];

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

interface TripBundle {
  code: string;
  state: TripState;
}

function createEmptyPlaceholderState(): TripState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    version: STATE_VERSION,
    updatedAt: DEFAULT_UPDATED_AT,
    meta: {
      title: '',
      subtitle: '',
      destination: '',
      monogramTop: '',
      monogramBottom: '',
      startDate: today,
      endDate: today,
      lat: 0,
      lng: 0,
      timezone: 'UTC',
      isLondonDefault: false,
    },
    days: [],
    steps: [],
    memories: {},
    expenses: [],
    checklist: [],
    rates: { ...DEFAULT_RATES },
    currencies: { tripCurrency: 'EUR', homeCurrency: 'EUR' },
    people: [],
    paymentMethods: [],
    practicalNotes: [],
  };
}

function loadInitialTripBundle(): TripBundle {
  const code = normalizeFamilyCode(loadFamilyCode()) || DEFAULT_LONDON_TRIP_ID;
  const loaded = loadTripStateForCode(code);
  if (loaded) {
    return { code, state: loaded };
  }
  if (code === DEFAULT_LONDON_TRIP_ID) {
    return { code, state: createDefaultState() };
  }
  return { code, state: createSkeletonTripState(code, STATE_VERSION) };
}

interface TripContextValue {
  state: TripState;
  days: TripDay[];
  trips: TripSummary[];
  authRequired: boolean;
  activeTripId: string | null;
  tripsLoading: boolean;
  hubNotice: string | null;
  clearHubNotice: () => void;
  openTrip: (tripId: string) => void;
  closeActiveTrip: () => void;
  joinTripByCode: (rawCode: string) => Promise<{ ok: boolean; error?: string }>;
  tripsModalOpen: boolean;
  setTripsModalOpen: (open: boolean) => void;
  switchTrip: (tripId: string) => void;
  createNewTrip: (
    input: CreateBlankTripInput
  ) => Promise<{ ok: boolean; tripId?: string; error?: string }>;
  updateTripMeta: (patch: Partial<TripMeta>) => void;

  lang: Language;
  langPref: LanguagePreference;
  detectedDeviceLang: Language;
  activeTab: TabId;
  selectedDayId: string;
  syncStatus: SyncStatus;
  weatherByDay: Record<string, DayWeather>;
  setLang: (lang: Language) => void;
  setLangPref: (pref: LanguagePreference) => void;
  setActiveTab: (tab: TabId) => void;
  setSelectedDayId: (dayId: string) => void;
  navigateToDay: (dayId: string, tab?: TabId) => void;

  // Option A — Accounts & Roles (admin / editor / viewer)
  authUser: AuthUser | null;
  authLoading: boolean;
  tripRole: TripAccessRole;
  tripMembers: TripMember[];
  membersSqlReady: boolean;
  canEdit: boolean;
  canManageMembers: boolean;
  canViewBudget: boolean;
  previewReadOnly: boolean;
  setPreviewReadOnly: (enabled: boolean) => void;
  setHideBudgetForViewers: (hide: boolean) => void;
  accountModalOpen: boolean;
  setAccountModalOpen: (open: boolean) => void;
  passwordRecoveryMode: boolean;
  dismissPasswordRecovery: () => void;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; needsConfirmation?: boolean; error?: string }>;
  sendMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  claimCurrentTrip: () => Promise<{ ok: boolean; error?: string }>;
  inviteMember: (email: string, role: MemberRole) => Promise<{ ok: boolean; error?: string }>;
  changeMemberRole: (memberId: string, role: MemberRole) => Promise<{ ok: boolean; error?: string }>;
  removeMember: (memberId: string) => Promise<{ ok: boolean; error?: string }>;
  refreshAccess: () => Promise<void>;

  // Planning
  toggleStepDone: (stepId: string) => void;
  cycleStepBookingStatus: (stepId: string) => void;
  setStepBookingStatus: (stepId: string, status: BookingStatus) => void;
  addStep: (step: Omit<TripStep, 'id' | 'order'>) => void;
  updateStep: (stepId: string, patch: Partial<Omit<TripStep, 'id'>>) => void;
  deleteStep: (stepId: string) => void;
  moveStepOrder: (stepId: string, direction: 'up' | 'down') => void;
  moveStepToDay: (stepId: string, targetDayId: string) => void;

  // Activities
  assignBonusActivity: (activity: BonusActivity, dayId: string, timeStart?: string) => void;

  // Carnet
  updateMemory: (dayId: string, note: string) => void;

  // Budget, Voyageurs & Moyens de paiement
  toggleExpensePaid: (expenseId: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expenseId: string, patch: Partial<Omit<Expense, 'id'>>) => void;
  deleteExpense: (expenseId: string) => void;
  updateRates: (rates: ExchangeRates) => void;
  updateCurrencies: (currencies: TripCurrencies, rate?: number) => void;
  addPerson: (name: string) => void;
  removePerson: (name: string) => void;
  addPaymentMethod: (name: string) => void;
  removePaymentMethod: (name: string) => void;

  // Practical notes
  addPracticalNote: (note: Omit<PracticalNote, 'id'>) => void;
  updatePracticalNote: (id: string, patch: Partial<Omit<PracticalNote, 'id'>>) => void;
  deletePracticalNote: (id: string) => void;

  // Infos & Sync
  toggleChecklistItem: (itemId: string) => void;
  addChecklistItem: (label: string, category: ChecklistItem['category']) => void;
  deleteChecklistItem: (itemId: string) => void;
  setFamilyCode: (code: string) => void;
  triggerManualSync: () => Promise<void>;
  refreshCurrentView: () => Promise<void>;
  exportTripJson: () => string;
  importTripJson: (raw: string) => { ok: boolean; error?: string };
  resetTripState: () => void;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const authRequired = isSupabaseConfigured();

  const [initialLocal] = useState<TripBundle | null>(() =>
    authRequired ? null : loadInitialTripBundle()
  );
  const [activeTripId, setActiveTripId] = useState<string | null>(() =>
    authRequired ? null : (initialLocal?.code ?? DEFAULT_LONDON_TRIP_ID)
  );
  const [tripBundle, setTripBundle] = useState<TripBundle>(() =>
    authRequired
      ? { code: '', state: createEmptyPlaceholderState() }
      : (initialLocal ?? loadInitialTripBundle())
  );
  const familyCode = authRequired ? (activeTripId ?? '') : tripBundle.code;
  const state = tripBundle.state;

  const days = useMemo<TripDay[]>(
    () => (state.days && state.days.length > 0 ? state.days : authRequired ? [] : TRIP_DAYS),
    [state.days, authRequired]
  );

  const [localTrips, setLocalTrips] = useState<TripSummary[]>(() => {
    if (authRequired) return [];
    const initial = loadTripsIndex();
    const hasCurrent = initial.some((t) => t.id === tripBundle.code);
    if (!hasCurrent) {
      return upsertTripSummary(buildTripSummary(tripBundle.code, tripBundle.state));
    }
    return initial;
  });
  const [catalogTrips, setCatalogTrips] = useState<TripSummary[]>([]);
  const [tripsLoading, setTripsLoading] = useState<boolean>(() => authRequired);
  const [hubNotice, setHubNotice] = useState<string | null>(null);
  const [remoteMyTrips, setRemoteMyTrips] = useState<
    { familyCode: string; role: MemberRole }[]
  >([]);
  const [tripsModalOpen, setTripsModalOpen] = useState<boolean>(false);

  const [langPref, setLangPrefState] = useState<LanguagePreference>(() =>
    loadLanguagePreference()
  );
  const [detectedDeviceLang, setDetectedDeviceLang] = useState<Language>(() =>
    detectDeviceLanguage()
  );
  const lang: Language = langPref === 'auto' ? detectedDeviceLang : langPref;

  useEffect(() => {
    const handleLanguageChange = () => {
      setDetectedDeviceLang(detectDeviceLanguage());
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const [activeTab, setActiveTab] = useState<TabId>('planning');
  const [selectedDayIdState, setSelectedDayIdState] = useState<string>(() => {
    if (authRequired) return '';
    const initialDays =
      tripBundle.state.days && tripBundle.state.days.length > 0
        ? tripBundle.state.days
        : TRIP_DAYS;
    const stored = loadSelectedDay(initialDays[0].id);
    return initialDays.some((d) => d.id === stored) ? stored : initialDays[0].id;
  });

  const selectedDayId = useMemo(() => {
    if (days.length === 0) return '';
    return days.some((d) => d.id === selectedDayIdState) ? selectedDayIdState : days[0].id;
  }, [days, selectedDayIdState]);

  useEffect(() => {
    if (selectedDayId && selectedDayId !== selectedDayIdState) {
      setSelectedDayIdState(selectedDayId);
      if (!authRequired) {
        saveSelectedDay(selectedDayId);
      }
    }
  }, [selectedDayId, selectedDayIdState, authRequired]);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => ({
    mode: authRequired ? 'supabase_ready' : 'local',
    familyCode: authRequired ? '' : tripBundle.code,
  }));

  const [weatherByDay, setWeatherByDay] = useState<Record<string, DayWeather>>(() =>
    authRequired ? {} : loadCachedOrSeasonalWeather(tripBundle.code, days, tripBundle.state.meta)
  );

  // Option A — Auth & role access state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(() => authRequired);
  const [tripRole, setTripRole] = useState<TripAccessRole>(() =>
    authRequired ? 'none' : 'unclaimed'
  );
  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [membersSqlReady, setMembersSqlReady] = useState<boolean>(true);
  const [previewReadOnly, setPreviewReadOnly] = useState<boolean>(false);
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false);
  const [passwordRecoveryMode, setPasswordRecoveryMode] = useState<boolean>(false);

  const isActualReadOnly = tripRole === 'viewer' || tripRole === 'none';
  const canEdit = !isActualReadOnly && !previewReadOnly;
  const canManageMembers = tripRole === 'admin' && !previewReadOnly;
  const canViewBudget = canEdit || !state.hideBudgetForViewers;

  const applyingRemoteRef = useRef(false);
  const pushTimeoutRef = useRef<number | null>(null);
  const bundleRef = useRef(tripBundle);
  bundleRef.current = tripBundle;
  const canEditRef = useRef(canEdit);
  canEditRef.current = canEdit;
  const authUserRef = useRef(authUser);
  authUserRef.current = authUser;
  const remoteMyTripsRef = useRef(remoteMyTrips);
  remoteMyTripsRef.current = remoteMyTrips;
  const catalogReqRef = useRef(0);

  // Keep document.title privacy-safe on Landing/Hub and contextual when a trip is open
  useEffect(() => {
    if (authRequired && (!authUser || !activeTripId)) {
      document.title = 'Carnet de Voyage';
      return;
    }
    document.title = state.meta.title ? `${state.meta.title} — Carnet de Voyage` : 'Carnet de Voyage';
  }, [authRequired, authUser, activeTripId, state.meta.title]);

  // Keep trips index synced with current active trip's metadata
  useEffect(() => {
    const roleForActive: MemberRole | undefined =
      tripRole === 'admin' || tripRole === 'editor' || tripRole === 'viewer'
        ? tripRole
        : undefined;

    if (!authRequired) {
      if (!familyCode) return;
      const summary = buildTripSummary(familyCode, state, roleForActive);
      setLocalTrips(upsertTripSummary(summary));
      return;
    }

    if (!authUser || !activeTripId || tripBundle.code !== activeTripId || !state.meta.title) {
      return;
    }
    if (!roleForActive) return;

    const summary = buildTripSummary(activeTripId, state, roleForActive);
    setCatalogTrips((prev) => {
      const idx = prev.findIndex((item) => item.id === activeTripId);
      if (idx < 0) return prev;
      const existing = prev[idx];
      if (
        existing.title === summary.title &&
        existing.subtitle === summary.subtitle &&
        existing.destination === summary.destination &&
        existing.monogramTop === summary.monogramTop &&
        existing.monogramBottom === summary.monogramBottom &&
        existing.startDate === summary.startDate &&
        existing.endDate === summary.endDate &&
        existing.role === summary.role
      ) {
        return prev;
      }
      const next = prev.map((item, i) => (i === idx ? summary : item));
      saveUserTripsIndex(authUser.id, next);
      return next;
    });
  }, [
    authRequired,
    authUser,
    activeTripId,
    tripBundle.code,
    familyCode,
    state,
    tripRole,
  ]);

  // Authorized trips list: strictly catalogTrips when authRequired, local merge otherwise
  const trips = useMemo<TripSummary[]>(() => {
    if (authRequired) {
      return catalogTrips;
    }

    const roleMap = new Map<string, MemberRole>();
    for (const r of remoteMyTrips) {
      roleMap.set(r.familyCode, r.role);
    }
    if (tripRole === 'admin' || tripRole === 'editor' || tripRole === 'viewer') {
      roleMap.set(familyCode, tripRole);
    }

    const byId = new Map<string, TripSummary>();
    for (const item of localTrips) {
      const role = roleMap.get(item.id) ?? item.role;
      byId.set(item.id, role ? { ...item, role } : item);
    }

    for (const remote of remoteMyTrips) {
      if (!byId.has(remote.familyCode)) {
        const cached = loadTripStateForCode(remote.familyCode);
        if (cached) {
          byId.set(
            remote.familyCode,
            buildTripSummary(remote.familyCode, cached, remote.role)
          );
        } else {
          const mono = buildMonogram(remote.familyCode, '');
          byId.set(remote.familyCode, {
            id: remote.familyCode,
            title: remote.familyCode,
            subtitle: remote.familyCode,
            destination: remote.familyCode,
            monogramTop: mono.top,
            monogramBottom: '··',
            startDate: '',
            endDate: '',
            role: remote.role,
          });
        }
      }
    }

    return Array.from(byId.values());
  }, [authRequired, catalogTrips, localTrips, remoteMyTrips, familyCode, tripRole]);

  // Keep budget tab inaccessible when hidden for viewers
  useEffect(() => {
    if (!canViewBudget && activeTab === 'budget') {
      setActiveTab('planning');
    }
  }, [canViewBudget, activeTab]);

  // Dynamic multi-destination Open-Meteo weather (never runs when logged out or on TripsHub)
  const dayIdsKey = useMemo(() => days.map((d) => d.id).join(','), [days]);
  const weatherLat = state.meta.lat;
  const weatherLng = state.meta.lng;
  const weatherTz = state.meta.timezone;
  const isLondonDefault = Boolean(state.meta.isLondonDefault);

  useEffect(() => {
    if ((authRequired && (!authUser || !activeTripId)) || !familyCode || days.length === 0) {
      setWeatherByDay({});
      return;
    }

    const meta = {
      lat: weatherLat,
      lng: weatherLng,
      timezone: weatherTz,
      isLondonDefault,
    };

    // Immediately show cached or seasonal (London-only) weather for this trip
    setWeatherByDay(loadCachedOrSeasonalWeather(familyCode, days, meta));

    let cancelled = false;
    let inFlight = false;
    let activeController: AbortController | null = null;

    const refreshWeather = () => {
      if (cancelled || inFlight || !isWeatherCacheStale(familyCode, days)) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

      inFlight = true;
      activeController = new AbortController();
      void fetchOpenMeteoWeather(familyCode, days, meta, activeController.signal)
        .then((next) => {
          if (!cancelled && next) {
            setWeatherByDay(next);
          }
        })
        .finally(() => {
          inFlight = false;
          activeController = null;
        });
    };

    refreshWeather();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshWeather();
      }
    };
    const handleOnline = () => refreshWeather();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);

    return () => {
      cancelled = true;
      activeController?.abort();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
    };
  }, [
    authRequired,
    authUser,
    activeTripId,
    familyCode,
    dayIdsKey,
    weatherLat,
    weatherLng,
    weatherTz,
    isLondonDefault,
  ]);

  const resetToLoggedOutState = useCallback(
    (previousUserId?: string | null) => {
      catalogReqRef.current += 1;
      if (pushTimeoutRef.current) {
        window.clearTimeout(pushTimeoutRef.current);
        pushTimeoutRef.current = null;
      }
      if (authRequired) {
        clearUserCachedTrips(previousUserId);
        setActiveTripId(null);
        setTripBundle({ code: '', state: createEmptyPlaceholderState() });
        setCatalogTrips([]);
        setRemoteMyTrips([]);
        setTripMembers([]);
        setTripRole('none');
        setTripsLoading(false);
        setPreviewReadOnly(false);
        setTripsModalOpen(false);
        setAccountModalOpen(false);
        setPasswordRecoveryMode(false);
        setHubNotice(null);
        setWeatherByDay({});
        setSyncStatus({ mode: 'supabase_ready', familyCode: '' });
      }
    },
    [authRequired]
  );

  // Subscribe to Supabase Auth session
  useEffect(() => {
    if (!authRequired) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    void getCurrentAuthUser().then((user) => {
      if (!mounted) return;
      setAuthUser(user);
      setAuthLoading(false);
    });

    const unsub = subscribeAuthState((nextUser, event) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecoveryMode(true);
      } else if (event === 'SIGNED_OUT') {
        setPasswordRecoveryMode(false);
      }
      const prevUserId = authUserRef.current?.id;
      if (!nextUser && prevUserId) {
        resetToLoggedOutState(prevUserId);
      }
      setAuthUser(nextUser);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [authRequired, resetToLoggedOutState]);

  // Keep Supabase user_metadata.lang synced with user's active language for all auth emails
  useEffect(() => {
    if (!authRequired || !authUser) return;
    void syncUserLanguageMetadata(lang);
  }, [authRequired, authUser?.id, lang]);

  const loadAuthorizedCatalog = useCallback(
    async (user: AuthUser, opts?: { silent?: boolean }) => {
      const reqId = ++catalogReqRef.current;
      if (!opts?.silent) {
        setTripsLoading(true);
      }
      try {
        const res = await fetchMyTripsCatalog(user);
        if (catalogReqRef.current !== reqId) return;

        setMembersSqlReady(res.sqlReady);
        setRemoteMyTrips(res.memberships);

        for (const [code, tripState] of Object.entries(res.statesByCode)) {
          saveUserTripState(user.id, code, tripState);
        }
        saveUserTripsIndex(user.id, res.trips);
        setCatalogTrips(res.trips);
      } catch {
        if (catalogReqRef.current !== reqId) return;
        // Offline fallback: only this user's previously cached trips (never London by default)
        const cachedList = loadUserTripsIndex(user.id);
        setCatalogTrips(cachedList);
        setRemoteMyTrips(
          cachedList
            .filter((item): item is TripSummary & { role: MemberRole } => Boolean(item.role))
            .map((item) => ({ familyCode: item.id, role: item.role }))
        );
      } finally {
        if (catalogReqRef.current === reqId) {
          setTripsLoading(false);
        }
      }
    },
    []
  );

  // Fetch authorized trip catalog when user signs in (when authRequired is true)
  useEffect(() => {
    if (!authRequired || authLoading) return;
    if (!authUser) {
      setActiveTripId(null);
      setTripBundle({ code: '', state: createEmptyPlaceholderState() });
      setCatalogTrips([]);
      setRemoteMyTrips([]);
      setTripMembers([]);
      setTripRole('none');
      setTripsLoading(false);
      setPreviewReadOnly(false);
      return;
    }
    void loadAuthorizedCatalog(authUser);
  }, [authRequired, authLoading, authUser?.id, loadAuthorizedCatalog]);

  const clearHubNotice = useCallback(() => {
    setHubNotice(null);
  }, []);

  const openTrip = useCallback(
    (rawTripId: string) => {
      const normalized = normalizeFamilyCode(rawTripId);
      if (!normalized) return;

      if (pushTimeoutRef.current) {
        window.clearTimeout(pushTimeoutRef.current);
        pushTimeoutRef.current = null;
      }

      if (!authRequired) {
        const loaded = loadTripStateForCode(normalized);
        const nextState =
          loaded ??
          (normalized === DEFAULT_LONDON_TRIP_ID
            ? createDefaultState()
            : createSkeletonTripState(normalized, STATE_VERSION));

        applyingRemoteRef.current = true;
        setTripBundle({ code: normalized, state: nextState });
        setActiveTripId(normalized);
        saveFamilyCode(normalized);
        setPreviewReadOnly(false);

        const firstDayId = nextState.days[0]?.id ?? TRIP_DAYS[0].id;
        setSelectedDayIdState(firstDayId);
        saveSelectedDay(firstDayId);

        setSyncStatus({
          mode: 'local',
          familyCode: normalized,
        });
        return;
      }

      const currentUser = authUserRef.current;
      if (!currentUser) return;

      // Strict membership check: only open trips verified in link_my_trip_memberships()
      const membership = remoteMyTripsRef.current.find(
        (m) => m.familyCode === normalized
      );
      if (!membership) return;

      const cached = loadUserTripState(currentUser.id, normalized);
      // Fallback createDefaultState() for LDN-NOEL-2026 is ONLY allowed because membership is verified above
      const nextState =
        cached ??
        (normalized === DEFAULT_LONDON_TRIP_ID
          ? createDefaultState()
          : createSkeletonTripState(normalized, STATE_VERSION));

      applyingRemoteRef.current = true;
      setTripBundle({ code: normalized, state: nextState });
      setActiveTripId(normalized);
      setTripRole(membership.role);
      setTripMembers([]);
      setPreviewReadOnly(false);
      setActiveTab('planning');
      setHubNotice(null);

      const firstDayId = nextState.days[0]?.id ?? '';
      setSelectedDayIdState(firstDayId);

      setSyncStatus({
        mode: 'supabase_ready',
        familyCode: normalized,
      });
    },
    [authRequired]
  );

  const switchTrip = useCallback(
    (rawTripId: string) => {
      openTrip(rawTripId);
    },
    [openTrip]
  );

  const closeActiveTrip = useCallback(() => {
    const hadPendingPush = pushTimeoutRef.current !== null;
    if (pushTimeoutRef.current) {
      window.clearTimeout(pushTimeoutRef.current);
      pushTimeoutRef.current = null;
    }

    if (
      authRequired &&
      hadPendingPush &&
      authUserRef.current &&
      canEditRef.current &&
      bundleRef.current.code &&
      bundleRef.current.state.updatedAt !== DEFAULT_UPDATED_AT
    ) {
      void pushRemoteState(bundleRef.current.code, bundleRef.current.state).catch(() => {
        // Ignore flush errors on navigation back to hub
      });
    }

    setPreviewReadOnly(false);
    setTripsModalOpen(false);
    setActiveTripId(null);

    if (authRequired) {
      setTripBundle({ code: '', state: createEmptyPlaceholderState() });
      setTripMembers([]);
      setTripRole('none');
      setSyncStatus({ mode: 'supabase_ready', familyCode: '' });
      if (authUserRef.current) {
        void loadAuthorizedCatalog(authUserRef.current, { silent: true });
      }
    }
  }, [authRequired, loadAuthorizedCatalog]);

  const joinTripByCode = useCallback(
    async (rawCode: string): Promise<{ ok: boolean; error?: string }> => {
      const normalized = normalizeFamilyCode(rawCode);
      if (!normalized) {
        return {
          ok: false,
          error:
            lang === 'fr'
              ? 'Veuillez saisir un code de voyage valide.'
              : 'Please enter a valid trip code.',
        };
      }

      if (!authRequired) {
        openTrip(normalized);
        return { ok: true };
      }

      const currentUser = authUserRef.current;
      if (!currentUser) {
        return {
          ok: false,
          error:
            lang === 'fr'
              ? 'Veuillez vous connecter pour rejoindre un voyage.'
              : 'Please sign in to join a trip.',
        };
      }

      try {
        const access = await resolveTripAccess(normalized, currentUser);
        setMembersSqlReady(access.sqlReady);

        // Strictly refuse unauthorized access — never load London or any trip state
        if (access.role === 'none') {
          return {
            ok: false,
            error:
              lang === 'fr'
                ? `Accès refusé pour « ${normalized} ». Ce voyage est privé — demandez à un Admin d’inviter votre adresse (${currentUser.email}).`
                : `Access denied for "${normalized}". This trip is private — ask an Admin to invite your email (${currentUser.email}).`,
          };
        }

        let grantedRole: MemberRole;
        let nextState: TripState;

        if (access.role === 'unclaimed') {
          const remote = await pullRemoteState(normalized);
          if (!remote) {
            return {
              ok: false,
              error:
                lang === 'fr'
                  ? `Aucun voyage trouvé pour le code « ${normalized} ».`
                  : `No trip found for code "${normalized}".`,
            };
          }
          const claimed = await claimTripAsAdmin(normalized);
          if (claimed !== 'admin' && claimed !== 'editor' && claimed !== 'viewer') {
            return {
              ok: false,
              error:
                lang === 'fr'
                  ? `Accès refusé pour « ${normalized} ».`
                  : `Access denied for "${normalized}".`,
            };
          }
          grantedRole = claimed;
          nextState = remote;
        } else {
          grantedRole = access.role;
          const remote = await pullRemoteState(normalized);
          const cached = loadUserTripState(currentUser.id, normalized);
          // Fallback createDefaultState() for LDN-NOEL-2026 ONLY allowed because membership is verified
          nextState =
            remote ??
            cached ??
            (normalized === DEFAULT_LONDON_TRIP_ID
              ? createDefaultState()
              : createSkeletonTripState(normalized, STATE_VERSION));
        }

        if (nextState.updatedAt !== DEFAULT_UPDATED_AT || nextState.meta.isLondonDefault) {
          saveUserTripState(currentUser.id, normalized, nextState);
        }

        const mergedMemberships = [
          ...access.myTrips.filter((m) => m.familyCode !== normalized),
          { familyCode: normalized, role: grantedRole },
        ];
        setRemoteMyTrips(mergedMemberships);

        const summary = buildTripSummary(normalized, nextState, grantedRole);
        setCatalogTrips((prev) => {
          const exists = prev.some((item) => item.id === normalized);
          const next = exists
            ? prev.map((item) => (item.id === normalized ? summary : item))
            : [...prev, summary];
          saveUserTripsIndex(currentUser.id, next);
          return next;
        });

        if (pushTimeoutRef.current) {
          window.clearTimeout(pushTimeoutRef.current);
          pushTimeoutRef.current = null;
        }

        applyingRemoteRef.current = true;
        setTripBundle({ code: normalized, state: nextState });
        setActiveTripId(normalized);
        setTripRole(grantedRole);
        setTripMembers(access.members);
        setPreviewReadOnly(false);
        setActiveTab('planning');
        setHubNotice(null);
        setSelectedDayIdState(nextState.days[0]?.id ?? '');
        setSyncStatus({
          mode: 'synced',
          familyCode: normalized,
          lastSyncedAt: new Date().toISOString(),
        });

        return { ok: true };
      } catch (err: unknown) {
        return {
          ok: false,
          error:
            err instanceof Error
              ? err.message
              : lang === 'fr'
                ? 'Impossible de vérifier ce code de voyage.'
                : 'Unable to verify this trip code.',
        };
      }
    },
    [authRequired, lang, openTrip]
  );

  const refreshAccess = useCallback(async () => {
    if (!authRequired) {
      setTripRole('unclaimed');
      setTripMembers([]);
      setRemoteMyTrips([]);
      setMembersSqlReady(true);
      return;
    }

    if (!authUser || !activeTripId) {
      return;
    }

    const code = activeTripId;
    try {
      const res = await resolveTripAccess(code, authUser);
      setMembersSqlReady(res.sqlReady);
      setRemoteMyTrips(res.myTrips);

      if (res.sqlReady && res.role === 'none') {
        // Membership revoked or unauthorized: immediately close trip and return to hub
        setActiveTripId(null);
        setTripBundle({ code: '', state: createEmptyPlaceholderState() });
        setTripRole('none');
        setTripMembers([]);
        setPreviewReadOnly(false);
        setCatalogTrips((prev) => {
          const next = prev.filter((item) => item.id !== code);
          saveUserTripsIndex(authUser.id, next);
          return next;
        });
        setHubNotice(
          lang === 'fr'
            ? `Vous n’avez plus accès au voyage « ${code} ».`
            : `You no longer have access to trip "${code}".`
        );
        return;
      }

      setTripRole(res.role);
      setTripMembers(res.members);
    } catch {
      // Keep current role state gracefully if offline
    }
  }, [authRequired, authUser, activeTripId, lang]);

  useEffect(() => {
    if (authLoading) return;
    if (authRequired && (!authUser || !activeTripId)) return;
    void refreshAccess();
  }, [authLoading, authRequired, authUser, activeTripId, refreshAccess]);

  const setLangPref = useCallback((nextPref: LanguagePreference) => {
    setLangPrefState(nextPref);
    saveLanguagePreference(nextPref);
    if (nextPref === 'auto') {
      setDetectedDeviceLang(detectDeviceLanguage());
    }
  }, []);

  const setLang = useCallback(
    (nextLang: Language) => {
      setLangPref(nextLang);
    },
    [setLangPref]
  );

  const setSelectedDayId = useCallback(
    (dayId: string) => {
      setSelectedDayIdState(dayId);
      if (!authRequired) {
        saveSelectedDay(dayId);
      }
    },
    [authRequired]
  );

  const navigateToDay = useCallback(
    (dayId: string, tab?: TabId) => {
      setSelectedDayId(dayId);
      if (tab) setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSelectedDayId]
  );

  // Persist to scoped localStorage + debounced optional Supabase push (only when active & canEdit)
  useEffect(() => {
    if (authRequired) {
      if (!authUser || !activeTripId || tripBundle.code !== activeTripId) {
        return;
      }
    }
    if (!familyCode) return;

    // Avoid saving an empty remote skeleton before it's actually populated
    const isEmptySkeleton =
      !state.meta.isLondonDefault && state.updatedAt === DEFAULT_UPDATED_AT;
    if (!isEmptySkeleton) {
      if (authRequired && authUser) {
        saveUserTripState(authUser.id, familyCode, state);
      } else if (!authRequired) {
        saveTripStateForCode(familyCode, state);
      }
    }

    if (
      !authRequired ||
      !authUser ||
      !activeTripId ||
      !canEditRef.current ||
      applyingRemoteRef.current ||
      state.updatedAt === DEFAULT_UPDATED_AT
    ) {
      applyingRemoteRef.current = false;
      return;
    }

    if (pushTimeoutRef.current) {
      window.clearTimeout(pushTimeoutRef.current);
    }

    const codeToPush = familyCode;
    pushTimeoutRef.current = window.setTimeout(() => {
      pushTimeoutRef.current = null;
      if (!canEditRef.current || bundleRef.current.code !== codeToPush) return;
      setSyncStatus((prev) => ({ ...prev, mode: 'syncing', errorMessage: undefined }));
      pushRemoteState(codeToPush, bundleRef.current.state)
        .then(() => {
          if (bundleRef.current.code !== codeToPush) return;
          setSyncStatus({
            mode: 'synced',
            familyCode: codeToPush,
            lastSyncedAt: new Date().toISOString(),
          });
        })
        .catch((err: unknown) => {
          if (bundleRef.current.code !== codeToPush) return;
          setSyncStatus({
            mode: 'error',
            familyCode: codeToPush,
            errorMessage: err instanceof Error ? err.message : 'Erreur de synchronisation',
          });
        });
    }, 800);

    return () => {
      if (pushTimeoutRef.current) {
        window.clearTimeout(pushTimeoutRef.current);
        pushTimeoutRef.current = null;
      }
    };
  }, [authRequired, authUser, activeTripId, tripBundle.code, state, familyCode]);

  // Subscribe to Supabase Realtime for active trip ONLY when authenticated & activeTripId is set
  useEffect(() => {
    if (!authRequired) {
      setSyncStatus({ mode: 'local', familyCode });
      return;
    }

    if (!authUser || !activeTripId || !familyCode || tripRole === 'none') {
      return;
    }

    let cancelled = false;
    const subscribedCode = activeTripId;
    const subscribedUserId = authUser.id;
    setSyncStatus((prev) => ({
      ...prev,
      mode: 'syncing',
      familyCode: subscribedCode,
      errorMessage: undefined,
    }));

    const syncFromRemote = () => {
      pullRemoteState(subscribedCode)
        .then(async (remote) => {
          if (cancelled || bundleRef.current.code !== subscribedCode) return;
          if (remote && remote.updatedAt > bundleRef.current.state.updatedAt) {
            applyingRemoteRef.current = true;
            saveUserTripState(subscribedUserId, subscribedCode, remote);
            setTripBundle({ code: subscribedCode, state: remote });
          } else if (
            !remote &&
            canEditRef.current &&
            bundleRef.current.state.updatedAt !== DEFAULT_UPDATED_AT
          ) {
            await pushRemoteState(subscribedCode, bundleRef.current.state);
          }
          if (cancelled || bundleRef.current.code !== subscribedCode) return;
          setSyncStatus({
            mode: 'synced',
            familyCode: subscribedCode,
            lastSyncedAt: new Date().toISOString(),
          });
        })
        .catch((err: unknown) => {
          if (cancelled || bundleRef.current.code !== subscribedCode) return;
          setSyncStatus({
            mode: 'error',
            familyCode: subscribedCode,
            errorMessage:
              err instanceof Error ? err.message : 'Connexion Supabase indisponible',
          });
        });
    };

    syncFromRemote();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromRemote();
      }
    };
    const handleOnline = () => syncFromRemote();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);

    const unsubscribe = subscribeToFamilySync(subscribedCode, (remote) => {
      if (cancelled || bundleRef.current.code !== subscribedCode) return;
      if (remote.updatedAt > bundleRef.current.state.updatedAt) {
        applyingRemoteRef.current = true;
        saveUserTripState(subscribedUserId, subscribedCode, remote);
        setTripBundle({ code: subscribedCode, state: remote });
        setSyncStatus({
          mode: 'synced',
          familyCode: subscribedCode,
          lastSyncedAt: new Date().toISOString(),
        });
      }
    });

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
      unsubscribe();
    };
  }, [authRequired, authUser?.id, activeTripId, familyCode, tripRole]);

  const mutate = useCallback((updater: (prev: TripState) => TripState) => {
    if (!canEditRef.current) return;
    setTripBundle((prev) => {
      if (!prev.code) return prev;
      const nextState = updater(prev.state);
      return {
        code: prev.code,
        state: {
          ...nextState,
          version: STATE_VERSION,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const createNewTrip = useCallback(
    async (
      input: CreateBlankTripInput
    ): Promise<{ ok: boolean; tripId?: string; error?: string }> => {
      try {
        if (authRequired && !authUser) {
          return {
            ok: false,
            error:
              lang === 'fr'
                ? 'Veuillez vous connecter pour créer un voyage.'
                : 'Please sign in to create a trip.',
          };
        }

        const newTripId = generateTripCode(input.destination, input.startDate);
        const newState = createBlankTripState(input, STATE_VERSION);

        if (pushTimeoutRef.current) {
          window.clearTimeout(pushTimeoutRef.current);
          pushTimeoutRef.current = null;
        }

        if (authRequired && authUser) {
          let grantedRole: MemberRole = 'admin';
          try {
            const role = await claimTripAsAdmin(newTripId);
            if (role === 'admin' || role === 'editor' || role === 'viewer') {
              grantedRole = role;
            }
            await pushRemoteState(newTripId, newState);
          } catch {
            // Keep newly created trip working offline locally in user-scoped cache
          }

          saveUserTripState(authUser.id, newTripId, newState);
          const summary = buildTripSummary(newTripId, newState, grantedRole);

          setRemoteMyTrips((prev) => [
            ...prev.filter((m) => m.familyCode !== newTripId),
            { familyCode: newTripId, role: grantedRole },
          ]);
          setCatalogTrips((prev) => {
            const next = [...prev.filter((item) => item.id !== newTripId), summary];
            saveUserTripsIndex(authUser.id, next);
            return next;
          });

          applyingRemoteRef.current = true;
          setTripBundle({ code: newTripId, state: newState });
          setActiveTripId(newTripId);
          setTripRole(grantedRole);
          setPreviewReadOnly(false);
          setActiveTab('planning');
          setHubNotice(null);

          const firstDayId = newState.days[0]?.id ?? input.startDate;
          setSelectedDayIdState(firstDayId);
          setSyncStatus({
            mode: 'synced',
            familyCode: newTripId,
            lastSyncedAt: new Date().toISOString(),
          });

          return { ok: true, tripId: newTripId };
        }

        // Local mode (!authRequired)
        saveTripStateForCode(newTripId, newState);
        const summary = buildTripSummary(newTripId, newState, undefined);
        setLocalTrips(upsertTripSummary(summary));

        applyingRemoteRef.current = true;
        setTripBundle({ code: newTripId, state: newState });
        setActiveTripId(newTripId);
        saveFamilyCode(newTripId);
        setPreviewReadOnly(false);

        const firstDayId = newState.days[0]?.id ?? input.startDate;
        setSelectedDayIdState(firstDayId);
        saveSelectedDay(firstDayId);

        return { ok: true, tripId: newTripId };
      } catch (err: unknown) {
        return {
          ok: false,
          error:
            err instanceof Error
              ? err.message
              : 'Impossible de créer le voyage.',
        };
      }
    },
    [authRequired, authUser, lang]
  );

  const updateTripMeta = useCallback(
    (patch: Partial<TripMeta>) => {
      mutate((prev) => {
        const nextDestination = patch.destination ?? prev.meta.destination;
        const monogramPatch =
          patch.destination &&
          patch.destination !== prev.meta.destination &&
          !patch.monogramTop &&
          !prev.meta.isLondonDefault
            ? (() => {
                const m = buildMonogram(nextDestination, prev.meta.startDate);
                return { monogramTop: m.top, monogramBottom: m.bottom };
              })()
            : {};

        return {
          ...prev,
          meta: {
            ...prev.meta,
            ...monogramPatch,
            ...patch,
          },
        };
      });
    },
    [mutate]
  );

  const setHideBudgetForViewers = useCallback(
    (hide: boolean) => {
      mutate((prev) => ({ ...prev, hideBudgetForViewers: hide }));
    },
    [mutate]
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await signInWithPassword(email, password);
    if (res.error) return { ok: false, error: res.error };
    setAuthUser(res.user);
    return { ok: true };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string) => {
      const res = await signUpWithPassword(email, password, lang);
      if (res.error) return { ok: false, error: res.error };
      if (res.user && !res.needsConfirmation) {
        setAuthUser(res.user);
      }
      return { ok: true, needsConfirmation: res.needsConfirmation };
    },
    [lang]
  );

  const sendMagicLink = useCallback(
    async (email: string) => {
      return signInWithMagicLink(email, lang);
    },
    [lang]
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    return sendPasswordResetEmail(email);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const res = await updateUserPassword(newPassword);
    if (res.ok) {
      setPasswordRecoveryMode(false);
    }
    return res;
  }, []);

  const dismissPasswordRecovery = useCallback(() => {
    setPasswordRecoveryMode(false);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    return signInWithGoogleOAuth();
  }, []);

  const signOut = useCallback(async () => {
    const prevUserId = authUserRef.current?.id;
    resetToLoggedOutState(prevUserId);
    setAuthUser(null);
    await signOutAuth();
  }, [resetToLoggedOutState]);

  const claimCurrentTrip = useCallback(async () => {
    try {
      const code = bundleRef.current.code;
      const role = await claimTripAsAdmin(code);
      await refreshAccess();
      if (
        (role === 'admin' || role === 'editor') &&
        bundleRef.current.state.updatedAt !== DEFAULT_UPDATED_AT
      ) {
        await pushRemoteState(code, bundleRef.current.state);
      }
      return { ok: true };
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Erreur lors de la protection',
      };
    }
  }, [refreshAccess]);

  const inviteMember = useCallback(
    async (email: string, role: MemberRole) => {
      try {
        await inviteOrUpdateMember(bundleRef.current.code, email, role);
        await refreshAccess();
        return { ok: true };
      } catch (err: unknown) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Erreur lors de l’invitation',
        };
      }
    },
    [refreshAccess]
  );

  const changeMemberRole = useCallback(
    async (memberId: string, role: MemberRole) => {
      try {
        await updateTripMemberRole(memberId, role);
        await refreshAccess();
        return { ok: true };
      } catch (err: unknown) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour',
        };
      }
    },
    [refreshAccess]
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      try {
        await deleteTripMember(memberId);
        await refreshAccess();
        return { ok: true };
      } catch (err: unknown) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Erreur lors de la suppression',
        };
      }
    },
    [refreshAccess]
  );

  const toggleStepDone = useCallback(
    (stepId: string) => {
      mutate((prev) => ({
        ...prev,
        steps: prev.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
      }));
    },
    [mutate]
  );

  const cycleStepBookingStatus = useCallback(
    (stepId: string) => {
      mutate((prev) => ({
        ...prev,
        steps: prev.steps.map((s) => {
          if (s.id !== stepId) return s;
          const idx = BOOKING_CYCLE.indexOf(s.bookingStatus);
          const nextStatus = BOOKING_CYCLE[(idx + 1) % BOOKING_CYCLE.length];
          return { ...s, bookingStatus: nextStatus };
        }),
      }));
    },
    [mutate]
  );

  const setStepBookingStatus = useCallback(
    (stepId: string, status: BookingStatus) => {
      mutate((prev) => ({
        ...prev,
        steps: prev.steps.map((s) => (s.id === stepId ? { ...s, bookingStatus: status } : s)),
      }));
    },
    [mutate]
  );

  const addStep = useCallback(
    (stepInput: Omit<TripStep, 'id' | 'order'>) => {
      mutate((prev) => {
        const daySteps = prev.steps.filter((s) => s.dayId === stepInput.dayId);
        const maxOrder = daySteps.reduce((max, s) => Math.max(max, s.order), 0);
        const newStepId = generateId('step');
        const newStep: TripStep = {
          ...stepInput,
          id: newStepId,
          order: maxOrder + 1,
        };

        const nextExpenses = [...prev.expenses];
        if (typeof newStep.costGbp === 'number' && newStep.costGbp > 0) {
          const linkedCategory: ExpenseCategory =
            newStep.kind === 'transport'
              ? 'transports'
              : newStep.kind === 'repas'
                ? 'repas'
                : 'activites';
          nextExpenses.push({
            id: generateId('exp'),
            dayId: newStep.dayId,
            title: newStep.title,
            category: linkedCategory,
            amountGbp: newStep.costGbp,
            paid: newStep.bookingStatus === 'reserve',
            note: newStep.costNote || 'Ajouté depuis le Planning',
            linkedStepId: newStepId,
            isTowerHamletsBenefit: newStep.isTowerHamletsBenefit,
            savedGbp:
              newStep.fullPriceGbp && newStep.fullPriceGbp > newStep.costGbp
                ? newStep.fullPriceGbp - newStep.costGbp
                : undefined,
          });
        }

        return {
          ...prev,
          steps: [...prev.steps, newStep],
          expenses: nextExpenses,
        };
      });
    },
    [mutate]
  );

  const updateStep = useCallback(
    (stepId: string, patch: Partial<Omit<TripStep, 'id'>>) => {
      mutate((prev) => {
        const existing = prev.steps.find((s) => s.id === stepId);
        if (!existing) return prev;
        const updatedStep: TripStep = { ...existing, ...patch };
        const linkedCategory: ExpenseCategory =
          updatedStep.kind === 'transport'
            ? 'transports'
            : updatedStep.kind === 'repas'
              ? 'repas'
              : 'activites';

        const nextSteps = prev.steps.map((s) => (s.id === stepId ? updatedStep : s));
        let nextExpenses = prev.expenses.map((exp) => {
          if (exp.linkedStepId !== stepId) return exp;
          return {
            ...exp,
            dayId: updatedStep.dayId,
            title: updatedStep.title,
            category: linkedCategory,
            amountGbp:
              typeof updatedStep.costGbp === 'number' ? updatedStep.costGbp : exp.amountGbp,
            note: updatedStep.costNote ?? exp.note,
          };
        });

        const hasLinked = nextExpenses.some((e) => e.linkedStepId === stepId);
        if (!hasLinked && typeof updatedStep.costGbp === 'number' && updatedStep.costGbp > 0) {
          nextExpenses = [
            ...nextExpenses,
            {
              id: generateId('exp'),
              dayId: updatedStep.dayId,
              title: updatedStep.title,
              category: linkedCategory,
              amountGbp: updatedStep.costGbp,
              paid: updatedStep.bookingStatus === 'reserve',
              note: updatedStep.costNote || 'Lié au Planning',
              linkedStepId: stepId,
            },
          ];
        } else if (
          hasLinked &&
          typeof updatedStep.costGbp === 'number' &&
          updatedStep.costGbp <= 0
        ) {
          nextExpenses = nextExpenses.filter((e) => e.linkedStepId !== stepId);
        }

        return {
          ...prev,
          steps: nextSteps,
          expenses: nextExpenses,
        };
      });
    },
    [mutate]
  );

  const deleteStep = useCallback(
    (stepId: string) => {
      mutate((prev) => ({
        ...prev,
        steps: prev.steps.filter((s) => s.id !== stepId),
        expenses: prev.expenses.filter((e) => e.linkedStepId !== stepId),
      }));
    },
    [mutate]
  );

  const moveStepOrder = useCallback(
    (stepId: string, direction: 'up' | 'down') => {
      mutate((prev) => {
        const target = prev.steps.find((s) => s.id === stepId);
        if (!target) return prev;

        const sameDay = prev.steps
          .filter((s) => s.dayId === target.dayId)
          .sort((a, b) => a.order - b.order);

        const idx = sameDay.findIndex((s) => s.id === stepId);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (idx < 0 || swapIdx < 0 || swapIdx >= sameDay.length) return prev;

        const reordered = [...sameDay];
        const [moved] = reordered.splice(idx, 1);
        reordered.splice(swapIdx, 0, moved);

        const orderMap = new Map<string, number>();
        reordered.forEach((step, i) => orderMap.set(step.id, i + 1));

        return {
          ...prev,
          steps: prev.steps.map((s) =>
            orderMap.has(s.id) ? { ...s, order: orderMap.get(s.id)! } : s
          ),
        };
      });
    },
    [mutate]
  );

  const moveStepToDay = useCallback(
    (stepId: string, targetDayId: string) => {
      mutate((prev) => {
        const target = prev.steps.find((s) => s.id === stepId);
        if (!target || target.dayId === targetDayId) return prev;

        const targetDaySteps = prev.steps.filter((s) => s.dayId === targetDayId);
        const maxOrder = targetDaySteps.reduce((max, s) => Math.max(max, s.order), 0);

        return {
          ...prev,
          steps: prev.steps.map((s) =>
            s.id === stepId ? { ...s, dayId: targetDayId, order: maxOrder + 1 } : s
          ),
          expenses: prev.expenses.map((e) =>
            e.linkedStepId === stepId ? { ...e, dayId: targetDayId } : e
          ),
        };
      });
    },
    [mutate]
  );

  const assignBonusActivity = useCallback(
    (activity: BonusActivity, dayId: string, timeStart?: string) => {
      addStep({
        dayId,
        timeStart: timeStart || activity.suggestedTime,
        title: activity.title,
        location: activity.neighborhood,
        transport: activity.transport,
        description: activity.description,
        ayaRating: activity.ayaRating,
        ayaNote: activity.ayaNote,
        adamRating: activity.adamRating,
        adamNote: activity.adamNote,
        bookingStatus: activity.bookingStatus,
        done: false,
        costGbp: activity.costGbp,
        costNote: activity.costLabel,
        tags: activity.tags,
        bonusActivityId: activity.id,
      });
    },
    [addStep]
  );

  const updateMemory = useCallback(
    (dayId: string, note: string) => {
      mutate((prev) => ({
        ...prev,
        memories: {
          ...prev.memories,
          [dayId]: {
            dayId,
            note,
            updatedAt: new Date().toISOString(),
          },
        },
      }));
    },
    [mutate]
  );

  const toggleExpensePaid = useCallback(
    (expenseId: string) => {
      mutate((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === expenseId ? { ...e, paid: !e.paid } : e)),
      }));
    },
    [mutate]
  );

  const addExpense = useCallback(
    (expense: Omit<Expense, 'id'>) => {
      mutate((prev) => ({
        ...prev,
        expenses: [...prev.expenses, { ...expense, id: generateId('exp') }],
      }));
    },
    [mutate]
  );

  const updateExpense = useCallback(
    (expenseId: string, patch: Partial<Omit<Expense, 'id'>>) => {
      mutate((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === expenseId ? { ...e, ...patch } : e)),
      }));
    },
    [mutate]
  );

  const deleteExpense = useCallback(
    (expenseId: string) => {
      mutate((prev) => ({
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== expenseId),
      }));
    },
    [mutate]
  );

  const updateRates = useCallback(
    (rates: ExchangeRates) => {
      mutate((prev) => ({
        ...prev,
        rates: {
          madPerGbp: Math.max(0.0001, rates.madPerGbp),
          eurPerGbp: Math.max(0.0001, rates.eurPerGbp),
        },
      }));
    },
    [mutate]
  );

  const updateCurrencies = useCallback(
    (currencies: TripCurrencies, rate?: number) => {
      mutate((prev) => ({
        ...prev,
        currencies: {
          tripCurrency: currencies.tripCurrency,
          homeCurrency: currencies.homeCurrency,
        },
        rates:
          typeof rate === 'number' && !Number.isNaN(rate) && rate > 0
            ? {
                ...prev.rates,
                madPerGbp: Math.max(0.0001, rate),
              }
            : prev.rates,
      }));
    },
    [mutate]
  );

  const addPerson = useCallback(
    (rawName: string) => {
      const name = rawName.trim();
      if (!name) return;
      mutate((prev) => {
        if (prev.people.some((p) => p.toLowerCase() === name.toLowerCase())) {
          return prev;
        }
        return {
          ...prev,
          people: [...prev.people, name],
        };
      });
    },
    [mutate]
  );

  const removePerson = useCallback(
    (name: string) => {
      mutate((prev) => ({
        ...prev,
        people: prev.people.filter((p) => p !== name),
        expenses: prev.expenses.map((e) =>
          e.person === name ? { ...e, person: undefined } : e
        ),
      }));
    },
    [mutate]
  );

  const addPaymentMethod = useCallback(
    (rawName: string) => {
      const name = rawName.trim();
      if (!name) return;
      mutate((prev) => {
        if (prev.paymentMethods.some((m) => m.toLowerCase() === name.toLowerCase())) {
          return prev;
        }
        return {
          ...prev,
          paymentMethods: [...prev.paymentMethods, name],
        };
      });
    },
    [mutate]
  );

  const removePaymentMethod = useCallback(
    (name: string) => {
      mutate((prev) => ({
        ...prev,
        paymentMethods: prev.paymentMethods.filter((m) => m !== name),
        expenses: prev.expenses.map((e) =>
          e.paymentMethod === name ? { ...e, paymentMethod: undefined } : e
        ),
      }));
    },
    [mutate]
  );

  const addPracticalNote = useCallback(
    (note: Omit<PracticalNote, 'id'>) => {
      const title = note.title.trim();
      const content = note.content.trim();
      if (!title && !content) return;
      mutate((prev) => ({
        ...prev,
        practicalNotes: [
          ...prev.practicalNotes,
          {
            id: generateId('note'),
            title: title || 'Note',
            content,
            ...(note.mapsQuery?.trim() ? { mapsQuery: note.mapsQuery.trim() } : {}),
          },
        ],
      }));
    },
    [mutate]
  );

  const updatePracticalNote = useCallback(
    (id: string, patch: Partial<Omit<PracticalNote, 'id'>>) => {
      mutate((prev) => ({
        ...prev,
        practicalNotes: prev.practicalNotes.map((n) =>
          n.id === id ? { ...n, ...patch } : n
        ),
      }));
    },
    [mutate]
  );

  const deletePracticalNote = useCallback(
    (id: string) => {
      mutate((prev) => ({
        ...prev,
        practicalNotes: prev.practicalNotes.filter((n) => n.id !== id),
      }));
    },
    [mutate]
  );

  const toggleChecklistItem = useCallback(
    (itemId: string) => {
      mutate((prev) => ({
        ...prev,
        checklist: prev.checklist.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ),
      }));
    },
    [mutate]
  );

  const addChecklistItem = useCallback(
    (label: string, category: ChecklistItem['category']) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      mutate((prev) => ({
        ...prev,
        checklist: [
          ...prev.checklist,
          { id: generateId('chk'), label: trimmed, category, checked: false },
        ],
      }));
    },
    [mutate]
  );

  const deleteChecklistItem = useCallback(
    (itemId: string) => {
      mutate((prev) => ({
        ...prev,
        checklist: prev.checklist.filter((item) => item.id !== itemId),
      }));
    },
    [mutate]
  );

  const setFamilyCode = useCallback(
    (rawCode: string) => {
      switchTrip(rawCode);
    },
    [switchTrip]
  );

  const triggerManualSync = useCallback(async () => {
    const code = bundleRef.current.code;
    if (!authRequired) {
      setSyncStatus({ mode: 'local', familyCode: code });
      return;
    }
    const currentUser = authUserRef.current;
    if (!currentUser || !code) {
      return;
    }

    setSyncStatus({ mode: 'syncing', familyCode: code });
    try {
      await refreshAccess();
      const remote = await pullRemoteState(code);
      if (remote && remote.updatedAt > bundleRef.current.state.updatedAt) {
        applyingRemoteRef.current = true;
        saveUserTripState(currentUser.id, code, remote);
        setTripBundle({ code, state: remote });
      } else if (canEditRef.current) {
        await pushRemoteState(code, bundleRef.current.state);
      }
      setSyncStatus({
        mode: 'synced',
        familyCode: code,
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      setSyncStatus({
        mode: 'error',
        familyCode: code,
        errorMessage: err instanceof Error ? err.message : 'Erreur de synchronisation',
      });
    }
  }, [authRequired, refreshAccess]);

  const refreshCurrentView = useCallback(async () => {
    const currentUser = authUserRef.current;
    if (authRequired && currentUser && !activeTripId) {
      await loadAuthorizedCatalog(currentUser, { silent: true });
      return;
    }

    const code = bundleRef.current.code;
    const currentState = bundleRef.current.state;
    const tasks: Promise<unknown>[] = [triggerManualSync()];

    if (
      code &&
      days.length > 0 &&
      typeof navigator !== 'undefined' &&
      navigator.onLine !== false
    ) {
      const meta = {
        lat: currentState.meta.lat,
        lng: currentState.meta.lng,
        timezone: currentState.meta.timezone,
        isLondonDefault: Boolean(currentState.meta.isLondonDefault),
      };
      tasks.push(
        fetchOpenMeteoWeather(code, days, meta)
          .then((next) => {
            if (next && bundleRef.current.code === code) {
              setWeatherByDay(next);
            }
          })
          .catch(() => undefined)
      );
    }

    await Promise.all(tasks);
  }, [authRequired, activeTripId, days, loadAuthorizedCatalog, triggerManualSync]);

  const exportTripJson = useCallback(() => {
    return JSON.stringify(bundleRef.current.state, null, 2);
  }, []);

  const importTripJson = useCallback((raw: string): { ok: boolean; error?: string } => {
    if (!canEditRef.current) {
      return { ok: false, error: 'Mode lecture seule actif.' };
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isValidTripState(parsed)) {
        return {
          ok: false,
          error: 'Le fichier JSON ne correspond pas au format de voyage attendu.',
        };
      }
      const code = bundleRef.current.code;
      const migrated = migrateTripState(parsed, code);
      setTripBundle({
        code,
        state: {
          ...migrated,
          version: STATE_VERSION,
          updatedAt: new Date().toISOString(),
        },
      });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Fichier JSON illisible ou invalide.' };
    }
  }, []);

  const resetTripState = useCallback(() => {
    if (!canEditRef.current) return;
    const code = bundleRef.current.code;
    const current = bundleRef.current.state;
    const fresh: TripState = current.meta.isLondonDefault
      ? createDefaultState()
      : {
          ...current,
          version: STATE_VERSION,
          updatedAt: new Date().toISOString(),
          steps: [],
          memories: {},
          expenses: [],
        };
    setTripBundle({ code, state: fresh });
    if (authRequired && authUserRef.current) {
      saveUserTripState(authUserRef.current.id, code, fresh);
    } else if (!authRequired) {
      saveTripStateForCode(code, fresh);
    }
  }, [authRequired]);

  const value = useMemo<TripContextValue>(
    () => ({
      state,
      days,
      trips,
      authRequired,
      activeTripId,
      tripsLoading,
      hubNotice,
      clearHubNotice,
      openTrip,
      closeActiveTrip,
      joinTripByCode,
      tripsModalOpen,
      setTripsModalOpen,
      switchTrip,
      createNewTrip,
      updateTripMeta,
      lang,
      langPref,
      detectedDeviceLang,
      activeTab,
      selectedDayId,
      syncStatus,
      weatherByDay,
      setLang,
      setLangPref,
      setActiveTab,
      setSelectedDayId,
      navigateToDay,
      authUser,
      authLoading,
      tripRole,
      tripMembers,
      membersSqlReady,
      canEdit,
      canManageMembers,
      canViewBudget,
      previewReadOnly,
      setPreviewReadOnly,
      setHideBudgetForViewers,
      accountModalOpen,
      setAccountModalOpen,
      passwordRecoveryMode,
      dismissPasswordRecovery,
      signIn,
      signUp,
      sendMagicLink,
      sendPasswordReset,
      updatePassword,
      signInWithGoogle,
      signOut,
      claimCurrentTrip,
      inviteMember,
      changeMemberRole,
      removeMember,
      refreshAccess,
      toggleStepDone,
      cycleStepBookingStatus,
      setStepBookingStatus,
      addStep,
      updateStep,
      deleteStep,
      moveStepOrder,
      moveStepToDay,
      assignBonusActivity,
      updateMemory,
      toggleExpensePaid,
      addExpense,
      updateExpense,
      deleteExpense,
      updateRates,
      updateCurrencies,
      addPerson,
      removePerson,
      addPaymentMethod,
      removePaymentMethod,
      addPracticalNote,
      updatePracticalNote,
      deletePracticalNote,
      toggleChecklistItem,
      addChecklistItem,
      deleteChecklistItem,
      setFamilyCode,
      triggerManualSync,
      refreshCurrentView,
      exportTripJson,
      importTripJson,
      resetTripState,
    }),
    [
      state,
      days,
      trips,
      authRequired,
      activeTripId,
      tripsLoading,
      hubNotice,
      clearHubNotice,
      openTrip,
      closeActiveTrip,
      joinTripByCode,
      tripsModalOpen,
      switchTrip,
      createNewTrip,
      updateTripMeta,
      lang,
      langPref,
      detectedDeviceLang,
      activeTab,
      selectedDayId,
      syncStatus,
      weatherByDay,
      setLang,
      setLangPref,
      setSelectedDayId,
      navigateToDay,
      authUser,
      authLoading,
      tripRole,
      tripMembers,
      membersSqlReady,
      canEdit,
      canManageMembers,
      canViewBudget,
      previewReadOnly,
      setHideBudgetForViewers,
      accountModalOpen,
      passwordRecoveryMode,
      dismissPasswordRecovery,
      signIn,
      signUp,
      sendMagicLink,
      sendPasswordReset,
      updatePassword,
      signInWithGoogle,
      signOut,
      claimCurrentTrip,
      inviteMember,
      changeMemberRole,
      removeMember,
      refreshAccess,
      toggleStepDone,
      cycleStepBookingStatus,
      setStepBookingStatus,
      addStep,
      updateStep,
      deleteStep,
      moveStepOrder,
      moveStepToDay,
      assignBonusActivity,
      updateMemory,
      toggleExpensePaid,
      addExpense,
      updateExpense,
      deleteExpense,
      updateRates,
      updateCurrencies,
      addPerson,
      removePerson,
      addPaymentMethod,
      removePaymentMethod,
      addPracticalNote,
      updatePracticalNote,
      deletePracticalNote,
      toggleChecklistItem,
      addChecklistItem,
      deleteChecklistItem,
      setFamilyCode,
      triggerManualSync,
      refreshCurrentView,
      exportTripJson,
      importTripJson,
      resetTripState,
    ]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return ctx;
}
