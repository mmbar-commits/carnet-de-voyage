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
import type {
  BonusActivity,
  BookingStatus,
  ChecklistItem,
  ExchangeRates,
  Expense,
  SyncStatus,
  TabId,
  TripState,
  TripStep,
} from '../types/trip';
import {
  createDefaultState,
  isValidTripState,
  loadFamilyCode,
  loadSelectedDay,
  loadTripState,
  saveFamilyCode,
  saveSelectedDay,
  saveTripState,
  STATE_VERSION,
} from './storage';
import {
  isSupabaseConfigured,
  normalizeFamilyCode,
  pullRemoteState,
  pushRemoteState,
  subscribeToFamilySync,
} from './sync';

const BOOKING_CYCLE: BookingStatus[] = [
  'a_reserver',
  'reserve',
  'sur_place',
  'entree_libre',
];

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

interface TripContextValue {
  state: TripState;
  activeTab: TabId;
  selectedDayId: string;
  syncStatus: SyncStatus;
  setActiveTab: (tab: TabId) => void;
  setSelectedDayId: (dayId: string) => void;
  navigateToDay: (dayId: string, tab?: TabId) => void;

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

  // Budget
  toggleExpensePaid: (expenseId: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expenseId: string, patch: Partial<Omit<Expense, 'id'>>) => void;
  deleteExpense: (expenseId: string) => void;
  updateRates: (rates: ExchangeRates) => void;

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
  const [state, setState] = useState<TripState>(() => loadTripState());
  const [activeTab, setActiveTab] = useState<TabId>('planning');
  const [selectedDayId, setSelectedDayIdState] = useState<string>(() => {
    const stored = loadSelectedDay(TRIP_DAYS[0].id);
    return TRIP_DAYS.some((d) => d.id === stored) ? stored : TRIP_DAYS[0].id;
  });
  const [familyCode, setFamilyCodeState] = useState<string>(() => loadFamilyCode());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => ({
    mode: isSupabaseConfigured() ? 'supabase_ready' : 'local',
    familyCode: loadFamilyCode(),
  }));

  const applyingRemoteRef = useRef(false);
  const pushTimeoutRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

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

  // Persist to localStorage + debounced optional Supabase push
  useEffect(() => {
    saveTripState(state);

    if (!isSupabaseConfigured() || !familyCode || applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }

    if (pushTimeoutRef.current) {
      window.clearTimeout(pushTimeoutRef.current);
    }

    pushTimeoutRef.current = window.setTimeout(() => {
      setSyncStatus((prev) => ({ ...prev, mode: 'syncing', errorMessage: undefined }));
      pushRemoteState(familyCode, stateRef.current)
        .then(() => {
          setSyncStatus({
            mode: 'synced',
            familyCode,
            lastSyncedAt: new Date().toISOString(),
          });
        })
        .catch((err: unknown) => {
          setSyncStatus({
            mode: 'error',
            familyCode,
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

  // Subscribe to Supabase Realtime if configured
  useEffect(() => {
    if (!isSupabaseConfigured() || !familyCode) {
      setSyncStatus({ mode: 'local', familyCode });
      return;
    }

    let cancelled = false;
    setSyncStatus((prev) => ({ ...prev, mode: 'syncing', familyCode, errorMessage: undefined }));

    const syncFromRemote = () => {
      pullRemoteState(familyCode)
        .then((remote) => {
          if (cancelled) return;
          if (remote && remote.updatedAt > stateRef.current.updatedAt) {
            applyingRemoteRef.current = true;
            setState(remote);
          }
          setSyncStatus({
            mode: 'synced',
            familyCode,
            lastSyncedAt: new Date().toISOString(),
          });
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setSyncStatus({
            mode: 'error',
            familyCode,
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

    const unsubscribe = subscribeToFamilySync(familyCode, (remote) => {
      if (remote.updatedAt > stateRef.current.updatedAt) {
        applyingRemoteRef.current = true;
        setState(remote);
        setSyncStatus({
          mode: 'synced',
          familyCode,
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
  }, [familyCode]);

  const mutate = useCallback((updater: (prev: TripState) => TripState) => {
    setState((prev) => {
      const next = updater(prev);
      return {
        ...next,
        version: STATE_VERSION,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

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
          madPerGbp: Math.max(0.01, rates.madPerGbp),
          eurPerGbp: Math.max(0.01, rates.eurPerGbp),
        },
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

  const setFamilyCode = useCallback((rawCode: string) => {
    const normalized = normalizeFamilyCode(rawCode);
    setFamilyCodeState(normalized);
    saveFamilyCode(normalized);
    setSyncStatus((prev) => ({
      ...prev,
      familyCode: normalized,
      mode: isSupabaseConfigured() && normalized ? 'supabase_ready' : 'local',
    }));
  }, []);

  const triggerManualSync = useCallback(async () => {
    if (!isSupabaseConfigured() || !familyCode) {
      setSyncStatus({ mode: 'local', familyCode });
      return;
    }

    setSyncStatus({ mode: 'syncing', familyCode });
    try {
      const remote = await pullRemoteState(familyCode);
      if (remote && remote.updatedAt > stateRef.current.updatedAt) {
        applyingRemoteRef.current = true;
        setState(remote);
      } else {
        await pushRemoteState(familyCode, stateRef.current);
      }
      setSyncStatus({
        mode: 'synced',
        familyCode,
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      setSyncStatus({
        mode: 'error',
        familyCode,
        errorMessage: err instanceof Error ? err.message : 'Erreur de synchronisation',
      });
    }
  }, [familyCode]);

  const exportTripJson = useCallback(() => {
    return JSON.stringify(stateRef.current, null, 2);
  }, []);

  const importTripJson = useCallback((raw: string): { ok: boolean; error?: string } => {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isValidTripState(parsed)) {
        return {
          ok: false,
          error: 'Le fichier JSON ne correspond pas au format Londres Noël 2026.',
        };
      }
      setState({
        ...parsed,
        version: STATE_VERSION,
        updatedAt: new Date().toISOString(),
      });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Fichier JSON illisible ou invalide.' };
    }
  }, []);

  const resetTripState = useCallback(() => {
    const fresh = createDefaultState();
    setState(fresh);
    saveTripState(fresh);
  }, []);

  const value = useMemo<TripContextValue>(
    () => ({
      state,
      activeTab,
      selectedDayId,
      syncStatus,
      setActiveTab,
      setSelectedDayId,
      navigateToDay,
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
      activeTab,
      selectedDayId,
      syncStatus,
      setSelectedDayId,
      navigateToDay,
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
