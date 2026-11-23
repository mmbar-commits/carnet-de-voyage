import { useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  Check,
  ExternalLink,
  Feather,
  Map as MapIcon,
} from 'lucide-react';
import { DAY_MAP, TRIP_DAYS } from '../data/days';
import { JOURNAL_CONTENT } from '../data/journal';
import { getDayLabel, UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';
import type { DayRoute } from '../types/trip';
import { DayRouteMap } from './DayRouteMap';
import { DaySelector } from './DaySelector';
import { WeatherStrip } from './WeatherBadge';

function buildExternalRouteUrl(route: DayRoute): string {
  const origin = route.stops[0]?.query || 'Mayfair, London, UK';
  const destination =
    route.stops[route.stops.length - 1]?.query || 'Mayfair, London, UK';
  const waypoints = route.stops
    .slice(1, -1)
    .map((s) => s.query)
    .join('|');
  const travelmode = route.mode === 'r' ? 'transit' : 'walking';

  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode,
  });
  if (waypoints) {
    params.set('waypoints', waypoints);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function CarnetTab() {
  const { lang, selectedDayId, state, updateMemory, setActiveTab, canEdit, weatherByDay } =
    useTrip();
  const [justSaved, setJustSaved] = useState(false);

  const t = UI_TEXT[lang];
  const day = DAY_MAP[selectedDayId] ?? TRIP_DAYS[0];
  const dayLbl = getDayLabel(day, lang);
  const dayWeather = weatherByDay[day.id];
  const entry = JOURNAL_CONTENT[day.id];
  const memory = state.memories[day.id];
  const memoryText = memory?.note ?? '';

  const handleNoteChange = (nextVal: string) => {
    if (!canEdit) return;
    updateMemory(day.id, nextVal);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1600);
  };

  const appendPrompt = (prompt: string) => {
    if (!canEdit) return;
    const prefix = memoryText.trim().length > 0 ? `${memoryText.trimEnd()}\n` : '';
    handleNoteChange(`${prefix}${prompt}`);
  };

  const formattedUpdatedAt = memory?.updatedAt
    ? new Date(memory.updatedAt).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const externalMapUrl = buildExternalRouteUrl(entry.route);

  return (
    <section id="tab-panel-carnet" className="space-y-5">
      <DaySelector />

      {/* Editorial Journal Page */}
      <article className="ivy-card rounded-3xl px-5 py-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-[#B39258]">
            {t.journal.badge} · {t.dayPrefix} {day.dayNumber} {t.ofDays}
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('planning')}
            className="inline-flex items-center gap-1 text-[12px] font-normal text-[#5F7067] hover:text-[#143B2B]"
          >
            <CalendarDays className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
            <span>{t.nav.planning}</span>
          </button>
        </div>

        <h2 className="font-editorial mt-2 text-[30px] font-normal leading-tight text-[#143B2B]">
          {dayLbl.dateLong}
        </h2>
        <p className="font-editorial mt-1 text-[19px] font-normal italic text-[#5F7067]">
          {entry.subtitle}
        </p>

        {dayWeather && (
          <WeatherStrip weather={dayWeather} lang={lang} surface="ivory" className="mt-3.5" />
        )}

        <p className="font-margin mt-4 border-l border-[#B39258] pl-3.5 text-[22px] font-normal leading-snug text-[#8F7038]">
          « {entry.marginQuote} »
        </p>

        {day.criticalBanner && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[#FCF5F5] px-3.5 py-3 text-[12.5px] font-light leading-relaxed text-[#7C2D36]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5]" />
            <p>
              <span className="font-medium">{day.criticalBanner.title} — </span>
              {day.criticalBanner.message}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-6 divide-y divide-[#F1ECE2]">
          <div className="pt-0">
            <h3 className="font-editorial text-[21px] font-medium text-[#143B2B]">
              {t.journal.morning}
            </h3>
            <p className="font-hand mt-2.5 text-[13.5px] font-light leading-[2.05] text-[#143B2B]/90">
              {entry.morning}
            </p>
          </div>

          <div className="pt-5">
            <h3 className="font-editorial text-[21px] font-medium text-[#143B2B]">
              {t.journal.lunch}
            </h3>
            <p className="mt-0.5 text-[11.5px] font-normal tracking-wide text-[#8F7038]">
              {entry.lunchTitle}
            </p>
            <p className="font-hand mt-2.5 text-[13.5px] font-light leading-[2.05] text-[#143B2B]/90">
              {entry.lunch}
            </p>
          </div>

          <div className="pt-5">
            <h3 className="font-editorial text-[21px] font-medium text-[#143B2B]">
              {t.journal.afternoon}
            </h3>
            <p className="font-hand mt-2.5 text-[13.5px] font-light leading-[2.05] text-[#143B2B]/90">
              {entry.afternoon}
            </p>
          </div>

          <div className="pt-5">
            <h3 className="font-editorial text-[20px] font-medium text-[#143B2B]">
              {t.journal.logistics}
            </h3>
            <p className="mt-2 text-[13px] font-light leading-[1.7] text-[#5F7067]">
              {entry.logisticsNote}
            </p>
          </div>
        </div>
      </article>

      {/* Editable Memories Notebook (read-only for viewers) */}
      {(canEdit || memoryText.trim().length > 0) && (
        <div className="ivy-card rounded-3xl px-5 py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Feather className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              <h3 className="font-editorial text-[22px] font-medium text-[#143B2B]">
                {t.journal.memories}
              </h3>
            </div>
            {canEdit && (
              <span
                id="carnet-save-status"
                className="inline-flex items-center gap-1 text-[11px] font-light text-[#5F7067]"
              >
                {justSaved ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#143B2B]" />
                    <span className="text-[#143B2B]">{t.journal.saved}</span>
                  </>
                ) : formattedUpdatedAt ? (
                  <span>{formattedUpdatedAt}</span>
                ) : (
                  <span>{t.journal.auto}</span>
                )}
              </span>
            )}
          </div>

          {canEdit && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.journal.prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => appendPrompt(prompt)}
                  className="rounded-full border border-[#ECE7DE] bg-[#FAF8F4] px-2.5 py-1 text-[11px] font-light text-[#143B2B] transition hover:border-[#B39258]"
                >
                  + {prompt.split(':')[0]}
                </button>
              ))}
            </div>
          )}

          <label className="sr-only" htmlFor="carnet-memory-textarea">
            {t.journal.memories}
          </label>
          <textarea
            id="carnet-memory-textarea"
            rows={4}
            readOnly={!canEdit}
            value={memoryText}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder={canEdit ? t.journal.placeholder : ''}
            className="notebook-paper font-hand mt-3 w-full resize-y rounded-2xl border border-[#ECE7DE] px-4 py-2 text-[13.5px] font-light text-[#143B2B] placeholder:text-[#5F7067]/45 focus:border-[#143B2B] focus:outline-none"
          />
        </div>
      )}

      {/* Custom Ivy Collection Styled Day Itinerary Map (zero clutter overlays) */}
      <div
        id={`journal-map-card-${day.id}`}
        className="ivy-card overflow-hidden rounded-3xl"
      >
        <div className="px-5 pt-4 pb-3.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                <h3 className="font-editorial text-[22px] font-medium text-[#143B2B]">
                  {t.journal.routeTitle}
                </h3>
              </div>
              <p className="mt-0.5 text-[11px] font-light text-[#5F7067]">
                {entry.route.mode === 'w' ? t.journal.walkHint : t.journal.transitHint}
              </p>
            </div>

            <a
              id={`journal-maps-open-${day.id}`}
              href={externalMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#ECE7DE] bg-[#FAF8F4] px-2.5 py-1 text-[11px] font-normal text-[#143B2B] transition hover:border-[#B39258]"
            >
              <span>{t.openMaps}</span>
              <ExternalLink className="h-3 w-3 stroke-[1.5] text-[#B39258]" />
            </a>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11.5px] font-light text-[#5F7067]">
            {entry.route.stops.map((stop, idx) => (
              <span key={stop.label} className="inline-flex items-center gap-1">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#143B2B] text-[9.5px] font-medium text-[#FAF8F4] ring-1 ring-[#B39258]">
                  {idx + 1}
                </span>
                <span className="text-[#143B2B]">{stop.label}</span>
                {idx < entry.route.stops.length - 1 && (
                  <span className="text-[#C8BCA6]">→</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-[#ECE7DE]">
          <DayRouteMap dayId={day.id} route={entry.route} />
        </div>
      </div>
    </section>
  );
}
