import { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Pencil,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { formatCurrencyAmount, getCurrencyChipLabel } from '../data/currencies';
import { DAY_MAP, TRIP_DAYS } from '../data/days';
import { PAYMENT_METHODS } from '../data/expenses';
import { getCategoryLabel, getDayLabel, UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';
import type { DisplayCurrency, Expense, ExpenseCategory } from '../types/trip';
import { ExpenseModal } from './ExpenseModal';

const ALL_CATEGORIES: ExpenseCategory[] = [
  'activites',
  'repas',
  'transports',
  'shopping',
];

export function BudgetTab() {
  const {
    lang,
    state,
    canEdit,
    toggleExpensePaid,
    addExpense,
    updateExpense,
    deleteExpense,
    updateRates,
  } = useTrip();

  const t = UI_TEXT[lang];
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';

  const [currency, setCurrency] = useState<DisplayCurrency>('trip');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>(
    'all'
  );
  const [showRatesEditor, setShowRatesEditor] = useState(false);

  // All dropdowns closed by default
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [expandedPayments, setExpandedPayments] = useState<
    Record<string, boolean>
  >({});
  const [expandedPeople, setExpandedPeople] = useState<Record<string, boolean>>(
    {}
  );

  const [modalDayId, setModalDayId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
    undefined
  );

  const { madPerGbp, eurPerGbp } = state.rates;
  const { tripCurrency, homeCurrency } = state.currencies;
  const sameCurrency = tripCurrency === homeCurrency;
  const homePerTrip = sameCurrency ? 1 : madPerGbp;

  const rateEditorLabel =
    lang === 'fr'
      ? `Taux de change (1 ${tripCurrency} en ${homeCurrency})`
      : `Exchange rate (1 ${tripCurrency} in ${homeCurrency})`;

  const formatPrimary = (amountInTrip: number) =>
    currency === 'trip' || sameCurrency
      ? formatCurrencyAmount(amountInTrip, tripCurrency, locale)
      : formatCurrencyAmount(amountInTrip * homePerTrip, homeCurrency, locale);

  const formatSecondary = (amountInTrip: number): string | null => {
    if (sameCurrency) return null;
    return currency === 'trip'
      ? formatCurrencyAmount(amountInTrip * homePerTrip, homeCurrency, locale)
      : formatCurrencyAmount(amountInTrip, tripCurrency, locale);
  };

  const filteredExpenses = useMemo(() => {
    if (categoryFilter === 'all') return state.expenses;
    return state.expenses.filter((e) => e.category === categoryFilter);
  }, [state.expenses, categoryFilter]);

  const totals = useMemo(() => {
    let total = 0;
    let paid = 0;
    let savedTh = 0;
    for (const exp of filteredExpenses) {
      total += exp.amountGbp;
      if (exp.paid) paid += exp.amountGbp;
    }
    for (const exp of state.expenses) {
      if (exp.isTowerHamletsBenefit && exp.savedGbp) {
        savedTh += exp.savedGbp;
      }
    }
    return {
      total,
      paid,
      remaining: Math.max(0, total - paid),
      paidPct: total > 0 ? Math.round((paid / total) * 100) : 0,
      savedTh: savedTh > 0 ? savedTh : 120,
    };
  }, [filteredExpenses, state.expenses]);

  const dayGroups = useMemo(() => {
    const list: {
      id: string;
      badge: string;
      title: string;
      items: Expense[];
      subtotalGbp: number;
    }[] = [
      {
        id: 'global',
        badge: t.budget.globalBadge,
        title: t.budget.globalTitle,
        items: filteredExpenses.filter((e) => e.dayId === 'global'),
        subtotalGbp: 0,
      },
      ...TRIP_DAYS.map((day) => {
        const dl = getDayLabel(day, lang);
        return {
          id: day.id,
          badge: `${lang === 'fr' ? 'J' : 'D'}${day.dayNumber}`,
          title: `${dl.weekdayFull} ${dl.dateShort}`,
          items: filteredExpenses.filter((e) => e.dayId === day.id),
          subtotalGbp: 0,
        };
      }),
    ];

    return list.map((g) => ({
      ...g,
      subtotalGbp: g.items.reduce((sum, i) => sum + i.amountGbp, 0),
    }));
  }, [filteredExpenses, lang, t.budget.globalBadge, t.budget.globalTitle]);

  const categoryGroups = useMemo(() => {
    return ALL_CATEGORIES.map((cat) => {
      const items = state.expenses.filter((e) => e.category === cat);
      return {
        id: cat,
        title: getCategoryLabel(cat, lang),
        items,
        subtotalGbp: items.reduce((sum, i) => sum + i.amountGbp, 0),
      };
    });
  }, [state.expenses, lang]);

  const paymentGroups = useMemo(() => {
    const known = new Set<string>(PAYMENT_METHODS);
    const extras = new Set<string>();
    for (const exp of state.expenses) {
      if (exp.paymentMethod && !known.has(exp.paymentMethod)) {
        extras.add(exp.paymentMethod);
      }
    }

    const orderedMethods = [...PAYMENT_METHODS, ...Array.from(extras)];
    const groups = orderedMethods.map((method) => {
      const items = state.expenses.filter((e) => e.paymentMethod === method);
      return {
        id: method,
        title: method,
        items,
        subtotalGbp: items.reduce((sum, i) => sum + i.amountGbp, 0),
      };
    });

    const unspecifiedItems = state.expenses.filter((e) => !e.paymentMethod);
    groups.push({
      id: 'non_precise',
      title: t.budget.unspecified,
      items: unspecifiedItems,
      subtotalGbp: unspecifiedItems.reduce((sum, i) => sum + i.amountGbp, 0),
    });

    return groups;
  }, [state.expenses, t.budget.unspecified]);

  const peopleGroups = useMemo(() => {
    const known = new Set<string>(state.people);
    const extras = new Set<string>();
    for (const exp of state.expenses) {
      if (exp.person && !known.has(exp.person)) {
        extras.add(exp.person);
      }
    }

    const orderedPeople = [...state.people, ...Array.from(extras)];
    const groups = orderedPeople.map((personName) => {
      const items = state.expenses.filter((e) => e.person === personName);
      return {
        id: personName,
        title: personName,
        items,
        subtotalGbp: items.reduce((sum, i) => sum + i.amountGbp, 0),
      };
    });

    const unspecifiedItems = state.expenses.filter((e) => !e.person);
    groups.push({
      id: 'non_precise_person',
      title: t.budget.unspecified,
      items: unspecifiedItems,
      subtotalGbp: unspecifiedItems.reduce((sum, i) => sum + i.amountGbp, 0),
    });

    return groups;
  }, [state.expenses, state.people, t.budget.unspecified]);

  const allDaysExpanded = dayGroups.every((g) => Boolean(expandedDays[g.id]));
  const setAllDaysExpanded = (expanded: boolean) => {
    const next: Record<string, boolean> = {};
    dayGroups.forEach((g) => {
      next[g.id] = expanded;
    });
    setExpandedDays(next);
  };

  const renderExpenseRow = (
    item: Expense,
    options?: { showDay?: boolean; showCategory?: boolean; keyPrefix?: string }
  ) => {
    const dayObj = item.dayId !== 'global' ? DAY_MAP[item.dayId] : undefined;
    const dl = dayObj ? getDayLabel(dayObj, lang) : undefined;
    const dayLabel =
      dayObj && dl
        ? `${lang === 'fr' ? 'J' : 'D'}${dayObj.dayNumber} · ${dl.dateShort}`
        : t.budget.globalBadge;

    return (
      <li
        key={`${options?.keyPrefix ?? 'day'}-${item.id}`}
        id={options?.keyPrefix ? undefined : `expense-row-${item.id}`}
        className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-1"
      >
        <div className="flex min-w-0 items-start gap-2.5">
          {canEdit ? (
            <button
              type="button"
              id={options?.keyPrefix ? undefined : `toggle-paid-${item.id}`}
              onClick={() => toggleExpensePaid(item.id)}
              aria-label="Toggle paid"
              className="mt-0.5 shrink-0 text-[#143B2B]"
            >
              {item.paid ? (
                <CheckCircle2 className="h-4 w-4 fill-[#143B2B] text-[#FAF8F4]" />
              ) : (
                <Circle className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              )}
            </button>
          ) : (
            <span className="mt-0.5 shrink-0 text-[#143B2B]">
              {item.paid ? (
                <CheckCircle2 className="h-4 w-4 fill-[#143B2B] text-[#FAF8F4]" />
              ) : (
                <Circle className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              )}
            </span>
          )}

          <div className="min-w-0">
            <p
              className={`text-[13px] font-normal leading-snug text-[#143B2B] ${
                item.paid ? 'line-through opacity-60' : ''
              }`}
            >
              {item.title}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-light text-[#5F7067]">
              <span>{item.paid ? t.budget.paid : t.budget.plannedStatus}</span>
              {options?.showDay && <span>· {dayLabel}</span>}
              {options?.showCategory && (
                <span>· {getCategoryLabel(item.category, lang, true)}</span>
              )}
              {item.paymentMethod && (
                <span className="text-[#143B2B]">· {item.paymentMethod}</span>
              )}
              {item.person && (
                <span className="text-[#83662F]">· {item.person}</span>
              )}
              {item.isTowerHamletsBenefit && item.savedGbp && (
                <span className="text-[#83662F]">
                  · -{formatPrimary(Math.round(item.savedGbp))} TH
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right tabular-nums">
            <p className="text-[13px] font-medium text-[#143B2B]">
              {formatPrimary(item.amountGbp)}
            </p>
            {!sameCurrency && (
              <p className="text-[10.5px] font-light text-[#5F7067]">
                {formatSecondary(item.amountGbp)}
              </p>
            )}
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditingExpense(item);
                setModalDayId(item.dayId);
              }}
              aria-label="Edit expense"
              className="p-1 text-[#5F7067]/70 hover:text-[#143B2B]"
            >
              <Pencil className="h-3.5 w-3.5 stroke-[1.5]" />
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <section id="tab-panel-budget" className="space-y-5">
      {/* Header + Dynamic Trip/Home Currency Toggle */}
      <div className="flex items-end justify-between gap-2 pt-2">
        <div>
          <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-[#B39258]">
            {t.budget.eyebrow}
          </span>
          <h2 className="font-editorial mt-1 text-[30px] font-normal leading-tight text-[#143B2B]">
            {t.budget.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {sameCurrency ? (
            <span
              id={`currency-toggle-${tripCurrency}`}
              className="inline-flex rounded-full border border-[#ECE7DE] bg-[#143B2B] px-3 py-1 text-[11px] font-medium text-[#FAF8F4]"
            >
              {getCurrencyChipLabel(tripCurrency)}
            </span>
          ) : (
            <div
              role="group"
              aria-label="Currency"
              className="inline-flex rounded-full border border-[#ECE7DE] bg-white p-0.5"
            >
              {(
                [
                  { key: 'trip' as const, code: tripCurrency },
                  { key: 'home' as const, code: homeCurrency },
                ] as const
              ).map(({ key, code }) => (
                <button
                  key={key}
                  id={`currency-toggle-${code}`}
                  type="button"
                  aria-pressed={currency === key}
                  onClick={() => setCurrency(key)}
                  className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                    currency === key
                      ? 'bg-[#143B2B] font-medium text-[#FAF8F4]'
                      : 'font-light text-[#5F7067]'
                  }`}
                >
                  {getCurrencyChipLabel(code)}
                </button>
              ))}
            </div>
          )}

          {canEdit && !sameCurrency && (
            <button
              type="button"
              id="toggle-rates-btn"
              onClick={() => setShowRatesEditor((v) => !v)}
              aria-label="Exchange rate"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECE7DE] bg-white text-[#143B2B]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
            </button>
          )}
        </div>
      </div>

      {canEdit && !sameCurrency && showRatesEditor && (
        <div className="ivy-card flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5">
          <label
            htmlFor="rate-mad-input"
            className="text-[12.5px] font-light text-[#5F7067]"
          >
            {rateEditorLabel}
          </label>
          <input
            id="rate-mad-input"
            type="number"
            step="any"
            min="0.0001"
            value={madPerGbp}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!Number.isNaN(val) && val > 0) {
                updateRates({ madPerGbp: val, eurPerGbp });
              }
            }}
            className="w-24 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-1.5 text-right text-[13px] font-normal tabular-nums text-[#143B2B]"
          />
        </div>
      )}

      {/* Summary Card */}
      <div className="ivy-card rounded-3xl px-5 py-5">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-[11px] font-light uppercase tracking-[0.14em] text-[#5F7067]">
              {t.budget.estimatedTotal}
            </p>
            <p
              id="budget-total-gbp"
              className="mt-1 text-[32px] font-light leading-none tracking-tight tabular-nums text-[#143B2B]"
            >
              {formatPrimary(totals.total)}
            </p>
          </div>
          {!sameCurrency && (
            <div className="text-right tabular-nums">
              <p className="text-[13.5px] font-normal text-[#5F7067]">
                {formatSecondary(totals.total)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11.5px] font-light text-[#5F7067]">
            <span>
              {t.budget.paid} :{' '}
              <span className="font-normal text-[#143B2B]">
                {formatPrimary(totals.paid)}
              </span>{' '}
              ({totals.paidPct} %)
            </span>
            <span>
              {t.budget.remaining} :{' '}
              <span className="font-normal text-[#143B2B]">
                {formatPrimary(totals.remaining)}
              </span>
            </span>
          </div>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#ECE7DE]">
            <div
              className="h-full rounded-full bg-[#143B2B] transition-all duration-300"
              style={{ width: `${totals.paidPct}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[#F2EDE4] pt-3.5 text-[12px] font-light text-[#83662F]">
          <Award className="h-3.5 w-3.5 shrink-0 stroke-[1.5] text-[#B39258]" />
          <span>
            ~{formatPrimary(Math.round(totals.savedTh))} {t.budget.thSaved}
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] transition ${
            categoryFilter === 'all'
              ? 'border-[#143B2B] bg-[#143B2B] font-medium text-[#FAF8F4]'
              : 'border-[#ECE7DE] bg-white font-light text-[#143B2B]'
          }`}
        >
          {t.budget.allCategories}
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] transition ${
              categoryFilter === cat
                ? 'border-[#143B2B] bg-[#143B2B] font-medium text-[#FAF8F4]'
                : 'border-[#ECE7DE] bg-white font-light text-[#143B2B]'
            }`}
          >
            {getCategoryLabel(cat, lang, true)}
          </button>
        ))}
      </div>

      {/* 1. Par journée */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pt-1">
          <h3 className="font-editorial text-[22px] font-normal text-[#143B2B]">
            {t.budget.byDay}
          </h3>
          <button
            type="button"
            onClick={() => setAllDaysExpanded(!allDaysExpanded)}
            className="text-[11.5px] font-light text-[#8F7038]"
          >
            {allDaysExpanded ? t.budget.collapseAll : t.budget.expandAll}
          </button>
        </div>

        {dayGroups.map((group) => {
          const isOpen = Boolean(expandedDays[group.id]);

          return (
            <div
              key={group.id}
              id={`budget-group-${group.id}`}
              className="ivy-card overflow-hidden rounded-2xl"
            >
              <button
                type="button"
                id={`budget-group-toggle-${group.id}`}
                onClick={() =>
                  setExpandedDays((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
                }
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="w-11 shrink-0 text-[11px] font-normal text-[#B39258]">
                    {group.badge}
                  </span>
                  <span className="font-editorial truncate text-[19px] font-normal text-[#143B2B]">
                    {group.title}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <div className="text-right tabular-nums">
                    <p className="text-[14px] font-medium text-[#143B2B]">
                      {formatPrimary(group.subtotalGbp)}
                    </p>
                    {!sameCurrency && (
                      <p className="text-[10.5px] font-light text-[#5F7067]">
                        {formatSecondary(group.subtotalGbp)}
                      </p>
                    )}
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#F2EDE4] bg-[#FDFCF9] px-4 py-3">
                  {group.items.length === 0 ? (
                    <p className="py-1 text-center text-[12px] font-light text-[#5F7067]">
                      {t.budget.noExpense}
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#F2EDE4]">
                      {group.items.map((item) => renderExpenseRow(item))}
                    </ul>
                  )}

                  {canEdit && (
                    <button
                      type="button"
                      id={`add-expense-btn-${group.id}`}
                      onClick={() => {
                        setEditingExpense(undefined);
                        setModalDayId(group.id);
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#D8CEBC] bg-white py-2 text-[12px] font-light text-[#143B2B]"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                      <span>{t.budget.addExpense}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Par catégorie */}
      <div id="budget-section-categories" className="space-y-2.5 pt-2">
        <h3 className="font-editorial text-[22px] font-normal text-[#143B2B]">
          {t.budget.byCategory}
        </h3>

        {categoryGroups.map((group) => {
          const isOpen = Boolean(expandedCategories[group.id]);

          return (
            <div
              key={group.id}
              id={`budget-cat-group-${group.id}`}
              className="ivy-card overflow-hidden rounded-2xl"
            >
              <button
                type="button"
                id={`budget-cat-toggle-${group.id}`}
                onClick={() =>
                  setExpandedCategories((prev) => ({
                    ...prev,
                    [group.id]: !prev[group.id],
                  }))
                }
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <div className="min-w-0">
                  <span className="font-editorial text-[19px] font-normal text-[#143B2B]">
                    {group.title}
                  </span>
                  <span className="ml-2 text-[11px] font-light text-[#5F7067]">
                    ({group.items.length})
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <div className="text-right tabular-nums">
                    <p className="text-[14px] font-medium text-[#143B2B]">
                      {formatPrimary(group.subtotalGbp)}
                    </p>
                    {!sameCurrency && (
                      <p className="text-[10.5px] font-light text-[#5F7067]">
                        {formatSecondary(group.subtotalGbp)}
                      </p>
                    )}
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#F2EDE4] bg-[#FDFCF9] px-4 py-3">
                  {group.items.length === 0 ? (
                    <p className="py-1 text-center text-[12px] font-light text-[#5F7067]">
                      {t.budget.noExpense}
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#F2EDE4]">
                      {group.items.map((item) =>
                        renderExpenseRow(item, {
                          showDay: true,
                          keyPrefix: `cat-${group.id}`,
                        })
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Par moyen de paiement */}
      <div id="budget-section-payments" className="space-y-2.5 pt-2">
        <h3 className="font-editorial text-[22px] font-normal text-[#143B2B]">
          {t.budget.byPayment}
        </h3>

        {paymentGroups.map((group) => {
          const isOpen = Boolean(expandedPayments[group.id]);

          return (
            <div
              key={group.id}
              id={`budget-pay-group-${group.id}`}
              className="ivy-card overflow-hidden rounded-2xl"
            >
              <button
                type="button"
                id={`budget-pay-toggle-${group.id}`}
                onClick={() =>
                  setExpandedPayments((prev) => ({
                    ...prev,
                    [group.id]: !prev[group.id],
                  }))
                }
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <div className="min-w-0">
                  <span className="font-editorial text-[19px] font-normal text-[#143B2B]">
                    {group.title}
                  </span>
                  <span className="ml-2 text-[11px] font-light text-[#5F7067]">
                    ({group.items.length})
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <div className="text-right tabular-nums">
                    <p className="text-[14px] font-medium text-[#143B2B]">
                      {formatPrimary(group.subtotalGbp)}
                    </p>
                    {!sameCurrency && (
                      <p className="text-[10.5px] font-light text-[#5F7067]">
                        {formatSecondary(group.subtotalGbp)}
                      </p>
                    )}
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#F2EDE4] bg-[#FDFCF9] px-4 py-3">
                  {group.items.length === 0 ? (
                    <p className="py-1 text-center text-[12px] font-light text-[#5F7067]">
                      {t.budget.noExpense}
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#F2EDE4]">
                      {group.items.map((item) =>
                        renderExpenseRow(item, {
                          showDay: true,
                          showCategory: true,
                          keyPrefix: `pay-${group.id}`,
                        })
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Par personne */}
      <div id="budget-section-people" className="space-y-2.5 pt-2">
        <h3 className="font-editorial text-[22px] font-normal text-[#143B2B]">
          {t.budget.byPerson}
        </h3>

        {peopleGroups.map((group) => {
          const isOpen = Boolean(expandedPeople[group.id]);

          return (
            <div
              key={group.id}
              id={`budget-person-group-${group.id}`}
              className="ivy-card overflow-hidden rounded-2xl"
            >
              <button
                type="button"
                id={`budget-person-toggle-${group.id}`}
                onClick={() =>
                  setExpandedPeople((prev) => ({
                    ...prev,
                    [group.id]: !prev[group.id],
                  }))
                }
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <div className="min-w-0">
                  <span className="font-editorial text-[19px] font-normal text-[#143B2B]">
                    {group.title}
                  </span>
                  <span className="ml-2 text-[11px] font-light text-[#5F7067]">
                    ({group.items.length})
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <div className="text-right tabular-nums">
                    <p className="text-[14px] font-medium text-[#143B2B]">
                      {formatPrimary(group.subtotalGbp)}
                    </p>
                    {!sameCurrency && (
                      <p className="text-[10.5px] font-light text-[#5F7067]">
                        {formatSecondary(group.subtotalGbp)}
                      </p>
                    )}
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#F2EDE4] bg-[#FDFCF9] px-4 py-3">
                  {group.items.length === 0 ? (
                    <p className="py-1 text-center text-[12px] font-light text-[#5F7067]">
                      {t.budget.noExpense}
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#F2EDE4]">
                      {group.items.map((item) =>
                        renderExpenseRow(item, {
                          showDay: true,
                          showCategory: true,
                          keyPrefix: `person-${group.id}`,
                        })
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {canEdit && modalDayId && (
        <ExpenseModal
          defaultDayId={modalDayId}
          initialExpense={editingExpense}
          onClose={() => {
            setModalDayId(null);
            setEditingExpense(undefined);
          }}
          onSave={(data) => {
            if (editingExpense) {
              updateExpense(editingExpense.id, data);
            } else {
              addExpense(data);
            }
            setExpandedDays((prev) => ({ ...prev, [data.dayId]: true }));
          }}
          onDelete={
            editingExpense ? () => deleteExpense(editingExpense.id) : undefined
          }
        />
      )}
    </section>
  );
}
