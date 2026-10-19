import { BadgeCheck, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { arcApi, setArcToken } from '../courses-landing/arc/api';
import type { Page } from './account';

/**
 * Website login: mobile number → SMS code → (first time only) name. While OTP_PROVIDER=console on the backend, the code
 * is printed in the browser console instead of sent by SMS.
 */

const digitsOf = (phone: string) => phone.replace(/[\s\-()]/g, '').replace(/^\+?91(?=\d{10}$)/, '');
const isMobile = (phone: string) => /^[6-9]\d{9}$/.test(digitsOf(phone));

const input =
  'w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-muted/60 outline-none focus:border-sun focus:ring-4 focus:ring-sun/10 transition';
const primary =
  'w-full inline-flex items-center justify-center gap-2 rounded-full bg-sun text-white font-semibold px-6 py-3 hover:brightness-110 transition disabled:opacity-50 cursor-pointer disabled:cursor-default';

export default function LoginModal({ page, onClose }: { page: Page; onClose: () => void }) {
  const [step, setStep] = useState<'phone' | 'code' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phoneToken, setPhoneToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInput.current?.focus();
  }, [step]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const sendCode = () =>
    run(async () => {
      if (!isMobile(phone)) throw new Error('Enter a valid 10-digit mobile number.');
      const r = await arcApi('/otp/send', { json: { phone } });
      if (r.devCode) console.log(`%c[OTP] Code for +91 ${digitsOf(phone)}: ${r.devCode}%c  (testing mode, no SMS sent)`, 'background:#6A45F5;color:#fff;font-weight:bold;padding:2px 6px;border-radius:4px', 'color:#686492');
      setInfo(r.devCode ? `Code sent to +91 ${digitsOf(phone)}. (Testing: see the browser console, F12.)` : `We sent a code by SMS to +91 ${digitsOf(phone)}.`);
      setWait(r.resendInSeconds ?? 30);
      setCode('');
      setStep('code');
    });

  /** Sign in with the verified number; a new number first asks for a name. */
  async function signIn(token: string, withName?: string) {
    const r = await arcApi('/account/login', { json: { phoneToken: token, name: withName, page } });
    if (r.needsName) {
      setPhoneToken(token);
      setInfo(null);
      setStep('name');
      return;
    }
    setArcToken(r.token); // tells the whole page
    onClose();
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 'phone') sendCode();
    else if (step === 'code') {
      if (!/^\d{4,6}$/.test(code)) return setError('Enter the code from the SMS.');
      run(async () => {
        const r = await arcApi('/otp/verify', { json: { phone, code } });
        await signIn(r.phoneToken);
      });
    } else {
      if (name.trim().length < 2) return setError('Enter your name.');
      run(() => signIn(phoneToken, name.trim()));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} className="relative w-full max-w-sm rounded-3xl bg-cream p-6 sm:p-7 shadow-lift text-left" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 p-1.5 rounded-full text-ink-muted hover:bg-ink/5 cursor-pointer" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <h2 id="login-title" className="font-display font-bold text-2xl text-ink">
          {step === 'name' ? 'Welcome to Upshift' : 'Log in'}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {step === 'name' ? 'Your number is verified. What should we call you?' : 'One login for workshops, the Idea Challenge and the Hackathon.'}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {step === 'phone' && (
            <label className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold text-ink">Mobile number</span>
              <div className="flex rounded-xl border border-ink/10 bg-white focus-within:border-sun focus-within:ring-4 focus-within:ring-sun/10 transition">
                <span className="flex items-center pl-3 pr-1.5 text-ink-muted text-[15px]">+91</span>
                <input
                  ref={firstInput}
                  className="w-full min-w-0 bg-transparent py-2.5 pr-3 text-[15px] text-ink placeholder:text-ink-muted/60 outline-none"
                  value={phone}
                  onChange={(e) => (setPhone(e.target.value), setError(null))}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Your number"
                />
              </div>
            </label>
          )}

          {step === 'code' && (
            <>
              <p className="flex items-center gap-2 text-sm text-ink">
                <BadgeCheck className="h-4 w-4 text-sun" /> +91 {digitsOf(phone)}
                <button type="button" onClick={() => (setStep('phone'), setInfo(null))} className="ml-auto text-xs font-semibold text-sun hover:underline cursor-pointer">
                  Change
                </button>
              </p>
              <label className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-ink">Verification code</span>
                <input
                  ref={firstInput}
                  className={`${input} font-mono tracking-[0.25em] placeholder:tracking-normal placeholder:font-sans`}
                  value={code}
                  onChange={(e) => (setCode(e.target.value.replace(/\D/g, '').slice(0, 6)), setError(null))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Code"
                />
              </label>
              <button type="button" onClick={sendCode} disabled={busy || wait > 0} className="self-start text-xs font-semibold text-sun disabled:text-ink-muted cursor-pointer disabled:cursor-default">
                {wait > 0 ? `Resend in ${wait}s` : 'Resend code'}
              </button>
            </>
          )}

          {step === 'name' && (
            <label className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold text-ink">Your name</span>
              <input ref={firstInput} className={input} value={name} onChange={(e) => (setName(e.target.value), setError(null))} maxLength={60} autoComplete="name" />
            </label>
          )}

          {info && <p className="text-xs text-ink-muted">{info}</p>}
          {error && <p className="rounded-xl bg-violet/10 text-violet text-sm px-4 py-2.5">{error}</p>}

          <button type="submit" disabled={busy} className={primary}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {step === 'phone' ? 'Send OTP' : step === 'code' ? 'Verify and log in' : 'Continue'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
