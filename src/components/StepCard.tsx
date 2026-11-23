import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation,
  Pencil,
  TrainFront,
  UtensilsCrossed,
} from 'lucide-react';
import { TRIP_DAYS } from '../data/days';
import {
  getBookingLabel,
  getDayLabel,
  getKidRatingLabel,
  UI_TEXT,
} from '../i18n/translations';
import { useTrip } from '../store/TripContext';
import type { BookingStatus, TripStep } from '../types/trip';

const BOOKING_STYLE: Record<BookingStatus, string> = {
  a_reserver: 'border-[#B39258]/50 bg-[#F8F3E9] text-[#83662F]',
  reserve: 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]',
  sur_place: 'border-[#ECE7DE] bg-[#F4F0E8] text-[#143B2B]',
  entree_libre: 'border-[#ECE7DE] bg-white text-[#5F7067]',
};

function buildMapsUrl(step: TripStep): string {
  const raw = step.location.trim();
  const segments = raw.split('→').map((s) => s.trim()).filter(Boolean);
  let target = segments.length > 1 ? segments[segments.length - 1] : raw;

  if (/casablanca|cmn/i.test(target)) {
    target = 'London Heathrow Airport, UK';
  } else if (!/london|londres|heathrow|uk/i.test(target)) {
    target = `${target}, London, UK`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    target
  )}&travelmode=transit`;
}

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
  const { lang, canEdit } = useTrip();
  const t = UI_TEXT[lang];
  const [expanded, setExpanded] = useState(false);
  const mapsUrl = buildMapsUrl(step);
  const isMeal = step.kind === 'repas';

  return (
    <article
      id={`step-card-${step.id}`}
      data-kind={isMeal ? 'repas' : 'activite'}
      className={`rounded-2xl border px-4 transition-opacity ${
        isMeal ? 'border-[#E6D4B8] bg-[#FBF5EA] py-3.5' : 'ivy-card py-4'
      } ${step.done ? 'opacity-60' : ''}`}
    >
      {/* Top quiet row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-[12px] font-normal tabular-nums ${
              isMeal ? 'text-[#8C6226]' : 'text-[#8F7038]'
            }`}
          >
            {step.timeStart}
            {step.timeEnd ? ` – ${step.timeEnd}` : ''}
          </span>

          {isMeal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EFE1C6] px-2.5 py-0.5 text-[10.5px] font-medium text-[#7A531C]">
              <UtensilsCrossed className="h-2.5 w-2.5 stroke-[1.7]" />
              <span>{t.meal}</span>
            </span>
          )}

          {canEdit ? (
            <button
              type="button"
              id={`booking-btn-${step.id}`}
              onClick={onCycleBooking}
              className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium transition ${
                BOOKING_STYLE[step.bookingStatus]
              }`}
            >
              {getBookingLabel(step.bookingStatus, lang)}
            </button>
          ) : (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium ${
                BOOKING_STYLE[step.bookingStatus]
              }`}
            >
              {getBookingLabel(step.bookingStatus, lang)}
            </span>
          )}

          {step.isTowerHamletsBenefit && (
            <span className="rounded-full bg-[#F8F3E9] px-2 py-0.5 text-[10.5px] font-medium text-[#83662F]">
              TH £1
            </span>
          )}
        </div>

        {canEdit ? (
          <button
            type="button"
            id={`done-btn-${step.id}`}
            onClick={onToggleDone}
            aria-pressed={step.done}
            aria-label="Toggle done"
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
              step.done
                ? isMeal
                  ? 'border-[#8C6226] bg-[#8C6226] text-[#FAF8F4]'
                  : 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
                : isMeal
                  ? 'border-[#D9C39F] bg-white/80 text-transparent hover:border-[#8C6226]'
                  : 'border-[#DDD6C9] bg-white text-transparent hover:border-[#143B2B]'
            }`}
          >
            <Check className="h-3.5 w-3.5 stroke-[2]" />
          </button>
        ) : step.done ? (
          <span
            aria-label="Done"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
              isMeal
                ? 'border-[#8C6226] bg-[#8C6226] text-[#FAF8F4]'
                : 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
            }`}
          >
            <Check className="h-3 w-3 stroke-[2]" />
          </span>
        ) : null}
      </div>

      {/* Editorial title */}
      <h3
        className={`font-editorial mt-2 font-medium leading-[1.22] ${
          isMeal ? 'text-[20px] text-[#4E3514]' : 'text-[22px] text-[#143B2B]'
        } ${step.done ? 'line-through decoration-[#B39258]/70' : ''}`}
      >
        {step.title}
      </h3>

      {/* Location + compact Maps button */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p
          className={`flex min-w-0 items-center gap-1.5 text-[12.5px] font-light ${
            isMeal ? 'text-[#735A38]' : 'text-[#5F7067]'
          }`}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 stroke-[1.5] text-[#B39258]" />
          <span className="truncate">{step.location}</span>
        </p>

        <a
          id={`maps-btn-${step.id}`}
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Maps: ${step.title}`}
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-normal transition ${
            isMeal
              ? 'border-[#E2CFAF] bg-white/80 text-[#5C3F17] hover:border-[#B39258]'
              : 'border-[#ECE7DE] bg-[#FAF8F4] text-[#143B2B] hover:border-[#B39258]'
          }`}
        >
          <Navigation className="h-3 w-3 stroke-[1.6] text-[#B39258]" />
          <span>{t.maps}</span>
        </a>
      </div>

      {/* Compact meta bar + expand trigger */}
      <div
        className={`mt-2.5 flex items-center justify-between gap-2 border-t pt-2 ${
          isMeal ? 'border-[#ECE0CA]' : 'border-[#F2EDE4]'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-light text-[#5F7067]">
          <span>Aya · {getKidRatingLabel(step.ayaRating, lang)}</span>
          <span className="text-[#D4CBB9]">•</span>
          <span>Adam · {getKidRatingLabel(step.adamRating, lang)}</span>
          {typeof step.costGbp === 'number' && (
            <>
              <span className="text-[#D4CBB9]">•</span>
              <span className="font-normal text-[#143B2B]">
                {step.costGbp === 0 ? t.free : `£${step.costGbp}`}
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
          <span>{expanded ? t.less : t.details}</span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 stroke-[1.6]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 stroke-[1.6]" />
          )}
        </button>
      </div>

      {/* Progressive disclosure */}
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

          <div className="space-y-2 rounded-xl bg-white/70 px-3.5 py-3 text-[12.5px] font-light leading-relaxed text-[#5F7067]">
            <p>
              <span className="font-medium text-[#143B2B]">Aya (8) — </span>
              {step.ayaNote}
            </p>
            <p>
              <span className="font-medium text-[#143B2B]">Adam (4) — </span>
              {step.adamNote}
            </p>
          </div>

          {step.costNote && (
            <p className="text-[12px] font-light text-[#83662F]">
              {step.costNote}
            </p>
          )}

          {canEdit && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onMoveUp}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ECE7DE] bg-white text-[#143B2B] disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>
                <button
                  type="button"
                  onClick={onMoveDown}
                  disabled={index === total - 1}
                  aria-label="Move down"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ECE7DE] bg-white text-[#143B2B] disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>

                <select
                  id={`move-day-${step.id}`}
                  value={step.dayId}
                  onChange={(e) => onMoveToDay(e.target.value)}
                  className="h-7 rounded-lg border border-[#ECE7DE] bg-[#FAF8F4] px-2 text-[11px] font-normal text-[#143B2B]"
                >
                  {TRIP_DAYS.map((d) => {
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

              <button
                type="button"
                id={`edit-step-btn-${step.id}`}
                onClick={onEdit}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[#ECE7DE] bg-white px-2.5 text-[11.5px] font-normal text-[#143B2B]"
              >
                <Pencil className="h-3 w-3 stroke-[1.5] text-[#B39258]" />
                <span>{t.edit}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
