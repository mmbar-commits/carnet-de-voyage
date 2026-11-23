import { useState, type FormEvent } from 'react';
import { Check, Compass, KeyRound, Plus, X } from 'lucide-react';
import { CURRENCY_OPTIONS } from '../data/currencies';
import {
  DESTINATION_PRESETS,
  geocodeDestination,
} from '../data/tripFactory';
import { UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';
import type { CurrencyCode, MemberRole } from '../types/trip';

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

export function TripsModal() {
  const {
    lang,
    state,
    trips,
    syncStatus,
    tripsModalOpen,
    setTripsModalOpen,
    switchTrip,
    createNewTrip,
    joinTripByCode,
  } = useTrip();

  const initialDates = defaultDates();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [tripCurrency, setTripCurrency] = useState<CurrencyCode>('EUR');
  const [homeCurrency, setHomeCurrency] = useState<CurrencyCode>(
    state.currencies.homeCurrency || 'MAD'
  );
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  if (!tripsModalOpen) return null;

  const t = UI_TEXT[lang];
  const quickCities = DESTINATION_PRESETS.filter((p) =>
    QUICK_CITY_NAMES.includes(p.name)
  );

  const getRoleLabel = (role?: MemberRole) => {
    if (!role) return null;
    if (role === 'admin') return t.auth.adminRole;
    if (role === 'editor') return t.auth.editorRole;
    return t.auth.viewerRole;
  };

  const handleClose = () => {
    setErrorMsg(null);
    setJoinError(null);
    setTripsModalOpen(false);
  };

  const handleSelectTrip = (tripId: string) => {
    switchTrip(tripId);
    setShowCreateForm(false);
    setErrorMsg(null);
    setJoinError(null);
    setTripsModalOpen(false);
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

    setBusy(true);
    setErrorMsg(null);
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
        people: state.people.length > 0 ? [...state.people] : ['Famille'],
      });

      if (!res.ok) {
        setErrorMsg(res.error || 'Erreur lors de la création.');
        return;
      }

      setTitle('');
      setDestination('');
      setShowCreateForm(false);
      setTripsModalOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const handleJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = joinCode.trim();
    if (!cleaned) return;
    setJoinError(null);
    const res = await joinTripByCode(cleaned);
    if (!res.ok) {
      setJoinError(res.error || 'Error');
      return;
    }
    setJoinCode('');
    setShowCreateForm(false);
    setTripsModalOpen(false);
  };

  return (
    <div
      id="trips-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trips-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#143B2B]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[#ECE7DE] bg-[#FAF8F4] px-5 pt-5 pb-7 shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10.5px] font-normal uppercase tracking-[0.16em] text-[#B39258]">
              {t.trips.eyebrow}
            </span>
            <h2
              id="trips-modal-title"
              className="font-editorial mt-0.5 text-[28px] font-normal leading-tight text-[#143B2B]"
            >
              {t.trips.title}
            </h2>
          </div>
          <button
            type="button"
            id="trips-modal-close-btn"
            onClick={handleClose}
            aria-label={t.cancel}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECE7DE] bg-white text-[#5F7067] hover:text-[#143B2B]"
          >
            <X className="h-4 w-4 stroke-[1.6]" />
          </button>
        </div>

        {/* Trips list */}
        <div className="mt-4 space-y-2.5">
          {trips.map((trip) => {
            const isActive = trip.id === syncStatus.familyCode;
            const roleLabel = getRoleLabel(trip.role);
            return (
              <button
                key={trip.id}
                id={`trip-item-${trip.id}`}
                type="button"
                onClick={() => handleSelectTrip(trip.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                  isActive
                    ? 'border-[#143B2B] bg-white shadow-[0_2px_8px_rgba(20,59,43,0.06)]'
                    : 'border-[#ECE7DE] bg-white/80 hover:border-[#B39258]/80 hover:bg-white'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    aria-hidden="true"
                    className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg border ${
                      isActive
                        ? 'border-[#B39258]/80 bg-[#143B2B] text-[#FAF8F4]'
                        : 'border-[#ECE7DE] bg-[#FAF8F4] text-[#143B2B]'
                    }`}
                  >
                    <span className="font-editorial text-[9.5px] font-medium tracking-[0.14em] leading-none">
                      {trip.monogramTop}
                    </span>
                    <span className="my-0.5 h-[0.75px] w-4 bg-[#B39258]" />
                    <span
                      className={`font-editorial text-[8.5px] font-normal tracking-[0.1em] leading-none ${
                        isActive ? 'text-[#D7BD8A]' : 'text-[#8F7038]'
                      }`}
                    >
                      {trip.monogramBottom}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="font-editorial truncate text-[19px] font-medium leading-tight text-[#143B2B]">
                      {trip.title}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] font-light text-[#5F7067]">
                      {trip.subtitle || trip.destination}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {roleLabel && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-normal ${
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
                  {isActive && (
                    <span
                      aria-label={t.trips.activeBadge}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#143B2B] text-[#FAF8F4]"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2]" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Toggleable + Nouveau voyage */}
        <div className="mt-4">
          <button
            type="button"
            id="trips-new-toggle-btn"
            onClick={() => {
              setShowCreateForm((v) => !v);
              setErrorMsg(null);
            }}
            aria-expanded={showCreateForm}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-2.5 text-[12.5px] font-normal transition ${
              showCreateForm
                ? 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
                : 'border-dashed border-[#D8CEBC] bg-white/80 text-[#143B2B] hover:border-[#B39258] hover:bg-white'
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
              id="create-trip-form"
              onSubmit={(e) => void handleCreateSubmit(e)}
              className="mt-3 space-y-3.5 rounded-2xl border border-[#ECE7DE] bg-white p-4 text-[12.5px]"
            >
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                <h3 className="font-editorial text-[20px] font-normal text-[#143B2B]">
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
                      destination.trim().toLowerCase() === city.name.toLowerCase();
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
                  htmlFor="new-trip-title-input"
                  className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                >
                  {t.trips.titleLabel}
                </label>
                <input
                  id="new-trip-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.trips.titlePlaceholder}
                  className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[13px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="new-trip-destination-input"
                  className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                >
                  {t.trips.destinationLabel}
                </label>
                <input
                  id="new-trip-destination-input"
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
                    htmlFor="new-trip-start-input"
                    className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                  >
                    {t.trips.startDateLabel}
                  </label>
                  <input
                    id="new-trip-start-input"
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
                    htmlFor="new-trip-end-input"
                    className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                  >
                    {t.trips.endDateLabel}
                  </label>
                  <input
                    id="new-trip-end-input"
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
                    htmlFor="new-trip-currency-select"
                    className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                  >
                    {t.trips.tripCurrencyLabel}
                  </label>
                  <select
                    id="new-trip-currency-select"
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
                    htmlFor="new-trip-home-currency-select"
                    className="mb-1 block text-[10.5px] font-normal uppercase tracking-wider text-[#5F7067]"
                  >
                    {t.trips.homeCurrencyLabel}
                  </label>
                  <select
                    id="new-trip-home-currency-select"
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

              {errorMsg && (
                <p className="rounded-xl bg-[#FCF5F5] px-3 py-2 text-[11.5px] text-[#7C2D36]">
                  {errorMsg}
                </p>
              )}

              <button
                id="create-trip-submit-btn"
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[12.5px] font-normal text-[#FAF8F4] transition hover:bg-[#1E543E] disabled:opacity-50"
              >
                <span>{busy ? t.trips.creatingBtn : t.trips.createBtn}</span>
              </button>
            </form>
          )}
        </div>

        {/* Join by code */}
        <form
          onSubmit={(e) => void handleJoinSubmit(e)}
          className="mt-5 border-t border-[#ECE7DE] pt-4"
        >
          <label
            htmlFor="join-trip-code-input"
            className="mb-1.5 flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
          >
            <KeyRound className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
            <span>{t.trips.joinHeading}</span>
          </label>
          <div className="flex gap-2">
            <input
              id="join-trip-code-input"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder={t.trips.joinPlaceholder}
              className="min-w-0 flex-1 rounded-xl border border-[#ECE7DE] bg-white px-3 py-2 text-[12px] font-medium uppercase tracking-wider text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
            />
            <button
              id="join-trip-submit-btn"
              type="submit"
              className="shrink-0 rounded-xl border border-[#ECE7DE] bg-white px-3.5 py-2 text-[12px] font-normal text-[#143B2B] hover:border-[#B39258]"
            >
              {t.trips.joinBtn}
            </button>
          </div>
          {joinError && (
            <p className="mt-2 rounded-xl bg-[#FCF5F5] px-3 py-2 text-[11.5px] text-[#7C2D36]">
              {joinError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
