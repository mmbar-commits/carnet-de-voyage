import { useEffect, useRef } from 'react';
import { TRIP_DAYS } from '../data/days';
import { useTrip } from '../store/TripContext';

export function DaySelector() {
  const { selectedDayId, setSelectedDayId, state } = useTrip();
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

  return (
    <div className="sticky top-[57px] z-20 -mx-5 border-b border-[#ECE7DE]/90 bg-[#FAF8F4]/95 px-5 py-2.5 backdrop-blur-md">
      <div
        ref={scrollRef}
        id="day-selector-strip"
        role="tablist"
        aria-label="Sélecteur des 11 jours du séjour"
        className="no-scrollbar flex gap-2 overflow-x-auto"
      >
        {TRIP_DAYS.map((day) => {
          const isSelected = day.id === selectedDayId;
          const daySteps = state.steps.filter((s) => s.dayId === day.id);
          const allDone = daySteps.length > 0 && daySteps.every((s) => s.done);

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
              className={`relative flex min-w-[62px] shrink-0 flex-col items-center rounded-xl border px-2 py-2 transition-all ${
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
                {day.weekdayShort}
              </span>
              <span className="mt-0.5 text-[12.5px] font-medium tabular-nums leading-tight">
                {day.dateShort}
              </span>
              <div className="mt-1 flex h-1.5 items-center gap-1">
                {day.isCritical && (
                  <span
                    title="Jour à contrainte calendaire"
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSelected ? 'bg-[#E9A6AE]' : 'bg-[#7C2D36]/80'
                    }`}
                  />
                )}
                {allDone && (
                  <span
                    title="Toutes les étapes réalisées"
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSelected ? 'bg-[#D7BD8A]' : 'bg-[#B39258]'
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
