import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useTrip } from '../store/TripContext';

export function Header() {
  const { state, syncStatus, setActiveTab } = useTrip();

  const totalSteps = state.steps.length;
  const doneSteps = state.steps.filter((s) => s.done).length;

  return (
    <header className="sticky top-0 z-30 border-b border-[#E7E2D8] bg-[#FAF8F4]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-[#B39258]/70 bg-[#143B2B] text-[#FAF8F4] shadow-xs"
          >
            <span className="font-editorial text-[11px] font-semibold tracking-[0.16em] leading-none">
              LDN
            </span>
            <span className="my-0.5 h-[1px] w-5 bg-[#B39258]" />
            <span className="font-editorial text-[10px] tracking-[0.12em] text-[#D7BD8A] leading-none">
              26
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-editorial truncate text-[22px] font-semibold leading-tight tracking-tight text-[#143B2B]">
              Londres en Famille
            </h1>
            <p className="truncate text-[11px] font-medium tracking-wide text-[#4C6358]">
              22 déc. – 1er jan. · Mayfair W1J 7SU
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded-full border border-[#E7E2D8] bg-white px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#143B2B]"
            title="Étapes réalisées"
          >
            {doneSteps}/{totalSteps}
          </span>
          <button
            type="button"
            id="header-sync-btn"
            onClick={() => setActiveTab('infos')}
            title={
              syncStatus.mode === 'synced'
                ? `Synchronisé (${syncStatus.familyCode})`
                : syncStatus.mode === 'syncing'
                  ? 'Synchronisation en cours...'
                  : 'Mode local hors-ligne — configurer la synchro dans Infos'
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E2D8] bg-white text-[#143B2B] transition hover:border-[#B39258]"
            aria-label="Statut de synchronisation"
          >
            {syncStatus.mode === 'syncing' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#B39258]" />
            ) : syncStatus.mode === 'synced' ? (
              <Cloud className="h-3.5 w-3.5 text-[#143B2B]" />
            ) : (
              <CloudOff className="h-3.5 w-3.5 text-[#4C6358]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
