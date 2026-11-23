import { useState, type FormEvent } from 'react';
import { Trash2, X } from 'lucide-react';
import { getCurrencyChipLabel } from '../data/currencies';
import { TRIP_DAYS } from '../data/days';
import { PAYMENT_METHODS } from '../data/expenses';
import { getCategoryLabel, getDayLabel, UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';
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
  const { lang, state } = useTrip();
  const t = UI_TEXT[lang];
  const tripCurrencyChip = getCurrencyChipLabel(state.currencies.tripCurrency);
  const amountFieldLabel =
    lang === 'fr'
      ? `Montant (${tripCurrencyChip}) *`
      : `Amount (${tripCurrencyChip}) *`;

  const [dayId, setDayId] = useState(initialExpense?.dayId ?? defaultDayId);
  const [title, setTitle] = useState(initialExpense?.title ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(
    initialExpense?.category ?? 'repas'
  );
  const [amountGbp, setAmountGbp] = useState(
    initialExpense ? String(initialExpense.amountGbp) : ''
  );
  const [paymentMethod, setPaymentMethod] = useState(
    initialExpense?.paymentMethod ?? ''
  );
  const [person, setPerson] = useState(initialExpense?.person ?? '');
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
      paymentMethod: paymentMethod || undefined,
      person: person || undefined,
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#143B2B]/35 p-0 backdrop-blur-xs sm:items-center sm:p-4"
    >
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[#ECE7DE] bg-[#FAF8F4] p-5 shadow-xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
          <h2
            id="expense-modal-title"
            className="font-editorial text-[24px] font-normal text-[#143B2B]"
          >
            {initialExpense ? t.budget.editExpense : t.budget.newExpense}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECE7DE] bg-white text-[#143B2B]"
          >
            <X className="h-4 w-4 stroke-[1.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-[13px] font-light">
          <div>
            <label
              htmlFor="expense-day-input"
              className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
            >
              {t.budget.dayField}
            </label>
            <select
              id="expense-day-input"
              value={dayId}
              onChange={(e) => setDayId(e.target.value)}
              className="w-full rounded-xl border border-[#ECE7DE] bg-white px-3 py-2.5 font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            >
              <option value="global">{t.budget.globalTitle}</option>
              {TRIP_DAYS.map((d) => {
                const dl = getDayLabel(d, lang);
                return (
                  <option key={d.id} value={d.id}>
                    {lang === 'fr' ? 'J' : 'D'}
                    {d.dayNumber} · {dl.dateShort} ({dl.weekdayShort})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label
              htmlFor="expense-title-input"
              className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
            >
              {t.budget.labelField}
            </label>
            <input
              id="expense-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Hot chocolates Covent Garden"
              className="w-full rounded-xl border border-[#ECE7DE] bg-white px-3 py-2.5 font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="expense-amount-input"
                className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
              >
                {amountFieldLabel}
              </label>
              <input
                id="expense-amount-input"
                type="number"
                required
                min="0"
                step="0.01"
                value={amountGbp}
                onChange={(e) => setAmountGbp(e.target.value)}
                placeholder="25.00"
                className="w-full rounded-xl border border-[#ECE7DE] bg-white px-3 py-2.5 font-normal text-[#143B2B] tabular-nums focus:border-[#143B2B] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="expense-category-input"
                className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
              >
                {t.budget.categoryField}
              </label>
              <select
                id="expense-category-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-xl border border-[#ECE7DE] bg-white px-3 py-2.5 font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              >
                {(['activites', 'repas', 'transports', 'shopping'] as const).map(
                  (c) => (
                    <option key={c} value={c}>
                      {getCategoryLabel(c, lang)}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="expense-payment-input"
                className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
              >
                {t.budget.paymentField}
              </label>
              <select
                id="expense-payment-input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-[#ECE7DE] bg-white px-3 py-2.5 font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              >
                <option value="">{t.budget.unspecified}</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="expense-person-input"
                className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
              >
                {t.budget.personField}
              </label>
              <select
                id="expense-person-input"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                className="w-full rounded-xl border border-[#ECE7DE] bg-white px-3 py-2.5 font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              >
                <option value="">{t.budget.unspecified}</option>
                {state.people.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="expense-note-input"
              className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
            >
              {t.budget.noteField}
            </label>
            <input
              id="expense-note-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-[#ECE7DE] bg-white px-3 py-2.5 font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#ECE7DE] bg-white px-3.5 py-2.5">
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              className="h-4 w-4 accent-[#143B2B]"
            />
            <span className="font-normal text-[#143B2B]">
              {t.budget.alreadyPaid}
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#7C2D36]/25 bg-[#FCF5F5] px-3.5 py-2.5 text-[12px] font-normal text-[#7C2D36]"
              >
                <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                {t.delete}
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#ECE7DE] bg-white px-4 py-2.5 text-[12px] font-light text-[#5F7067]"
              >
                {t.cancel}
              </button>
              <button
                id="save-expense-submit"
                type="submit"
                className="rounded-xl bg-[#143B2B] px-5 py-2.5 text-[12px] font-normal text-[#FAF8F4]"
              >
                {t.save}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
