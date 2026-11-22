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
import { TRIP_DAYS } from '../data/days';
import { useTrip } from '../store/TripContext';
import type { Expense, ExpenseCategory } from '../types/trip';
import { ExpenseModal } from './ExpenseModal';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  activites: 'Activités',
  repas: 'Repas',
  transports: 'Transports',
  shopping: 'Shopping',
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
    selectedDayId,
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => ({
    global: false,
    [selectedDayId]: true,
  }));
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
      items: Expense[];
      subtotalGbp: number;
    }[] = [
      {
        id: 'global',
        badge: 'Global',
        title: 'Dépenses globales',
        items: filteredExpenses.filter((e) => e.dayId === 'global'),
        subtotalGbp: 0,
      },
      ...TRIP_DAYS.map((day) => ({
        id: day.id,
        badge: `J${day.dayNumber}`,
        title: `${day.weekdayFull} ${day.dateShort}`,
        items: filteredExpenses.filter((e) => e.dayId === day.id),
        subtotalGbp: 0,
      })),
    ];

    return list.map((g) => ({
      ...g,
      subtotalGbp: g.items.reduce((sum, i) => sum + i.amountGbp, 0),
    }));
  }, [filteredExpenses]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allExpanded = groups.every((g) => Boolean(expandedGroups[g.id]));

  const setAllExpanded = (expanded: boolean) => {
    const next: Record<string, boolean> = { global: expanded };
    TRIP_DAYS.forEach((d) => {
      next[d.id] = expanded;
    });
    setExpandedGroups(next);
  };

  return (
    <section id="tab-panel-budget" className="space-y-5">
      <div className="flex items-end justify-between gap-2 pt-2">
        <div>
          <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-[#B39258]">
            4 Voyageurs · 11 Jours
          </span>
          <h2 className="font-editorial mt-1 text-[30px] font-normal leading-tight text-[#143B2B]">
            Budget
          </h2>
        </div>

        <button
          type="button"
          id="toggle-rates-btn"
          onClick={() => setShowRatesEditor((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE7DE] bg-white px-3 py-1.5 text-[11.5px] font-light text-[#143B2B]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
          <span>Taux</span>
        </button>
      </div>

      {showRatesEditor && (
        <div className="ivy-card grid grid-cols-2 gap-3 rounded-2xl p-4">
          <div>
            <label
              htmlFor="rate-mad-input"
              className="mb-1 block text-[11px] font-light text-[#5F7067]"
            >
              1 £ en MAD
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
              className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[13px] font-normal tabular-nums text-[#143B2B]"
            />
          </div>
          <div>
            <label
              htmlFor="rate-eur-input"
              className="mb-1 block text-[11px] font-light text-[#5F7067]"
            >
              1 £ en € EUR
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
              className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[13px] font-normal tabular-nums text-[#143B2B]"
            />
          </div>
        </div>
      )}

      {/* Serene, luminous summary card */}
      <div className="ivy-card rounded-3xl px-5 py-5">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-[11px] font-light uppercase tracking-[0.14em] text-[#5F7067]">
              Total estimé
            </p>
            <p
              id="budget-total-gbp"
              className="mt-1 text-[34px] font-light leading-none tracking-tight tabular-nums text-[#143B2B]"
            >
              {formatGbp(totals.total)}
            </p>
          </div>
          <div className="text-right tabular-nums">
            <p className="text-[14px] font-normal text-[#143B2B]">
              {formatMad(totals.total, madPerGbp)}
            </p>
            <p className="mt-0.5 text-[12px] font-light text-[#5F7067]">
              {formatEur(totals.total, eurPerGbp)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11.5px] font-light text-[#5F7067]">
            <span>
              Payé : <span className="font-normal text-[#143B2B]">{formatGbp(totals.paid)}</span>
            </span>
            <span>
              Reste : <span className="font-normal text-[#143B2B]">{formatGbp(totals.remaining)}</span>
            </span>
          </div>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#ECE7DE]">
            <div
              className="h-full rounded-full bg-[#143B2B] transition-all duration-300"
              style={{ width: `${totals.paidPct}%` }}
            />
          </div>
        </div>

        {/* Understated Tower Hamlets savings line */}
        <div className="mt-4 flex items-center gap-2 border-t border-[#F2EDE4] pt-3.5 text-[12px] font-light text-[#83662F]">
          <Award className="h-3.5 w-3.5 shrink-0 stroke-[1.5] text-[#B39258]" />
          <span>
            ~£{Math.round(totals.savedTh)} économisés ({formatMad(totals.savedTh, madPerGbp)}) · Résident Tower Hamlets
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
          Toutes
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
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Chronological Day List */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="font-editorial text-[22px] font-normal text-[#143B2B]">
          Par journée
        </h3>
        <button
          type="button"
          onClick={() => setAllExpanded(!allExpanded)}
          className="text-[11.5px] font-light text-[#8F7038]"
        >
          {allExpanded ? 'Tout replier' : 'Tout déplier'}
        </button>
      </div>

      <div className="space-y-2.5">
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
                      {formatGbp(group.subtotalGbp)}
                    </p>
                    <p className="text-[10.5px] font-light text-[#5F7067]">
                      {formatMad(group.subtotalGbp, madPerGbp)}
                    </p>
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
                      Aucune dépense
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#F2EDE4]">
                      {group.items.map((item) => (
                        <li
                          key={item.id}
                          id={`expense-row-${item.id}`}
                          className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-1"
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
                              className="mt-0.5 shrink-0 text-[#143B2B]"
                            >
                              {item.paid ? (
                                <CheckCircle2 className="h-4 w-4 fill-[#143B2B] text-[#FAF8F4]" />
                              ) : (
                                <Circle className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <p
                                className={`text-[13px] font-normal leading-snug text-[#143B2B] ${
                                  item.paid ? 'line-through opacity-60' : ''
                                }`}
                              >
                                {item.title}
                              </p>
                              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-light text-[#5F7067]">
                                <span>{item.paid ? 'Payé' : 'Prévu'}</span>
                                {item.linkedStepId && <span>· Planning</span>}
                                {item.isTowerHamletsBenefit && item.savedGbp && (
                                  <span className="text-[#83662F]">
                                    · -£{Math.round(item.savedGbp)} TH
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <div className="text-right tabular-nums">
                              <p className="text-[13px] font-medium text-[#143B2B]">
                                {formatGbp(item.amountGbp)}
                              </p>
                              <p className="text-[10.5px] font-light text-[#5F7067]">
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
                              className="p-1 text-[#5F7067]/70 hover:text-[#143B2B]"
                            >
                              <Pencil className="h-3.5 w-3.5 stroke-[1.5]" />
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
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#D8CEBC] bg-white py-2 text-[12px] font-light text-[#143B2B]"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                    <span>Ajouter une dépense</span>
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
