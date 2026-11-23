import { useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Plus } from 'lucide-react';
import { DAY_MAP, TRIP_DAYS } from '../data/days';
import { getDayLabel, UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';
import type { TripStep } from '../types/trip';
import { DaySelector } from './DaySelector';
import { StepCard } from './StepCard';
import { StepModal } from './StepModal';

export function PlanningTab() {
  const {
    lang,
    state,
    selectedDayId,
    setActiveTab,
    canEdit,
    toggleStepDone,
    cycleStepBookingStatus,
    addStep,
    updateStep,
    deleteStep,
    moveStepOrder,
    moveStepToDay,
  } = useTrip();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<TripStep | undefined>(undefined);

  const t = UI_TEXT[lang];
  const day = DAY_MAP[selectedDayId] ?? TRIP_DAYS[0];
  const dayLbl = getDayLabel(day, lang);

  const daySteps = useMemo(
    () =>
      state.steps
        .filter((s) => s.dayId === day.id)
        .sort((a, b) => a.order - b.order),
    [state.steps, day.id]
  );

  const doneCount = daySteps.filter((s) => s.done).length;

  return (
    <section id="tab-panel-planning" className="space-y-5">
      <DaySelector />

      <div className="pt-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-[#B39258]">
            {t.dayPrefix} {day.dayNumber} · {day.neighborhood}
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('carnet')}
            className="inline-flex items-center gap-1 text-[12px] font-normal text-[#5F7067] transition hover:text-[#143B2B]"
          >
            <BookOpen className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
            <span>{t.nav.carnet}</span>
          </button>
        </div>

        <h2 className="font-editorial mt-1.5 text-[30px] font-normal leading-tight text-[#143B2B]">
          {dayLbl.dateLong}
        </h2>
        <p className="mt-1 text-[13.5px] font-light text-[#5F7067]">{day.title}</p>

        {daySteps.length > 0 && (
          <div className="mt-3.5 flex items-center gap-3">
            <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#ECE7DE]">
              <div
                className="h-full rounded-full bg-[#143B2B] transition-all duration-300"
                style={{
                  width: `${Math.round((doneCount / daySteps.length) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[11px] font-light tabular-nums text-[#5F7067]">
              {doneCount}/{daySteps.length}
            </span>
          </div>
        )}
      </div>

      {day.criticalBanner && (
        <div
          id={`critical-banner-${day.id}`}
          role="note"
          className="rounded-2xl border border-[#7C2D36]/20 bg-[#FCF5F5] px-4 py-3.5 text-[#7C2D36]"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6]" />
            <div className="space-y-1">
              <p className="text-[12.5px] font-medium">
                {day.criticalBanner.title}
              </p>
              <p className="text-[12.5px] font-light leading-relaxed text-[#7C2D36]/85">
                {day.criticalBanner.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3.5">
        {daySteps.length === 0 ? (
          <div className="ivy-card rounded-2xl px-5 py-8 text-center">
            <p className="font-editorial text-[22px] font-normal text-[#143B2B]">
              {t.freeDayTitle}
            </p>
            <p className="mt-1 text-[13px] font-light text-[#5F7067]">
              {t.freeDayDesc}
            </p>
          </div>
        ) : (
          daySteps.map((step, idx) => (
            <StepCard
              key={step.id}
              step={step}
              index={idx}
              total={daySteps.length}
              onToggleDone={() => toggleStepDone(step.id)}
              onCycleBooking={() => cycleStepBookingStatus(step.id)}
              onEdit={() => {
                setEditingStep(step);
                setModalOpen(true);
              }}
              onMoveUp={() => moveStepOrder(step.id, 'up')}
              onMoveDown={() => moveStepOrder(step.id, 'down')}
              onMoveToDay={(targetDayId) => moveStepToDay(step.id, targetDayId)}
            />
          ))
        )}
      </div>

      {canEdit && (
        <button
          type="button"
          id="add-step-btn"
          onClick={() => {
            setEditingStep(undefined);
            setModalOpen(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#D8CEBC] bg-white/60 py-3.5 text-[13px] font-normal text-[#143B2B] transition hover:border-[#B39258] hover:bg-white"
        >
          <Plus className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
          <span>{t.addStep}</span>
        </button>
      )}

      {canEdit && modalOpen && (
        <StepModal
          defaultDayId={day.id}
          initialStep={editingStep}
          onClose={() => setModalOpen(false)}
          onSave={(data) => {
            if (editingStep) {
              updateStep(editingStep.id, data);
            } else {
              addStep(data);
            }
          }}
          onDelete={
            editingStep ? () => deleteStep(editingStep.id) : undefined
          }
        />
      )}
    </section>
  );
}
