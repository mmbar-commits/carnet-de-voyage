import { BookOpen, CalendarDays, Compass, Info, Wallet } from 'lucide-react';
import { useTrip } from '../store/TripContext';
import type { TabId } from '../types/trip';

const NAV_ITEMS: { id: TabId; label: string; icon: typeof CalendarDays }[] = [
  { id: 'planning', label: 'Planning', icon: CalendarDays },
  { id: 'carnet', label: 'Carnet', icon: BookOpen },
  { id: 'activites', label: 'Activités', icon: Compass },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'infos', label: 'Infos', icon: Info },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useTrip();

  return (
    <nav
      aria-label="Navigation principale"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[#E7E2D8] bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 px-1.5 pt-1.5 pb-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`nav-tab-${id}`}
              type="button"
              onClick={() => {
                setActiveTab(id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-colors ${
                isActive
                  ? 'text-[#143B2B]'
                  : 'text-[#4C6358]/75 hover:text-[#143B2B]'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1.5 h-[2.5px] w-7 rounded-full bg-[#B39258]"
                />
              )}
              <Icon
                className={`h-[19px] w-[19px] transition-transform ${
                  isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.7]'
                }`}
              />
              <span
                className={`text-[10.5px] tracking-wide ${
                  isActive ? 'font-bold text-[#143B2B]' : 'font-medium'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
