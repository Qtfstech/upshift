import { useCallback, useEffect, useState } from 'react';
import { ACCOUNT_EVENT, arcApi, ArcError, arcToken, setArcToken } from '../courses-landing/arc/api';

/**
 * The website login (main page, Idea Challenge, Hackathon). It shares the Winter Arc token, so signing in on any of the
 * three pages signs you in on all of them. Talks to /api/account.
 */

export type Page = 'main' | 'idea-challenge' | 'hackathon';

/** Fired after a product click is recorded, so "My Upshift" refreshes its workshop list */
const TRACK_EVENT = 'upshift:tracked';

export interface Account {
  user: { name: string; firstName: string; phone: string; since: string };
  ideaChallenge: { points: number; entries: { day: number; category: string; code: string; title: string; rank: number | null }[] };
  /** Evening Zoom discussions for shortlisted ideas; time and link once invited */
  zoomCalls: { day: number; category: string; title: string; invited: boolean; attended: boolean; time: string | null; link: string | null }[];
  hackathon: { id: number; teamName: string; category: string; paid: boolean; members: number; registeredAt: string }[];
  products: { productKey: string; productName: string; price: number | null; actions: string[]; clicks: number; lastAt: string }[];
}

/** The signed-in person (null when logged out), kept in step with logins and logouts anywhere on the page. */
export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!arcToken()) {
      setAccount(null);
      setLoaded(true);
      return;
    }
    try {
      setAccount(await arcApi<Account>('/account/me', { auth: true }));
    } catch (e) {
      if (e instanceof ArcError && e.status === 401) setArcToken(null);
      setAccount(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(ACCOUNT_EVENT, reload);
    window.addEventListener(TRACK_EVENT, reload);
    return () => {
      window.removeEventListener(ACCOUNT_EVENT, reload);
      window.removeEventListener(TRACK_EVENT, reload);
    };
  }, [reload]);

  return { account, loaded, reload };
}

export async function logout(page: Page) {
  // Record the sign-out first (it needs the token), then forget the token even if that fails
  await arcApi('/account/logout', { json: { page }, auth: true }).catch(() => {});
  setArcToken(null);
}

export interface Product {
  /** e.g. "workshop:robotics", "class:robotics", "company:host-workshop", "hackathon" */
  key: string;
  name: string;
  price?: number | null;
  /** e.g. "reserve_whatsapp", "join_class", "enquire", "pay_whatsapp" */
  action: string;
  page: Page;
}

/** Record product interest. Fire and forget: never blocks the click (works logged out too). */
export function trackProduct(p: Product) {
  arcApi('/account/track', { json: { productKey: p.key, productName: p.name, price: p.price ?? null, action: p.action, page: p.page }, auth: true })
    .then(() => window.dispatchEvent(new Event(TRACK_EVENT)))
    .catch(() => {});
}
