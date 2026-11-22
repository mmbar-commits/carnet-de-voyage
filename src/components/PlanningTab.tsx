import { useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Plus } from 'lucide-react';
import { DAY_MAP, TRIP_DAYS } from '../data/days';
import { useTrip } from '../store/TripContext';
import type { TripStep } from '../types/trip';
import { DaySelector } from './DaySelector';
import { StepCard } from './StepCard';
import { StepModal } from './StepModal';

export function PlanningTab() {
  const {
    state,
    selectedDayId,
    setActiveTab,
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

  const day = DAY_MAP[selectedDayId] ?? TRIP_DAYS[0];

  const daySteps = useMemo(
    () =>
      state.steps
        .filter((s) => s.dayId === day.id)
        .sort((a, b) => a.order - b.order),
    [state.steps, day.id]
  );

  const doneCount = daySteps.filter((s) => s.done).length;

  return (
    <section id="tab-panel-planning" className="space-y-4">
      <DaySelector />

      {/* Editorial Day Header */}
      <div className="pt-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B39258]">
            Jour {day.dayNumber} · {day.neighborhood}
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('carnet')}
            className="inline-flex items-center gap-1 rounded-full border border-[#E7E2D8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#143B2B] transition hover:border-[#B39258]"
          >
            <BookOpen className="h-3 w-3 text-[#B39258]" />
            <span>Lire le Carnet</span>
          </button>
        </div>

        <h2 className="font-editorial mt-1 text-[28px] font-semibold leading-tight text-[#143B2B]">
          {day.dateLong}
        </h2>
        <p className="mt-0.5 text-[13.5px] text-[#4C6358]">{day.title}</p>

        {/* Mini progress line */}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E7E2D8]">
            <div
              className="h-full rounded-full bg-[#143B2B] transition-all duration-300"
              style={{
                width:
                  daySteps.length === 0
                    ? '0%'
                    : `${Math.round((doneCount / daySteps.length) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[11.5px] font-semibold tabular-nums text-[#4C6358]">
            {doneCount}/{daySteps.length} étape{daySteps.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Critical Calendar Alert Banner — Burgundy ONLY on critical days */}
      {day.criticalBanner && (
        <div
          id={`critical-banner-${day.id}`}
          role="note"
          className="rounded-2xl border border-[#7C2D36]/30 bg-[#FDF3F4] p-3.5 text-[#7C2D36]"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#7C2D36]" />
            <div>
              <p className="text-[12.5px] font-bold tracking-wide">
                {day.criticalBanner.title}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#7C2D36]/90">
                {day.criticalBanner.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-3.5">
        {daySteps.length === 0 ? (
          <div className="ivy-card rounded-2xl p-6 text-center">
            <p className="font-editorial text-[20px] text-[#143B2B]">
              Journée libre pour le moment
            </p>
            <p className="mt-1 text-[13px] text-[#4C6358]">
              Ajoutez une étape ou piochez une idée dans l’onglet Activités.
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

      {/* Add Step CTA */}
      <button
        type="button"
        id="add-step-btn"
        onClick={() => {
          setEditingStep(undefined);
          setModalOpen(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#B39258] bg-white/80 py-3.5 text-[13.5px] font-semibold text-[#143B2B] transition hover:bg-white"
      >
        <Plus className="h-4 w-4 text-[#B39258]" />
        <span>Ajouter une étape ce jour</span>
      </button>

      {modalOpen && (
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
