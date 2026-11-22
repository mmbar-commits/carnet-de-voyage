import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
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
      'border-[#B39258]/50 bg-[#F8F3E9] text-[#83662F]',
  },
  reserve: {
    label: 'Réservé',
    className:
      'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]',
  },
  sur_place: {
    label: 'Sur place',
    className:
      'border-[#ECE7DE] bg-[#F4F0E8] text-[#143B2B]',
  },
  entree_libre: {
    label: 'Libre',
    className:
      'border-[#ECE7DE] bg-white text-[#5F7067]',
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
  const [expanded, setExpanded] = useState(false);
  const booking = BOOKING_META[step.bookingStatus];

  return (
    <article
      id={`step-card-${step.id}`}
      className={`ivy-card rounded-2xl px-4 py-4 transition-opacity ${
        step.done ? 'bg-[#FDFCF9] opacity-65' : ''
      }`}
    >
      {/* Top quiet row: time + clickable booking pill + minimal check circle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-normal tabular-nums text-[#8F7038]">
            {step.timeStart}
            {step.timeEnd ? ` – ${step.timeEnd}` : ''}
          </span>

          <button
            type="button"
            id={`booking-btn-${step.id}`}
            onClick={onCycleBooking}
            title="Toucher pour changer le statut"
            className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium transition ${booking.className}`}
          >
            {booking.label}
          </button>

          {step.isTowerHamletsBenefit && (
            <span className="rounded-full bg-[#F8F3E9] px-2 py-0.5 text-[10.5px] font-medium text-[#83662F]">
              TH £1
            </span>
          )}
        </div>

        <button
          type="button"
          id={`done-btn-${step.id}`}
          onClick={onToggleDone}
          aria-pressed={step.done}
          aria-label={step.done ? 'Marquer comme à faire' : 'Marquer comme fait'}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
            step.done
              ? 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
              : 'border-[#DDD6C9] bg-white text-transparent hover:border-[#143B2B]'
          }`}
        >
          <Check className="h-3.5 w-3.5 stroke-[2]" />
        </button>
      </div>

      {/* Editorial title */}
      <h3
        className={`font-editorial mt-2.5 text-[22px] font-medium leading-[1.22] text-[#143B2B] ${
          step.done ? 'line-through decoration-[#B39258]/70' : ''
        }`}
      >
        {step.title}
      </h3>

      {/* Single quiet location line */}
      <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-light text-[#5F7067]">
        <MapPin className="h-3.5 w-3.5 shrink-0 stroke-[1.5] text-[#B39258]" />
        <span className="truncate">{step.location}</span>
      </p>

      {/* Compact meta bar + expand trigger */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#F2EDE4]">
        <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-light text-[#5F7067]">
          <span>Aya · {step.ayaRating}</span>
          <span className="text-[#D4CBB9]">•</span>
          <span>Adam · {step.adamRating}</span>
          {typeof step.costGbp === 'number' && (
            <>
              <span className="text-[#D4CBB9]">•</span>
              <span className="font-normal text-[#143B2B]">
                {step.costGbp === 0 ? 'Gratuit' : `£${step.costGbp}`}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          id={`expand-step-btn-${step.id}`}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-normal text-[#8F7038]"
        >
          <span>{expanded ? 'Réduire' : 'Détails'}</span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 stroke-[1.6]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 stroke-[1.6]" />
          )}
        </button>
      </div>

      {/* Progressive disclosure: full details, transport, kids notes & actions */}
      {expanded && (
        <div className="mt-3.5 space-y-3.5 border-t border-[#F2EDE4] pt-3.5">
          {step.transport && (
            <p className="flex items-start gap-2 text-[12.5px] font-light leading-relaxed text-[#5F7067]">
              <TrainFront className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.5] text-[#B39258]" />
              <span>{step.transport}</span>
            </p>
          )}

          <p className="text-[13.5px] font-light leading-[1.65] text-[#143B2B]/90">
            {step.description}
          </p>

          <div className="space-y-2 rounded-xl bg-[#FAF8F4] px-3.5 py-3 text-[12.5px] font-light leading-relaxed text-[#5F7067]">
            <p>
              <span className="font-medium text-[#143B2B]">Aya (8 ans) — </span>
              {step.ayaNote}
            </p>
            <p>
              <span className="font-medium text-[#143B2B]">Adam (4 ans) — </span>
              {step.adamNote}
            </p>
          </div>

          {step.costNote && (
            <p className="text-[12px] font-light text-[#83662F]">
              {step.costNote}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0}
                aria-label="Monter l'étape"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ECE7DE] bg-white text-[#143B2B] disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5 stroke-[1.5]" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={index === total - 1}
                aria-label="Descendre l'étape"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ECE7DE] bg-white text-[#143B2B] disabled:opacity-30"
              >
                <ArrowDown className="h-3.5 w-3.5 stroke-[1.5]" />
              </button>

              <label className="sr-only" htmlFor={`move-day-${step.id}`}>
                Déplacer vers un autre jour
              </label>
              <select
                id={`move-day-${step.id}`}
                value={step.dayId}
                onChange={(e) => onMoveToDay(e.target.value)}
                className="h-7 rounded-lg border border-[#ECE7DE] bg-[#FAF8F4] px-2 text-[11px] font-normal text-[#143B2B]"
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
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[#ECE7DE] bg-white px-2.5 text-[11.5px] font-normal text-[#143B2B]"
            >
              <Pencil className="h-3 w-3 stroke-[1.5] text-[#B39258]" />
              <span>Modifier</span>
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
