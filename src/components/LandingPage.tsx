import { useState, type FormEvent } from 'react';
import {
  BookOpen,
  CalendarDays,
  Compass,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';

export function LandingPage() {
  const {
    lang,
    setLang,
    signIn,
    signUp,
    sendMagicLink,
    signInWithGoogle,
  } = useTrip();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [useMagicLink, setUseMagicLink] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const t = UI_TEXT[lang];
  const isMagic = tab === 'login' && useMagicLink;

  const switchTab = (next: 'login' | 'signup') => {
    setTab(next);
    if (next === 'signup') {
      setUseMagicLink(false);
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
    try {
      const res = await signInWithGoogle();
      if (!res.ok) {
        setErrorMsg(res.error || 'Error');
        setBusy(false);
      }
    } catch {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setBusy(true);
    try {
      if (isMagic) {
        const res = await sendMagicLink(trimmedEmail);
        if (!res.ok) {
          setErrorMsg(res.error || 'Error');
        } else {
          setSuccessMsg(t.auth.magicSent);
        }
      } else if (tab === 'signup') {
        const res = await signUp(trimmedEmail, password);
        if (!res.ok) {
          setErrorMsg(res.error || 'Error');
        } else if (res.needsConfirmation) {
          setSuccessMsg(t.auth.confirmEmailSent);
        }
      } else {
        const res = await signIn(trimmedEmail, password);
        if (!res.ok) {
          setErrorMsg(res.error || 'Error');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      id="landing-page"
      className="min-h-dvh bg-[#FAF8F4] text-[#143B2B] selection:bg-[#143B2B] selection:text-[#FAF8F4]"
    >
      {/* Subtle antique brass top hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#B39258]/60 to-transparent" />

      <div className="mx-auto flex min-h-[calc(100dvh-2px)] max-w-md flex-col px-5 pt-4 pb-8">
        {/* Top bar: Brand crest + FR/EN toggle */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl border border-[#B39258]/65 bg-[#143B2B] text-[#FAF8F4] shadow-[0_2px_6px_rgba(20,59,43,0.12)]"
            >
              <span className="font-editorial text-[10px] font-medium tracking-[0.16em] leading-none">
                CV
              </span>
              <span className="my-0.5 h-[0.75px] w-4 bg-[#B39258]" />
              <Compass className="h-2.5 w-2.5 stroke-[1.6] text-[#D7BD8A]" />
            </div>
            <span className="font-editorial text-[18px] font-medium tracking-tight text-[#143B2B]">
              {t.landing.brandName}
            </span>
          </div>

          <div
            role="group"
            aria-label="Language"
            className="inline-flex rounded-full border border-[#ECE7DE] bg-white p-0.5 shadow-[0_1px_2px_rgba(20,59,43,0.03)]"
          >
            {(['fr', 'en'] as const).map((code) => (
              <button
                key={code}
                id={`landing-lang-toggle-${code}`}
                type="button"
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
                className={`rounded-full px-2.5 py-0.5 text-[10.5px] uppercase tracking-wider transition ${
                  lang === code
                    ? 'bg-[#143B2B] font-medium text-[#FAF8F4]'
                    : 'font-light text-[#5F7067] hover:text-[#143B2B]'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </header>

        {/* Hero */}
        <section className="mt-7 text-center">
          <p className="text-[10.5px] font-normal uppercase tracking-[0.2em] text-[#B39258]">
            {t.landing.eyebrow}
          </p>
          <h1 className="font-editorial mt-2 text-[36px] font-normal leading-[1.08] tracking-tight text-[#143B2B]">
            {t.landing.heroLead}{' '}
            <span className="italic text-[#1E543E]">{t.landing.heroAccent}</span>{' '}
            {t.landing.heroTail}
          </h1>
          <div
            aria-hidden="true"
            className="mx-auto my-3.5 flex items-center justify-center gap-2"
          >
            <span className="h-[1px] w-8 bg-[#B39258]/50" />
            <span className="h-1 w-1 rotate-45 bg-[#B39258]" />
            <span className="h-[1px] w-8 bg-[#B39258]/50" />
          </div>
          <p className="mx-auto max-w-[320px] text-[13px] font-light leading-relaxed text-[#5F7067]">
            {t.landing.subtitle}
          </p>
        </section>

        {/* Embedded Auth Card */}
        <section
          aria-label={t.auth.sectionTitle}
          className="ivy-card mt-6 rounded-3xl p-5 shadow-[0_8px_30px_rgba(20,59,43,0.045)]"
        >
          {/* Segmented tabs: Connexion / Créer un compte */}
          <div
            role="tablist"
            aria-label={t.auth.sectionTitle}
            className="grid grid-cols-2 gap-1 rounded-2xl border border-[#ECE7DE] bg-[#FAF8F4] p-1"
          >
            <button
              type="button"
              role="tab"
              id="landing-tab-login"
              aria-selected={tab === 'login'}
              onClick={() => switchTab('login')}
              className={`rounded-xl py-2 text-[12px] transition ${
                tab === 'login'
                  ? 'bg-[#143B2B] font-medium text-[#FAF8F4] shadow-[0_1px_2px_rgba(20,59,43,0.12)]'
                  : 'font-light text-[#5F7067] hover:text-[#143B2B]'
              }`}
            >
              {t.auth.modalLoginTitle}
            </button>
            <button
              type="button"
              role="tab"
              id="landing-tab-signup"
              aria-selected={tab === 'signup'}
              onClick={() => switchTab('signup')}
              className={`rounded-xl py-2 text-[12px] transition ${
                tab === 'signup'
                  ? 'bg-[#143B2B] font-medium text-[#FAF8F4] shadow-[0_1px_2px_rgba(20,59,43,0.12)]'
                  : 'font-light text-[#5F7067] hover:text-[#143B2B]'
              }`}
            >
              {t.auth.modalSignUpTitle}
            </button>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            id="landing-google-btn"
            disabled={busy}
            onClick={() => void handleGoogleSignIn()}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#ECE7DE] bg-white py-2.5 text-[13px] font-normal text-[#143B2B] shadow-[0_1px_2px_rgba(20,59,43,0.03)] transition hover:border-[#B39258] disabled:opacity-50"
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            <span>{t.auth.continueWithGoogle}</span>
          </button>

          <div className="my-3.5 flex items-center gap-3">
            <span className="h-[1px] flex-1 bg-[#ECE7DE]" />
            <span className="text-[11px] font-light text-[#5F7067]">
              {t.auth.orDivider}
            </span>
            <span className="h-[1px] flex-1 bg-[#ECE7DE]" />
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
            <div>
              <label
                htmlFor="landing-email-input"
                className="block text-[11.5px] font-light text-[#5F7067]"
              >
                {t.auth.emailLabel}
              </label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-[#B39258]" />
                <input
                  id="landing-email-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.landing.emailPlaceholder}
                  className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4]/70 py-2.5 pr-3 pl-9 text-[13.5px] font-light text-[#143B2B] placeholder:text-[#5F7067]/55 focus:border-[#143B2B] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {!isMagic && (
              <div>
                <label
                  htmlFor="landing-password-input"
                  className="block text-[11.5px] font-light text-[#5F7067]"
                >
                  {t.auth.passwordLabel}
                </label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-[#B39258]" />
                  <input
                    id="landing-password-input"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={
                      tab === 'signup' ? 'new-password' : 'current-password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#ECE7DE] bg-[#FAF8F4]/70 py-2.5 pr-3 pl-9 text-[13.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <p
                id="landing-auth-error"
                className="rounded-xl bg-[#FCF5F5] px-3 py-2 text-[12px] font-light text-[#7C2D36]"
              >
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p
                id="landing-auth-success"
                className="rounded-xl border border-[#E2D6BE] bg-[#F8F3E9] px-3 py-2.5 text-[12px] font-normal leading-relaxed text-[#143B2B]"
              >
                {successMsg}
              </p>
            )}

            <button
              id="landing-submit-btn"
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[13px] font-normal text-[#FAF8F4] shadow-[0_2px_8px_rgba(20,59,43,0.14)] transition hover:bg-[#1E543E] disabled:opacity-50"
            >
              {isMagic && <Sparkles className="h-3.5 w-3.5 text-[#D7BD8A]" />}
              <span>
                {busy
                  ? '...'
                  : tab === 'signup'
                    ? t.auth.submitSignUp
                    : isMagic
                      ? t.auth.submitMagic
                      : t.auth.submitLogin}
              </span>
            </button>
          </form>

          {/* Toggle between Magic Link (default) & Password inside Connexion */}
          {tab === 'login' && (
            <div className="mt-3.5 text-center">
              <button
                type="button"
                id="landing-toggle-magic-btn"
                onClick={() => {
                  setUseMagicLink((v) => !v);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ECE7DE] bg-[#FAF8F4]/70 px-3.5 py-2 text-[12px] font-normal text-[#143B2B] transition hover:border-[#B39258] hover:bg-white"
              >
                {isMagic ? (
                  <Lock className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                )}
                <span>
                  {isMagic ? t.auth.switchToPassword : t.auth.switchToMagic}
                </span>
              </button>
            </div>
          )}
        </section>

        {/* 3-item Feature Strip */}
        <section
          aria-label="Features"
          className="mt-6 grid grid-cols-3 gap-2.5"
        >
          <div className="rounded-2xl border border-[#ECE7DE] bg-white/80 px-2.5 py-3 text-center">
            <CalendarDays className="mx-auto h-4 w-4 stroke-[1.5] text-[#B39258]" />
            <p className="font-editorial mt-1.5 text-[15px] font-medium leading-tight text-[#143B2B]">
              {t.landing.features.planningTitle}
            </p>
            <p className="mt-0.5 text-[10.5px] font-light text-[#5F7067]">
              {t.landing.features.planningDesc}
            </p>
          </div>

          <div className="rounded-2xl border border-[#ECE7DE] bg-white/80 px-2.5 py-3 text-center">
            <BookOpen className="mx-auto h-4 w-4 stroke-[1.5] text-[#B39258]" />
            <p className="font-editorial mt-1.5 text-[15px] font-medium leading-tight text-[#143B2B]">
              {t.landing.features.journalTitle}
            </p>
            <p className="mt-0.5 text-[10.5px] font-light text-[#5F7067]">
              {t.landing.features.journalDesc}
            </p>
          </div>

          <div className="rounded-2xl border border-[#ECE7DE] bg-white/80 px-2.5 py-3 text-center">
            <Wallet className="mx-auto h-4 w-4 stroke-[1.5] text-[#B39258]" />
            <p className="font-editorial mt-1.5 text-[15px] font-medium leading-tight text-[#143B2B]">
              {t.landing.features.budgetTitle}
            </p>
            <p className="mt-0.5 text-[10.5px] font-light text-[#5F7067]">
              {t.landing.features.budgetDesc}
            </p>
          </div>
        </section>

        {/* Privacy Note Footer */}
        <footer className="mt-auto pt-6 text-center">
          <p className="mx-auto max-w-[330px] text-[11px] font-light leading-relaxed text-[#5F7067]">
            <ShieldCheck className="mr-1.5 inline-block h-3.5 w-3.5 align-[-2px] stroke-[1.5] text-[#B39258]" />
            <span>{t.landing.privacyNote}</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
