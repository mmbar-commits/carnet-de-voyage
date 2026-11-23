import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
} from 'lucide-react';
import { BONUS_ACTIVITIES } from '../data/bonusActivities';
import { DAY_MAP, TRIP_DAYS } from '../data/days';
import { getDayLabel, getTagLabel, UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';
import type { ActivityTag, BonusActivity } from '../types/trip';

type ScopeFilter = 'all' | 'planned' | 'bonus';
const ALL_TAGS: ActivityTag[] = ['gratuit', 'resident_th', 'interieur', 'top_4_ans'];

export function ActivitesTab() {
  const { lang, state, selectedDayId, assignBonusActivity, navigateToDay, canEdit } =
    useTrip();
  const t = UI_TEXT[lang];
  const [scope, setScope] = useState<ScopeFilter>('bonus');
  const [activeTags, setActiveTags] = useState<ActivityTag[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [targetDayId, setTargetDayId] = useState<string>(selectedDayId);
  const [targetTime, setTargetTime] = useState<string>('14h30');
  const [justAssigned, setJustAssigned] = useState<Record<string, string>>({});

  const toggleTag = (tag: ActivityTag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
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

  const plannedActivities = useMemo(
    () => state.steps.filter((s) => s.kind !== 'repas'),
    [state.steps]
  );

  const filteredPlanned = useMemo(() => {
    if (scope === 'bonus') return [];
    return plannedActivities.filter((step) => {
      if (activeTags.length === 0) return true;
      const stepTags = step.tags ?? [];
      return activeTags.every((tag) => stepTags.includes(tag));
    });
  }, [scope, plannedActivities, activeTags]);

  const filteredBonus = useMemo(() => {
    if (scope === 'planned') return [];
    return BONUS_ACTIVITIES.filter((act) => {
      if (activeTags.length === 0) return true;
      return activeTags.every((tag) => act.tags.includes(tag));
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
    <section id="tab-panel-activites" className="space-y-5">
      <div className="pt-2">
        <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-[#B39258]">
          {t.activities.eyebrow}
        </span>
        <h2 className="font-editorial mt-1 text-[30px] font-normal leading-tight text-[#143B2B]">
          {t.activities.title}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-[#ECE7DE] bg-white p-1">
        {(
          [
            ['bonus', `${t.activities.bonus} (${BONUS_ACTIVITIES.length})`],
            ['planned', `${t.activities.planned} (${plannedActivities.length})`],
            ['all', t.activities.all],
          ] as const
        ).map(([val, label]) => (
          <button
            key={val}
            id={`activities-scope-${val}`}
            type="button"
            onClick={() => setScope(val)}
            className={`rounded-xl py-2 text-[12px] transition ${
              scope === val
                ? 'bg-[#143B2B] font-medium text-[#FAF8F4]'
                : 'font-light text-[#5F7067] hover:text-[#143B2B]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
        {ALL_TAGS.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              id={`activities-tag-${tag}`}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] transition ${
                active
                  ? 'border-[#143B2B] bg-[#143B2B] font-medium text-[#FAF8F4]'
                  : 'border-[#ECE7DE] bg-white font-light text-[#143B2B]'
              }`}
            >
              {getTagLabel(tag, lang)}
            </button>
          );
        })}
      </div>

      {filteredBonus.length > 0 && (
        <div className="space-y-3.5">
          {scope === 'all' && (
            <h3 className="font-editorial text-[22px] font-normal text-[#143B2B]">
              {t.activities.bonusHeading}
            </h3>
          )}

          {filteredBonus.map((act) => {
            const assignedDayId = assignedBonusMap.get(act.id) || justAssigned[act.id];
            const assignedDay = assignedDayId ? DAY_MAP[assignedDayId] : undefined;
            const isPicking = assigningId === act.id;
            const isExpanded = expandedId === act.id;

            return (
              <article
                key={act.id}
                id={`bonus-card-${act.id}`}
                className="ivy-card rounded-2xl p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-light text-[#8F7038]">
                    <span>{act.costLabel}</span>
                    <span className="text-[#D4CBB9]">•</span>
                    <span>{act.duration}</span>
                  </div>
                  <h4 className="font-editorial mt-1 text-[21px] font-medium leading-snug text-[#143B2B]">
                    {act.title}
                  </h4>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] font-light text-[#5F7067]">
                    <MapPin className="h-3.5 w-3.5 shrink-0 stroke-[1.5] text-[#B39258]" />
                    <span className="truncate">{act.neighborhood}</span>
                  </p>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-2.5 border-t border-[#F2EDE4] pt-3 text-[13px] font-light leading-relaxed text-[#143B2B]/90">
                    <p>{act.description}</p>
                    <p className="text-[12px] text-[#5F7067]">
                      {t.activities.access} : {act.transport}
                    </p>
                    <div className="space-y-1.5 rounded-xl bg-[#FAF8F4] px-3 py-2.5 text-[12px] text-[#5F7067]">
                      <p>
                        <span className="font-medium text-[#143B2B]">Aya — </span>
                        {act.ayaNote}
                      </p>
                      <p>
                        <span className="font-medium text-[#143B2B]">Adam — </span>
                        {act.adamNote}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-3.5 border-t border-[#F2EDE4] pt-3">
                  {isPicking ? (
                    <div className="space-y-2.5 rounded-xl bg-[#FAF8F4] p-3">
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={targetDayId}
                          onChange={(e) => setTargetDayId(e.target.value)}
                          className="col-span-2 rounded-lg border border-[#ECE7DE] bg-white px-2.5 py-2 text-[12px] font-normal text-[#143B2B]"
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
                        <input
                          type="text"
                          value={targetTime}
                          onChange={(e) => setTargetTime(e.target.value)}
                          className="rounded-lg border border-[#ECE7DE] bg-white px-2.5 py-2 text-[12px] font-normal text-[#143B2B]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAssigningId(null)}
                          className="rounded-lg border border-[#ECE7DE] bg-white px-3 py-1.5 text-[12px] font-light text-[#5F7067]"
                        >
                          {t.cancel}
                        </button>
                        <button
                          type="button"
                          id={`confirm-assign-${act.id}`}
                          onClick={() => confirmAssign(act)}
                          className="rounded-lg bg-[#143B2B] px-3.5 py-1.5 text-[12px] font-medium text-[#FAF8F4]"
                        >
                          {t.add}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : act.id)}
                        className="inline-flex items-center gap-1 text-[12px] font-light text-[#8F7038]"
                      >
                        <span>{isExpanded ? t.less : t.details}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 stroke-[1.5]" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 stroke-[1.5]" />
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        {assignedDay && (
                          <button
                            type="button"
                            onClick={() => navigateToDay(assignedDay.id, 'planning')}
                            className="inline-flex items-center gap-1 rounded-full bg-[#F8F3E9] px-2.5 py-1 text-[11px] font-medium text-[#143B2B]"
                          >
                            <Check className="h-3 w-3" />
                            <span>
                              {lang === 'fr' ? 'J' : 'D'}
                              {assignedDay.dayNumber}
                            </span>
                          </button>
                        )}
                        {canEdit && (
                          <button
                            type="button"
                            id={`assign-btn-${act.id}`}
                            onClick={() => openAssignPicker(act)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#143B2B] px-3 py-1.5 text-[12px] font-normal text-[#FAF8F4]"
                          >
                            <CalendarPlus className="h-3.5 w-3.5 stroke-[1.5] text-[#D7BD8A]" />
                            <span>{t.activities.assign}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {filteredPlanned.length > 0 && (
        <div className="space-y-3">
          {scope === 'all' && (
            <h3 className="font-editorial pt-1 text-[22px] font-normal text-[#143B2B]">
              {t.activities.plannedHeading}
            </h3>
          )}
          {filteredPlanned.map((step) => {
            const day = DAY_MAP[step.dayId];
            const dl = day ? getDayLabel(day, lang) : undefined;
            return (
              <div
                key={step.id}
                className="ivy-card flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-light text-[#8F7038]">
                    {day && dl && (
                      <span>
                        {lang === 'fr' ? 'J' : 'D'}
                        {day.dayNumber} · {dl.dateShort}
                      </span>
                    )}
                    <span className="text-[#D4CBB9]">•</span>
                    <span className="tabular-nums">{step.timeStart}</span>
                  </div>
                  <p className="font-editorial mt-0.5 truncate text-[19px] font-medium text-[#143B2B]">
                    {step.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigateToDay(step.dayId, 'planning')}
                  aria-label="Open in Plan"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ECE7DE] bg-[#FAF8F4] text-[#143B2B]"
                >
                  <ArrowRight className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {filteredBonus.length === 0 && filteredPlanned.length === 0 && (
        <div className="ivy-card rounded-2xl p-6 text-center">
          <p className="font-editorial text-[20px] font-normal text-[#143B2B]">
            {t.activities.empty}
          </p>
          <button
            type="button"
            onClick={() => {
              setScope('all');
              setActiveTags([]);
            }}
            className="mt-3 rounded-xl bg-[#143B2B] px-4 py-2 text-[12px] font-normal text-[#FAF8F4]"
          >
            {t.activities.showAll}
          </button>
        </div>
      )}
    </section>
  );
}
