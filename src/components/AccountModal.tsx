import { useState, type FormEvent } from 'react';
import { Lock, Mail, Sparkles, X } from 'lucide-react';
import { UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';

type AuthMode = 'login' | 'signup' | 'magic';

export function AccountModal() {
  const {
    lang,
    accountModalOpen,
    setAccountModalOpen,
    signIn,
    signUp,
    sendMagicLink,
  } = useTrip();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!accountModalOpen) return null;

  const t = UI_TEXT[lang];

  const handleClose = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setAccountModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setBusy(true);
    try {
      if (mode === 'magic') {
        const res = await sendMagicLink(trimmedEmail);
        if (!res.ok) {
          setErrorMsg(res.error || 'Error');
        } else {
          setSuccessMsg(t.auth.magicSent);
        }
      } else if (mode === 'signup') {
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

  const title =
    mode === 'login'
      ? t.auth.modalLoginTitle
      : mode === 'signup'
        ? t.auth.modalSignUpTitle
        : t.auth.modalMagicTitle;

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

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3.5">
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
                placeholder="mehdi@..."
                className="w-full rounded-xl border border-[#ECE7DE] bg-white py-2.5 pr-3 pl-9 text-[13.5px] font-light text-[#143B2B] focus:border-[#143B2B] focus:outline-none"
              />
            </div>
          </div>

          {mode !== 'magic' && (
            <div>
              <label
                htmlFor="auth-password-input"
                className="block text-[11.5px] font-light text-[#5F7067]"
              >
                {t.auth.passwordLabel}
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-[#B39258]" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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
            {mode === 'magic' && <Sparkles className="h-3.5 w-3.5 text-[#D7BD8A]" />}
            <span>
              {busy
                ? '...'
                : mode === 'login'
                  ? t.auth.submitLogin
                  : mode === 'signup'
                    ? t.auth.submitSignUp
                    : t.auth.submitMagic}
            </span>
          </button>
        </form>

        <div className="mt-4 space-y-2 border-t border-[#ECE7DE] pt-3.5 text-center text-[12px]">
          {mode !== 'signup' ? (
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="block w-full font-normal text-[#143B2B] underline decoration-[#B39258]/70 underline-offset-2"
            >
              {t.auth.switchToSignUp}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="block w-full font-normal text-[#143B2B] underline decoration-[#B39258]/70 underline-offset-2"
            >
              {t.auth.switchToLogin}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'magic' ? 'login' : 'magic');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="block w-full font-light text-[#5F7067] hover:text-[#143B2B]"
          >
            {mode === 'magic' ? t.auth.switchToPassword : t.auth.switchToMagic}
          </button>
        </div>
      </div>
    </div>
  );
}
