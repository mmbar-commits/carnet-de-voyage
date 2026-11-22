import { useState } from 'react';
import { AlertCircle, CalendarDays, Check, Feather } from 'lucide-react';
import { DAY_MAP, TRIP_DAYS } from '../data/days';
import { JOURNAL_CONTENT } from '../data/journal';
import { useTrip } from '../store/TripContext';
import { DaySelector } from './DaySelector';

const MEMORY_PROMPTS = [
  'Mot d’Aya : «  »',
  'Mot d’Adam : «  »',
  'Coup de cœur : ',
];

export function CarnetTab() {
  const { selectedDayId, state, updateMemory, setActiveTab } = useTrip();
  const [justSaved, setJustSaved] = useState(false);

  const day = DAY_MAP[selectedDayId] ?? TRIP_DAYS[0];
  const entry = JOURNAL_CONTENT[day.id];
  const memory = state.memories[day.id];
  const memoryText = memory?.note ?? '';

  const handleNoteChange = (nextVal: string) => {
    updateMemory(day.id, nextVal);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1600);
  };

  const appendPrompt = (prompt: string) => {
    const prefix = memoryText.trim().length > 0 ? `${memoryText.trimEnd()}\n` : '';
    handleNoteChange(`${prefix}${prompt}`);
  };

  const formattedUpdatedAt = memory?.updatedAt
    ? new Date(memory.updatedAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <section id="tab-panel-carnet" className="space-y-5">
      <DaySelector />

      {/* Editorial Journal Page — authentic French cursive handwriting & breathing room */}
      <article className="ivy-card rounded-3xl px-5 py-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-[#B39258]">
            Journal · Jour {day.dayNumber} sur 11
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('planning')}
            className="inline-flex items-center gap-1 text-[12px] font-normal text-[#5F7067] hover:text-[#143B2B]"
          >
            <CalendarDays className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
            <span>Planning</span>
          </button>
        </div>

        <h2 className="font-editorial mt-2 text-[30px] font-normal leading-tight text-[#143B2B]">
          {day.dateLong}
        </h2>
        <p className="font-editorial mt-1 text-[19px] font-normal italic text-[#5F7067]">
          {entry.subtitle}
        </p>

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

        {/* Airy reading chapters in Playwrite FR Moderne cursive */}
        <div className="mt-6 space-y-6 divide-y divide-[#F1ECE2]">
          <div className="pt-0">
            <h3 className="font-editorial text-[21px] font-medium text-[#143B2B]">
              Le Matin
            </h3>
            <p className="font-hand mt-2.5 text-[13.5px] font-light leading-[2.05] text-[#143B2B]/90">
              {entry.morning}
            </p>
          </div>

          <div className="pt-5">
            <h3 className="font-editorial text-[21px] font-medium text-[#143B2B]">
              Pause Gourmande
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
              L’Après-midi
            </h3>
            <p className="font-hand mt-2.5 text-[13.5px] font-light leading-[2.05] text-[#143B2B]/90">
              {entry.afternoon}
            </p>
          </div>

          <div className="pt-5">
            <h3 className="font-editorial text-[20px] font-medium text-[#143B2B]">
              Note de poche
            </h3>
            <p className="mt-2 text-[13px] font-light leading-[1.7] text-[#5F7067]">
              {entry.logisticsNote}
            </p>
          </div>
        </div>
      </article>

      {/* Editable Memories Notebook */}
      <div className="ivy-card rounded-3xl px-5 py-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Feather className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
            <h3 className="font-editorial text-[22px] font-medium text-[#143B2B]">
              Nos petits mots & souvenirs
            </h3>
          </div>
          <span
            id="carnet-save-status"
            className="inline-flex items-center gap-1 text-[11px] font-light text-[#5F7067]"
          >
            {justSaved ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#143B2B]" />
                <span className="text-[#143B2B]">Enregistré</span>
              </>
            ) : formattedUpdatedAt ? (
              <span>{formattedUpdatedAt}</span>
            ) : (
              <span>Auto</span>
            )}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {MEMORY_PROMPTS.map((prompt) => (
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

        <label className="sr-only" htmlFor="carnet-memory-textarea">
          Nos petits mots et souvenirs du {day.dateLong}
        </label>
        <textarea
          id="carnet-memory-textarea"
          rows={4}
          value={memoryText}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Un mot d’Aya, un rire d’Adam, une belle adresse..."
          className="notebook-paper font-hand mt-3 w-full resize-y rounded-2xl border border-[#ECE7DE] px-4 py-2 text-[13.5px] font-light text-[#143B2B] placeholder:text-[#5F7067]/45 focus:border-[#143B2B] focus:outline-none"
        />
      </div>
    </section>
  );
}
