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
  Language,
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
  createDefaultState,
  DEFAULT_UPDATED_AT,
  isValidTripState,
  loadFamilyCode,
  loadLanguage,
  loadSelectedDay,
  loadTripsIndex,
  loadTripStateForCode,
  migrateTripState,
  saveFamilyCode,
  saveLanguage,
  saveSelectedDay,
  saveTripStateForCode,
  STATE_VERSION,
  upsertTripSummary,
} from './storage';
import {
  claimTripAsAdmin,
  deleteTripMember,
  getCurrentAuthUser,
  inviteOrUpdateMember,
  isSupabaseConfigured,
  normalizeFamilyCode,
  pullRemoteState,
  pushRemoteState,
  resolveTripAccess,
  signInWithGoogleOAuth,
  signInWithMagicLink,
  signInWithPassword,
  signOutAuth,
  signUpWithPassword,
  subscribeAuthState,
  subscribeToFamilySync,
  updateTripMemberRole,
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
  tripsModalOpen: boolean;
  setTripsModalOpen: (open: boolean) => void;
  switchTrip: (tripId: string) => void;
  createNewTrip: (
    input: CreateBlankTripInput
  ) => Promise<{ ok: boolean; tripId?: string; error?: string }>;
  updateTripMeta: (patch: Partial<TripMeta>) => void;

  lang: Language;
  activeTab: TabId;
  selectedDayId: string;
  syncStatus: SyncStatus;
  weatherByDay: Record<string, DayWeather>;
  setLang: (lang: Language) => void;
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
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; needsConfirmation?: boolean; error?: string }>;
  sendMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
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
  exportTripJson: () => string;
  importTripJson: (raw: string) => { ok: boolean; error?: string };
  resetTripState: () => void;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [tripBundle, setTripBundle] = useState<TripBundle>(() => loadInitialTripBundle());
  const familyCode = tripBundle.code;
  const state = tripBundle.state;

  const days = useMemo<TripDay[]>(
    () => (state.days && state.days.length > 0 ? state.days : TRIP_DAYS),
    [state.days]
  );

  const [localTrips, setLocalTrips] = useState<TripSummary[]>(() => {
    const initial = loadTripsIndex();
    const hasCurrent = initial.some((t) => t.id === tripBundle.code);
    if (!hasCurrent) {
      return upsertTripSummary(buildTripSummary(tripBundle.code, tripBundle.state));
    }
    return initial;
  });
  const [remoteMyTrips, setRemoteMyTrips] = useState<
    { familyCode: string; role: MemberRole }[]
  >([]);
  const [tripsModalOpen, setTripsModalOpen] = useState<boolean>(false);

  const [lang, setLangState] = useState<Language>(() => loadLanguage());
  const [activeTab, setActiveTab] = useState<TabId>('planning');
  const [selectedDayIdState, setSelectedDayIdState] = useState<string>(() => {
    const initialDays =
      tripBundle.state.days && tripBundle.state.days.length > 0
        ? tripBundle.state.days
        : TRIP_DAYS;
    const stored = loadSelectedDay(initialDays[0].id);
    return initialDays.some((d) => d.id === stored) ? stored : initialDays[0].id;
  });

  const selectedDayId = useMemo(
    () => (days.some((d) => d.id === selectedDayIdState) ? selectedDayIdState : days[0].id),
    [days, selectedDayIdState]
  );

  useEffect(() => {
    if (selectedDayId !== selectedDayIdState) {
      setSelectedDayIdState(selectedDayId);
      saveSelectedDay(selectedDayId);
    }
  }, [selectedDayId, selectedDayIdState]);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => ({
    mode: isSupabaseConfigured() ? 'supabase_ready' : 'local',
    familyCode: tripBundle.code,
  }));

  const [weatherByDay, setWeatherByDay] = useState<Record<string, DayWeather>>(() =>
    loadCachedOrSeasonalWeather(tripBundle.code, days, tripBundle.state.meta)
  );

  // Option A — Auth & role access state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(() => isSupabaseConfigured());
  const [tripRole, setTripRole] = useState<TripAccessRole>('unclaimed');
  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [membersSqlReady, setMembersSqlReady] = useState<boolean>(true);
  const [previewReadOnly, setPreviewReadOnly] = useState<boolean>(false);
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false);

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

  // Keep trips index synced with current active trip's metadata
  useEffect(() => {
    const roleForActive: MemberRole | undefined =
      tripRole === 'admin' || tripRole === 'editor' || tripRole === 'viewer'
        ? tripRole
        : undefined;
    const summary = buildTripSummary(familyCode, state, roleForActive);
    setLocalTrips(upsertTripSummary(summary));
  }, [
    familyCode,
    state.meta.title,
    state.meta.subtitle,
    state.meta.destination,
    state.meta.monogramTop,
    state.meta.monogramBottom,
    state.meta.startDate,
    state.meta.endDate,
    tripRole,
  ]);

  // Merge local trips index with remote memberships from Supabase
  const trips = useMemo<TripSummary[]>(() => {
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
  }, [localTrips, remoteMyTrips, familyCode, tripRole]);

  // Keep budget tab inaccessible when hidden for viewers
  useEffect(() => {
    if (!canViewBudget && activeTab === 'budget') {
      setActiveTab('planning');
    }
  }, [canViewBudget, activeTab]);

  // Dynamic multi-destination Open-Meteo weather
  const dayIdsKey = useMemo(() => days.map((d) => d.id).join(','), [days]);
  const weatherLat = state.meta.lat;
  const weatherLng = state.meta.lng;
  const weatherTz = state.meta.timezone;
  const isLondonDefault = Boolean(state.meta.isLondonDefault);

  useEffect(() => {
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
  }, [familyCode, dayIdsKey, weatherLat, weatherLng, weatherTz, isLondonDefault]);

  // Subscribe to Supabase Auth session
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    void getCurrentAuthUser().then((user) => {
      if (!mounted) return;
      setAuthUser(user);
      setAuthLoading(false);
    });

    const unsub = subscribeAuthState((nextUser) => {
      if (!mounted) return;
      setAuthUser(nextUser);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const switchTrip = useCallback((rawTripId: string) => {
    const normalized = normalizeFamilyCode(rawTripId);
    if (!normalized) return;

    if (pushTimeoutRef.current) {
      window.clearTimeout(pushTimeoutRef.current);
      pushTimeoutRef.current = null;
    }

    const loaded = loadTripStateForCode(normalized);
    const nextState =
      loaded ??
      (normalized === DEFAULT_LONDON_TRIP_ID
        ? createDefaultState()
        : createSkeletonTripState(normalized, STATE_VERSION));

    applyingRemoteRef.current = true;
    setTripBundle({ code: normalized, state: nextState });
    saveFamilyCode(normalized);
    setPreviewReadOnly(false);

    const firstDayId = nextState.days[0]?.id ?? TRIP_DAYS[0].id;
    setSelectedDayIdState(firstDayId);
    saveSelectedDay(firstDayId);

    setSyncStatus({
      mode: isSupabaseConfigured() ? 'supabase_ready' : 'local',
      familyCode: normalized,
    });
  }, []);

  const refreshAccess = useCallback(async () => {
    if (!isSupabaseConfigured() || !familyCode) {
      setTripRole('unclaimed');
      setTripMembers([]);
      setRemoteMyTrips([]);
      setMembersSqlReady(true);
      return;
    }
    try {
      const res = await resolveTripAccess(familyCode, authUser);
      setMembersSqlReady(res.sqlReady);
      setTripRole(res.role);
      setTripMembers(res.members);
      setRemoteMyTrips(res.myTrips);

      // Only auto-switch if the user has NO access ('none') to the current trip and has another invited trip
      if (
        authUser &&
        res.sqlReady &&
        res.role === 'none' &&
        res.myTrips.length > 0 &&
        res.myTrips[0].familyCode !== familyCode
      ) {
        switchTrip(res.myTrips[0].familyCode);
      }
    } catch {
      // Keep current role state gracefully if offline
    }
  }, [familyCode, authUser, switchTrip]);

  useEffect(() => {
    if (authLoading) return;
    void refreshAccess();
  }, [authLoading, refreshAccess]);

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    saveLanguage(nextLang);
  }, []);

  const setSelectedDayId = useCallback((dayId: string) => {
    setSelectedDayIdState(dayId);
    saveSelectedDay(dayId);
  }, []);

  const navigateToDay = useCallback(
    (dayId: string, tab?: TabId) => {
      setSelectedDayId(dayId);
      if (tab) setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSelectedDayId]
  );

  // Persist to per-trip localStorage + debounced optional Supabase push (only when canEdit)
  useEffect(() => {
    // Avoid saving an empty remote skeleton before it's actually populated
    const isEmptySkeleton =
      !state.meta.isLondonDefault && state.updatedAt === DEFAULT_UPDATED_AT;
    if (!isEmptySkeleton) {
      saveTripStateForCode(familyCode, state);
    }

    if (
      !isSupabaseConfigured() ||
      !familyCode ||
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
      }
    };
  }, [state, familyCode]);

  // Subscribe to Supabase Realtime for active familyCode (re-runs on authUser change to attach JWT)
  useEffect(() => {
    if (!isSupabaseConfigured() || !familyCode) {
      setSyncStatus({ mode: 'local', familyCode });
      return;
    }

    let cancelled = false;
    const subscribedCode = familyCode;
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
  }, [familyCode, authUser?.id]);

  const mutate = useCallback((updater: (prev: TripState) => TripState) => {
    if (!canEditRef.current) return;
    setTripBundle((prev) => {
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
        const newTripId = generateTripCode(input.destination, input.startDate);
        const newState = createBlankTripState(input, STATE_VERSION);

        saveTripStateForCode(newTripId, newState);
        const summary = buildTripSummary(
          newTripId,
          newState,
          authUser ? 'admin' : undefined
        );
        setLocalTrips(upsertTripSummary(summary));

        if (pushTimeoutRef.current) {
          window.clearTimeout(pushTimeoutRef.current);
          pushTimeoutRef.current = null;
        }

        applyingRemoteRef.current = true;
        setTripBundle({ code: newTripId, state: newState });
        saveFamilyCode(newTripId);
        setPreviewReadOnly(false);

        const firstDayId = newState.days[0]?.id ?? input.startDate;
        setSelectedDayIdState(firstDayId);
        saveSelectedDay(firstDayId);

        if (isSupabaseConfigured()) {
          try {
            if (authUser) {
              const role = await claimTripAsAdmin(newTripId);
              if (role === 'admin' || role === 'editor' || role === 'viewer') {
                setTripRole(role);
              }
            }
            await pushRemoteState(newTripId, newState);
            setSyncStatus({
              mode: 'synced',
              familyCode: newTripId,
              lastSyncedAt: new Date().toISOString(),
            });
          } catch {
            // Keep newly created trip working offline locally
          }
        }

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
    [authUser]
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

  const signUp = useCallback(async (email: string, password: string) => {
    const res = await signUpWithPassword(email, password);
    if (res.error) return { ok: false, error: res.error };
    if (res.user && !res.needsConfirmation) {
      setAuthUser(res.user);
    }
    return { ok: true, needsConfirmation: res.needsConfirmation };
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    return signInWithMagicLink(email);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    return signInWithGoogleOAuth();
  }, []);

  const signOut = useCallback(async () => {
    await signOutAuth();
    setAuthUser(null);
    setRemoteMyTrips([]);
    setPreviewReadOnly(false);
  }, []);

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
          nextExpenses.push({
            id: generateId('exp'),
            dayId: newStep.dayId,
            title: newStep.title,
            category: 'activites',
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

        const nextSteps = prev.steps.map((s) => (s.id === stepId ? updatedStep : s));
        let nextExpenses = prev.expenses.map((exp) => {
          if (exp.linkedStepId !== stepId) return exp;
          return {
            ...exp,
            dayId: updatedStep.dayId,
            title: updatedStep.title,
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
              category: 'activites',
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
    if (!isSupabaseConfigured() || !code) {
      setSyncStatus({ mode: 'local', familyCode: code });
      return;
    }

    setSyncStatus({ mode: 'syncing', familyCode: code });
    try {
      await refreshAccess();
      const remote = await pullRemoteState(code);
      if (remote && remote.updatedAt > bundleRef.current.state.updatedAt) {
        applyingRemoteRef.current = true;
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
  }, [refreshAccess]);

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
    saveTripStateForCode(code, fresh);
  }, []);

  const value = useMemo<TripContextValue>(
    () => ({
      state,
      days,
      trips,
      tripsModalOpen,
      setTripsModalOpen,
      switchTrip,
      createNewTrip,
      updateTripMeta,
      lang,
      activeTab,
      selectedDayId,
      syncStatus,
      weatherByDay,
      setLang,
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
      signIn,
      signUp,
      sendMagicLink,
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
      exportTripJson,
      importTripJson,
      resetTripState,
    }),
    [
      state,
      days,
      trips,
      tripsModalOpen,
      switchTrip,
      createNewTrip,
      updateTripMeta,
      lang,
      activeTab,
      selectedDayId,
      syncStatus,
      weatherByDay,
      setLang,
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
      signIn,
      signUp,
      sendMagicLink,
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
