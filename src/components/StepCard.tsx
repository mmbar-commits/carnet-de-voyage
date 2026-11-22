import {
  ArrowDown,
  ArrowUp,
  Award,
  Check,
  Clock,
  MapPin,
  Pencil,
  TrainFront,
} from 'lucide-react';
import { TRIP_DAYS } from '../data/days';
import type { BookingStatus, TripStep } from '../types/trip';

const BOOKING_META: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  a_reserver: {
    label: 'À réserver',
    className:
      'border-[#B39258]/60 bg-[#F7F1E4] text-[#7A5E28] hover:border-[#B39258]',
  },
  reserve: {
    label: 'Réservé',
    className:
      'border-[#143B2B]/30 bg-[#143B2B] text-[#FAF8F4] hover:bg-[#1E543E]',
  },
  sur_place: {
    label: 'Sur place',
    className:
      'border-[#E7E2D8] bg-[#F3EFE7] text-[#143B2B] hover:border-[#B39258]',
  },
  entree_libre: {
    label: 'Entrée libre',
    className:
      'border-[#E7E2D8] bg-white text-[#4C6358] hover:border-[#B39258]',
  },
};

interface StepCardProps {
  step: TripStep;
  index: number;
  total: number;
  onToggleDone: () => void;
  onCycleBooking: () => void;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToDay: (dayId: string) => void;
}

export function StepCard({
  step,
  index,
  total,
  onToggleDone,
  onCycleBooking,
  onEdit,
  onMoveUp,
  onMoveDown,
  onMoveToDay,
}: StepCardProps) {
  const booking = BOOKING_META[step.bookingStatus];

  return (
    <article
      id={`step-card-${step.id}`}
      className={`ivy-card rounded-2xl p-4 transition-all ${
        step.done ? 'bg-[#FCFBF8] opacity-80' : ''
      }`}
    >
      {/* Top row: time + clickable booking pill + Done toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold tabular-nums text-[#8F7038]">
            <Clock className="h-3.5 w-3.5 text-[#B39258]" />
            {step.timeStart}
            {step.timeEnd ? ` – ${step.timeEnd}` : ''}
          </span>

          <button
            type="button"
            id={`booking-btn-${step.id}`}
            onClick={onCycleBooking}
            title="Cliquer pour changer le statut de réservation"
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${booking.className}`}
          >
            {booking.label}
          </button>

          {step.isTowerHamletsBenefit && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#B39258]/50 bg-[#F7F1E4] px-2 py-0.5 text-[10.5px] font-semibold text-[#143B2B]">
              <Award className="h-3 w-3 text-[#B39258]" />
              Résident TH £1
            </span>
          )}
        </div>

        <button
          type="button"
          id={`done-btn-${step.id}`}
          onClick={onToggleDone}
          aria-pressed={step.done}
          aria-label={step.done ? 'Marquer comme à faire' : 'Marquer comme fait'}
          className={`flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold transition ${
            step.done
              ? 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
              : 'border-[#E7E2D8] bg-[#FAF8F4] text-[#4C6358] hover:border-[#143B2B]'
          }`}
        >
          <Check className="h-3.5 w-3.5" />
          <span>{step.done ? 'Fait' : 'Fait ?'}</span>
        </button>
      </div>

      {/* Title */}
      <h3
        className={`font-editorial mt-2.5 text-[21px] font-semibold leading-snug text-[#143B2B] ${
          step.done ? 'line-through decoration-[#B39258]/70' : ''
        }`}
      >
        {step.title}
      </h3>

      {/* Location & Transport */}
      <div className="mt-1.5 space-y-1 text-[12px] text-[#4C6358]">
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B39258]" />
          <span>{step.location}</span>
        </p>
        {step.transport && (
          <p className="flex items-start gap-1.5">
            <TrainFront className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B39258]" />
            <span>{step.transport}</span>
          </p>
        )}
      </div>

      {/* Description */}
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#143B2B]/85">
        {step.description}
      </p>

      {/* Kids compatibility: Aya (8 ans) & Adam (4 ans) */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E7E2D8]/80 bg-[#FAF8F4] px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#143B2B]">
              Aya · 8 ans
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8F7038] border border-[#E7E2D8]">
              {step.ayaRating}
            </span>
          </div>
          <p className="mt-1 text-[12px] leading-snug text-[#4C6358]">
            {step.ayaNote}
          </p>
        </div>

        <div className="rounded-xl border border-[#E7E2D8]/80 bg-[#FAF8F4] px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#143B2B]">
              Adam · 4 ans
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8F7038] border border-[#E7E2D8]">
              {step.adamRating}
            </span>
          </div>
          <p className="mt-1 text-[12px] leading-snug text-[#4C6358]">
            {step.adamNote}
          </p>
        </div>
      </div>

      {/* Cost note if present */}
      {(typeof step.costGbp === 'number' || step.costNote) && (
        <div className="mt-2.5 flex items-center justify-between rounded-lg bg-[#F7F1E4]/55 px-3 py-1.5 text-[12px] text-[#143B2B]">
          <span className="truncate pr-2 text-[#4C6358]">
            {step.costNote || 'Budget activité'}
          </span>
          {typeof step.costGbp === 'number' && (
            <span className="shrink-0 font-bold tabular-nums text-[#143B2B]">
              {step.costGbp === 0 ? 'Gratuit' : `£${step.costGbp}`}
            </span>
          )}
        </div>
      )}

      {/* Subtle footer actions */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#E7E2D8]/70 pt-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Monter l'étape"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E7E2D8] bg-white text-[#143B2B] transition hover:border-[#B39258] disabled:opacity-35"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Descendre l'étape"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E7E2D8] bg-white text-[#143B2B] transition hover:border-[#B39258] disabled:opacity-35"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>

          <label className="sr-only" htmlFor={`move-day-${step.id}`}>
            Déplacer vers un autre jour
          </label>
          <select
            id={`move-day-${step.id}`}
            value={step.dayId}
            onChange={(e) => onMoveToDay(e.target.value)}
            className="ml-1 h-7 rounded-lg border border-[#E7E2D8] bg-[#FAF8F4] px-2 text-[11px] font-medium text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
          >
            {TRIP_DAYS.map((d) => (
              <option key={d.id} value={d.id}>
                J{d.dayNumber} · {d.dateShort}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          id={`edit-step-btn-${step.id}`}
          onClick={onEdit}
          className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#E7E2D8] bg-white px-2.5 text-[11.5px] font-semibold text-[#143B2B] transition hover:border-[#B39258]"
        >
          <Pencil className="h-3 w-3 text-[#B39258]" />
          <span>Modifier</span>
        </button>
      </div>
    </article>
  );
}
