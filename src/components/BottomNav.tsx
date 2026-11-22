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
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[#ECE7DE] bg-[#FAF8F4]/95 backdrop-blur-md"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 pt-2 pb-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`nav-tab-${id}`}
              type="button"
              onClick={() => {
                setActiveTab(id);
                window.scrollTo({ top: 0 });
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-1 transition-colors ${
                isActive
                  ? 'text-[#143B2B]'
                  : 'text-[#5F7067]/75 hover:text-[#143B2B]'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute -top-2 h-[2px] w-6 rounded-full bg-[#B39258]"
                />
              )}
              <Icon
                className={`h-[18px] w-[18px] ${
                  isActive ? 'stroke-[1.9]' : 'stroke-[1.4]'
                }`}
              />
              <span
                className={`text-[10.5px] tracking-wide ${
                  isActive ? 'font-medium text-[#143B2B]' : 'font-light'
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
