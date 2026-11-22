import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  CalendarPlus,
  Check,
  Clock,
  MapPin,
  Sparkles,
  TrainFront,
} from 'lucide-react';
import { BONUS_ACTIVITIES } from '../data/bonusActivities';
import { DAY_MAP, TRIP_DAYS } from '../data/days';
import { useTrip } from '../store/TripContext';
import type { ActivityTag, BonusActivity } from '../types/trip';

type ScopeFilter = 'all' | 'planned' | 'bonus';

const TAG_LABELS: Record<ActivityTag, string> = {
  gratuit: 'Gratuit',
  resident_th: 'Résident TH',
  interieur: 'Intérieur',
  top_4_ans: 'Top 4 ans',
};

const ALL_TAGS: ActivityTag[] = ['gratuit', 'resident_th', 'interieur', 'top_4_ans'];

export function ActivitesTab() {
  const { state, selectedDayId, assignBonusActivity, navigateToDay } = useTrip();
  const [scope, setScope] = useState<ScopeFilter>('all');
  const [activeTags, setActiveTags] = useState<ActivityTag[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [targetDayId, setTargetDayId] = useState<string>(selectedDayId);
  const [targetTime, setTargetTime] = useState<string>('14h30');
  const [justAssigned, setJustAssigned] = useState<Record<string, string>>({});

  const toggleTag = (tag: ActivityTag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const assignedBonusMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const step of state.steps) {
      if (step.bonusActivityId) {
        map.set(step.bonusActivityId, step.dayId);
      }
    }
    return map;
  }, [state.steps]);

  const filteredPlanned = useMemo(() => {
    if (scope === 'bonus') return [];
    return state.steps.filter((step) => {
      if (activeTags.length === 0) return true;
      const stepTags = step.tags ?? [];
      return activeTags.every((t) => stepTags.includes(t));
    });
  }, [scope, state.steps, activeTags]);

  const filteredBonus = useMemo(() => {
    if (scope === 'planned') return [];
    return BONUS_ACTIVITIES.filter((act) => {
      if (activeTags.length === 0) return true;
      return activeTags.every((t) => act.tags.includes(t));
    });
  }, [scope, activeTags]);

  const openAssignPicker = (activity: BonusActivity) => {
    setAssigningId(activity.id);
    setTargetDayId(selectedDayId);
    setTargetTime(activity.suggestedTime);
  };

  const confirmAssign = (activity: BonusActivity) => {
    assignBonusActivity(activity, targetDayId, targetTime);
    setAssigningId(null);
    setJustAssigned((prev) => ({ ...prev, [activity.id]: targetDayId }));
  };

  return (
    <section id="tab-panel-activites" className="space-y-4">
      {/* Editorial Intro */}
      <div className="pt-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B39258]">
          Catalogue Londres · Aya & Adam
        </span>
        <h2 className="font-editorial mt-1 text-[28px] font-semibold leading-tight text-[#143B2B]">
          Activités & Idées Bonus
        </h2>
        <p className="mt-0.5 text-[13px] text-[#4C6358]">
          Filtrez selon la météo ou l’âge d’Adam, et affectez une idée bonus à
          n’importe quelle journée en un clic.
        </p>
      </div>

      {/* Scope segmented control */}
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-[#E7E2D8] bg-white p-1">
        {(
          [
            ['all', `Toutes (${state.steps.length + BONUS_ACTIVITIES.length})`],
            ['planned', `Planifiées (${state.steps.length})`],
            ['bonus', `Bonus (${BONUS_ACTIVITIES.length})`],
          ] as const
        ).map(([val, label]) => (
          <button
            key={val}
            id={`activities-scope-${val}`}
            type="button"
            onClick={() => setScope(val)}
            className={`rounded-xl py-2 text-[12px] font-semibold transition ${
              scope === val
                ? 'bg-[#143B2B] text-[#FAF8F4] shadow-xs'
                : 'text-[#4C6358] hover:text-[#143B2B]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Multi-tag filters */}
      <div className="flex flex-wrap items-center gap-2">
        {ALL_TAGS.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              id={`activities-tag-${tag}`}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                active
                  ? 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
                  : 'border-[#E7E2D8] bg-white text-[#143B2B] hover:border-[#B39258]'
              }`}
            >
              {tag === 'resident_th' && <Award className="h-3.5 w-3.5 text-[#B39258]" />}
              <span>{TAG_LABELS[tag]}</span>
            </button>
          );
        })}
        {activeTags.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTags([])}
            className="text-[11.5px] font-semibold text-[#8F7038] underline underline-offset-2"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Bonus Ideas Section */}
      {filteredBonus.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pt-1">
            <Sparkles className="h-4 w-4 text-[#B39258]" />
            <h3 className="font-editorial text-[22px] font-semibold text-[#143B2B]">
              Idées Bonus à affecter ({filteredBonus.length})
            </h3>
          </div>

          {filteredBonus.map((act) => {
            const assignedDayId = assignedBonusMap.get(act.id) || justAssigned[act.id];
            const assignedDay = assignedDayId ? DAY_MAP[assignedDayId] : undefined;
            const isPicking = assigningId === act.id;

            return (
              <article
                key={act.id}
                id={`bonus-card-${act.id}`}
                className="ivy-card rounded-2xl p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {act.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-[#E7E2D8] bg-[#FAF8F4] px-2 py-0.5 text-[10.5px] font-semibold text-[#4C6358]"
                      >
                        {TAG_LABELS[t]}
                      </span>
                    ))}
                  </div>
                  <span className="text-[12px] font-bold text-[#143B2B]">
                    {act.costLabel}
                  </span>
                </div>

                <h4 className="font-editorial mt-2 text-[21px] font-semibold leading-snug text-[#143B2B]">
                  {act.title}
                </h4>

                <div className="mt-1.5 space-y-1 text-[12px] text-[#4C6358]">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B39258]" />
                    <span>
                      {act.neighborhood} · {act.duration}
                    </span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <TrainFront className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B39258]" />
                    <span>{act.transport}</span>
                  </p>
                </div>

                <p className="mt-2 text-[13px] leading-relaxed text-[#143B2B]/85">
                  {act.description}
                </p>

                <div className="mt-2.5 grid grid-cols-1 gap-1.5 text-[11.5px] sm:grid-cols-2">
                  <div className="rounded-xl bg-[#FAF8F4] px-2.5 py-1.5 text-[#4C6358]">
                    <strong className="text-[#143B2B]">Aya (8 ans) :</strong>{' '}
                    {act.ayaNote}
                  </div>
                  <div className="rounded-xl bg-[#FAF8F4] px-2.5 py-1.5 text-[#4C6358]">
                    <strong className="text-[#143B2B]">Adam (4 ans) :</strong>{' '}
                    {act.adamNote}
                  </div>
                </div>

                {/* Assign controls */}
                <div className="mt-3 border-t border-[#E7E2D8]/70 pt-3">
                  {isPicking ? (
                    <div className="space-y-2.5 rounded-xl border border-[#B39258]/40 bg-[#FAF8F4] p-3">
                      <p className="text-[12px] font-semibold text-[#143B2B]">
                        Choisir le jour & l’horaire :
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={targetDayId}
                          onChange={(e) => setTargetDayId(e.target.value)}
                          className="col-span-2 rounded-lg border border-[#E7E2D8] bg-white px-2.5 py-2 text-[12px] text-[#143B2B]"
                        >
                          {TRIP_DAYS.map((d) => (
                            <option key={d.id} value={d.id}>
                              J{d.dayNumber} · {d.dateShort} ({d.weekdayShort})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={targetTime}
                          onChange={(e) => setTargetTime(e.target.value)}
                          className="rounded-lg border border-[#E7E2D8] bg-white px-2.5 py-2 text-[12px] text-[#143B2B]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAssigningId(null)}
                          className="rounded-lg border border-[#E7E2D8] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4C6358]"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          id={`confirm-assign-${act.id}`}
                          onClick={() => confirmAssign(act)}
                          className="rounded-lg bg-[#143B2B] px-3.5 py-1.5 text-[12px] font-semibold text-[#FAF8F4]"
                        >
                          Ajouter au Planning
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {assignedDay ? (
                        <button
                          type="button"
                          onClick={() => navigateToDay(assignedDay.id, 'planning')}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#143B2B]/25 bg-[#143B2B]/5 px-3 py-1 text-[11.5px] font-semibold text-[#143B2B]"
                        >
                          <Check className="h-3.5 w-3.5 text-[#143B2B]" />
                          <span>
                            Planifié J{assignedDay.dayNumber} ({assignedDay.dateShort})
                          </span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11.5px] text-[#4C6358]">
                          <Clock className="h-3.5 w-3.5 text-[#B39258]" />
                          Horaire conseillé : {act.suggestedTime}
                        </span>
                      )}

                      <button
                        type="button"
                        id={`assign-btn-${act.id}`}
                        onClick={() => openAssignPicker(act)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#143B2B] px-3.5 py-2 text-[12px] font-semibold text-[#FAF8F4] transition hover:bg-[#1E543E]"
                      >
                        <CalendarPlus className="h-3.5 w-3.5 text-[#D7BD8A]" />
                        <span>
                          {assignedDay ? 'Affecter un autre jour' : 'Affecter à un jour'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Planned Activities Section */}
      {filteredPlanned.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="font-editorial text-[22px] font-semibold text-[#143B2B]">
            Déjà au Planning ({filteredPlanned.length})
          </h3>
          {filteredPlanned.map((step) => {
            const day = DAY_MAP[step.dayId];
            return (
              <div
                key={step.id}
                className="ivy-card flex items-center justify-between gap-3 rounded-2xl p-3.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {day && (
                      <span className="rounded-full bg-[#F7F1E4] px-2 py-0.5 text-[10.5px] font-bold text-[#8F7038]">
                        J{day.dayNumber} · {day.dateShort}
                      </span>
                    )}
                    <span className="text-[11px] font-medium tabular-nums text-[#4C6358]">
                      {step.timeStart}
                    </span>
                    {step.isTowerHamletsBenefit && (
                      <span className="rounded-full bg-[#143B2B] px-2 py-0.5 text-[10px] font-semibold text-[#FAF8F4]">
                        TH £1
                      </span>
                    )}
                  </div>
                  <p className="font-editorial mt-1 truncate text-[19px] font-semibold text-[#143B2B]">
                    {step.title}
                  </p>
                  <p className="truncate text-[12px] text-[#4C6358]">{step.location}</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigateToDay(step.dayId, 'planning')}
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-[#E7E2D8] bg-[#FAF8F4] px-3 py-2 text-[11.5px] font-semibold text-[#143B2B] transition hover:border-[#B39258]"
                >
                  <span>Voir</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#B39258]" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {filteredBonus.length === 0 && filteredPlanned.length === 0 && (
        <div className="ivy-card rounded-2xl p-6 text-center">
          <p className="font-editorial text-[20px] text-[#143B2B]">
            Aucune activité ne correspond à ces filtres
          </p>
          <button
            type="button"
            onClick={() => {
              setScope('all');
              setActiveTags([]);
            }}
            className="mt-3 rounded-xl bg-[#143B2B] px-4 py-2 text-[12.5px] font-semibold text-[#FAF8F4]"
          >
            Afficher tout le catalogue
          </button>
        </div>
      )}
    </section>
  );
}
