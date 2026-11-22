import { useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Coffee,
  Compass,
  Feather,
  Sun,
  Sunrise,
} from 'lucide-react';
import { DAY_MAP, TRIP_DAYS } from '../data/days';
import { JOURNAL_CONTENT } from '../data/journal';
import { useTrip } from '../store/TripContext';
import { DaySelector } from './DaySelector';

const MEMORY_PROMPTS = [
  'Mot d’Aya : «  »',
  'Mot d’Adam : «  »',
  'Coup de cœur du jour : ',
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
    <section id="tab-panel-carnet" className="space-y-4">
      <DaySelector />

      {/* Editorial Journal Sheet */}
      <article className="ivy-card overflow-hidden rounded-3xl">
        {/* Top editorial banner inside card */}
        <div className="border-b border-[#E7E2D8] bg-[#FCFBF8] px-5 pt-5 pb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B39258]">
              Carnet · Jour {day.dayNumber} sur 11
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('planning')}
              className="inline-flex items-center gap-1 rounded-full border border-[#E7E2D8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#143B2B] transition hover:border-[#B39258]"
            >
              <CalendarDays className="h-3 w-3 text-[#B39258]" />
              <span>Voir le Planning</span>
            </button>
          </div>

          <h2 className="font-editorial mt-1.5 text-[29px] font-semibold leading-tight text-[#143B2B]">
            {day.dateLong}
          </h2>
          <p className="font-editorial mt-1 text-[18px] italic text-[#4C6358]">
            {entry.subtitle}
          </p>

          {/* Margin annotation in Caveat */}
          <div className="mt-3 flex items-center gap-2 border-l-2 border-[#B39258] pl-3">
            <p className="font-margin text-[20px] leading-snug text-[#8F7038]">
              « {entry.marginQuote} »
            </p>
          </div>
        </div>

        {/* Critical reminder if applicable */}
        {day.criticalBanner && (
          <div className="border-b border-[#7C2D36]/20 bg-[#FDF3F4] px-5 py-3 text-[#7C2D36]">
            <p className="flex items-start gap-2 text-[12px] leading-relaxed">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>{day.criticalBanner.title} :</strong>{' '}
                {day.criticalBanner.message}
              </span>
            </p>
          </div>
        )}

        {/* Narrative body in Kalam */}
        <div className="space-y-6 px-5 py-5">
          {/* Le Matin */}
          <div>
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-[#B39258]" />
              <h3 className="font-editorial text-[21px] font-semibold text-[#143B2B]">
                Le Matin
              </h3>
            </div>
            <p className="font-hand mt-2 text-[15.5px] leading-[1.8] text-[#143B2B]/90">
              {entry.morning}
            </p>
          </div>

          {/* Pause Gourmande */}
          <div className="rounded-2xl border border-[#E7E2D8] bg-[#FAF8F4] p-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-[#B39258]" />
              <h3 className="font-editorial text-[20px] font-semibold text-[#143B2B]">
                Pause Gourmande
              </h3>
            </div>
            <p className="mt-0.5 text-[11.5px] font-semibold uppercase tracking-wider text-[#8F7038]">
              {entry.lunchTitle}
            </p>
            <p className="font-hand mt-2 text-[15px] leading-[1.75] text-[#143B2B]/90">
              {entry.lunch}
            </p>
          </div>

          {/* L'Après-midi */}
          <div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-[#B39258]" />
              <h3 className="font-editorial text-[21px] font-semibold text-[#143B2B]">
                L’Après-midi
              </h3>
            </div>
            <p className="font-hand mt-2 text-[15.5px] leading-[1.8] text-[#143B2B]/90">
              {entry.afternoon}
            </p>
          </div>

          {/* Note de poche logistique */}
          <div className="rounded-2xl border border-[#B39258]/40 bg-[#F7F1E4]/55 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#143B2B]" />
                <h3 className="font-editorial text-[19px] font-semibold text-[#143B2B]">
                  Note de poche logistique
                </h3>
              </div>
              <span className="font-margin text-[18px] text-[#8F7038]">
                Mémo pratique
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#143B2B]/90">
              {entry.logisticsNote}
            </p>
          </div>
        </div>
      </article>

      {/* Editable Family Memories Block */}
      <div className="ivy-card rounded-3xl p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Feather className="h-4 w-4 text-[#B39258]" />
            <h3 className="font-editorial text-[23px] font-semibold text-[#143B2B]">
              Nos petits mots & souvenirs
            </h3>
          </div>
          <span
            id="carnet-save-status"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4C6358]"
          >
            {justSaved ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#143B2B]" />
                <span className="text-[#143B2B]">Enregistré</span>
              </>
            ) : formattedUpdatedAt ? (
              <span>Modifié à {formattedUpdatedAt}</span>
            ) : (
              <span>Sauvegarde auto</span>
            )}
          </span>
        </div>

        <p className="font-margin mt-0.5 text-[18px] text-[#8F7038]">
          Notez ici les phrases drôles d’Aya & Adam, vos adresses coup de cœur ou
          les petits bonheurs du {day.dateShort}…
        </p>

        {/* Quick prompts */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {MEMORY_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => appendPrompt(prompt)}
              className="rounded-full border border-[#E7E2D8] bg-[#FAF8F4] px-2.5 py-1 text-[11px] font-medium text-[#143B2B] transition hover:border-[#B39258]"
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
          rows={5}
          value={memoryText}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Ex. Adam a voulu saluer tous les conducteurs de bus rouges sur Piccadilly..."
          className="notebook-paper font-hand mt-3 w-full resize-y rounded-2xl border border-[#E7E2D8] px-4 py-2 text-[15.5px] text-[#143B2B] placeholder:text-[#4C6358]/50 focus:border-[#143B2B] focus:outline-none"
        />
      </div>
    </section>
  );
}
