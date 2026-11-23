import { useEffect, useRef } from 'react';
import { getDayLabel } from '../i18n/translations';
import { useTrip } from '../store/TripContext';
import { WeatherIcon } from './WeatherBadge';

export function DaySelector() {
  const { lang, days, selectedDayId, setSelectedDayId, state, canEdit, weatherByDay } = useTrip();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const el = buttonRefs.current[selectedDayId];
    if (el && scrollRef.current) {
      el.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedDayId]);

  const hasAnyIndicator = days.some((d) => {
    const dSteps = state.steps.filter((s) => s.dayId === d.id);
    return (
      Boolean(weatherByDay[d.id]) ||
      Boolean(d.isCritical) ||
      (dSteps.length > 0 && dSteps.every((s) => s.done))
    );
  });

  return (
    <div
      className={`sticky z-20 -mx-5 border-b border-[#ECE7DE]/90 bg-[#FAF8F4]/95 px-5 py-2.5 backdrop-blur-md ${
        canEdit ? 'top-[57px]' : 'top-[88px]'
      }`}
    >
      <div
        ref={scrollRef}
        id="day-selector-strip"
        role="tablist"
        aria-label={`${days.length}-day selector`}
        className="no-scrollbar flex gap-2 overflow-x-auto"
      >
        {days.map((day) => {
          const isSelected = day.id === selectedDayId;
          const daySteps = state.steps.filter((s) => s.dayId === day.id);
          const allDone = daySteps.length > 0 && daySteps.every((s) => s.done);
          const lbl = getDayLabel(day, lang);
          const dayWeather = weatherByDay[day.id];

          return (
            <button
              key={day.id}
              ref={(node) => {
                buttonRefs.current[day.id] = node;
              }}
              id={`day-pill-${day.id}`}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => setSelectedDayId(day.id)}
              className={`relative flex min-w-[62px] shrink-0 flex-col items-center rounded-xl border px-2 transition-all ${
                hasAnyIndicator ? 'py-1.5' : 'py-2'
              } ${
                isSelected
                  ? 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
                  : 'border-[#ECE7DE] bg-white/80 text-[#143B2B] hover:border-[#B39258]/70'
              }`}
            >
              <span
                className={`text-[9.5px] font-normal uppercase tracking-widest ${
                  isSelected ? 'text-[#D7BD8A]' : 'text-[#5F7067]'
                }`}
              >
                {lbl.weekdayShort}
              </span>
              <span className="mt-0.5 text-[12.5px] font-medium tabular-nums leading-tight">
                {lbl.dateShort}
              </span>
              {hasAnyIndicator && (
                <div className="mt-1 flex h-3 items-center justify-center gap-1">
                  {dayWeather && (
                    <WeatherIcon
                      kind={dayWeather.kind}
                      className={`h-3 w-3 shrink-0 stroke-[1.6] ${
                        isSelected ? 'text-[#D7BD8A]' : 'text-[#B39258]'
                      }`}
                    />
                  )}
                  {day.isCritical && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected ? 'bg-[#E9A6AE]' : 'bg-[#7C2D36]/80'
                      }`}
                    />
                  )}
                  {allDone && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected ? 'bg-[#D7BD8A]' : 'bg-[#B39258]'
                      }`}
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
