import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Award,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Cloud,
  Copy,
  Download,
  ExternalLink,
  Home,
  Plane,
  Plus,
  RefreshCw,
  RotateCcw,
  Share2,
  Smartphone,
  Square,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ACCOMMODATION_INFO,
  FLIGHT_INFO,
  SUPABASE_SQL_SNIPPET,
  TOWER_HAMLETS_MEMO,
} from '../data/infos';
import { useTrip } from '../store/TripContext';
import { isSupabaseConfigured } from '../store/sync';
import type { ChecklistItem } from '../types/trip';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type SectionKey = 'flights' | 'home' | 'th' | 'checklist' | 'sync' | 'share' | 'pwa';

export function InfosTab() {
  const {
    state,
    syncStatus,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    setFamilyCode,
    triggerManualSync,
    exportTripJson,
    importTripJson,
    resetTripState,
  } = useTrip();

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    flights: false,
    home: false,
    th: false,
    checklist: false,
    sync: false,
    share: false,
    pwa: false,
  });

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [newCheckLabel, setNewCheckLabel] = useState('');
  const [familyInput, setFamilyInput] = useState(syncStatus.familyCode);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyText = async (text: string, onSuccess: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onSuccess();
    } catch {
      // Ignore
    }
  };

  const buildWhatsappSummary = () => {
    const totalGbp = state.expenses.reduce((s, e) => s + e.amountGbp, 0);
    const totalMad = Math.round(totalGbp * state.rates.madPerGbp);
    return [
      'Londres en Famille — Noël 2026 (22 déc. → 1er jan.)',
      `Aller RAM AT800 : 22 déc. CMN 13h05 → LHR 15h25`,
      `Retour RAM AT801 : 1er jan. LHR 17h15 → CMN 21h30 (cabine uniquement)`,
      `Appartement : ${ACCOMMODATION_INFO.fullAddress}`,
      `Tower Hamlets £1 : 27 déc. (Tour de Londres + Tower Bridge)`,
      `1er jan. : Piccadilly Line depuis Hyde Park Corner vers 13h45 (zéro taxi)`,
      `Budget estimé : £${totalGbp.toFixed(0)} (~${totalMad.toLocaleString('fr-FR')} MAD)`,
    ].join('\n');
  };

  const handleExportJson = () => {
    const content = exportTripJson();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `londres-noel-2026-${new Date().toISOString().slice(0, 10)}.json`;
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
          ? 'Sauvegarde importée.'
          : result.error || 'Erreur lors de l’import.'
      );
      window.setTimeout(() => setImportFeedback(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleChecklistSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newCheckLabel.trim()) return;
    addChecklistItem(newCheckLabel, 'bagages' as ChecklistItem['category']);
    setNewCheckLabel('');
  };

  const checkedCount = state.checklist.filter((c) => c.checked).length;

  return (
    <section id="tab-panel-infos" className="space-y-4">
      <div className="pt-2">
        <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-[#B39258]">
          Pratique · Mayfair W1J 7SU
        </span>
        <h2 className="font-editorial mt-1 text-[30px] font-normal leading-tight text-[#143B2B]">
          Infos & Préparatifs
        </h2>
      </div>

      {/* 1. Vols Royal Air Maroc */}
      <article className="ivy-card overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => toggleSection('flights')}
          className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
        >
          <div className="flex items-center gap-2.5">
            <Plane className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
            <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
              Vols Royal Air Maroc
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-light text-[#7C2D36]">Cabine</span>
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
              { label: 'Aller', f: FLIGHT_INFO.outbound },
              { label: 'Retour', f: FLIGHT_INFO.inbound },
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
                    <span>Suivi</span>
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
                  Terminaux :{' '}
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
          onClick={() => toggleSection('home')}
          className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
        >
          <div className="flex items-center gap-2.5">
            <Home className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
            <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
              Appartement · W1J 7SU
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
              Piccadilly Line directe Heathrow : Hyde Park Corner (5 min) et Green Park (7 min).
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
                <span>{copiedAddress ? 'Copié' : 'Copier'}</span>
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
          onClick={() => toggleSection('th')}
          className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
        >
          <div className="flex items-center gap-2.5">
            <Award className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
            <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
              Mémo Tower Hamlets (£1)
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
              Justificatifs requis le 27 déc.
            </p>
            <ul className="space-y-1">
              {TOWER_HAMLETS_MEMO.requiredDocs.map((doc) => (
                <li key={doc}>— {doc}</li>
              ))}
            </ul>
          </div>
        )}
      </article>

      {/* 4. Check-list pré-départ */}
      <article className="ivy-card overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => toggleSection('checklist')}
          className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
        >
          <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
            Check-list pré-départ
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
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
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
                  <button
                    type="button"
                    onClick={() => deleteChecklistItem(item.id)}
                    aria-label="Supprimer"
                    className="p-0.5 text-[#5F7067]/50 hover:text-[#7C2D36]"
                  >
                    <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleChecklistSubmit} className="mt-2.5 flex gap-2">
              <input
                type="text"
                value={newCheckLabel}
                onChange={(e) => setNewCheckLabel(e.target.value)}
                placeholder="Ajouter un pense-bête..."
                className="min-w-0 flex-1 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Ajouter"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#143B2B] text-[#FAF8F4]"
              >
                <Plus className="h-4 w-4 stroke-[1.6]" />
              </button>
            </form>
          </div>
        )}
      </article>

      {/* 5. Synchronisation multi-appareils */}
      <article className="ivy-card overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => toggleSection('sync')}
          className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
        >
          <div className="flex items-center gap-2.5">
            <Cloud className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
            <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
              Synchro multi-appareils
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-light text-[#5F7067]">
              {supabaseReady ? 'Cloud' : 'Local'}
            </span>
            {openSections.sync ? (
              <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
            ) : (
              <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
            )}
          </div>
        </button>

        {openSections.sync && (
          <div className="space-y-3 border-t border-[#F2EDE4] px-4 py-3.5 text-[12.5px] font-light text-[#5F7067]">
            <p className="leading-relaxed">
              {supabaseReady
                ? 'Saisissez le même Code Famille sur autant de téléphones, tablettes ou PC que vous voulez pour synchroniser en temps réel.'
                : 'Sauvegarde locale active hors-ligne. Pour la synchro temps réel, ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans GitHub Actions.'}
            </p>
            <div className="flex gap-2">
              <input
                id="family-code-input"
                type="text"
                value={familyInput}
                onChange={(e) => setFamilyInput(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-medium uppercase tracking-wider text-[#143B2B]"
              />
              <button
                type="button"
                onClick={() => setFamilyCode(familyInput)}
                className="rounded-xl bg-[#143B2B] px-3.5 py-2 text-[12px] font-normal text-[#FAF8F4]"
              >
                OK
              </button>
              {supabaseReady && (
                <button
                  type="button"
                  onClick={() => void triggerManualSync()}
                  aria-label="Synchroniser"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECE7DE] bg-white text-[#143B2B]"
                >
                  <RefreshCw
                    className={`h-4 w-4 stroke-[1.5] ${
                      syncStatus.mode === 'syncing' ? 'animate-spin text-[#B39258]' : ''
                    }`}
                  />
                </button>
              )}
            </div>
            {supabaseReady && syncStatus.mode === 'synced' && syncStatus.lastSyncedAt && (
              <p className="text-[11.5px] font-normal text-[#143B2B]">
                ✓ Synchronisé à{' '}
                {new Date(syncStatus.lastSyncedAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
            {supabaseReady && syncStatus.mode === 'error' && (
              <p className="rounded-xl bg-[#FCF5F5] px-3 py-2 text-[11.5px] text-[#7C2D36]">
                Erreur de synchro : {syncStatus.errorMessage || 'vérifiez la table trip_sync dans Supabase'}
              </p>
            )}
            {(!supabaseReady || syncStatus.mode === 'error') && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowSqlHelp((v) => !v)}
                  className="text-[11.5px] font-normal text-[#8F7038]"
                >
                  {showSqlHelp ? 'Masquer le SQL Supabase' : 'Voir le SQL Supabase'}
                </button>
                {showSqlHelp && (
                  <div className="mt-2 rounded-xl bg-[#FAF8F4] p-3">
                    <pre className="overflow-x-auto text-[10.5px] leading-relaxed text-[#143B2B]">
                      {SUPABASE_SQL_SNIPPET}
                    </pre>
                    <button
                      type="button"
                      onClick={() =>
                        void copyText(SUPABASE_SQL_SNIPPET, () => {
                          setCopiedSql(true);
                          window.setTimeout(() => setCopiedSql(false), 1800);
                        })
                      }
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-normal text-[#143B2B]"
                    >
                      <Copy className="h-3 w-3 text-[#B39258]" />
                      <span>{copiedSql ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </article>

      {/* 6. Partage WhatsApp & JSON */}
      <article className="ivy-card overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => toggleSection('share')}
          className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
        >
          <div className="flex items-center gap-2.5">
            <Share2 className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
            <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
              Partage & Sauvegarde
            </h3>
          </div>
          {openSections.share ? (
            <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
          ) : (
            <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
          )}
        </button>

        {openSections.share && (
          <div className="space-y-2.5 border-t border-[#F2EDE4] px-4 py-3.5">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(buildWhatsappSummary())}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#143B2B] py-2.5 text-[12px] font-normal text-[#FAF8F4]"
              >
                <Share2 className="h-3.5 w-3.5 stroke-[1.5] text-[#D7BD8A]" />
                <span>WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() =>
                  void copyText(buildWhatsappSummary(), () => {
                    setCopiedWhatsapp(true);
                    window.setTimeout(() => setCopiedWhatsapp(false), 1800);
                  })
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4] py-2.5 text-[12px] font-normal text-[#143B2B]"
              >
                <Copy className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                <span>{copiedWhatsapp ? 'Copié' : 'Copier récap'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ECE7DE] bg-white py-2 text-[12px] font-light text-[#143B2B]"
              >
                <Download className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                <span>Exporter JSON</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ECE7DE] bg-white py-2 text-[12px] font-light text-[#143B2B]"
              >
                <Upload className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                <span>Importer JSON</span>
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
              <p className="text-[12px] font-light text-[#143B2B]">{importFeedback}</p>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11.5px] font-light text-[#5F7067]">
                Données par défaut
              </span>
              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="text-[11.5px] font-light text-[#5F7067]"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetTripState();
                      setConfirmReset(false);
                    }}
                    className="rounded-lg bg-[#7C2D36] px-2.5 py-1 text-[11px] font-normal text-white"
                  >
                    Confirmer
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1 text-[11.5px] font-light text-[#7C2D36]"
                >
                  <RotateCcw className="h-3 w-3 stroke-[1.5]" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>
          </div>
        )}
      </article>

      {/* 7. Guide PWA Android */}
      <article className="ivy-card overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => toggleSection('pwa')}
          className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
            <h3 className="font-editorial text-[21px] font-normal text-[#143B2B]">
              Installer sur Android
            </h3>
          </div>
          {openSections.pwa ? (
            <ChevronUp className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
          ) : (
            <ChevronDown className="h-4 w-4 stroke-[1.5] text-[#B39258]" />
          )}
        </button>

        {openSections.pwa && (
          <div className="space-y-2.5 border-t border-[#F2EDE4] px-4 py-3.5 text-[12.5px] font-light leading-relaxed text-[#5F7067]">
            {installPrompt && (
              <button
                type="button"
                onClick={() => {
                  void installPrompt.prompt();
                  setInstallPrompt(null);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[12.5px] font-normal text-[#FAF8F4]"
              >
                Installer LDN 26
              </button>
            )}
            <p>
              Dans <span className="font-normal text-[#143B2B]">Chrome Android</span> :
              touchez <span className="font-normal text-[#143B2B]">⋮</span> puis{' '}
              <span className="font-normal text-[#143B2B]">Installer l’application</span>.
              L’app reste 100 % accessible hors-ligne dans le métro.
            </p>
          </div>
        )}
      </article>
    </section>
  );
}
