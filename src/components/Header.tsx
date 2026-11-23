import { Cloud, CloudOff, Eye, RefreshCw, User, UserCheck } from 'lucide-react';
import { UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';

export function Header() {
  const {
    lang,
    setLang,
    syncStatus,
    setActiveTab,
    authUser,
    canEdit,
    previewReadOnly,
    setPreviewReadOnly,
    setAccountModalOpen,
  } = useTrip();
  const t = UI_TEXT[lang];

  return (
    <header className="sticky top-0 z-30 border-b border-[#ECE7DE]/90 bg-[#FAF8F4]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg border border-[#B39258]/60 bg-[#143B2B] text-[#FAF8F4]"
          >
            <span className="font-editorial text-[9.5px] font-medium tracking-[0.14em] leading-none">
              LDN
            </span>
            <span className="my-0.5 h-[0.75px] w-4 bg-[#B39258]" />
            <span className="font-editorial text-[8.5px] font-normal tracking-[0.1em] text-[#D7BD8A] leading-none">
              26
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-editorial truncate text-[21px] font-medium leading-none tracking-tight text-[#143B2B]">
              {t.appTitle}
            </h1>
            <p className="mt-1 truncate text-[11px] font-light tracking-wide text-[#5F7067]">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* Global FR / EN toggle */}
          <div
            role="group"
            aria-label="Language"
            className="inline-flex rounded-full border border-[#ECE7DE] bg-white p-0.5"
          >
            {(['fr', 'en'] as const).map((code) => (
              <button
                key={code}
                id={`lang-toggle-${code}`}
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

          {/* Account / Role button */}
          <button
            type="button"
            id="header-account-btn"
            onClick={() => {
              if (authUser) {
                setActiveTab('infos');
              } else {
                setAccountModalOpen(true);
              }
            }}
            title={authUser ? authUser.email : t.auth.signInBtn}
            aria-label={t.auth.sectionTitle}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#5F7067] transition hover:bg-white hover:text-[#143B2B]"
          >
            {!canEdit ? (
              <Eye className="h-4 w-4 stroke-[1.5] text-[#8F7038]" />
            ) : authUser ? (
              <UserCheck className="h-4 w-4 stroke-[1.6] text-[#143B2B]" />
            ) : (
              <User className="h-4 w-4 stroke-[1.5] text-[#5F7067]" />
            )}
          </button>

          <button
            type="button"
            id="header-sync-btn"
            onClick={() => setActiveTab('infos')}
            title={
              syncStatus.mode === 'synced'
                ? `${t.infos.syncedAt} (${syncStatus.familyCode})`
                : syncStatus.mode === 'syncing'
                  ? 'Sync...'
                  : t.infos.syncLocal
            }
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#5F7067] transition hover:bg-white hover:text-[#143B2B]"
            aria-label="Sync status"
          >
            {syncStatus.mode === 'syncing' ? (
              <RefreshCw className="h-4 w-4 animate-spin stroke-[1.5] text-[#B39258]" />
            ) : syncStatus.mode === 'synced' ? (
              <Cloud className="h-4 w-4 stroke-[1.5] text-[#143B2B]" />
            ) : (
              <CloudOff className="h-4 w-4 stroke-[1.5] text-[#5F7067]/70" />
            )}
          </button>
        </div>
      </div>

      {!canEdit && (
        <div
          id="readonly-banner"
          className="border-t border-[#E6D9BE] bg-[#F8F3E9] px-5 py-1.5"
        >
          <div className="mx-auto flex max-w-md items-center justify-between gap-2 text-[11.5px] text-[#83662F]">
            <span className="inline-flex items-center gap-1.5 font-normal">
              <Eye className="h-3.5 w-3.5 stroke-[1.6] text-[#B39258]" />
              <span>{t.auth.readOnlyBanner}</span>
            </span>
            {previewReadOnly && (
              <button
                type="button"
                id="exit-readonly-preview-btn"
                onClick={() => setPreviewReadOnly(false)}
                className="font-medium text-[#143B2B] underline decoration-[#B39258] underline-offset-2"
              >
                {t.auth.exitPreview}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
