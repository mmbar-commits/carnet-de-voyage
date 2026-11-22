import { useState, type FormEvent } from 'react';
import { Trash2, X } from 'lucide-react';
import { TRIP_DAYS } from '../data/days';
import type { Expense, ExpenseCategory } from '../types/trip';

interface ExpenseModalProps {
  defaultDayId: string;
  initialExpense?: Expense;
  onClose: () => void;
  onSave: (data: Omit<Expense, 'id'>) => void;
  onDelete?: () => void;
}

export function ExpenseModal({
  defaultDayId,
  initialExpense,
  onClose,
  onSave,
  onDelete,
}: ExpenseModalProps) {
  const [dayId, setDayId] = useState(initialExpense?.dayId ?? defaultDayId);
  const [title, setTitle] = useState(initialExpense?.title ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(
    initialExpense?.category ?? 'repas'
  );
  const [amountGbp, setAmountGbp] = useState(
    initialExpense ? String(initialExpense.amountGbp) : ''
  );
  const [paid, setPaid] = useState(initialExpense?.paid ?? false);
  const [note, setNote] = useState(initialExpense?.note ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numeric = Number(amountGbp.replace(',', '.'));
    if (!title.trim() || Number.isNaN(numeric) || numeric < 0) return;

    onSave({
      dayId,
      title: title.trim(),
      category,
      amountGbp: Math.round(numeric * 100) / 100,
      paid,
      note: note.trim() || undefined,
      linkedStepId: initialExpense?.linkedStepId,
      isTowerHamletsBenefit: initialExpense?.isTowerHamletsBenefit,
      savedGbp: initialExpense?.savedGbp,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#143B2B]/40 p-0 backdrop-blur-xs sm:items-center sm:p-4"
    >
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#E7E2D8] bg-[#FAF8F4] p-5 shadow-xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-3">
          <h2
            id="expense-modal-title"
            className="font-editorial text-[24px] font-semibold text-[#143B2B]"
          >
            {initialExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E2D8] bg-white text-[#143B2B]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-[13px]">
          <div>
            <label
              htmlFor="expense-day-input"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]"
            >
              Journée
            </label>
            <select
              id="expense-day-input"
              value={dayId}
              onChange={(e) => setDayId(e.target.value)}
              className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2.5 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            >
              <option value="global">Dépenses globales (hors jour précis)</option>
              {TRIP_DAYS.map((d) => (
                <option key={d.id} value={d.id}>
                  J{d.dayNumber} · {d.dateShort} ({d.weekdayShort})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="expense-title-input"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]"
            >
              Libellé *
            </label>
            <input
              id="expense-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Chocolats chauds à Covent Garden"
              className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2.5 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="expense-amount-input"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]"
              >
                Montant (£ GBP) *
              </label>
              <input
                id="expense-amount-input"
                type="number"
                required
                min="0"
                step="0.5"
                value={amountGbp}
                onChange={(e) => setAmountGbp(e.target.value)}
                placeholder="25"
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2.5 text-[#143B2B] tabular-nums focus:border-[#143B2B] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="expense-category-input"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]"
              >
                Catégorie
              </label>
              <select
                id="expense-category-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2.5 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              >
                <option value="activites">Activités</option>
                <option value="repas">Repas & Courses</option>
                <option value="transports">Transports</option>
                <option value="shopping">Shopping & Extras</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="expense-note-input"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]"
            >
              Note (optionnel)
            </label>
            <input
              id="expense-note-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. Payé par carte sans frais"
              className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2.5 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#E7E2D8] bg-white px-3.5 py-2.5">
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              className="h-4 w-4 accent-[#143B2B]"
            />
            <span className="font-medium text-[#143B2B]">
              Dépense déjà payée
            </span>
          </label>

          <div className="flex items-center justify-between gap-2 pt-2">
            {initialExpense && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#7C2D36]/30 bg-[#FDF3F4] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#7C2D36]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E7E2D8] bg-white px-4 py-2.5 text-[12.5px] font-semibold text-[#4C6358]"
              >
                Annuler
              </button>
              <button
                id="save-expense-submit"
                type="submit"
                className="rounded-xl bg-[#143B2B] px-5 py-2.5 text-[12.5px] font-semibold text-[#FAF8F4] hover:bg-[#1E543E]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
