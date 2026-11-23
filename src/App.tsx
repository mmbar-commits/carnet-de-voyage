import { Compass } from 'lucide-react';
import { AccountModal } from './components/AccountModal';
import { ActivitesTab } from './components/ActivitesTab';
import { BottomNav } from './components/BottomNav';
import { BudgetTab } from './components/BudgetTab';
import { CarnetTab } from './components/CarnetTab';
import { Header } from './components/Header';
import { InfosTab } from './components/InfosTab';
import { LandingPage } from './components/LandingPage';
import { PlanningTab } from './components/PlanningTab';
import { TripsHub } from './components/TripsHub';
import { TripsModal } from './components/TripsModal';
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
  const { authRequired, authLoading, authUser, activeTripId } = useTrip();

  if (authRequired) {
    if (authLoading) return <IvySplash />;
    if (!authUser) return <LandingPage />;
    if (!activeTripId) return <TripsHub />;
  }

  return <TripShell />;
}

export default function App() {
  return (
    <TripProvider>
      <AppRouter />
    </TripProvider>
  );
}
