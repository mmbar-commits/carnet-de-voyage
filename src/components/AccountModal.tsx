import { useState, type FormEvent } from 'react';
import { ArrowLeft, Lock, Mail, Sparkles, X } from 'lucide-react';
import { UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';

export function AccountModal() {
  const {
    lang,
    accountModalOpen,
    setAccountModalOpen,
    signIn,
    signUp,
    sendMagicLink,
    sendPasswordReset,
    signInWithGoogle,
  } = useTrip();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [useMagicLink, setUseMagicLink] = useState(true);
  const [resetMode, setResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!accountModalOpen) return null;

  const t = UI_TEXT[lang];
  const isMagic = tab === 'login' && useMagicLink;

  const handleClose = () => {
    setResetMode(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    setAccountModalOpen(false);
  };

  const switchTab = (next: 'login' | 'signup') => {
    setTab(next);
    setResetMode(false);
    if (next === 'signup') setUseMagicLink(false);
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
      if (resetMode) {
        const res = await sendPasswordReset(trimmedEmail);
        if (!res.ok) {
          setErrorMsg(res.error || 'Error');
        } else {
          setSuccessMsg(t.auth.resetPasswordSent);
        }
      } else if (isMagic) {
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
        } else {
          handleClose();
        }
      } else {
        const res = await signIn(trimmedEmail, password);
        if (!res.ok) {
          setErrorMsg(res.error || 'Error');
        } else {
          handleClose();
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const title = resetMode
    ? t.auth.resetPasswordTitle
    : tab === 'signup'
      ? t.auth.modalSignUpTitle
      : t.auth.modalLoginTitle;

  return (
    <div
      id="account-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#143B2B]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
    >
      <div className="w-full max-w-md rounded-t-3xl border border-[#ECE7DE] bg-[#FAF8F4] px-5 pt-5 pb-7 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10.5px] font-normal uppercase tracking-[0.16em] text-[#B39258]">
              {t.auth.sectionTitle}
            </span>
            <h2
              id="account-modal-title"
              className="font-editorial mt-0.5 text-[28px] font-normal leading-tight text-[#143B2B]"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t.cancel}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECE7DE] bg-white text-[#5F7067] hover:text-[#143B2B]"
          >
            <X className="h-4 w-4 stroke-[1.6]" />
          </button>
        </div>

        {resetMode ? (
          <div id="auth-reset-panel" className="mt-3">
            <p className="text-[12px] font-light leading-relaxed text-[#5F7067]">
              {t.auth.resetPasswordDesc}
            </p>

            <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3.5">
              <div>
                <label
                  htmlFor="auth-reset-email-input"
                  className="block text-[11.5px] font-light text-[#5F7067]"
                >
                  {t.auth.emailLabel}
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-[#B39258]" />
                  <input
                    id="auth-reset-email-input"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.landing.emailPlaceholder}
                    className="w-full rounded-xl border border-[#ECE7DE] bg-white py-2.5 pr-3 pl-9 text-[13.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="rounded-xl bg-[#FCF5F5] px-3 py-2 text-[12px] font-light text-[#7C2D36]">
                  {errorMsg}
                </p>
              )}

              {successMsg && (
                <p className="rounded-xl border border-[#E2D6BE] bg-[#F8F3E9] px-3 py-2.5 text-[12px] font-normal leading-relaxed text-[#143B2B]">
                  {successMsg}
                </p>
              )}

              <button
                id="auth-reset-submit-btn"
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[13px] font-normal text-[#FAF8F4] transition hover:bg-[#1E543E] disabled:opacity-50"
              >
                <span>{busy ? '...' : t.auth.submitResetPassword}</span>
              </button>
            </form>

            <div className="mt-3.5 text-center">
              <button
                type="button"
                id="auth-reset-back-btn"
                onClick={() => {
                  setResetMode(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="inline-flex items-center justify-center gap-1.5 text-[12px] font-normal text-[#5F7067] transition hover:text-[#143B2B]"
              >
                <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5] text-[#B39258]" />
                <span>{t.auth.backToLogin}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Clear segmented tabs: Connexion vs Créer un compte */}
            <div
              role="tablist"
              aria-label={t.auth.sectionTitle}
              className="mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-[#ECE7DE] bg-white p-1"
            >
              <button
                type="button"
                role="tab"
                id="auth-tab-login"
                aria-selected={tab === 'login'}
                onClick={() => switchTab('login')}
                className={`rounded-xl py-2 text-[12px] transition ${
                  tab === 'login'
                    ? 'bg-[#143B2B] font-medium text-[#FAF8F4]'
                    : 'font-light text-[#5F7067] hover:text-[#143B2B]'
                }`}
              >
                {t.auth.modalLoginTitle}
              </button>
              <button
                type="button"
                role="tab"
                id="auth-tab-signup"
                aria-selected={tab === 'signup'}
                onClick={() => switchTab('signup')}
                className={`rounded-xl py-2 text-[12px] transition ${
                  tab === 'signup'
                    ? 'bg-[#143B2B] font-medium text-[#FAF8F4]'
                    : 'font-light text-[#5F7067] hover:text-[#143B2B]'
                }`}
              >
                {t.auth.modalSignUpTitle}
              </button>
            </div>

            {/* Continue with Google (1-tap sign-in & sign-up) */}
            <button
              type="button"
              id="auth-google-btn"
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
                  htmlFor="auth-email-input"
                  className="block text-[11.5px] font-light text-[#5F7067]"
                >
                  {t.auth.emailLabel}
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-[#B39258]" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.landing.emailPlaceholder}
                    className="w-full rounded-xl border border-[#ECE7DE] bg-white py-2.5 pr-3 pl-9 text-[13.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                  />
                </div>
              </div>

              {!isMagic && (
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="auth-password-input"
                      className="block text-[11.5px] font-light text-[#5F7067]"
                    >
                      {t.auth.passwordLabel}
                    </label>
                    {tab === 'login' && (
                      <button
                        type="button"
                        id="auth-forgot-password-btn"
                        onClick={() => {
                          setResetMode(true);
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11.5px] font-normal text-[#8F7038] underline decoration-[#B39258]/50 underline-offset-2 transition hover:text-[#143B2B]"
                      >
                        {t.auth.forgotPasswordLink}
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-[#B39258]" />
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      minLength={6}
                      autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#ECE7DE] bg-white py-2.5 pr-3 pl-9 text-[13.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <p className="rounded-xl bg-[#FCF5F5] px-3 py-2 text-[12px] font-light text-[#7C2D36]">
                  {errorMsg}
                </p>
              )}

              {successMsg && (
                <p className="rounded-xl border border-[#E2D6BE] bg-[#F8F3E9] px-3 py-2.5 text-[12px] font-normal leading-relaxed text-[#143B2B]">
                  {successMsg}
                </p>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#143B2B] py-2.5 text-[13px] font-normal text-[#FAF8F4] transition hover:bg-[#1E543E] disabled:opacity-50"
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

            {/* Passwordless sign-in option — clearly part of Connexion only */}
            {tab === 'login' && (
              <div className="mt-3.5 text-center">
                <button
                  type="button"
                  id="auth-toggle-magic-btn"
                  onClick={() => {
                    setUseMagicLink((v) => !v);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ECE7DE] bg-white px-3.5 py-2 text-[12px] font-normal text-[#143B2B] transition hover:border-[#B39258]"
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
          </>
        )}
      </div>
    </div>
  );
}
