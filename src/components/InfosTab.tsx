import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Award,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Coins,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Home,
  LogIn,
  LogOut,
  MapPin,
  Pencil,
  Plane,
  Plus,
  RotateCcw,
  Shield,
  Smartphone,
  Square,
  Trash2,
  Upload,
  User,
  Users,
} from 'lucide-react';
import {
  CURRENCY_OPTIONS,
  getApproxRate,
  getCurrencyChipLabel,
} from '../data/currencies';
import {
  ACCOMMODATION_INFO,
  FLIGHT_INFO,
  SUPABASE_AUTH_SQL_SNIPPET,
  TOWER_HAMLETS_MEMO,
} from '../data/infos';
import { UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';
import { isSupabaseConfigured } from '../store/sync';
import type {
  ChecklistItem,
  CurrencyCode,
  LanguagePreference,
  MemberRole,
} from '../types/trip';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type SectionKey =
  | 'flights'
  | 'home'
  | 'th'
  | 'notes'
  | 'checklist'
  | 'details'
  | 'currencies'
  | 'people'
  | 'payments'
  | 'members'
  | 'share'
  | 'account'
  | 'language'
  | 'pwa';

type DevicePlatform = 'iphone' | 'ipad' | 'android' | 'desktop';

function detectDevicePlatform(): DevicePlatform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  const isIpad =
    /iPad/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIpad) return 'ipad';
  if (/iPhone|iPod/i.test(ua)) return 'iphone';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    Boolean(nav.standalone) ||
    window.matchMedia?.('(display-mode: standalone)').matches === true
  );
}

const SUPABASE_SQL_EDITOR_URL =
  'https://supabase.com/dashboard/project/vbrbmokrgkxqmcihryns/sql/new';

export function InfosTab() {
  const {
    lang,
    langPref,
    detectedDeviceLang,
    setLangPref,
    state,
    syncStatus,
    authUser,
    tripRole,
    tripMembers,
    membersSqlReady,
    canEdit,
    previewReadOnly,
    setPreviewReadOnly,
    setHideBudgetForViewers,
    setAccountModalOpen,
    signOut,
    claimCurrentTrip,
    inviteMember,
    changeMemberRole,
    removeMember,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    updateTripMeta,
    updateCurrencies,
    addPerson,
    removePerson,
    addPaymentMethod,
    removePaymentMethod,
    addPracticalNote,
    updatePracticalNote,
    deletePracticalNote,
    exportTripJson,
    importTripJson,
    resetTripState,
    deleteCurrentTrip,
    leaveCurrentTrip,
  } = useTrip();

  const t = UI_TEXT[lang];
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  const isLondon = Boolean(state.meta.isLondonDefault);

  const { tripCurrency, homeCurrency } = state.currencies;
  const sameCurrency = tripCurrency === homeCurrency;
  const activeRate = sameCurrency ? 1 : state.rates.madPerGbp;

  // All dropdowns closed by default
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    flights: false,
    home: false,
    th: false,
    notes: false,
    checklist: false,
    details: false,
    currencies: false,
    people: false,
    payments: false,
    members: false,
    share: false,
    account: false,
    language: false,
    pwa: false,
  });

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedTripCode, setCopiedTripCode] = useState(false);
  const [copiedAuthSql, setCopiedAuthSql] = useState(false);
  const [newCheckLabel, setNewCheckLabel] = useState('');
  const [newPersonName, setNewPersonName] = useState('');
  const [newPaymentName, setNewPaymentName] = useState('');
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteMaps, setNewNoteMaps] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editNoteMaps, setEditNoteMaps] = useState('');
  const [rateInput, setRateInput] = useState(String(activeRate));
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('viewer');
  const [accountActionBusy, setAccountActionBusy] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState<string | null>(null);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDeleteTrip, setConfirmDeleteTrip] = useState(false);
  const [deleteTripBusy, setDeleteTripBusy] = useState(false);
  const [deleteTripError, setDeleteTripError] = useState<string | null>(null);
  const [confirmLeaveTrip, setConfirmLeaveTrip] = useState(false);
  const [leaveTripBusy, setLeaveTripBusy] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [devicePlatform] = useState<DevicePlatform>(() => detectDevicePlatform());
  const [isInstalledPwa, setIsInstalledPwa] = useState<boolean>(() =>
    isStandalonePwa()
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    setRateInput(String(sameCurrency ? 1 : state.rates.madPerGbp));
  }, [state.rates.madPerGbp, sameCurrency]);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalledPwa(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTripCurrencyChange = (nextTrip: CurrencyCode) => {
    if (!canEdit) return;
    const nextRate = getApproxRate(nextTrip, homeCurrency);
    updateCurrencies({ tripCurrency: nextTrip, homeCurrency }, nextRate);
    setRateInput(String(nextRate));
  };

  const handleHomeCurrencyChange = (nextHome: CurrencyCode) => {
    if (!canEdit) return;
    const nextRate = getApproxRate(tripCurrency, nextHome);
    updateCurrencies({ tripCurrency, homeCurrency: nextHome }, nextRate);
    setRateInput(String(nextRate));
  };

  const handleRateInputChange = (raw: string) => {
    setRateInput(raw);
    const parsed = Number(raw.replace(',', '.'));
    if (!Number.isNaN(parsed) && parsed > 0) {
      updateCurrencies(state.currencies, parsed);
    }
  };

  const formattedRatePreview = activeRate.toLocaleString(locale, {
    maximumFractionDigits: activeRate < 1 ? 4 : 2,
  });

  const copyText = async (text: string, onSuccess: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onSuccess();
    } catch {
      // Ignore
    }
  };

  const handleExportJson = () => {
    const content = exportTripJson();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const slug = (syncStatus.familyCode || 'trip').toLowerCase();
    link.download = `${slug}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importTripJson(String(reader.result || ''));
      setImportFeedback(
        result.ok
          ? lang === 'fr'
            ? 'Sauvegarde importée.'
            : 'Backup imported.'
          : result.error || 'Import error.'
      );
      window.setTimeout(() => setImportFeedback(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleChecklistSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canEdit || !newCheckLabel.trim()) return;
    addChecklistItem(newCheckLabel, 'bagages' as ChecklistItem['category']);
    setNewCheckLabel('');
  };

  const handlePersonSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canEdit || !newPersonName.trim()) return;
    addPerson(newPersonName);
    setNewPersonName('');
  };

  const handlePaymentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canEdit || !newPaymentName.trim()) return;
    addPaymentMethod(newPaymentName);
    setNewPaymentName('');
  };

  const handleAddNoteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canEdit || (!newNoteTitle.trim() && !newNoteContent.trim())) return;
    addPracticalNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      mapsQuery: newNoteMaps.trim() || undefined,
    });
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteMaps('');
    setShowAddNoteForm(false);
  };

  const handleSaveEditNote = (e: FormEvent, noteId: string) => {
    e.preventDefault();
    if (!canEdit) return;
    updatePracticalNote(noteId, {
      title: editNoteTitle.trim() || 'Note',
      content: editNoteContent.trim(),
      mapsQuery: editNoteMaps.trim() || undefined,
    });
    setEditingNoteId(null);
  };

  const handleClaimTrip = async () => {
    setAccountFeedback(null);
    setAccountActionBusy(true);
    try {
      const res = await claimCurrentTrip();
      if (!res.ok) setAccountFeedback(res.error || 'Error');
    } finally {
      setAccountActionBusy(false);
    }
  };

  const handleInviteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setAccountFeedback(null);
    setAccountActionBusy(true);
    try {
      const res = await inviteMember(inviteEmail, inviteRole);
      if (!res.ok) {
        setAccountFeedback(res.error || 'Error');
      } else {
        setInviteEmail('');
      }
    } finally {
      setAccountActionBusy(false);
    }
  };

  const handleDeleteTrip = async () => {
    setDeleteTripError(null);
    setDeleteTripBusy(true);
    try {
      const res = await deleteCurrentTrip();
      if (!res.ok) {
        setDeleteTripError(res.error || 'Error');
      } else {
        setConfirmDeleteTrip(false);
      }
    } finally {
      setDeleteTripBusy(false);
    }
  };

  const handleLeaveTrip = async () => {
    setAccountFeedback(null);
    setLeaveTripBusy(true);
    try {
      const res = await leaveCurrentTrip();
      if (!res.ok) {
        setAccountFeedback(res.error || 'Error');
      } else {
        setConfirmLeaveTrip(false);
      }
    } finally {
      setLeaveTripBusy(false);
    }
  };

  const adminCount = tripMembers.filter((m) => m.role === 'admin').length;
  const canLeaveTrip =
    Boolean(authUser) &&
    membersSqlReady &&
    (tripRole === 'editor' ||
      tripRole === 'viewer' ||
      (tripRole === 'admin' && adminCount > 1));

  const accountBadge = !authUser
    ? tripRole === 'none'
      ? t.auth.noAccessBadge
      : t.auth.signedOut
    : tripRole === 'admin'
      ? t.auth.adminRole
      : tripRole === 'editor'
        ? t.auth.editorRole
        : tripRole === 'viewer'
          ? t.auth.viewerRole
          : tripRole === 'none'
            ? t.auth.noAccessBadge
            : t.auth.unclaimedBadge;

  const languageBadge =
    langPref === 'auto'
      ? `${t.infos.languageAuto} · ${lang.toUpperCase()}`
      : langPref === 'fr'
        ? 'Français'
        : 'English';

  const checkedCount = state.checklist.filter((c) => c.checked).length;

  return (
    <section id="tab-panel-infos" className="space-y-6">
      {/* ================================================= */}
      {/* SECTION 1 : INFOS & PRÉPARATIFS                   */}
      {/* ================================================= */}
      <div className="space-y-3.5">
        <div className="pt-2">
          <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-[#B39258]">
            {isLondon
              ? t.infos.prepEyebrow
              : `${t.infos.practicalPrefix} · ${state.meta.destination}`}
          </span>
          <h2 className="font-editorial mt-1 text-[30px] font-normal leading-tight text-[#143B2B]">
            {t.infos.prepTitle}
          </h2>
        </div>

        {isLondon && (
          <>
            {/* 1. Vols Royal Air Maroc */}
            <article className="ivy-card overflow-hidden rounded-2xl">
              <button
                type="button"
                id="infos-toggle-flights"
                onClick={() => toggleSection('flights')}
                className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Plane className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                    {t.infos.flightsTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-light text-[#7C2D36]">
                    {t.infos.cabinTag}
                  </span>
                  {openSections.flights ? (
                    <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  )}
                </div>
              </button>

              {openSections.flights && (
                <div className="space-y-3.5 border-t border-[#F2EDE4] px-4 py-3.5 text-[13px] font-light">
                  {[
                    { label: t.infos.outbound, f: FLIGHT_INFO.outbound },
                    { label: t.infos.inbound, f: FLIGHT_INFO.inbound },
                  ].map(({ label, f }, idx) => (
                    <div
                      key={f.code}
                      className={`space-y-1 ${idx > 0 ? 'border-t border-[#F2EDE4] pt-3' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-normal uppercase tracking-wider text-[#8F7038]">
                          {label} · {f.code} · {f.date}
                        </p>
                        <a
                          href={f.statusUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-normal text-[#143B2B] underline decoration-[#B39258]/70 underline-offset-2"
                        >
                          <span>{t.infos.track}</span>
                          <ExternalLink className="h-3 w-3 stroke-[1.5] text-[#B39258]" />
                        </a>
                      </div>
                      <p className="text-[#143B2B]">
                        {f.from}{' '}
                        <span className="font-medium tabular-nums">{f.departure}</span> →{' '}
                        {f.to}{' '}
                        <span className="font-medium tabular-nums">{f.arrival}</span>
                      </p>
                      <p className="text-[12px] text-[#5F7067]">
                        {t.infos.terminals} :{' '}
                        <span className="font-normal text-[#143B2B]">
                          {f.fromTerminal}
                        </span>{' '}
                        →{' '}
                        <span className="font-normal text-[#143B2B]">
                          {f.toTerminal}
                        </span>
                      </p>
                      <p className="text-[11.5px] text-[#5F7067]">{f.gateNote}</p>
                    </div>
                  ))}
                  <p className="border-t border-[#F2EDE4] pt-2.5 text-[12px] text-[#5F7067]">
                    {FLIGHT_INFO.baggageNote}.
                  </p>
                </div>
              )}
            </article>

            {/* 2. Appartement W1J 7SU */}
            <article className="ivy-card overflow-hidden rounded-2xl">
              <button
                type="button"
                id="infos-toggle-home"
                onClick={() => toggleSection('home')}
                className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Home className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                    {t.infos.homeTitle}
                  </h3>
                </div>
                {openSections.home ? (
                  <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                ) : (
                  <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                )}
              </button>

              {openSections.home && (
                <div className="space-y-3 border-t border-[#F2EDE4] px-4 py-3.5 text-[13px] font-light">
                  <p className="font-normal text-[#143B2B]">
                    {ACCOMMODATION_INFO.street}, {ACCOMMODATION_INFO.postcode}
                  </p>
                  <p className="text-[12.5px] leading-relaxed text-[#5F7067]">
                    {t.infos.homeTube}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        void copyText(ACCOMMODATION_INFO.fullAddress, () => {
                          setCopiedAddress(true);
                          window.setTimeout(() => setCopiedAddress(false), 1800);
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12px] font-normal text-[#143B2B]"
                    >
                      {copiedAddress ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                      )}
                      <span>{copiedAddress ? t.infos.copied : t.infos.copy}</span>
                    </button>

                    <a
                      href={ACCOMMODATION_INFO.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#143B2B] px-3.5 py-2 text-[12px] font-normal text-[#FAF8F4]"
                    >
                      <span>Maps</span>
                      <ExternalLink className="h-3.5 w-3.5 stroke-[1.5] text-[#D7BD8A]" />
                    </a>
                  </div>
                </div>
              )}
            </article>

            {/* 3. Mémo Tower Hamlets */}
            <article className="ivy-card overflow-hidden rounded-2xl">
              <button
                type="button"
                id="infos-toggle-th"
                onClick={() => toggleSection('th')}
                className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                    {t.infos.thTitle}
                  </h3>
                </div>
                {openSections.th ? (
                  <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                ) : (
                  <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                )}
              </button>

              {openSections.th && (
                <div className="space-y-2.5 border-t border-[#F2EDE4] px-4 py-3.5 text-[12.5px] font-light leading-relaxed text-[#5F7067]">
                  <p className="font-normal text-[#83662F]">
                    {TOWER_HAMLETS_MEMO.savingsSummary}
                  </p>
                  <ul className="space-y-1 text-[#143B2B]">
                    {TOWER_HAMLETS_MEMO.sites.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                  <p className="pt-1 text-[11px] font-normal uppercase tracking-wider text-[#143B2B]">
                    {t.infos.thDocsTitle}
                  </p>
                  <ul className="space-y-1">
                    {TOWER_HAMLETS_MEMO.requiredDocs.map((doc) => (
                      <li key={doc}>— {doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </>
        )}

        {/* Notes pratiques (always editable: shown inline for custom trips, collapsible for London) */}
        {isLondon ? (
          <article className="ivy-card overflow-hidden rounded-2xl">
            <button
              type="button"
              id="infos-toggle-notes"
              onClick={() => toggleSection('notes')}
              className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                  {t.infos.practicalNotesTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-light tabular-nums text-[#5F7067]">
                  {state.practicalNotes.length}
                </span>
                {openSections.notes ? (
                  <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                ) : (
                  <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                )}
              </div>
            </button>

            {openSections.notes && (
              <div className="space-y-3 border-t border-[#F2EDE4] px-4 py-3.5 text-[12.5px] font-light text-[#5F7067]">
                {state.practicalNotes.length === 0 ? (
                  <p className="leading-relaxed">{t.infos.practicalNotesEmpty}</p>
                ) : (
                  <div className="space-y-2.5">
                    {state.practicalNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-normal text-[#143B2B]">{note.title}</p>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => deletePracticalNote(note.id)}
                              aria-label={t.delete}
                              className="p-0.5 text-[#5F7067]/60 hover:text-[#7C2D36]"
                            >
                              <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                            </button>
                          )}
                        </div>
                        {note.content && (
                          <p className="mt-1 whitespace-pre-line leading-relaxed text-[#5F7067]">
                            {note.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {canEdit && (
                  <form onSubmit={handleAddNoteSubmit} className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder={t.infos.noteTitlePlaceholder}
                      className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder={t.infos.noteContentPlaceholder}
                      className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#143B2B] px-3.5 py-2 text-[12px] font-normal text-[#FAF8F4]"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[1.6] text-[#D7BD8A]" />
                      <span>{t.infos.addPracticalNoteBtn}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </article>
        ) : (
          <div id="custom-practical-notes" className="space-y-3">
            {state.practicalNotes.length === 0 ? (
              <div className="ivy-card rounded-2xl px-4 py-4 text-[12.5px] font-light text-[#5F7067]">
                {t.infos.practicalNotesEmpty}
              </div>
            ) : (
              state.practicalNotes.map((note) => {
                const isEditing = editingNoteId === note.id;
                return (
                  <article
                    key={note.id}
                    id={`practical-note-${note.id}`}
                    className="ivy-card rounded-2xl px-4 py-3.5"
                  >
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveEditNote(e, note.id)}
                        className="space-y-2.5 text-[12.5px]"
                      >
                        <input
                          type="text"
                          value={editNoteTitle}
                          onChange={(e) => setEditNoteTitle(e.target.value)}
                          placeholder={t.infos.noteTitlePlaceholder}
                          className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                        />
                        <textarea
                          rows={3}
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                          placeholder={t.infos.noteContentPlaceholder}
                          className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={editNoteMaps}
                          onChange={(e) => setEditNoteMaps(e.target.value)}
                          placeholder={t.infos.noteMapsPlaceholder}
                          className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingNoteId(null)}
                            className="rounded-xl border border-[#ECE7DE] bg-white px-3 py-1.5 text-[12px] font-light text-[#5F7067]"
                          >
                            {t.cancel}
                          </button>
                          <button
                            type="submit"
                            className="rounded-xl bg-[#143B2B] px-3.5 py-1.5 text-[12px] font-normal text-[#FAF8F4]"
                          >
                            {t.save}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 stroke-[1.5] text-[#B39258]" />
                            <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                              {note.title}
                            </h3>
                          </div>
                          {canEdit && (
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditNoteTitle(note.title);
                                  setEditNoteContent(note.content);
                                  setEditNoteMaps(note.mapsQuery ?? '');
                                }}
                                aria-label={t.edit}
                                className="p-1 text-[#5F7067]/70 hover:text-[#143B2B]"
                              >
                                <Pencil className="h-3.5 w-3.5 stroke-[1.5]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deletePracticalNote(note.id)}
                                aria-label={t.delete}
                                className="p-1 text-[#5F7067]/60 hover:text-[#7C2D36]"
                              >
                                <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                              </button>
                            </div>
                          )}
                        </div>
                        {note.content && (
                          <p className="mt-2 whitespace-pre-line text-[13px] font-light leading-relaxed text-[#5F7067]">
                            {note.content}
                          </p>
                        )}
                        {note.mapsQuery && (
                          <div className="mt-3">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                note.mapsQuery
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-1.5 text-[11.5px] font-normal text-[#143B2B] hover:border-[#B39258]"
                            >
                              <MapPin className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                              <span>{t.openMaps}</span>
                              <ExternalLink className="h-3 w-3 stroke-[1.5] text-[#B39258]" />
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                );
              })
            )}

            {canEdit &&
              (showAddNoteForm ? (
                <form
                  onSubmit={handleAddNoteSubmit}
                  className="ivy-card space-y-2.5 rounded-2xl p-4 text-[12.5px]"
                >
                  <input
                    id="new-practical-note-title"
                    type="text"
                    required
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder={t.infos.noteTitlePlaceholder}
                    className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  />
                  <textarea
                    id="new-practical-note-content"
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder={t.infos.noteContentPlaceholder}
                    className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newNoteMaps}
                    onChange={(e) => setNewNoteMaps(e.target.value)}
                    placeholder={t.infos.noteMapsPlaceholder}
                    className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddNoteForm(false)}
                      className="rounded-xl border border-[#ECE7DE] bg-white px-3 py-1.5 text-[12px] font-light text-[#5F7067]"
                    >
                      {t.cancel}
                    </button>
                    <button
                      id="save-practical-note-btn"
                      type="submit"
                      className="rounded-xl bg-[#143B2B] px-3.5 py-1.5 text-[12px] font-normal text-[#FAF8F4]"
                    >
                      {t.add}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  id="add-practical-note-btn"
                  onClick={() => setShowAddNoteForm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#D8CEBC] bg-white/60 py-3 text-[12.5px] font-normal text-[#143B2B] transition hover:border-[#B39258] hover:bg-white"
                >
                  <Plus className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                  <span>{t.infos.addPracticalNoteBtn}</span>
                </button>
              ))}
          </div>
        )}

        {/* Check-list pré-départ */}
        <article className="ivy-card overflow-hidden rounded-2xl">
          <button
            type="button"
            id="infos-toggle-checklist"
            onClick={() => toggleSection('checklist')}
            className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
          >
            <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
              {t.infos.checklistTitle}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-light tabular-nums text-[#5F7067]">
                {checkedCount}/{state.checklist.length}
              </span>
              {openSections.checklist ? (
                <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              ) : (
                <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              )}
            </div>
          </button>

          {openSections.checklist && (
            <div className="border-t border-[#F2EDE4] px-4 py-3">
              <ul className="divide-y divide-[#F2EDE4]">
                {state.checklist.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-2 py-2.5"
                  >
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => toggleChecklistItem(item.id)}
                      className="flex min-w-0 flex-1 items-start gap-2.5 text-left disabled:cursor-default"
                    >
                      {item.checked ? (
                        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6] text-[#143B2B]" />
                      ) : (
                        <Square className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.4] text-[#B39258]" />
                      )}
                      <span
                        className={`text-[13px] font-light leading-snug text-[#143B2B] ${
                          item.checked ? 'line-through opacity-50' : ''
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => deleteChecklistItem(item.id)}
                        aria-label={t.delete}
                        className="p-0.5 text-[#5F7067]/50 hover:text-[#7C2D36]"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {canEdit && (
                <form onSubmit={handleChecklistSubmit} className="mt-2.5 flex gap-2">
                  <input
                    type="text"
                    value={newCheckLabel}
                    onChange={(e) => setNewCheckLabel(e.target.value)}
                    placeholder={t.infos.checklistPlaceholder}
                    className="min-w-0 flex-1 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label={t.add}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#143B2B] text-[#FAF8F4]"
                  >
                    <Plus className="h-4 w-4 stroke-[1.6]" />
                  </button>
                </form>
              )}
            </div>
          )}
        </article>
      </div>

      {/* ================================================= */}
      {/* SECTION 2 : RÉGLAGES DU VOYAGE                    */}
      {/* ================================================= */}
      <div id="infos-section-trip-settings" className="space-y-3.5 pt-2">
        <div>
          <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-[#B39258]">
            {t.infos.tripSettingsEyebrow}
          </span>
          <h2 className="font-editorial mt-1 text-[28px] font-normal leading-tight text-[#143B2B]">
            {t.infos.tripSettingsTitle}
          </h2>
        </div>

        {/* 0. Identité du voyage */}
        <article className="ivy-card overflow-hidden rounded-2xl">
          <button
            type="button"
            id="infos-toggle-details"
            onClick={() => toggleSection('details')}
            className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-2.5">
              <Pencil className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                {t.infos.tripDetailsTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="max-w-[110px] truncate text-[11px] font-light text-[#5F7067]">
                {state.meta.destination}
              </span>
              {openSections.details ? (
                <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              ) : (
                <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              )}
            </div>
          </button>

          {openSections.details && (
            <div className="space-y-3 border-t border-[#F2EDE4] px-4 py-3.5 text-[12.5px] font-light text-[#5F7067]">
              <p className="leading-relaxed">{t.infos.tripDetailsDesc}</p>
              <div>
                <label
                  htmlFor="trip-meta-title-input"
                  className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
                >
                  {t.infos.tripTitleLabel}
                </label>
                <input
                  id="trip-meta-title-input"
                  type="text"
                  disabled={!canEdit}
                  value={state.meta.title}
                  onChange={(e) => updateTripMeta({ title: e.target.value })}
                  className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor="trip-meta-dest-input"
                  className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
                >
                  {t.infos.tripDestLabel}
                </label>
                <input
                  id="trip-meta-dest-input"
                  type="text"
                  disabled={!canEdit}
                  value={state.meta.destination}
                  onChange={(e) =>
                    updateTripMeta({ destination: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor="trip-meta-subtitle-input"
                  className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
                >
                  {t.infos.tripSubtitleLabel}
                </label>
                <input
                  id="trip-meta-subtitle-input"
                  type="text"
                  disabled={!canEdit}
                  value={state.meta.subtitle}
                  onChange={(e) => updateTripMeta({ subtitle: e.target.value })}
                  className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>
          )}
        </article>

        {/* 1. Devises du voyage */}
        <article className="ivy-card overflow-hidden rounded-2xl">
          <button
            type="button"
            id="infos-toggle-currencies"
            onClick={() => toggleSection('currencies')}
            className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-2.5">
              <Coins className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                {t.infos.currenciesTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-light tabular-nums text-[#5F7067]">
                {tripCurrency} · {homeCurrency}
              </span>
              {openSections.currencies ? (
                <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              ) : (
                <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              )}
            </div>
          </button>

          {openSections.currencies && (
            <div className="space-y-3.5 border-t border-[#F2EDE4] px-4 py-3.5 text-[12.5px] font-light text-[#5F7067]">
              <p className="leading-relaxed">{t.infos.currenciesDesc}</p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="trip-currency-select"
                    className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
                  >
                    {t.infos.tripCurrencyLabel}
                  </label>
                  <select
                    id="trip-currency-select"
                    value={tripCurrency}
                    disabled={!canEdit}
                    onChange={(e) =>
                      handleTripCurrencyChange(e.target.value as CurrencyCode)
                    }
                    className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {CURRENCY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.symbol === opt.code
                          ? `${opt.code} — ${lang === 'fr' ? opt.labelFr : opt.labelEn}`
                          : `${opt.code} (${opt.symbol}) — ${
                              lang === 'fr' ? opt.labelFr : opt.labelEn
                            }`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="home-currency-select"
                    className="mb-1 block text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
                  >
                    {t.infos.homeCurrencyLabel}
                  </label>
                  <select
                    id="home-currency-select"
                    value={homeCurrency}
                    disabled={!canEdit}
                    onChange={(e) =>
                      handleHomeCurrencyChange(e.target.value as CurrencyCode)
                    }
                    className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-normal text-[#143B2B] focus:border-[#143B2B] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {CURRENCY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.symbol === opt.code
                          ? `${opt.code} — ${lang === 'fr' ? opt.labelFr : opt.labelEn}`
                          : `${opt.code} (${opt.symbol}) — ${
                              lang === 'fr' ? opt.labelFr : opt.labelEn
                            }`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="trip-exchange-rate-input"
                      className="text-[11px] font-normal uppercase tracking-wider text-[#5F7067]"
                    >
                      {t.infos.exchangeRateLabel}
                    </label>
                    <input
                      id="trip-exchange-rate-input"
                      type="number"
                      step="any"
                      min="0.0001"
                      value={rateInput}
                      disabled={!canEdit || sameCurrency}
                      onChange={(e) => handleRateInputChange(e.target.value)}
                      className="w-24 rounded-lg border border-[#ECE7DE] bg-white px-2.5 py-1.5 text-right text-[13px] font-normal tabular-nums text-[#143B2B] focus:border-[#143B2B] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <p
                    id="trip-exchange-rate-preview"
                    className="mt-1.5 text-[11.5px] font-normal tabular-nums text-[#83662F]"
                  >
                    1 {getCurrencyChipLabel(tripCurrency)} = {formattedRatePreview}{' '}
                    {homeCurrency}
                  </p>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* 2. Voyageurs (Budget) */}
        <article className="ivy-card overflow-hidden rounded-2xl">
          <button
            type="button"
            id="infos-toggle-people"
            onClick={() => toggleSection('people')}
            className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                {t.infos.peopleTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-light tabular-nums text-[#5F7067]">
                {state.people.length}
              </span>
              {openSections.people ? (
                <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              ) : (
                <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              )}
            </div>
          </button>

          {openSections.people && (
            <div className="space-y-3 border-t border-[#F2EDE4] px-4 py-3.5">
              <p className="text-[12.5px] font-light leading-relaxed text-[#5F7067]">
                {t.infos.peopleDesc}
              </p>

              <div className="flex flex-wrap gap-2">
                {state.people.map((person) => (
                  <span
                    key={person}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-[#ECE7DE] bg-[#FAF8F4] py-1 pl-3 text-[12.5px] font-normal text-[#143B2B] ${
                      canEdit ? 'pr-2' : 'pr-3'
                    }`}
                  >
                    <span>{person}</span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => removePerson(person)}
                        aria-label={`Remove ${person}`}
                        className="rounded-full p-0.5 text-[#5F7067]/70 hover:text-[#7C2D36]"
                      >
                        <Trash2 className="h-3 w-3 stroke-[1.5]" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {canEdit && (
                <form onSubmit={handlePersonSubmit} className="flex gap-2 pt-1">
                  <input
                    id="new-person-input"
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder={t.infos.peoplePlaceholder}
                    className="min-w-0 flex-1 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  />
                  <button
                    id="add-person-submit"
                    type="submit"
                    aria-label={t.add}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#143B2B] text-[#FAF8F4]"
                  >
                    <Plus className="h-4 w-4 stroke-[1.6]" />
                  </button>
                </form>
              )}
            </div>
          )}
        </article>

        {/* 3. Moyens de paiement */}
        <article className="ivy-card overflow-hidden rounded-2xl">
          <button
            type="button"
            id="infos-toggle-payments"
            onClick={() => toggleSection('payments')}
            className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                {t.infos.paymentsTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-light tabular-nums text-[#5F7067]">
                {state.paymentMethods.length}
              </span>
              {openSections.payments ? (
                <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              ) : (
                <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              )}
            </div>
          </button>

          {openSections.payments && (
            <div className="space-y-3 border-t border-[#F2EDE4] px-4 py-3.5">
              <p className="text-[12.5px] font-light leading-relaxed text-[#5F7067]">
                {t.infos.paymentsDesc}
              </p>

              <div className="flex flex-wrap gap-2">
                {state.paymentMethods.map((method) => (
                  <span
                    key={method}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-[#ECE7DE] bg-[#FAF8F4] py-1 pl-3 text-[12.5px] font-normal text-[#143B2B] ${
                      canEdit ? 'pr-2' : 'pr-3'
                    }`}
                  >
                    <span>{method}</span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => removePaymentMethod(method)}
                        aria-label={`Remove ${method}`}
                        className="rounded-full p-0.5 text-[#5F7067]/70 hover:text-[#7C2D36]"
                      >
                        <Trash2 className="h-3 w-3 stroke-[1.5]" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {canEdit && (
                <form onSubmit={handlePaymentSubmit} className="flex gap-2 pt-1">
                  <input
                    id="new-payment-input"
                    type="text"
                    value={newPaymentName}
                    onChange={(e) => setNewPaymentName(e.target.value)}
                    placeholder={t.infos.paymentsPlaceholder}
                    className="min-w-0 flex-1 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  />
                  <button
                    id="add-payment-submit"
                    type="submit"
                    aria-label={t.add}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#143B2B] text-[#FAF8F4]"
                  >
                    <Plus className="h-4 w-4 stroke-[1.6]" />
                  </button>
                </form>
              )}
            </div>
          )}
        </article>

        {/* 4. Accès & Membres (rôles & permissions de ce voyage) */}
        {supabaseReady && (
          <article className="ivy-card overflow-hidden rounded-2xl">
            <button
              type="button"
              id="infos-toggle-members"
              onClick={() => toggleSection('members')}
              className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                  {t.auth.membersSectionTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-normal ${
                    tripRole === 'admin'
                      ? 'bg-[#143B2B] text-[#FAF8F4]'
                      : tripRole === 'editor'
                        ? 'border border-[#B39258]/50 bg-[#F8F3E9] text-[#143B2B]'
                        : tripRole === 'viewer'
                          ? 'bg-[#F8F3E9] text-[#83662F]'
                          : 'text-[#5F7067]'
                  }`}
                >
                  {accountBadge}
                </span>
                {openSections.members ? (
                  <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                ) : (
                  <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                )}
              </div>
            </button>

            {openSections.members && (
              <div className="space-y-3.5 border-t border-[#F2EDE4] px-4 py-3.5 text-[12.5px] font-light text-[#5F7067]">
                {!authUser ? (
                  <>
                    <p className="leading-relaxed">
                      {tripRole === 'none'
                        ? t.auth.noAccessDesc
                        : t.auth.accountDescSignedOut}
                    </p>
                    <button
                      type="button"
                      id="infos-members-login-btn"
                      onClick={() => setAccountModalOpen(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[12.5px] font-normal text-[#FAF8F4]"
                    >
                      <LogIn className="h-3.5 w-3.5 text-[#D7BD8A]" />
                      <span>{t.auth.signInBtn}</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Trip code for joining / sharing */}
                    {membersSqlReady && tripRole !== 'none' && (
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-[10.5px] font-normal uppercase tracking-wider text-[#8F7038]">
                            {t.infos.tripCodeLabel}
                          </p>
                          <p
                            id="trip-code-value"
                            className="truncate text-[12.5px] font-medium uppercase tracking-wider text-[#143B2B]"
                          >
                            {syncStatus.familyCode}
                          </p>
                        </div>
                        <button
                          type="button"
                          id="copy-trip-code-btn"
                          onClick={() =>
                            void copyText(syncStatus.familyCode, () => {
                              setCopiedTripCode(true);
                              window.setTimeout(() => setCopiedTripCode(false), 1800);
                            })
                          }
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#ECE7DE] bg-white px-2.5 py-1.5 text-[11px] font-normal text-[#143B2B]"
                        >
                          {copiedTripCode ? (
                            <Check className="h-3 w-3 text-[#143B2B]" />
                          ) : (
                            <Copy className="h-3 w-3 stroke-[1.5] text-[#B39258]" />
                          )}
                          <span>{copiedTripCode ? t.infos.copied : t.infos.copy}</span>
                        </button>
                      </div>
                    )}

                    {/* Case 1: Option A SQL migration not executed yet */}
                    {!membersSqlReady && (
                      <div className="space-y-2 rounded-xl border border-[#E2D6BE] bg-[#F8F3E9] p-3 text-[#143B2B]">
                        <p className="text-[12px] font-medium">{t.auth.sqlPendingTitle}</p>
                        <p className="text-[11.5px] font-light leading-relaxed text-[#5F7067]">
                          {t.auth.sqlPendingDesc}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              void copyText(SUPABASE_AUTH_SQL_SNIPPET, () => {
                                setCopiedAuthSql(true);
                                window.setTimeout(() => setCopiedAuthSql(false), 2000);
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#143B2B] px-3 py-1.5 text-[11.5px] font-normal text-[#FAF8F4]"
                          >
                            {copiedAuthSql ? (
                              <Check className="h-3.5 w-3.5 text-[#D7BD8A]" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-[#D7BD8A]" />
                            )}
                            <span>
                              {copiedAuthSql ? t.infos.copied : t.auth.copyAuthSql}
                            </span>
                          </button>
                          <a
                            href={SUPABASE_SQL_EDITOR_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#D8CEBC] bg-white px-3 py-1.5 text-[11.5px] font-normal text-[#143B2B]"
                          >
                            <span>{t.auth.openSqlEditor}</span>
                            <ExternalLink className="h-3 w-3 text-[#B39258]" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Case 2: SQL ready, trip unclaimed */}
                    {membersSqlReady && tripRole === 'unclaimed' && (
                      <div className="space-y-2 rounded-xl border border-[#E2D6BE] bg-[#F8F3E9] p-3">
                        <p className="text-[12px] font-medium text-[#143B2B]">
                          {t.auth.claimTripTitle}
                        </p>
                        <p className="text-[11.5px] font-light leading-relaxed text-[#5F7067]">
                          {t.auth.claimTripDesc}
                        </p>
                        <button
                          type="button"
                          id="claim-trip-btn"
                          disabled={accountActionBusy}
                          onClick={() => void handleClaimTrip()}
                          className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#143B2B] py-2 text-[12px] font-normal text-[#FAF8F4] disabled:opacity-50"
                        >
                          <Shield className="h-3.5 w-3.5 text-[#D7BD8A]" />
                          <span>{t.auth.claimTripBtn}</span>
                        </button>
                      </div>
                    )}

                    {/* Case 3: Trip protected, signed-in user not invited */}
                    {membersSqlReady && tripRole === 'none' && (
                      <p className="rounded-xl bg-[#FCF5F5] px-3 py-2.5 text-[12px] text-[#7C2D36]">
                        {t.auth.noAccessDesc}
                      </p>
                    )}

                    {/* Case 4: Read-only viewer */}
                    {membersSqlReady && tripRole === 'viewer' && (
                      <p className="rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2.5 text-[12px] leading-relaxed text-[#5F7067]">
                        {t.auth.viewerAccessNote}
                      </p>
                    )}

                    {/* Case 5a: Editor info note (can edit trip, cannot manage users) */}
                    {membersSqlReady && tripRole === 'editor' && (
                      <div className="space-y-2.5">
                        <p className="rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2.5 text-[12px] leading-relaxed text-[#5F7067]">
                          {t.auth.editorAccessNote}
                        </p>
                        {tripMembers.length > 0 && (
                          <ul className="divide-y divide-[#F2EDE4] rounded-xl border border-[#ECE7DE] bg-[#FDFCF9] px-3">
                            {tripMembers.map((member) => (
                              <li
                                key={member.id}
                                className="flex items-center justify-between gap-2 py-2"
                              >
                                <span className="truncate text-[12px] font-normal text-[#143B2B]">
                                  {member.email}
                                </span>
                                <span className="shrink-0 text-[11px] font-light text-[#83662F]">
                                  {member.role === 'admin'
                                    ? t.auth.adminRole
                                    : member.role === 'editor'
                                      ? t.auth.editorRole
                                      : t.auth.viewerRole}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Case 5b: Admin management panel */}
                    {membersSqlReady && tripRole === 'admin' && (
                      <div className="space-y-3">
                        <p className="text-[11px] font-normal uppercase tracking-wider text-[#8F7038]">
                          {t.auth.membersHeading} ({tripMembers.length})
                        </p>

                        <ul className="divide-y divide-[#F2EDE4] rounded-xl border border-[#ECE7DE] bg-[#FDFCF9] px-3">
                          {tripMembers.map((member) => {
                            const isLastAdmin =
                              member.role === 'admin' && adminCount <= 1;
                            return (
                              <li
                                key={member.id}
                                className="flex items-center justify-between gap-2 py-2.5"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-[12.5px] font-normal text-[#143B2B]">
                                    {member.email}
                                  </p>
                                  <p className="text-[10.5px] font-light text-[#5F7067]">
                                    {member.userId
                                      ? t.auth.activeStatus
                                      : t.auth.pendingStatus}
                                  </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-1.5">
                                  <select
                                    aria-label={`Role for ${member.email}`}
                                    value={member.role}
                                    disabled={isLastAdmin}
                                    onChange={(e) =>
                                      void changeMemberRole(
                                        member.id,
                                        e.target.value as MemberRole
                                      )
                                    }
                                    className="rounded-lg border border-[#ECE7DE] bg-white px-2 py-1 text-[11px] font-normal text-[#143B2B] disabled:opacity-50"
                                  >
                                    <option value="admin">{t.auth.adminRole}</option>
                                    <option value="editor">{t.auth.editorRole}</option>
                                    <option value="viewer">{t.auth.viewerRole}</option>
                                  </select>
                                  {!isLastAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => void removeMember(member.id)}
                                      aria-label={t.delete}
                                      className="p-1 text-[#5F7067]/60 hover:text-[#7C2D36]"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                                    </button>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>

                        {/* Invite new member */}
                        <form
                          onSubmit={(e) => void handleInviteSubmit(e)}
                          className="space-y-2"
                        >
                          <div className="flex gap-1.5">
                            <input
                              id="invite-member-email"
                              type="email"
                              required
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder={t.auth.invitePlaceholder}
                              className="min-w-0 flex-1 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12px] font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                            />
                            <select
                              id="invite-member-role"
                              value={inviteRole}
                              onChange={(e) =>
                                setInviteRole(e.target.value as MemberRole)
                              }
                              className="rounded-xl border border-[#ECE7DE] bg-white px-2 py-2 text-[11.5px] font-normal text-[#143B2B]"
                            >
                              <option value="viewer">{t.auth.viewerRole}</option>
                              <option value="editor">{t.auth.editorRole}</option>
                              <option value="admin">{t.auth.adminRole}</option>
                            </select>
                            <button
                              id="invite-member-submit"
                              type="submit"
                              disabled={accountActionBusy}
                              aria-label={t.auth.inviteBtn}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#143B2B] text-[#FAF8F4] disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4 stroke-[1.6]" />
                            </button>
                          </div>
                        </form>

                        {/* Hide Budget for viewers option */}
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2.5">
                          <div className="min-w-0">
                            <p className="text-[12px] font-normal text-[#143B2B]">
                              {t.auth.hideBudgetToggle}
                            </p>
                            <p className="text-[11px] font-light text-[#5F7067]">
                              {t.auth.hideBudgetDesc}
                            </p>
                          </div>
                          <input
                            id="hide-budget-viewers-checkbox"
                            type="checkbox"
                            checked={Boolean(state.hideBudgetForViewers)}
                            onChange={(e) =>
                              setHideBudgetForViewers(e.target.checked)
                            }
                            className="h-4 w-4 accent-[#143B2B]"
                          />
                        </label>
                      </div>
                    )}
                  </>
                )}

                {/* Preview read-only mode toggle (available to editors & unclaimed trips) */}
                {tripRole !== 'viewer' && tripRole !== 'none' && (
                  <div className="flex items-center justify-between gap-3 border-t border-[#F2EDE4] pt-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[12px] font-normal text-[#143B2B]">
                        <Eye className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                        <span>{t.auth.previewReadOnly}</span>
                      </p>
                      <p className="text-[11px] font-light text-[#5F7067]">
                        {t.auth.previewReadOnlyDesc}
                      </p>
                    </div>
                    <button
                      type="button"
                      id="toggle-readonly-preview-btn"
                      onClick={() => setPreviewReadOnly(!previewReadOnly)}
                      className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                        previewReadOnly
                          ? 'border-[#143B2B] bg-[#143B2B] text-[#FAF8F4]'
                          : 'border-[#ECE7DE] bg-white text-[#143B2B]'
                      }`}
                    >
                      {previewReadOnly ? 'ON' : 'OFF'}
                    </button>
                  </div>
                )}

                {canLeaveTrip && (
                  <div className="border-t border-[#F2EDE4] pt-3">
                    {confirmLeaveTrip ? (
                      <div
                        id="leave-trip-confirm-box"
                        className="space-y-2.5 rounded-xl border border-[#E8CFD2] bg-[#FCF5F5] p-3"
                      >
                        <p className="text-[12px] font-light leading-relaxed text-[#7C2D36]">
                          {t.infos.leaveTripWarning}
                        </p>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={leaveTripBusy}
                            onClick={() => setConfirmLeaveTrip(false)}
                            className="rounded-lg border border-[#ECE7DE] bg-white px-3 py-1.5 text-[11.5px] font-light text-[#5F7067]"
                          >
                            {t.cancel}
                          </button>
                          <button
                            type="button"
                            id="confirm-leave-trip-btn"
                            disabled={leaveTripBusy}
                            onClick={() => void handleLeaveTrip()}
                            className="rounded-lg bg-[#7C2D36] px-3 py-1.5 text-[11.5px] font-normal text-white disabled:opacity-50"
                          >
                            {leaveTripBusy ? '...' : t.infos.leaveTripConfirmBtn}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11.5px] font-light text-[#5F7067]">
                          {t.infos.leaveTripLabel}
                        </span>
                        <button
                          type="button"
                          id="leave-trip-btn"
                          onClick={() => {
                            setAccountFeedback(null);
                            setConfirmLeaveTrip(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-[11.5px] font-normal text-[#7C2D36]"
                        >
                          <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
                          <span>{t.infos.leaveTripBtn}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {accountFeedback && (
                  <p className="rounded-xl bg-[#FCF5F5] px-3 py-2 text-[11.5px] text-[#7C2D36]">
                    {accountFeedback}
                  </p>
                )}
              </div>
            )}
          </article>
        )}

        {/* 5. Sauvegarde (Admin uniquement) */}
        {canEdit && (tripRole === 'admin' || tripRole === 'unclaimed') && (
          <article className="ivy-card overflow-hidden rounded-2xl">
            <button
              type="button"
              id="infos-toggle-share"
              onClick={() => toggleSection('share')}
              className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-2.5">
                <Download className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                  {t.infos.shareTitle}
                </h3>
              </div>
              {openSections.share ? (
                <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              ) : (
                <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              )}
            </button>

            {openSections.share && (
              <div className="space-y-3 border-t border-[#F2EDE4] px-4 py-3.5">
                <p className="text-[12.5px] font-light leading-relaxed text-[#5F7067]">
                  {t.infos.backupDesc}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="backup-export-json-btn"
                    onClick={handleExportJson}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] py-2.5 text-[12px] font-normal text-[#143B2B] transition hover:border-[#B39258]"
                  >
                    <Download className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                    <span>{t.infos.exportJson}</span>
                  </button>
                  <button
                    type="button"
                    id="backup-import-json-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ECE7DE] bg-white py-2.5 text-[12px] font-normal text-[#143B2B] transition hover:border-[#B39258]"
                  >
                    <Upload className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                    <span>{t.infos.importJson}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </div>

                {importFeedback && (
                  <p className="text-[12px] font-light text-[#143B2B]">
                    {importFeedback}
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-[#F2EDE4] pt-2.5">
                  <span className="text-[11.5px] font-light text-[#5F7067]">
                    {t.infos.resetLabel}
                  </span>
                  {confirmReset ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="text-[11.5px] font-light text-[#5F7067]"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          resetTripState();
                          setConfirmReset(false);
                        }}
                        className="rounded-lg bg-[#7C2D36] px-2.5 py-1 text-[11px] font-normal text-white"
                      >
                        {t.infos.confirm}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="inline-flex items-center gap-1 text-[11.5px] font-light text-[#7C2D36]"
                    >
                      <RotateCcw className="h-3 w-3 stroke-[1.5]" />
                      <span>{t.infos.resetBtn}</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-[#F2EDE4] pt-2.5">
                  {confirmDeleteTrip ? (
                    <div
                      id="delete-trip-confirm-box"
                      className="space-y-2.5 rounded-xl border border-[#E8CFD2] bg-[#FCF5F5] p-3"
                    >
                      <p className="text-[12px] font-light leading-relaxed text-[#7C2D36]">
                        {t.infos.deleteTripWarning}
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={deleteTripBusy}
                          onClick={() => {
                            setConfirmDeleteTrip(false);
                            setDeleteTripError(null);
                          }}
                          className="rounded-lg border border-[#ECE7DE] bg-white px-3 py-1.5 text-[11.5px] font-light text-[#5F7067]"
                        >
                          {t.cancel}
                        </button>
                        <button
                          type="button"
                          id="confirm-delete-trip-btn"
                          disabled={deleteTripBusy}
                          onClick={() => void handleDeleteTrip()}
                          className="rounded-lg bg-[#7C2D36] px-3 py-1.5 text-[11.5px] font-normal text-white disabled:opacity-50"
                        >
                          {deleteTripBusy ? '...' : t.infos.deleteTripConfirmBtn}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-light text-[#5F7067]">
                        {t.infos.deleteTripLabel}
                      </span>
                      <button
                        type="button"
                        id="delete-trip-btn"
                        onClick={() => {
                          setDeleteTripError(null);
                          setConfirmDeleteTrip(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11.5px] font-normal text-[#7C2D36]"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span>{t.infos.deleteTripBtn}</span>
                      </button>
                    </div>
                  )}

                  {deleteTripError && (
                    <p
                      id="delete-trip-error"
                      className="mt-2 rounded-xl bg-[#FCF5F5] px-3 py-2 text-[11.5px] text-[#7C2D36]"
                    >
                      {deleteTripError}
                    </p>
                  )}
                </div>
              </div>
            )}
          </article>
        )}
      </div>

      {/* ================================================= */}
      {/* SECTION 3 : RÉGLAGES DE L'APPLICATION             */}
      {/* ================================================= */}
      <div id="infos-section-app-settings" className="space-y-3.5 pt-2">
        <div>
          <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-[#B39258]">
            {t.infos.appSettingsEyebrow}
          </span>
          <h2 className="font-editorial mt-1 text-[28px] font-normal leading-tight text-[#143B2B]">
            {t.infos.appSettingsTitle}
          </h2>
        </div>

        {/* 1. Mon compte (statut global de connexion) */}
        {supabaseReady && (
          <article className="ivy-card overflow-hidden rounded-2xl">
            <button
              type="button"
              id="infos-toggle-account"
              onClick={() => toggleSection('account')}
              className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                  {t.auth.accountTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-normal ${
                    authUser
                      ? 'bg-[#143B2B] text-[#FAF8F4]'
                      : 'text-[#5F7067]'
                  }`}
                >
                  {authUser ? t.auth.connectedStatus : t.auth.disconnectedStatus}
                </span>
                {openSections.account ? (
                  <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                ) : (
                  <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
                )}
              </div>
            </button>

            {openSections.account && (
              <div className="space-y-3 border-t border-[#F2EDE4] px-4 py-3.5 text-[12.5px] font-light text-[#5F7067]">
                {!authUser ? (
                  <>
                    <p className="leading-relaxed">
                      {t.auth.myAccountDescSignedOut}
                    </p>
                    <button
                      type="button"
                      id="infos-open-login-btn"
                      onClick={() => setAccountModalOpen(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[12.5px] font-normal text-[#FAF8F4]"
                    >
                      <LogIn className="h-3.5 w-3.5 text-[#D7BD8A]" />
                      <span>{t.auth.signInBtn}</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-normal text-[#143B2B]">
                        {authUser.email}
                      </p>
                      <p className="text-[11px] font-light text-[#83662F]">
                        {t.auth.connectedStatus}
                      </p>
                    </div>
                    <button
                      type="button"
                      id="infos-signout-btn"
                      onClick={() => void signOut()}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#ECE7DE] bg-white px-2.5 py-1.5 text-[11px] font-normal text-[#143B2B]"
                    >
                      <LogOut className="h-3 w-3 stroke-[1.5] text-[#B39258]" />
                      <span>{t.auth.signOutBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </article>
        )}

        {/* 2. Langue de l'application (Auto / Français / English) */}
        <article className="ivy-card overflow-hidden rounded-2xl">
          <button
            type="button"
            id="infos-toggle-language"
            onClick={() => toggleSection('language')}
            className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                {t.infos.languageTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                id="infos-language-badge"
                className="text-[11px] font-light text-[#5F7067]"
              >
                {languageBadge}
              </span>
              {openSections.language ? (
                <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              ) : (
                <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              )}
            </div>
          </button>

          {openSections.language && (
            <div className="space-y-3 border-t border-[#F2EDE4] px-4 py-3.5 text-[12.5px] font-light text-[#5F7067]">
              <div
                role="group"
                aria-label={t.infos.languageTitle}
                className="grid grid-cols-3 gap-1 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] p-1"
              >
                {(
                  [
                    { value: 'auto', label: t.infos.languageAuto },
                    { value: 'fr', label: 'Français' },
                    { value: 'en', label: 'English' },
                  ] as { value: LanguagePreference; label: string }[]
                ).map((opt) => {
                  const active = langPref === opt.value;
                  return (
                    <button
                      key={opt.value}
                      id={`lang-pref-${opt.value}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setLangPref(opt.value)}
                      className={`rounded-lg px-2 py-2 text-[12px] transition ${
                        active
                          ? 'bg-[#143B2B] font-medium text-[#FAF8F4]'
                          : 'bg-transparent font-light text-[#5F7067] hover:bg-[#ECE7DE]/60 hover:text-[#143B2B]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1 text-[11.5px] font-light leading-relaxed text-[#5F7067]">
                {langPref === 'auto' && (
                  <p id="lang-detected-hint" className="text-[#83662F]">
                    {t.infos.languageDetectedPrefix}{' '}
                    <span className="font-normal text-[#143B2B]">
                      {detectedDeviceLang === 'fr' ? 'Français' : 'English'}
                    </span>
                    .
                  </p>
                )}
                <p>{t.infos.languageContentNote}</p>
              </div>
            </div>
          )}
        </article>

        {/* 3. Installer l'application (adaptatif iOS / Android / Desktop / Installée) */}
        <article className="ivy-card overflow-hidden rounded-2xl">
          <button
            type="button"
            id="infos-toggle-pwa"
            onClick={() => toggleSection('pwa')}
            className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
                {isInstalledPwa
                  ? t.infos.pwaTitleInstalled
                  : devicePlatform === 'iphone'
                    ? t.infos.pwaTitleIos
                    : devicePlatform === 'ipad'
                      ? t.infos.pwaTitleIpad
                      : devicePlatform === 'android'
                        ? t.infos.pwaTitleAndroid
                        : t.infos.pwaTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {isInstalledPwa && (
                <span className="inline-flex items-center gap-1 text-[11px] font-light text-[#5F7067]">
                  <Check className="h-3.5 w-3.5 stroke-[1.7] text-[#143B2B]" />
                  <span>{t.infos.pwaInstalledBadge}</span>
                </span>
              )}
              {openSections.pwa ? (
                <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              ) : (
                <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
              )}
            </div>
          </button>

          {openSections.pwa && (
            <div className="space-y-2.5 border-t border-[#F2EDE4] px-4 py-3.5 text-[12.5px] font-light leading-relaxed text-[#5F7067]">
              {isInstalledPwa ? (
                <p>{t.infos.pwaInstalledGuide}</p>
              ) : (
                <>
                  {installPrompt && (
                    <button
                      type="button"
                      onClick={() => {
                        void installPrompt.prompt();
                        setInstallPrompt(null);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[12.5px] font-normal text-[#FAF8F4]"
                    >
                      {t.infos.pwaInstallBtn}
                    </button>
                  )}
                  {devicePlatform === 'iphone' || devicePlatform === 'ipad' ? (
                    <p>{t.infos.pwaGuideIos}</p>
                  ) : devicePlatform === 'android' ? (
                    <p>{t.infos.pwaGuideAndroid}</p>
                  ) : (
                    <div className="space-y-2">
                      <p>{t.infos.pwaGuideDesktopIntro}</p>
                      <div className="space-y-1.5 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2.5 text-[12px]">
                        <p>
                          <span className="font-normal text-[#143B2B]">
                            {t.infos.pwaLabelIos} :{' '}
                          </span>
                          {t.infos.pwaShortIos}
                        </p>
                        <p>
                          <span className="font-normal text-[#143B2B]">
                            {t.infos.pwaLabelAndroid} :{' '}
                          </span>
                          {t.infos.pwaShortAndroid}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
