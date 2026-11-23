import { useState, type FormEvent } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Compass,
  KeyRound,
  LogOut,
  Plus,
  X,
} from 'lucide-react';
import { CURRENCY_OPTIONS } from '../data/currencies';
import {
  DEFAULT_LONDON_META,
  DEFAULT_LONDON_TRIP_ID,
  DESTINATION_PRESETS,
  geocodeDestination,
} from '../data/tripFactory';
import { UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';
import type { CurrencyCode, MemberRole, TripSummary } from '../types/trip';

const QUICK_CITY_NAMES = [
  'Rome',
  'Paris',
  'Tokyo',
  'New York',
  'Marrakech',
  'Barcelone',
  'Lisbonne',
  'Dubaï',
];

function defaultDates(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 10));
  const end = new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function TripsHub() {
  const {
    lang,
    setLang,
    authUser,
    trips,
    tripsLoading,
    hubNotice,
    clearHubNotice,
    openTrip,
    createNewTrip,
    joinTripByCode,
    signOut,
  } = useTrip();

  const t = UI_TEXT[lang];
  const initialDates = defaultDates();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [tripCurrency, setTripCurrency] = useState<CurrencyCode>('EUR');
  const [homeCurrency, setHomeCurrency] = useState<CurrencyCode>('MAD');
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const quickCities = DESTINATION_PRESETS.filter((p) =>
    QUICK_CITY_NAMES.includes(p.name)
  );

  const getRoleLabel = (role?: MemberRole) => {
    if (!role) return null;
    if (role === 'admin') return t.auth.adminRole;
    if (role === 'editor') return t.auth.editorRole;
    return t.auth.viewerRole;
  };

  const getTripDisplay = (trip: TripSummary) => {
    const isLondonEn =
      trip.id === DEFAULT_LONDON_TRIP_ID &&
      lang === 'en' &&
      trip.title === DEFAULT_LONDON_META.title;

    const displayTitle = isLondonEn ? t.appTitle : trip.title;
    const displaySubtitle =
      isLondonEn && trip.subtitle === DEFAULT_LONDON_META.subtitle
        ? t.appSubtitle
        : trip.subtitle ||
          (trip.startDate && trip.endDate
            ? `${trip.startDate} – ${trip.endDate}`
            : trip.destination);

    return { displayTitle, displaySubtitle };
  };

  const handlePickPreset = (cityName: string) => {
    const preset = DESTINATION_PRESETS.find((p) => p.name === cityName);
    if (!preset) return;
    setDestination(preset.name);
    setTripCurrency(preset.defaultCurrency);
    if (!title.trim()) {
      setTitle(
        lang === 'fr'
          ? `${preset.name} en Famille`
          : `${preset.name} Family Trip`
      );
    }
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanDest = destination.trim();
    if (!cleanDest) return;

    setCreateBusy(true);
    setCreateError(null);
    try {
      const geo = await geocodeDestination(cleanDest);
      const finalTitle =
        title.trim() ||
        (lang === 'fr' ? `${cleanDest} en Famille` : `${cleanDest} Family Trip`);

      const res = await createNewTrip({
        title: finalTitle,
        destination: geo?.name || cleanDest,
        startDate,
        endDate: endDate >= startDate ? endDate : startDate,
        lat: geo?.lat ?? 48.8566,
        lng: geo?.lng ?? 2.3522,
        timezone: geo?.timezone ?? 'UTC',
        tripCurrency,
        homeCurrency,
        people: ['Famille'],
      });

      if (!res.ok) {
        setCreateError(res.error || 'Error');
        return;
      }

      setTitle('');
      setDestination('');
      setShowCreateForm(false);
    } finally {
      setCreateBusy(false);
    }
  };

  const handleJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = joinCode.trim();
    if (!cleaned) return;

    setJoinBusy(true);
    setJoinError(null);
    try {
      const res = await joinTripByCode(cleaned);
      if (!res.ok) {
        setJoinError(res.error || 'Access denied');
        return;
      }
      setJoinCode('');
      setShowJoinForm(false);
    } finally {
      setJoinBusy(false);
    }
  };

  return (
    <div id="trips-hub" className="min-h-dvh bg-[#FAF8F4] text-[#143B2B]">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-30 border-b border-[#ECE7DE]/90 bg-[#FAF8F4]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg border border-[#B39258]/60 bg-[#143B2B] text-[#FAF8F4]"
            >
              <span className="font-editorial text-[9.5px] font-medium tracking-[0.14em] leading-none">
                CV
              </span>
              <span className="my-0.5 h-[0.75px] w-4 bg-[#B39258]" />
              <Compass className="h-2.5 w-2.5 stroke-[1.6] text-[#D7BD8A]" />
            </div>
            <div className="min-w-0">
              <p className="font-editorial truncate text-[17px] font-medium leading-none tracking-tight text-[#143B2B]">
                {t.hub.brandName}
              </p>
              {authUser?.email && (
                <p
                  id="hub-user-email"
                  className="mt-1 truncate text-[11px] font-light text-[#5F7067]"
                >
                  {authUser.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div
              role="group"
              aria-label="Language"
              className="inline-flex rounded-full border border-[#ECE7DE] bg-white p-0.5"
            >
              {(['fr', 'en'] as const).map((code) => (
                <button
                  key={code}
                  id={`hub-lang-toggle-${code}`}
                  type="button"
                  aria-pressed={lang === code}
                  onClick={() => setLang(code)}
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider transition ${
                    lang === code
                      ? 'bg-[#143B2B] font-medium text-[#FAF8F4]'
                      : 'font-light text-[#5F7067]'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            <button
              type="button"
              id="hub-signout-btn"
              onClick={() => void signOut()}
              title={t.auth.signOutBtn}
              aria-label={t.auth.signOutBtn}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ECE7DE] bg-white text-[#5F7067] transition hover:border-[#B39258] hover:text-[#7C2D36]"
            >
              <LogOut className="h-3.5 w-3.5 stroke-[1.6]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-md px-5 pt-6 pb-12">
        {/* Heading */}
        <div>
          <p className="text-[10.5px] font-normal uppercase tracking-[0.18em] text-[#B39258]">
            {t.hub.eyebrow}
          </p>
          <h1 className="font-editorial mt-1 text-[32px] font-normal leading-tight text-[#143B2B]">
            {t.hub.title}
          </h1>
          <p className="mt-1 text-[12.5px] font-light leading-relaxed text-[#5F7067]">
            {t.hub.subtitle}
          </p>
        </div>

        {/* Optional Hub Notice */}
        {hubNotice && (
          <div
            id="hub-notice-banner"
            className="mt-4 flex items-start justify-between gap-2 rounded-2xl border border-[#E6D9BE] bg-[#F8F3E9] px-3.5 py-2.5 text-[12px] text-[#7C2D36]"
          >
            <span>{hubNotice}</span>
            <button
              type="button"
              onClick={clearHubNotice}
              aria-label={t.hub.dismissNotice}
              className="shrink-0 rounded-full p-0.5 text-[#5F7067] hover:text-[#143B2B]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Trips list / Skeleton / Empty state */}
        <section aria-label={t.hub.title} className="mt-5">
          {tripsLoading ? (
            <div id="hub-trips-skeleton" className="space-y-3" aria-busy="true">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className="ivy-card flex animate-pulse items-center justify-between gap-3 rounded-2xl p-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3.5">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-[#ECE7DE]" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-3/5 rounded-full bg-[#ECE7DE]" />
                      <div className="h-3 w-2/5 rounded-full bg-[#F4F0E8]" />
                    </div>
                  </div>
                  <div className="h-5 w-14 shrink-0 rounded-full bg-[#F4F0E8]" />
                </div>
              ))}
            </div>
          ) : trips.length > 0 ? (
            <div id="hub-trips-list" className="space-y-3">
              {trips.map((trip) => {
                const roleLabel = getRoleLabel(trip.role);
                const { displayTitle, displaySubtitle } = getTripDisplay(trip);
                return (
                  <button
                    key={trip.id}
                    id={`hub-trip-card-${trip.id}`}
                    type="button"
                    onClick={() => openTrip(trip.id)}
                    className="ivy-card group flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left transition hover:border-[#B39258] hover:shadow-[0_6px_20px_rgba(20,59,43,0.06)] active:scale-[0.99]"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-[#B39258]/70 bg-[#143B2B] text-[#FAF8F4] transition group-hover:border-[#B39258]"
                      >
                        <span className="font-editorial text-[11px] font-medium tracking-[0.14em] leading-none">
                          {trip.monogramTop}
                        </span>
                        <span className="my-1 h-[0.75px] w-5 bg-[#B39258]" />
                        <span className="font-editorial text-[9.5px] font-normal tracking-[0.1em] text-[#D7BD8A] leading-none">
                          {trip.monogramBottom}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="font-editorial truncate text-[21px] font-medium leading-tight text-[#143B2B]">
                          {displayTitle}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] font-light text-[#5F7067]">
                          {displaySubtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {roleLabel && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-normal ${
                            trip.role === 'admin'
                              ? 'bg-[#143B2B] text-[#FAF8F4]'
                              : trip.role === 'editor'
                                ? 'border border-[#B39258]/50 bg-[#F8F3E9] text-[#143B2B]'
                                : 'bg-[#F8F3E9] text-[#83662F]'
                          }`}
                        >
                          {roleLabel}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 stroke-[1.6] text-[#B39258] transition group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              id="hub-empty-state"
              className="ivy-card rounded-3xl px-5 py-7 text-center"
            >
              <div
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E6D9BE] bg-[#F8F3E9] text-[#B39258]"
              >
                <Compass className="h-5 w-5 stroke-[1.5]" />
              </div>
              <h2 className="font-editorial mt-3.5 text-[23px] font-normal leading-snug text-[#143B2B]">
                {t.hub.emptyTitle}
              </h2>
              <p className="mt-2 text-[12.5px] font-light leading-relaxed text-[#5F7067]">
                {t.hub.emptyDescBefore}{' '}
                <span className="font-medium text-[#143B2B]">
                  {authUser?.email}
                </span>
                . {t.hub.emptyDescAfter}
              </p>
            </div>
          )}
        </section>

        {/* + Nouveau voyage inline form */}
        <section className="mt-5">
          <button
            type="button"
            id="hub-new-trip-toggle-btn"
            onClick={() => {
              setShowCreateForm((v) => !v);
              setCreateError(null);
            }}
            aria-expanded={showCreateForm}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-[13px] font-normal transition ${
              showCreateForm
                ? 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
                : 'border-dashed border-[#D8CEBC] bg-white/85 text-[#143B2B] hover:border-[#B39258] hover:bg-white'
            }`}
          >
            <Plus
              className={`h-4 w-4 stroke-[1.6] ${
                showCreateForm ? 'text-[#D7BD8A]' : 'text-[#B39258]'
              }`}
            />
            <span>{t.trips.newTripBtn}</span>
          </button>

          {showCreateForm && (
            <form
              id="hub-create-trip-form"
              onSubmit={(e) => void handleCreateSubmit(e)}
              className="ivy-card mt-3 space-y-3.5 rounded-2xl p-4 text-[12.5px]"
            >
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                  {t.trips.newTripTitle}
                </h3>
              </div>

              {/* Quick city chips */}
              <div>
                <p className="mb-1.5 text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]">
                  {t.trips.quickCitiesLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickCities.map((city) => {
                    const selected =
                      destination.trim().toLowerCase() ===
                      city.name.toLowerCase();
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handlePickPreset(city.name)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                          selected
                            ? 'border-[#143B2B] bg-[#143B2B] font-medium text-[#FAF8F4]'
                            : 'border-[#ECE7DE] bg-[#FAF8F4] font-light text-[#143B2B] hover:border-[#B39258]'
                        }`}
                      >
                        {city.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="hub-new-trip-title-input"
                  className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                >
                  {t.trips.titleLabel}
                </label>
                <input
                  id="hub-new-trip-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.trips.titlePlaceholder}
                  className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[13px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="hub-new-trip-destination-input"
                  className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                >
                  {t.trips.destinationLabel}
                </label>
                <input
                  id="hub-new-trip-destination-input"
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t.trips.destinationPlaceholder}
                  className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[13px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="hub-new-trip-start-input"
                    className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                  >
                    {t.trips.startDateLabel}
                  </label>
                  <input
                    id="hub-new-trip-start-input"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      const nextStart = e.target.value;
                      setStartDate(nextStart);
                      if (nextStart && endDate && endDate < nextStart) {
                        setEndDate(nextStart);
                      }
                    }}
                    className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-2.5 py-2 text-[12px] font-normal tabular-nums text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="hub-new-trip-end-input"
                    className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                  >
                    {t.trips.endDateLabel}
                  </label>
                  <input
                    id="hub-new-trip-end-input"
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-2.5 py-2 text-[12px] font-normal tabular-nums text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="hub-new-trip-currency-select"
                    className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                  >
                    {t.trips.tripCurrencyLabel}
                  </label>
                  <select
                    id="hub-new-trip-currency-select"
                    value={tripCurrency}
                    onChange={(e) =>
                      setTripCurrency(e.target.value as CurrencyCode)
                    }
                    className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-2.5 py-2 text-[12px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  >
                    {CURRENCY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code} ({opt.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="hub-new-trip-home-currency-select"
                    className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                  >
                    {t.trips.homeCurrencyLabel}
                  </label>
                  <select
                    id="hub-new-trip-home-currency-select"
                    value={homeCurrency}
                    onChange={(e) =>
                      setHomeCurrency(e.target.value as CurrencyCode)
                    }
                    className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-2.5 py-2 text-[12px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  >
                    {CURRENCY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code} ({opt.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {createError && (
                <p className="rounded-xl bg-[#FCF5F5] px-3 py-2 text-[11.5px] text-[#7C2D36]">
                  {createError}
                </p>
              )}

              <button
                id="hub-create-trip-submit-btn"
                type="submit"
                disabled={createBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[12.5px] font-normal text-[#FAF8F4] transition hover:bg-[#1E543E] disabled:opacity-50"
              >
                <span>
                  {createBusy ? t.trips.creatingBtn : t.trips.createBtn}
                </span>
              </button>
            </form>
          )}
        </section>

        {/* Collapsible Rejoindre par code */}
        <section className="mt-3">
          <button
            type="button"
            id="hub-join-toggle-btn"
            onClick={() => {
              setShowJoinForm((v) => !v);
              setJoinError(null);
            }}
            aria-expanded={showJoinForm}
            className="flex w-full items-center justify-between gap-2 rounded-2xl border border-[#ECE7DE] bg-white/80 px-4 py-3 text-[12.5px] font-normal text-[#143B2B] transition hover:border-[#B39258] hover:bg-white"
          >
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              <span>{t.hub.joinToggle}</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 stroke-[1.5] text-[#5F7067] transition ${
                showJoinForm ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showJoinForm && (
            <form
              id="hub-join-trip-form"
              onSubmit={(e) => void handleJoinSubmit(e)}
              className="ivy-card mt-2.5 space-y-3 rounded-2xl p-4"
            >
              <p className="text-[12px] font-light leading-relaxed text-[#5F7067]">
                {t.hub.joinHelper}
              </p>

              <div className="flex gap-2">
                <input
                  id="hub-join-code-input"
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder={t.trips.joinPlaceholder}
                  className="min-w-0 flex-1 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-medium uppercase tracking-wider text-[#143B2B] focus:border-[#143B2B] focus:bg-white focus:outline-none"
                />
                <button
                  id="hub-join-submit-btn"
                  type="submit"
                  disabled={joinBusy}
                  className="shrink-0 rounded-xl bg-[#143B2B] px-4 py-2 text-[12px] font-normal text-[#FAF8F4] transition hover:bg-[#1E543E] disabled:opacity-50"
                >
                  {joinBusy ? t.hub.joiningBtn : t.trips.joinBtn}
                </button>
              </div>

              {joinError && (
                <p
                  id="hub-join-error"
                  className="rounded-xl bg-[#FCF5F5] px-3 py-2 text-[12px] font-light leading-relaxed text-[#7C2D36]"
                >
                  {joinError}
                </p>
              )}
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
