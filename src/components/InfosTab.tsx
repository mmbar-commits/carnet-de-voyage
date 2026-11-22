import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Award,
  Check,
  CheckSquare,
  Cloud,
  Copy,
  Download,
  ExternalLink,
  Home,
  Luggage,
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

const CHECKLIST_CATEGORIES: Record<ChecklistItem['category'], string> = {
  papiers: 'Papiers & Bancaire',
  reservations: 'Réservations',
  bagages: 'Bagages Cabine',
  enfants: 'Aya & Adam',
};

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

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [newCheckLabel, setNewCheckLabel] = useState('');
  const [newCheckCategory, setNewCheckCategory] =
    useState<ChecklistItem['category']>('bagages');
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

  const copyText = async (text: string, onSuccess: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onSuccess();
    } catch {
      // Fallback ignored gracefully
    }
  };

  const buildWhatsappSummary = () => {
    const totalGbp = state.expenses.reduce((s, e) => s + e.amountGbp, 0);
    const totalMad = Math.round(totalGbp * state.rates.madPerGbp);
    const doneSteps = state.steps.filter((s) => s.done).length;
    const checkedItems = state.checklist.filter((c) => c.checked).length;

    return [
      '🇬🇧 *Londres en Famille — Noël 2026* (22 déc. → 1er jan.)',
      `✈️ Aller RAM AT800 : 22 déc. CMN 13h05 → LHR 15h25`,
      `✈️ Retour RAM AT801 : 1er jan. LHR 17h15 → CMN 21h30 (bagages cabine uniquement)`,
      `🏠 Appartement : ${ACCOMMODATION_INFO.fullAddress}`,
      `🚇 Piccadilly Line : Hyde Park Corner / Green Park`,
      `🎟️ Tower Hamlets £1 : 27 déc. (Tour de Londres + Tower Bridge — ~£120 économisés)`,
      `⚠️ 1er jan. : Parade Piccadilly 13h00 → Piccadilly Line vers LHR à 13h45 (aucun taxi)`,
      `💶 Budget estimé : £${totalGbp.toFixed(0)} (~${totalMad.toLocaleString('fr-FR')} MAD)`,
      `✅ Avancement : ${doneSteps}/${state.steps.length} étapes · Check-list ${checkedItems}/${state.checklist.length}`,
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
          ? 'Sauvegarde JSON importée avec succès.'
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
    addChecklistItem(newCheckLabel, newCheckCategory);
    setNewCheckLabel('');
  };

  const checkedCount = state.checklist.filter((c) => c.checked).length;

  return (
    <section id="tab-panel-infos" className="space-y-4">
      <div className="pt-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B39258]">
          Pratique · Logistique & Synchro
        </span>
        <h2 className="font-editorial mt-1 text-[28px] font-semibold leading-tight text-[#143B2B]">
          Infos & Préparatifs
        </h2>
      </div>

      {/* 1. Flights RAM */}
      <article className="ivy-card rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 shrink-0 text-[#B39258]" />
            <h3 className="font-editorial text-[21px] font-semibold text-[#143B2B]">
              Vols {FLIGHT_INFO.airline}
            </h3>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[#FDF3F4] px-2.5 py-1 text-[10.5px] font-bold text-[#7C2D36]">
            <Luggage className="h-3 w-3" />
            Cabine uniquement
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {[
            { label: 'Aller', f: FLIGHT_INFO.outbound },
            { label: 'Retour', f: FLIGHT_INFO.inbound },
          ].map(({ label, f }) => (
            <div
              key={f.code}
              className="rounded-xl border border-[#E7E2D8] bg-[#FAF8F4] p-3"
            >
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#8F7038]">
                <span>
                  {label} · {f.code}
                </span>
                <span>{f.date}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[13px] font-semibold text-[#143B2B]">
                <span>
                  {f.from} <strong className="tabular-nums">{f.departure}</strong>
                </span>
                <span className="text-[#B39258]">→</span>
                <span className="text-right">
                  {f.to} <strong className="tabular-nums">{f.arrival}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2.5 text-[12px] text-[#4C6358]">
          {FLIGHT_INFO.baggageNote} (liquides &lt; 100 ml en pochette transparente).
        </p>
      </article>

      {/* 2. Accommodation W1J 7SU */}
      <article className="ivy-card rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-[#B39258]" />
          <h3 className="font-editorial text-[22px] font-semibold text-[#143B2B]">
            {ACCOMMODATION_INFO.label} · {ACCOMMODATION_INFO.postcode}
          </h3>
        </div>
        <p className="mt-1.5 text-[13.5px] font-semibold text-[#143B2B]">
          {ACCOMMODATION_INFO.street}, {ACCOMMODATION_INFO.postcode}
        </p>
        <ul className="mt-2 space-y-1 text-[12.5px] text-[#4C6358]">
          {ACCOMMODATION_INFO.stations.map((st) => (
            <li key={st}>• {st}</li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void copyText(ACCOMMODATION_INFO.fullAddress, () => {
                setCopiedAddress(true);
                window.setTimeout(() => setCopiedAddress(false), 1800);
              })
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2D8] bg-[#FAF8F4] px-3 py-2 text-[12px] font-semibold text-[#143B2B]"
          >
            {copiedAddress ? (
              <Check className="h-3.5 w-3.5 text-[#143B2B]" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-[#B39258]" />
            )}
            <span>{copiedAddress ? 'Adresse copiée' : 'Copier l’adresse'}</span>
          </button>

          <a
            href={ACCOMMODATION_INFO.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#143B2B] px-3.5 py-2 text-[12px] font-semibold text-[#FAF8F4]"
          >
            <span>Google Maps</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#D7BD8A]" />
          </a>
        </div>
      </article>

      {/* 3. Tower Hamlets Memo */}
      <article className="rounded-2xl border border-[#B39258]/50 bg-[#F7F1E4]/70 p-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[#143B2B]" />
          <h3 className="font-editorial text-[21px] font-semibold text-[#143B2B]">
            {TOWER_HAMLETS_MEMO.title}
          </h3>
        </div>
        <p className="mt-1 text-[12px] font-bold text-[#8F7038]">
          {TOWER_HAMLETS_MEMO.savingsSummary}
        </p>
        <ul className="mt-2 space-y-1 text-[12.5px] text-[#143B2B]">
          {TOWER_HAMLETS_MEMO.sites.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
        <div className="mt-2.5 rounded-xl border border-[#B39258]/30 bg-white/85 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#143B2B]">
            Pièces à avoir impérativement le 27 déc.
          </p>
          <ul className="mt-1.5 space-y-1 text-[12px] text-[#4C6358]">
            {TOWER_HAMLETS_MEMO.requiredDocs.map((doc) => (
              <li key={doc}>— {doc}</li>
            ))}
          </ul>
        </div>
      </article>

      {/* 4. Interactive Pre-Departure Checklist */}
      <article className="ivy-card rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-editorial text-[22px] font-semibold text-[#143B2B]">
            Check-list pré-départ
          </h3>
          <span className="rounded-full bg-[#FAF8F4] px-2.5 py-0.5 text-[11.5px] font-bold tabular-nums text-[#143B2B] border border-[#E7E2D8]">
            {checkedCount}/{state.checklist.length}
          </span>
        </div>

        <ul className="mt-3 space-y-2">
          {state.checklist.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-[#E7E2D8]/80 bg-[#FAF8F4] px-3 py-2.5"
            >
              <button
                type="button"
                onClick={() => toggleChecklistItem(item.id)}
                className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
              >
                {item.checked ? (
                  <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#143B2B]" />
                ) : (
                  <Square className="mt-0.5 h-4 w-4 shrink-0 text-[#B39258]" />
                )}
                <div className="min-w-0">
                  <p
                    className={`text-[12.5px] leading-snug text-[#143B2B] ${
                      item.checked ? 'line-through opacity-60' : 'font-medium'
                    }`}
                  >
                    {item.label}
                  </p>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8F7038]">
                    {CHECKLIST_CATEGORIES[item.category]}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => deleteChecklistItem(item.id)}
                aria-label="Retirer de la check-list"
                className="p-1 text-[#4C6358]/60 hover:text-[#7C2D36]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleChecklistSubmit} className="mt-3 flex gap-2">
          <input
            type="text"
            value={newCheckLabel}
            onChange={(e) => setNewCheckLabel(e.target.value)}
            placeholder="Ajouter un pense-bête..."
            className="min-w-0 flex-1 rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[12.5px] text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
          />
          <select
            value={newCheckCategory}
            onChange={(e) =>
              setNewCheckCategory(e.target.value as ChecklistItem['category'])
            }
            aria-label="Catégorie"
            className="rounded-xl border border-[#E7E2D8] bg-white px-2 text-[11.5px] text-[#143B2B]"
          >
            <option value="bagages">Bagages</option>
            <option value="papiers">Papiers</option>
            <option value="reservations">Résas</option>
            <option value="enfants">Enfants</option>
          </select>
          <button
            type="submit"
            aria-label="Ajouter"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#143B2B] text-[#FAF8F4]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>
      </article>

      {/* 5. Family Sync (2 phones) */}
      <article className="ivy-card rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-[#B39258]" />
            <h3 className="font-editorial text-[22px] font-semibold text-[#143B2B]">
              Synchronisation 2 téléphones
            </h3>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
              supabaseReady
                ? 'bg-[#143B2B] text-[#FAF8F4]'
                : 'bg-[#F3EFE7] text-[#4C6358]'
            }`}
          >
            {supabaseReady ? 'Cloud prêt' : 'Mode local'}
          </span>
        </div>

        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#4C6358]">
          {supabaseReady
            ? 'Entrez le même Code Famille sur les deux téléphones pour synchroniser Planning, Carnet et Budget en temps réel.'
            : 'Vos données sont sauvegardées localement et fonctionnent 100 % hors-ligne. Pour activer la synchro temps réel entre les deux téléphones, renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans les variables GitHub Actions.'}
        </p>

        <div className="mt-3 flex gap-2">
          <input
            id="family-code-input"
            type="text"
            value={familyInput}
            onChange={(e) => setFamilyInput(e.target.value)}
            placeholder="LDN-NOEL-2026"
            className="min-w-0 flex-1 rounded-xl border border-[#E7E2D8] bg-[#FAF8F4] px-3 py-2 text-[12.5px] font-bold uppercase tracking-wider text-[#143B2B]"
          />
          <button
            type="button"
            onClick={() => setFamilyCode(familyInput)}
            className="rounded-xl bg-[#143B2B] px-3.5 py-2 text-[12px] font-semibold text-[#FAF8F4]"
          >
            Enregistrer
          </button>
          {supabaseReady && (
            <button
              type="button"
              onClick={() => void triggerManualSync()}
              aria-label="Synchroniser maintenant"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7E2D8] bg-white text-[#143B2B]"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  syncStatus.mode === 'syncing' ? 'animate-spin text-[#B39258]' : ''
                }`}
              />
            </button>
          )}
        </div>

        {!supabaseReady && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => setShowSqlHelp((v) => !v)}
              className="text-[11.5px] font-semibold text-[#8F7038] underline underline-offset-2"
            >
              {showSqlHelp
                ? 'Masquer le schéma SQL Supabase'
                : 'Voir le schéma SQL Supabase (optionnel)'}
            </button>
            {showSqlHelp && (
              <div className="mt-2 rounded-xl border border-[#E7E2D8] bg-[#FAF8F4] p-3">
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
                  className="mt-2 inline-flex items-center gap-1 rounded-lg border border-[#E7E2D8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#143B2B]"
                >
                  <Copy className="h-3 w-3 text-[#B39258]" />
                  <span>{copiedSql ? 'SQL copié' : 'Copier le SQL'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </article>

      {/* 6. WhatsApp Share + Import/Export JSON */}
      <article className="ivy-card rounded-2xl p-4 space-y-3">
        <h3 className="font-editorial text-[22px] font-semibold text-[#143B2B]">
          Partage & Sauvegarde
        </h3>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(buildWhatsappSummary())}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#143B2B] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#FAF8F4]"
          >
            <Share2 className="h-4 w-4 text-[#D7BD8A]" />
            <span>Partager récap WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() =>
              void copyText(buildWhatsappSummary(), () => {
                setCopiedWhatsapp(true);
                window.setTimeout(() => setCopiedWhatsapp(false), 1800);
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7E2D8] bg-[#FAF8F4] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#143B2B]"
          >
            {copiedWhatsapp ? (
              <Check className="h-4 w-4 text-[#143B2B]" />
            ) : (
              <Copy className="h-4 w-4 text-[#B39258]" />
            )}
            <span>{copiedWhatsapp ? 'Récap copié' : 'Copier le récap'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-[#E7E2D8] pt-3">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[12px] font-semibold text-[#143B2B]"
          >
            <Download className="h-3.5 w-3.5 text-[#B39258]" />
            <span>Exporter JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-[12px] font-semibold text-[#143B2B]"
          >
            <Upload className="h-3.5 w-3.5 text-[#B39258]" />
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
          <p className="rounded-xl bg-[#F7F1E4] px-3 py-2 text-[12px] font-medium text-[#143B2B]">
            {importFeedback}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-[#E7E2D8] pt-3">
          <span className="text-[11.5px] text-[#4C6358]">
            Réinitialiser les données par défaut
          </span>
          {confirmReset ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-[#E7E2D8] px-2.5 py-1 text-[11px] font-semibold text-[#4C6358]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  resetTripState();
                  setConfirmReset(false);
                }}
                className="rounded-lg bg-[#7C2D36] px-2.5 py-1 text-[11px] font-semibold text-white"
              >
                Confirmer
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#7C2D36]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>
      </article>

      {/* 7. Android PWA Install Guide */}
      <article className="ivy-card rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-[#B39258]" />
          <h3 className="font-editorial text-[22px] font-semibold text-[#143B2B]">
            Installer l’app sur Android (PWA)
          </h3>
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[#4C6358]">
          Une fois installée sur vos deux téléphones, l’application <strong>LDN 26</strong>{' '}
          s’ouvre en plein écran et reste 100 % consultable dans le métro sans réseau.
        </p>

        {installPrompt && (
          <button
            type="button"
            onClick={() => {
              void installPrompt.prompt();
              setInstallPrompt(null);
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[12.5px] font-semibold text-[#FAF8F4]"
          >
            <Smartphone className="h-4 w-4 text-[#D7BD8A]" />
            <span>Installer LDN 26 sur cet appareil</span>
          </button>
        )}

        <ol className="mt-3 space-y-1.5 text-[12.5px] text-[#143B2B]">
          <li>
            <strong>1.</strong> Ouvrez le lien dans <strong>Chrome Android</strong>.
          </li>
          <li>
            <strong>2.</strong> Touchez le menu <strong>⋮</strong> en haut à droite.
          </li>
          <li>
            <strong>3.</strong> Choisissez{' '}
            <strong>« Installer l’application »</strong> ou{' '}
            <strong>« Ajouter à l’écran d’accueil »</strong>.
          </li>
          <li>
            <strong>4.</strong> L’icône <strong>LDN 26</strong> vert Ivy & laiton
            apparaît parmi vos apps, prête pour le mode avion / Tube !
          </li>
        </ol>
      </article>
    </section>
  );
}
