import { AccountModal } from './components/AccountModal';
import { ActivitesTab } from './components/ActivitesTab';
import { BottomNav } from './components/BottomNav';
import { BudgetTab } from './components/BudgetTab';
import { CarnetTab } from './components/CarnetTab';
import { Header } from './components/Header';
import { InfosTab } from './components/InfosTab';
import { PlanningTab } from './components/PlanningTab';
import { TripsModal } from './components/TripsModal';
import { TripProvider, useTrip } from './store/TripContext';

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

export default function App() {
  return (
    <TripProvider>
      <TripShell />
    </TripProvider>
  );
}
