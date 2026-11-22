import { useState, type FormEvent } from 'react';
import { Trash2, X } from 'lucide-react';
import { TRIP_DAYS } from '../data/days';
import type {
  BookingStatus,
  KidCompatibility,
  StepKind,
  TripStep,
} from '../types/trip';

interface StepModalProps {
  defaultDayId: string;
  initialStep?: TripStep;
  onClose: () => void;
  onSave: (data: Omit<TripStep, 'id' | 'order'>) => void;
  onDelete?: () => void;
}

export function StepModal({
  defaultDayId,
  initialStep,
  onClose,
  onSave,
  onDelete,
}: StepModalProps) {
  const [dayId, setDayId] = useState(initialStep?.dayId ?? defaultDayId);
  const [kind, setKind] = useState<StepKind>(initialStep?.kind ?? 'activite');
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
    initialStep?.ayaNote ?? 'Activité adaptée à Aya (8 ans)'
  );
  const [adamRating, setAdamRating] = useState<KidCompatibility>(
    initialStep?.adamRating ?? 'Adapté'
  );
  const [adamNote, setAdamNote] = useState(
    initialStep?.adamNote ?? 'Activité pensée pour Adam (4 ans)'
  );
  const [costGbp, setCostGbp] = useState(
    typeof initialStep?.costGbp === 'number' ? String(initialStep.costGbp) : ''
  );
  const [costNote, setCostNote] = useState(initialStep?.costNote ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const parsedCost = costGbp.trim() === '' ? undefined : Number(costGbp);
    onSave({
      dayId,
      kind,
      timeStart: timeStart.trim() || '10h00',
      timeEnd: timeEnd.trim() || undefined,
      title: title.trim(),
      location: location.trim() || 'Londres',
      transport: transport.trim() || undefined,
      description: description.trim() || 'Étape familiale ajoutée au planning.',
      ayaRating,
      ayaNote: ayaNote.trim() || 'Adapté',
      adamRating,
      adamNote: adamNote.trim() || 'Adapté',
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
            {initialStep ? 'Modifier l’étape' : 'Nouvelle étape'}
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
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#E7E2D8] bg-white p-1">
            {(
              [
                ['activite', 'Activité'],
                ['repas', 'Repas'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setKind(val)}
                className={`rounded-lg py-1.5 text-[12px] font-medium transition ${
                  kind === val
                    ? val === 'repas'
                      ? 'bg-[#EFE1C6] text-[#5C3F17]'
                      : 'bg-[#143B2B] text-[#FAF8F4]'
                    : 'text-[#5F7067]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-3 sm:col-span-1">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                Jour
              </label>
              <select
                value={dayId}
                onChange={(e) => setDayId(e.target.value)}
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              >
                {TRIP_DAYS.map((d) => (
                  <option key={d.id} value={d.id}>
                    J{d.dayNumber} · {d.dateShort}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                Début
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
                Fin
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
              Titre de l’étape *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Chocolat chaud chez Fortnum & Mason"
              className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                Lieu / Quartier
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Piccadilly, Mayfair"
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                Accès / Transport
              </label>
              <input
                type="text"
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                placeholder="À pied / Piccadilly Line"
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                Statut réservation
              </label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
                className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              >
                <option value="a_reserver">À réserver</option>
                <option value="reserve">Réservé</option>
                <option value="sur_place">Sur place</option>
                <option value="entree_libre">Entrée libre</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#4C6358]">
                Coût prévu (£ GBP)
              </label>
              <input
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
              Note tarifaire (optionnel)
            </label>
            <input
              type="text"
              value={costNote}
              onChange={(e) => setCostNote(e.target.value)}
              placeholder="Ex. Gratuit pour les enfants"
              className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E7E2D8] bg-white p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#143B2B]">Aya (8 ans)</span>
                <select
                  value={ayaRating}
                  onChange={(e) => setAyaRating(e.target.value as KidCompatibility)}
                  className="rounded-lg border border-[#E7E2D8] bg-[#FAF8F4] px-2 py-0.5 text-[11px]"
                >
                  <option value="Top">Top</option>
                  <option value="Adapté">Adapté</option>
                  <option value="Calme">Calme</option>
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
                <span className="text-[11px] font-bold text-[#143B2B]">Adam (4 ans)</span>
                <select
                  value={adamRating}
                  onChange={(e) => setAdamRating(e.target.value as KidCompatibility)}
                  className="rounded-lg border border-[#E7E2D8] bg-[#FAF8F4] px-2 py-0.5 text-[11px]"
                >
                  <option value="Top">Top</option>
                  <option value="Adapté">Adapté</option>
                  <option value="Calme">Calme</option>
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
                type="submit"
                className="rounded-xl bg-[#143B2B] px-5 py-2.5 text-[12.5px] font-semibold text-[#FAF8F4] shadow-xs hover:bg-[#1E543E]"
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
