import { useState, type FormEvent } from 'react';
import { Trash2, X } from 'lucide-react';
import { getCurrencyChipLabel } from '../data/currencies';
import {
  getTransportModeLabel,
  isValidTransportMode,
  TRANSPORT_MODES,
} from '../data/transports';
import {
  getBookingLabel,
  getDayLabel,
  getKidRatingLabel,
  UI_TEXT,
} from '../i18n/translations';
import { useTrip } from '../store/TripContext';
import type {
  BookingStatus,
  KidCompatibility,
  StepKind,
  TransportMode,
  TripStep,
} from '../types/trip';
import { TransportModeIcon } from './TransportModeIcon';

interface StepModalProps {
  defaultDayId: string;
  initialStep?: TripStep;
  onClose: () => void;
  onSave: (data: Omit<TripStep, 'id' | 'order'>) => void;
  onDelete?: () => void;
}

const BOOKING_OPTIONS: BookingStatus[] = [
  'a_reserver',
  'reserve',
  'sur_place',
  'entree_libre',
];

const KID_RATING_OPTIONS: KidCompatibility[] = ['Top', 'Adapté', 'Calme'];

export function StepModal({
  defaultDayId,
  initialStep,
  onClose,
  onSave,
  onDelete,
}: StepModalProps) {
  const { days, state, lang } = useTrip();
  const t = UI_TEXT[lang];
  const tm = t.stepModal;
  const tripCurrencyChip = getCurrencyChipLabel(state.currencies.tripCurrency);

  const [dayId, setDayId] = useState(initialStep?.dayId ?? defaultDayId);
  const [kind, setKind] = useState<StepKind>(initialStep?.kind ?? 'activite');
  const [transportMode, setTransportMode] = useState<TransportMode>(
    isValidTransportMode(initialStep?.transportMode)
      ? initialStep.transportMode
      : 'avion'
  );
  const [timeStart, setTimeStart] = useState(initialStep?.timeStart ?? '10h30');
  const [timeEnd, setTimeEnd] = useState(initialStep?.timeEnd ?? '');
  const [title, setTitle] = useState(initialStep?.title ?? '');
  const [location, setLocation] = useState(initialStep?.location ?? '');
  const [transport, setTransport] = useState(initialStep?.transport ?? '');
  const [description, setDescription] = useState(initialStep?.description ?? '');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(
    initialStep?.bookingStatus ?? 'entree_libre'
  );
  const [ayaRating, setAyaRating] = useState<KidCompatibility>(
    initialStep?.ayaRating ?? 'Top'
  );
  const [ayaNote, setAyaNote] = useState(
    initialStep?.ayaNote ?? tm.ayaDefaultNote
  );
  const [adamRating, setAdamRating] = useState<KidCompatibility>(
    initialStep?.adamRating ?? 'Adapté'
  );
  const [adamNote, setAdamNote] = useState(
    initialStep?.adamNote ?? tm.adamDefaultNote
  );
  const [costGbp, setCostGbp] = useState(
    typeof initialStep?.costGbp === 'number' ? String(initialStep.costGbp) : ''
  );
  const [costNote, setCostNote] = useState(initialStep?.costNote ?? '');

  const isTransport = kind === 'transport';
  const showKidRatings = !isTransport && Boolean(state.meta.isLondonDefault);

  const handleKindChange = (nextKind: StepKind) => {
    setKind(nextKind);
    if (nextKind === 'transport' && !isValidTransportMode(transportMode)) {
      setTransportMode('avion');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const parsedCost = costGbp.trim() === '' ? undefined : Number(costGbp);
    const defaultDesc = isTransport
      ? tm.defaultTransportDescription
      : tm.defaultDescription;

    onSave({
      dayId,
      kind,
      transportMode: isTransport ? transportMode : undefined,
      timeStart: timeStart.trim() || '10h00',
      timeEnd: timeEnd.trim() || undefined,
      title: title.trim(),
      location: location.trim() || state.meta.destination,
      transport: transport.trim() || undefined,
      description: description.trim() || defaultDesc,
      ayaRating: isTransport ? initialStep?.ayaRating ?? 'Adapté' : ayaRating,
      ayaNote: isTransport
        ? initialStep?.ayaNote ?? 'Adapté'
        : ayaNote.trim() || 'Adapté',
      adamRating: isTransport ? initialStep?.adamRating ?? 'Adapté' : adamRating,
      adamNote: isTransport
        ? initialStep?.adamNote ?? 'Adapté'
        : adamNote.trim() || 'Adapté',
      bookingStatus,
      done: initialStep?.done ?? false,
      costGbp:
        typeof parsedCost === 'number' && !Number.isNaN(parsedCost)
          ? Math.max(0, parsedCost)
          : undefined,
      costNote: costNote.trim() || undefined,
      isTowerHamletsBenefit: initialStep?.isTowerHamletsBenefit,
      fullPriceGbp: initialStep?.fullPriceGbp,
      tags: initialStep?.tags,
      bonusActivityId: initialStep?.bonusActivityId,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="step-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#143B2B]/40 p-0 backdrop-blur-xs sm:items-center sm:p-4"
    >
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#E7E2D8] bg-[#FAF8F4] p-5 shadow-xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-3">
          <h2
            id="step-modal-title"
            className="font-editorial text-[24px] font-semibold text-[#143B2B]"
          >
            {initialStep ? t.editStep : t.newStep}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={tm.close}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E2D8] bg-white text-[#143B2B]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-[13px]">
          <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#E7E2D8] bg-white p-1">
            {(
              [
                ['activite', t.activity],
                ['repas', t.meal],
                ['transport', t.transport],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                id={`step-kind-${val}`}
                type="button"
                aria-pressed={kind === val}
                onClick={() => handleKindChange(val)}
                className={`rounded-lg py-1.5 text-[12px] font-medium transition ${
                  kind === val
                    ? val === 'repas'
                      ? 'bg-[#EFE1C6] text-[#5C3F17]'
                      : val === 'transport'
                        ? 'bg-[#E4EFE9] text-[#143B2B]'
                        : 'bg-[#143B2B] text-[#FAF8F4]'
                    : 'text-[#5F7067] hover:text-[#143B2B]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isTransport && (
            <div id="transport-mode-selector">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                {tm.transportModeLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TRANSPORT_MODES.map((mode) => {
                  const active = transportMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      id={`transport-mode-${mode.id}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setTransportMode(mode.id)}
                      className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11.5px] font-medium transition ${
                        active
                          ? 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4] shadow-xs'
                          : 'border-[#ECE7DE] bg-[#FFFFFF] text-[#4C6358] hover:border-[#143B2B]/40 hover:text-[#143B2B]'
                      }`}
                    >
                      <TransportModeIcon
                        mode={mode.id}
                        className="h-3.5 w-3.5 shrink-0 stroke-[1.7]"
                      />
                      <span className="truncate">
                        {getTransportModeLabel(mode.id, lang)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                {tm.day}
              </label>
              <select
                value={dayId}
                onChange={(e) => setDayId(e.target.value)}
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              >
                {days.map((d) => {
                  const dl = getDayLabel(d, lang);
                  return (
                    <option key={d.id} value={d.id}>
                      {lang === 'fr' ? 'J' : 'D'}
                      {d.dayNumber} · {dl.dateShort}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                {tm.start}
              </label>
              <input
                type="text"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                placeholder="10h00"
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                {tm.end}
              </label>
              <input
                type="text"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                placeholder="12h00"
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
              {tm.titleLabel}
            </label>
            <input
              id="step-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isTransport ? tm.transportTitlePlaceholder : tm.titlePlaceholder
              }
              className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                {isTransport ? tm.transportLocationLabel : tm.locationLabel}
              </label>
              <input
                id="step-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={
                  isTransport
                    ? tm.transportLocationPlaceholder
                    : state.meta.destination
                }
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                {isTransport ? tm.transportDetailsLabel : tm.accessLabel}
              </label>
              <input
                id="step-transport-input"
                type="text"
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                placeholder={
                  isTransport
                    ? tm.transportDetailsPlaceholder
                    : tm.accessPlaceholder
                }
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
              {tm.descriptionLabel}
            </label>
            <textarea
              id="step-description-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isTransport ? tm.transportDescriptionPlaceholder : undefined
              }
              className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                {tm.bookingStatusLabel}
              </label>
              <select
                id="step-booking-select"
                value={bookingStatus}
                onChange={(e) =>
                  setBookingStatus(e.target.value as BookingStatus)
                }
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              >
                {BOOKING_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {getBookingLabel(status, lang)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                {tm.costLabel} ({tripCurrencyChip})
              </label>
              <input
                id="step-cost-input"
                type="number"
                min="0"
                step="0.5"
                value={costGbp}
                onChange={(e) => setCostGbp(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
              {tm.costNoteLabel}
            </label>
            <input
              type="text"
              value={costNote}
              onChange={(e) => setCostNote(e.target.value)}
              placeholder={
                isTransport
                  ? tm.transportCostNotePlaceholder
                  : tm.costNotePlaceholder
              }
              className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
          </div>

          {showKidRatings && (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E7E2D8] bg-white p-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#143B2B]">
                    {tm.ayaLabel}
                  </span>
                  <select
                    value={ayaRating}
                    onChange={(e) =>
                      setAyaRating(e.target.value as KidCompatibility)
                    }
                    className="rounded-lg border border-[#E7E2D8] bg-[#FAF8F4] px-2 py-0.5 text-[11px]"
                  >
                    {KID_RATING_OPTIONS.map((rating) => (
                      <option key={rating} value={rating}>
                        {getKidRatingLabel(rating, lang)}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={ayaNote}
                  onChange={(e) => setAyaNote(e.target.value)}
                  className="w-full rounded-lg border border-[#E7E2D8] bg-[#FAF8F4] px-2.5 py-1.5 text-[12px]"
                />
              </div>

              <div className="rounded-xl border border-[#E7E2D8] bg-white p-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#143B2B]">
                    {tm.adamLabel}
                  </span>
                  <select
                    value={adamRating}
                    onChange={(e) =>
                      setAdamRating(e.target.value as KidCompatibility)
                    }
                    className="rounded-lg border border-[#E7E2D8] bg-[#FAF8F4] px-2 py-0.5 text-[11px]"
                  >
                    {KID_RATING_OPTIONS.map((rating) => (
                      <option key={rating} value={rating}>
                        {getKidRatingLabel(rating, lang)}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={adamNote}
                  onChange={(e) => setAdamNote(e.target.value)}
                  className="w-full rounded-lg border border-[#E7E2D8] bg-[#FAF8F4] px-2.5 py-1.5 text-[12px]"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            {initialStep && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#7C2D36]/30 bg-[#FDF3F4] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#7C2D36]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t.delete}
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
                {t.cancel}
              </button>
              <button
                id="step-save-btn"
                type="submit"
                className="rounded-xl bg-[#143B2B] px-5 py-2.5 text-[12.5px] font-semibold text-[#FAF8F4] shadow-xs hover:bg-[#1E543E]"
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
