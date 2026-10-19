import { ArrowRight, BadgeCheck, CheckCircle2, GraduationCap, Loader2, Lock, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { arcApi, categoryOf, istTime, setArcToken, type ArcMe } from '../arc/api';
import { whatsappHref } from '../whatsapp';
import { trackProduct } from '../../account/account';

/**
 * The Winter Arc form on the page: verify the mobile number, add a name, the idea heading and solution, submit. One form, no
 * separate registration. A signed-in participant (from an earlier submit) skips the mobile check and can edit
 * today's idea until 11:59 PM IST. While there's no SMS service (OTP_PROVIDER=console on the backend), the code is
 * logged in the browser console.
 */

const digitsOf = (phone: string) => phone.replace(/[\s\-()]/g, '').replace(/^\+?91(?=\d{10}$)/, '');
const isMobile = (phone: string) => /^[6-9]\d{9}$/.test(digitsOf(phone));
// Same rule as the server: no links of any kind
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|in|net|org|io|co|ai|app|dev|me|xyz|info|link|ly|gl)\b)/i;
const IDEA_MIN = 50;
const IDEA_MAX = 2000;
const TITLE_MAX = 80;
/** Workshops section on the Upshift home page */
const WORKSHOPS_HREF = './#workshops';

const input =
  'w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-muted/60 outline-none focus:border-sun focus:ring-4 focus:ring-sun/10 transition disabled:bg-paper/60';
const small = 'shrink-0 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-50 cursor-pointer disabled:cursor-default';

function Field({ label, right, children }: { label: string; right?: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between gap-2 text-[13px]">
        <span className="font-semibold text-ink">{label}</span>
        {right}
      </span>
      {children}
    </label>
  );
}

export default function IdeaSubmitForm({ me, onSubmitted }: { me: ArcMe | null; onSubmitted: () => void }) {
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [phoneToken, setPhoneToken] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [idea, setIdea] = useState('');
  const [busy, setBusy] = useState<'send' | 'verify' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  const [receipt, setReceipt] = useState<{ code: string; savedAt: string; day: number } | null>(null);
  const [dirty, setDirty] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  const signedIn = Boolean(me);
  const verified = signedIn || Boolean(phoneToken);

  // Signed in: fill in the name and today's idea (if already sent)
  useEffect(() => {
    if (!me) return;
    setName(me.user.name);
    if (me.today) {
      setTitle(me.today.title);
      setIdea(me.today.idea);
      setReceipt({ code: me.today.code, savedAt: me.today.updatedAt, day: me.today.day });
      setDirty(false);
    }
  }, [me?.user.name, me?.today?.code, me?.today?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Logged out (header menu or My data): back to just the mobile check
  const wasSignedIn = useRef(false);
  useEffect(() => {
    if (me) wasSignedIn.current = true;
    else if (wasSignedIn.current) {
      wasSignedIn.current = false;
      setPhone('');
      setPhoneToken('');
      setCodeSent(false);
      setCode('');
      setName('');
      setTitle('');
      setIdea('');
      setReceipt(null);
      setInfo(null);
    }
  }, [me]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function run(kind: 'send' | 'verify' | 'submit', fn: () => Promise<void>) {
    if (busy) return;
    setBusy(kind);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const send = () => {
    if (!isMobile(phone)) return setError('Enter a valid 10-digit mobile number.');
    run('send', async () => {
      const r = await arcApi('/otp/send', { json: { phone } });
      if (r.devCode) {
        console.log(
          `%c[OTP] Code for +91 ${digitsOf(phone)}: ${r.devCode}%c  (testing mode, no SMS sent)`,
          'background:#6A45F5;color:#fff;font-weight:bold;padding:2px 6px;border-radius:4px',
          'color:#686492',
        );
      }
      setCodeSent(true);
      setCode('');
      setWait(r.resendInSeconds ?? 30);
      // Real SMS (Spear UC) or testing mode (code in the browser console)
      setInfo(r.devCode ? `Code sent to +91 ${digitsOf(phone)}. (Testing: see the browser console, F12.)` : `We sent a code by SMS to +91 ${digitsOf(phone)}.`);
      setTimeout(() => codeRef.current?.focus(), 50);
    });
  };

  const verify = () => {
    if (!/^\d{4,6}$/.test(code)) return setError('Enter the code from the SMS.');
    run('verify', async () => {
      const r = await arcApi('/otp/verify', { json: { phone, code } });
      setPhoneToken(r.phoneToken);
      // A verified number logs in straight away (the same login as the rest of the site). A new number has no
      // account yet: it gets one, with the name below, when the idea is submitted.
      const login = await arcApi('/account/login', { json: { phoneToken: r.phoneToken, page: 'idea-challenge' } });
      if (login.token) {
        setArcToken(login.token);
        setInfo(null);
      } else setInfo('Mobile verified. Add your name and idea below — you’re signed in when you submit.');
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!verified) return setError(codeSent ? 'Enter the code and tap Verify first.' : 'Verify your mobile number first: tap Send OTP.');
    if (name.trim().length < 2) return setError('Enter your name.');
    if (title.trim().length < 3) return setError('Add an idea heading.');
    if (LINK.test(title) || LINK.test(idea)) return setError('Links are not allowed. Describe it in words.');
    if (idea.trim().length < IDEA_MIN) return setError(`Idea solution needs at least ${IDEA_MIN} characters.`);
    if (idea.trim().length > IDEA_MAX) return setError(`Idea solution can be at most ${IDEA_MAX} characters.`);
    run('submit', async () => {
      const data = new FormData();
      data.append('name', name);
      data.append('title', title);
      data.append('idea', idea);
      if (!signedIn) data.append('phoneToken', phoneToken);
      const r = await arcApi('/arc/submit', { json: data, auth: signedIn });
      setArcToken(r.token);
      setReceipt({ code: r.code, savedAt: r.savedAt, day: r.day });
      setDirty(false);
      onSubmitted();
    });
  };

  const count = idea.trim().length;

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5">
      {/* Mobile + code */}
      {signedIn ? (
        <div className="flex items-center gap-2 rounded-xl border border-leaf/30 bg-leaf/5 px-3 py-2.5 text-sm">
          <BadgeCheck className="h-4 w-4 text-leaf" />
          <span className="text-ink">
            Mobile <b>+91 {me!.user.phone}</b> verified · logged in as <b>{me!.user.firstName}</b>
          </span>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Mobile number">
            <div className="flex gap-2">
              <div
                className={`flex flex-1 min-w-0 rounded-xl border transition ${
                  verified ? 'border-leaf/40 bg-leaf/5' : 'border-ink/10 bg-white focus-within:border-sun focus-within:ring-4 focus-within:ring-sun/10'
                }`}
              >
                <span className="flex items-center pl-3 pr-1.5 text-ink-muted text-[15px]">+91</span>
                <input
                  className="w-full min-w-0 bg-transparent py-2.5 pr-3 text-[15px] text-ink placeholder:text-ink-muted/60 outline-none"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneToken('');
                    setCodeSent(false);
                    setInfo(null);
                    setError(null);
                  }}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Your number"
                  aria-label="Mobile number"
                  readOnly={verified}
                />
              </div>
              {!verified && (
                <button type="button" onClick={send} disabled={busy !== null || wait > 0} className={`${small} bg-sun/10 text-sun hover:bg-sun/15`}>
                  {busy === 'send' ? <Loader2 className="h-4 w-4 animate-spin" /> : wait > 0 ? `${wait}s` : codeSent ? 'Resend' : 'Send OTP'}
                </button>
              )}
            </div>
          </Field>
          <Field label="Verification code">
            {verified ? (
              <div className={`${input} flex items-center gap-2 border-leaf/40 bg-leaf/5 text-leaf font-semibold`}>
                <BadgeCheck className="h-4 w-4" /> Verified
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  ref={codeRef}
                  className={`${input} min-w-0 font-mono tracking-[0.25em] placeholder:tracking-normal placeholder:font-sans`}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      verify();
                    }
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Code"
                  aria-label="Verification code"
                  disabled={!codeSent}
                />
                <button type="button" onClick={verify} disabled={!codeSent || busy !== null} className={`${small} bg-ink text-cream hover:bg-ink-soft`}>
                  {busy === 'verify' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                </button>
              </div>
            )}
          </Field>
        </div>
      )}
      {info && <p className="-mt-2 text-xs text-ink-muted">{info}</p>}

      <Field label="Your name">
        <input
          className={input}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setDirty(true);
            setError(null);
          }}
          required
          minLength={2}
          maxLength={60}
          autoComplete="name"
        />
      </Field>

      <Field label="Idea heading" right={<span className="font-mono text-[11px] text-ink-muted">{title.trim().length}/{TITLE_MAX}</span>}>
        <input
          className={input}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value.replace(/\n/g, ' '));
            setDirty(true);
            setError(null);
          }}
          maxLength={TITLE_MAX}
          placeholder="e.g. Hostel washing machine alert with a vibration sensor"
        />
      </Field>

      <Field
        label="Idea solution"
        right={
          <span className={`font-mono text-[11px] ${count > IDEA_MAX ? 'text-violet font-bold' : 'text-ink-muted'}`}>
            {count}/{IDEA_MAX}
            {count < IDEA_MIN ? ` · min ${IDEA_MIN}` : ''}
          </span>
        }
      >
        <textarea
          className={`${input} resize-y`}
          rows={3}
          value={idea}
          onChange={(e) => {
            setIdea(e.target.value);
            setDirty(true);
            setError(null);
          }}
          maxLength={IDEA_MAX + 50}
          placeholder="Who has the problem, what the AI does for them, how it works, and how you'd test it in 7 days."
        />
      </Field>

      {error && <p className="rounded-xl bg-violet/10 text-violet text-sm px-4 py-2.5">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-sm">
          {receipt && !dirty ? (
            <span className="inline-flex items-center gap-1.5 text-leaf font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Entry <b className="font-mono">{receipt.code}</b> received · {istTime(receipt.savedAt)}
            </span>
          ) : receipt ? (
            <span className="text-xs text-ink-muted">Unsaved changes — submit again to save them.</span>
          ) : !verified ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sun">
              <Lock className="h-3.5 w-3.5 shrink-0" /> Verify your mobile number to submit
            </span>
          ) : (
            <span className="text-xs text-ink-muted">Plain text only · no links</span>
          )}
        </div>
        <button
          type="submit"
          disabled={!verified || busy !== null || (!!receipt && !dirty)}
          title={verified ? undefined : 'Verify your mobile number first'}
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-sun text-white px-8 py-3 font-semibold shadow-soft hover:brightness-110 transition disabled:opacity-50 cursor-pointer disabled:cursor-default"
        >
          {busy === 'submit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {receipt ? 'Update my idea' : 'Submit idea'}
        </button>
      </div>

      {/* After an entry: the free class that fits the day's learning area. Optional, and never part of judging. */}
      {receipt && (
        <div className="rounded-2xl border border-sun/20 bg-sun/5 px-4 py-3.5 text-sm">
          <p className="font-semibold text-ink">
            Recommended for you: the free <span className="text-sun">{categoryOf(receipt.day).className}</span>
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">Fits your {categoryOf(receipt.day).name} idea. Joining is optional and never affects judging.</p>
          <a
            href={whatsappHref(
              `Hi Upshift India! I sent a ${categoryOf(receipt.day).name} idea in the Winter Arc challenge (entry ${receipt.code}). I'd like to join the free ${categoryOf(receipt.day).className}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              const c = categoryOf(receipt.day);
              trackProduct({ key: `class:${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name: `Free ${c.className}`, price: 0, action: 'join_class', page: 'idea-challenge' });
            }}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sun hover:underline"
          >
            Join the free class on WhatsApp <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}

      <a
        href={WORKSHOPS_HREF}
        className="group mt-1 flex items-center justify-center gap-3 rounded-2xl bg-ink px-6 py-4 text-lg font-bold text-cream shadow-lift hover:bg-ink-soft hover:-translate-y-0.5 transition-all"
      >
        <GraduationCap className="h-6 w-6 text-sun-light" />
        Explore our workshops
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </a>
    </form>
  );
}
