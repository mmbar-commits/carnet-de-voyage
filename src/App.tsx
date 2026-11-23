import { useState, type FormEvent } from 'react';
import { Compass, Lock } from 'lucide-react';
import { AccountModal } from './components/AccountModal';
import { ActivitesTab } from './components/ActivitesTab';
import { BottomNav } from './components/BottomNav';
import { BudgetTab } from './components/BudgetTab';
import { CarnetTab } from './components/CarnetTab';
import { Header } from './components/Header';
import { InfosTab } from './components/InfosTab';
import { LandingPage } from './components/LandingPage';
import { PlanningTab } from './components/PlanningTab';
import { PullToRefresh } from './components/PullToRefresh';
import { TripsHub } from './components/TripsHub';
import { TripsModal } from './components/TripsModal';
import { UI_TEXT } from './i18n/translations';
import { TripProvider, useTrip } from './store/TripContext';

function IvySplash() {
  return (
    <div
      id="ivy-auth-splash"
      className="flex min-h-dvh flex-col items-center justify-center bg-[#FAF8F4] px-6 text-[#143B2B]"
    >
      <div
        aria-hidden="true"
        className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-[#B39258]/70 bg-[#143B2B] text-[#FAF8F4] shadow-[0_4px_14px_rgba(20,59,43,0.14)]"
      >
        <span className="font-editorial text-[14px] font-medium tracking-[0.18em] leading-none">
          CV
        </span>
        <span className="my-1 h-[1px] w-6 bg-[#B39258]" />
        <Compass className="h-3.5 w-3.5 stroke-[1.5] text-[#D7BD8A]" />
      </div>
      <p className="font-editorial mt-4 text-[22px] font-normal tracking-tight text-[#143B2B]">
        Carnet de Voyage
      </p>
      <div className="mt-3 h-0.5 w-16 overflow-hidden rounded-full bg-[#ECE7DE]">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-[#B39258]" />
      </div>
    </div>
  );
}

function PasswordRecoveryScreen() {
  const { lang, updatePassword, dismissPasswordRecovery } = useTrip();
  const t = UI_TEXT[lang];

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg(t.auth.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(t.auth.passwordMismatch);
      return;
    }

    setBusy(true);
    try {
      const res = await updatePassword(newPassword);
      if (!res.ok) {
        setErrorMsg(res.error || 'Error');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      id="password-recovery-screen"
      className="min-h-dvh bg-[#FAF8F4] text-[#143B2B]"
    >
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#B39258]/60 to-transparent" />
      <div className="mx-auto flex min-h-[calc(100dvh-2px)] max-w-md flex-col justify-center px-5 py-10">
        <div className="flex flex-col items-center text-center">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl border border-[#B39258]/70 bg-[#143B2B] text-[#FAF8F4] shadow-[0_4px_14px_rgba(20,59,43,0.14)]"
          >
            <span className="font-editorial text-[12px] font-medium tracking-[0.18em] leading-none">
              CV
            </span>
            <span className="my-1 h-[0.75px] w-5 bg-[#B39258]" />
            <Compass className="h-3 w-3 stroke-[1.5] text-[#D7BD8A]" />
          </div>
          <p className="font-editorial mt-3 text-[19px] font-medium tracking-tight text-[#143B2B]">
            {t.landing.brandName}
          </p>
        </div>

        <section
          aria-labelledby="recovery-title"
          className="ivy-card mt-6 rounded-3xl p-6 shadow-[0_8px_30px_rgba(20,59,43,0.045)]"
        >
          <p className="text-[10.5px] font-normal uppercase tracking-[0.18em] text-[#B39258]">
            {t.auth.newPasswordEyebrow}
          </p>
          <h1
            id="recovery-title"
            className="font-editorial mt-1 text-[28px] font-normal leading-tight text-[#143B2B]"
          >
            {t.auth.newPasswordTitle}
          </h1>
          <p className="mt-1.5 text-[12.5px] font-light leading-relaxed text-[#5F7067]">
            {t.auth.newPasswordDesc}
          </p>

          <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-3.5">
            <div>
              <label
                htmlFor="recovery-new-password-input"
                className="block text-[11.5px] font-light text-[#5F7067]"
              >
                {t.auth.newPasswordLabel}
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-[#B39258]" />
                <input
                  id="recovery-new-password-input"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4]/70 py-2.5 pr-3 pl-9 text-[13.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="recovery-confirm-password-input"
                className="block text-[11.5px] font-light text-[#5F7067]"
              >
                {t.auth.confirmPasswordLabel}
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-[#B39258]" />
                <input
                  id="recovery-confirm-password-input"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4]/70 py-2.5 pr-3 pl-9 text-[13.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <p
                id="recovery-error"
                className="rounded-xl bg-[#FCF5F5] px-3 py-2 text-[12px] font-light text-[#7C2D36]"
              >
                {errorMsg}
              </p>
            )}

            <button
              id="recovery-submit-btn"
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[13px] font-normal text-[#FAF8F4] shadow-[0_2px_8px_rgba(20,59,43,0.14)] transition hover:bg-[#1E543E] disabled:opacity-50"
            >
              <span>{busy ? '...' : t.auth.saveNewPassword}</span>
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              id="recovery-cancel-btn"
              onClick={dismissPasswordRecovery}
              className="text-[12px] font-light text-[#5F7067] transition hover:text-[#143B2B]"
            >
              {t.cancel}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function TripShell() {
  const { activeTab, canViewBudget } = useTrip();

  return (
    <div className="min-h-dvh bg-[#FAF8F4] text-[#143B2B]">
      <Header />
      <main className="mx-auto max-w-md px-5 pt-1 pb-28">
        {activeTab === 'planning' && <PlanningTab />}
        {activeTab === 'carnet' && <CarnetTab />}
        {activeTab === 'activites' && <ActivitesTab />}
        {activeTab === 'budget' && canViewBudget && <BudgetTab />}
        {activeTab === 'infos' && <InfosTab />}
      </main>
      <BottomNav />
      <AccountModal />
      <TripsModal />
    </div>
  );
}

function AppRouter() {
  const { authRequired, authLoading, authUser, activeTripId, passwordRecoveryMode } =
    useTrip();

  if (authRequired && authLoading) return <IvySplash />;
  if (passwordRecoveryMode) return <PasswordRecoveryScreen />;

  if (authRequired) {
    if (!authUser) return <LandingPage />;
    if (!activeTripId) {
      return (
        <>
          <PullToRefresh enabled />
          <TripsHub />
        </>
      );
    }
  }

  return (
    <>
      <PullToRefresh enabled />
      <TripShell />
    </>
  );
}

export default function App() {
  return (
    <TripProvider>
      <AppRouter />
    </TripProvider>
  );
}
