import { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Link2,
  Pencil,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { TRIP_DAYS } from '../data/days';
import { useTrip } from '../store/TripContext';
import type { Expense, ExpenseCategory } from '../types/trip';
import { ExpenseModal } from './ExpenseModal';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  activites: 'Activités',
  repas: 'Repas & Courses',
  transports: 'Transports',
  shopping: 'Shopping & Extras',
};

const ALL_CATEGORIES: ExpenseCategory[] = [
  'activites',
  'repas',
  'transports',
  'shopping',
];

function formatGbp(amount: number): string {
  return `£${amount.toLocaleString('fr-FR', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatMad(amountGbp: number, rate: number): string {
  return `${Math.round(amountGbp * rate).toLocaleString('fr-FR')} MAD`;
}

function formatEur(amountGbp: number, rate: number): string {
  return `${Math.round(amountGbp * rate).toLocaleString('fr-FR')} €`;
}

export function BudgetTab() {
  const {
    state,
    toggleExpensePaid,
    addExpense,
    updateExpense,
    deleteExpense,
    updateRates,
  } = useTrip();

  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>(
    'all'
  );
  const [showRatesEditor, setShowRatesEditor] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = { global: true };
    TRIP_DAYS.forEach((d, idx) => {
      initial[d.id] = idx < 6;
    });
    return initial;
  });
  const [modalDayId, setModalDayId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
    undefined
  );

  const { madPerGbp, eurPerGbp } = state.rates;

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

  const groups = useMemo(() => {
    const list: {
      id: string;
      badge: string;
      title: string;
      subtitle: string;
      items: Expense[];
      subtotalGbp: number;
      paidGbp: number;
    }[] = [
      {
        id: 'global',
        badge: 'Global',
        title: 'Dépenses globales du séjour',
        subtitle: 'Transports TfL, formalités & extras transverses',
        items: filteredExpenses.filter((e) => e.dayId === 'global'),
        subtotalGbp: 0,
        paidGbp: 0,
      },
      ...TRIP_DAYS.map((day) => ({
        id: day.id,
        badge: `J${day.dayNumber} · ${day.dateShort}`,
        title: `${day.weekdayFull} ${day.dateShort}`,
        subtitle: day.title,
        items: filteredExpenses.filter((e) => e.dayId === day.id),
        subtotalGbp: 0,
        paidGbp: 0,
      })),
    ];

    return list.map((g) => ({
      ...g,
      subtotalGbp: g.items.reduce((sum, i) => sum + i.amountGbp, 0),
      paidGbp: g.items.reduce((sum, i) => sum + (i.paid ? i.amountGbp : 0), 0),
    }));
  }, [filteredExpenses]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllExpanded = (expanded: boolean) => {
    const next: Record<string, boolean> = { global: expanded };
    TRIP_DAYS.forEach((d) => {
      next[d.id] = expanded;
    });
    setExpandedGroups(next);
  };

  const allExpanded = groups.every((g) => Boolean(expandedGroups[g.id]));

  return (
    <section id="tab-panel-budget" className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 pt-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B39258]">
            Suivi Financier · 4 Voyageurs
          </span>
          <h2 className="font-editorial mt-1 text-[28px] font-semibold leading-tight text-[#143B2B]">
            Budget du Séjour
          </h2>
        </div>

        <button
          type="button"
          id="toggle-rates-btn"
          onClick={() => setShowRatesEditor((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E2D8] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[#143B2B] transition hover:border-[#B39258]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#B39258]" />
          <span>Taux</span>
        </button>
      </div>

      {/* Collapsible Exchange Rates Editor */}
      {showRatesEditor && (
        <div className="ivy-card rounded-2xl p-4">
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#143B2B]">
            Taux de conversion (base 1 £ GBP)
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="rate-mad-input"
                className="mb-1 block text-[11px] font-medium text-[#4C6358]"
              >
                Dirhams (MAD)
              </label>
              <input
                id="rate-mad-input"
                type="number"
                step="0.05"
                min="1"
                value={madPerGbp}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val > 0) {
                    updateRates({ madPerGbp: val, eurPerGbp });
                  }
                }}
                className="w-full rounded-xl border border-[#E7E2D8] bg-[#FAF8F4] px-3 py-2 text-[13px] font-semibold tabular-nums text-[#143B2B]"
              />
            </div>
            <div>
              <label
                htmlFor="rate-eur-input"
                className="mb-1 block text-[11px] font-medium text-[#4C6358]"
              >
                Euros (€ EUR)
              </label>
              <input
                id="rate-eur-input"
                type="number"
                step="0.01"
                min="0.1"
                value={eurPerGbp}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val > 0) {
                    updateRates({ madPerGbp, eurPerGbp: val });
                  }
                }}
                className="w-full rounded-xl border border-[#E7E2D8] bg-[#FAF8F4] px-3 py-2 text-[13px] font-semibold tabular-nums text-[#143B2B]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Tri-Currency Summary Card */}
      <div className="rounded-3xl border border-[#143B2B] bg-[#143B2B] p-5 text-[#FAF8F4] shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D7BD8A]">
              Total estimé
              {categoryFilter !== 'all'
                ? ` · ${CATEGORY_LABELS[categoryFilter]}`
                : ' · 11 jours'}
            </p>
            <p
              id="budget-total-gbp"
              className="mt-1.5 text-[34px] font-bold leading-none tracking-tight tabular-nums"
            >
              {formatGbp(totals.total)}
            </p>
          </div>

          <div className="text-right tabular-nums">
            <p className="text-[14px] font-bold text-[#FAF8F4]">
              {formatMad(totals.total, madPerGbp)}
            </p>
            <p className="mt-0.5 text-[12.5px] text-[#D7BD8A]">
              {formatEur(totals.total, eurPerGbp)}
            </p>
            <p className="mt-1 text-[10px] text-[#FAF8F4]/65">
              1 £ = {madPerGbp.toFixed(2)} MAD · {eurPerGbp.toFixed(2)} €
            </p>
          </div>
        </div>

        {/* Paid vs Remaining Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="font-medium text-[#D7BD8A]">
              Payé : <strong className="text-[#FAF8F4]">{formatGbp(totals.paid)}</strong>{' '}
              ({totals.paidPct} %)
            </span>
            <span className="font-medium text-[#FAF8F4]/85">
              À prévoir : <strong>{formatGbp(totals.remaining)}</strong>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#B39258] transition-all duration-300"
              style={{ width: `${totals.paidPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tower Hamlets ~£120 Savings Highlight */}
      <div className="rounded-2xl border border-[#B39258]/50 bg-[#F7F1E4] p-3.5 text-[#143B2B]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#143B2B] text-[#D7BD8A]">
            <Award className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#143B2B]">
              ~£{Math.round(totals.savedTh)} économisés grâce à Tower Hamlets
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-[#4C6358]">
              Soit environ{' '}
              <strong className="text-[#143B2B]">
                {formatMad(totals.savedTh, madPerGbp)}
              </strong>{' '}
              d’économie sur la Tour de Londres (£1) et Tower Bridge (£1) le
              dimanche 27 déc.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition ${
            categoryFilter === 'all'
              ? 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
              : 'border-[#E7E2D8] bg-white text-[#143B2B] hover:border-[#B39258]'
          }`}
        >
          Toutes
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition ${
              categoryFilter === cat
                ? 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
                : 'border-[#E7E2D8] bg-white text-[#143B2B] hover:border-[#B39258]'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Chronological Day-by-Day Header + Expand/Collapse All */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="font-editorial text-[22px] font-semibold text-[#143B2B]">
          Détail chronologique par jour
        </h3>
        <button
          type="button"
          onClick={() => setAllExpanded(!allExpanded)}
          className="text-[11.5px] font-semibold text-[#8F7038] underline underline-offset-2"
        >
          {allExpanded ? 'Tout replier' : 'Tout déplier'}
        </button>
      </div>

      {/* Collapsible Day Groups */}
      <div className="space-y-3">
        {groups.map((group) => {
          const isOpen = Boolean(expandedGroups[group.id]);

          return (
            <div
              key={group.id}
              id={`budget-group-${group.id}`}
              className="ivy-card overflow-hidden rounded-2xl"
            >
              <button
                type="button"
                id={`budget-group-toggle-${group.id}`}
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-[#FAF8F4]/70"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#F7F1E4] px-2 py-0.5 text-[10.5px] font-bold text-[#8F7038]">
                      {group.badge}
                    </span>
                    <span className="text-[11px] font-medium text-[#4C6358]">
                      {group.items.length} poste{group.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="font-editorial mt-1 truncate text-[19px] font-semibold text-[#143B2B]">
                    {group.title}
                  </p>
                  <p className="truncate text-[11.5px] text-[#4C6358]">
                    {group.subtitle}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <div className="text-right tabular-nums">
                    <p className="text-[15px] font-bold text-[#143B2B]">
                      {formatGbp(group.subtotalGbp)}
                    </p>
                    <p className="text-[11px] font-medium text-[#4C6358]">
                      {formatMad(group.subtotalGbp, madPerGbp)}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-[#B39258]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#B39258]" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#E7E2D8] bg-[#FCFBF8] px-3.5 py-3">
                  {group.items.length === 0 ? (
                    <p className="py-1 text-center text-[12px] text-[#4C6358]">
                      Aucune dépense dans cette catégorie pour ce jour.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {group.items.map((item) => (
                        <li
                          key={item.id}
                          id={`expense-row-${item.id}`}
                          className={`flex items-start justify-between gap-2.5 rounded-xl border p-3 transition ${
                            item.paid
                              ? 'border-[#143B2B]/20 bg-white/75'
                              : 'border-[#E7E2D8] bg-white'
                          }`}
                        >
                          <div className="flex min-w-0 items-start gap-2.5">
                            <button
                              type="button"
                              id={`toggle-paid-${item.id}`}
                              onClick={() => toggleExpensePaid(item.id)}
                              aria-label={
                                item.paid
                                  ? 'Marquer comme prévu'
                                  : 'Marquer comme payé'
                              }
                              className="mt-0.5 shrink-0 text-[#143B2B] transition hover:scale-105"
                            >
                              {item.paid ? (
                                <CheckCircle2 className="h-5 w-5 fill-[#143B2B] text-[#FAF8F4]" />
                              ) : (
                                <Circle className="h-5 w-5 text-[#B39258]" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <p
                                className={`text-[13px] font-semibold leading-snug text-[#143B2B] ${
                                  item.paid ? 'line-through opacity-75' : ''
                                }`}
                              >
                                {item.title}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="rounded-full bg-[#FAF8F4] px-2 py-0.5 text-[10px] font-semibold text-[#4C6358] border border-[#E7E2D8]">
                                  {CATEGORY_LABELS[item.category]}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleExpensePaid(item.id)}
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    item.paid
                                      ? 'bg-[#143B2B] text-[#FAF8F4]'
                                      : 'bg-[#F7F1E4] text-[#8F7038]'
                                  }`}
                                >
                                  {item.paid ? 'Payé' : 'Prévu'}
                                </button>
                                {item.linkedStepId && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#4C6358]">
                                    <Link2 className="h-3 w-3 text-[#B39258]" />
                                    Planning
                                  </span>
                                )}
                                {item.isTowerHamletsBenefit && item.savedGbp && (
                                  <span className="rounded-full bg-[#F7F1E4] px-2 py-0.5 text-[10px] font-bold text-[#143B2B]">
                                    -£{Math.round(item.savedGbp)} TH
                                  </span>
                                )}
                              </div>
                              {item.note && (
                                <p className="mt-1 text-[11.5px] leading-snug text-[#4C6358]">
                                  {item.note}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <div className="text-right tabular-nums">
                              <p className="text-[13.5px] font-bold text-[#143B2B]">
                                {formatGbp(item.amountGbp)}
                              </p>
                              <p className="text-[10.5px] text-[#4C6358]">
                                {formatMad(item.amountGbp, madPerGbp)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingExpense(item);
                                setModalDayId(item.dayId);
                              }}
                              aria-label="Modifier la dépense"
                              className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#E7E2D8] bg-[#FAF8F4] text-[#4C6358] hover:border-[#B39258] hover:text-[#143B2B]"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    id={`add-expense-btn-${group.id}`}
                    onClick={() => {
                      setEditingExpense(undefined);
                      setModalDayId(group.id);
                    }}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#B39258]/80 bg-white py-2 text-[12px] font-semibold text-[#143B2B] transition hover:border-[#143B2B]"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#B39258]" />
                    <span>+ Ajouter une dépense ce jour</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalDayId && (
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
            setExpandedGroups((prev) => ({ ...prev, [data.dayId]: true }));
          }}
          onDelete={
            editingExpense ? () => deleteExpense(editingExpense.id) : undefined
          }
        />
      )}
    </section>
  );
}
