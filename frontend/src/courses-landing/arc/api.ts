import { useCallback, useEffect, useState } from 'react';
import { BACKEND_URL } from '../../dashboard/config';

/** Winter Arc: talks to /api/arc and keeps the participant's 30-day sign-in in this browser. */

const TOKEN_KEY = 'winter-arc:session';

export function arcToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? memoryToken;
  } catch {
    return memoryToken;
  }
}
/** The token is also the website login (main page, Idea Challenge, Hackathon); this event tells every part of the page. */
export const ACCOUNT_EVENT = 'upshift:account';
let memoryToken = '';
export function setArcToken(token: string | null) {
  memoryToken = token ?? '';
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked: signed in for this page load only */
  }
  window.dispatchEvent(new Event(ACCOUNT_EVENT));
}

export class ArcError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** `json` is sent as JSON, or as-is when it's FormData (multipart, for the file upload). */
export async function arcApi<T = any>(path: string, init: { method?: string; json?: unknown; auth?: boolean } = {}): Promise<T> {
  const form = init.json instanceof FormData;
  const token = init.auth ? arcToken() : '';
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL.replace(/\/+$/, '')}/api${path}`, {
      method: init.method ?? (init.json !== undefined ? 'POST' : 'GET'),
      headers: {
        ...(init.json !== undefined && !form ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: init.json === undefined ? undefined : form ? (init.json as FormData) : JSON.stringify(init.json),
    });
  } catch {
    throw new ArcError(0, "Couldn't reach our server. Check your internet connection and try again.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ArcError(res.status, body?.error ?? 'Something went wrong. Please try again.');
  return body as T;
}

/** Upshift India's five learning areas, four days each (same order as the backend's src/arc/schedule.ts). */
export const CATEGORIES = [
  { name: 'Robotics', className: 'Robotics class' },
  { name: 'Cybersecurity', className: 'Cybersecurity class' },
  { name: 'Embedded Systems', className: 'Embedded Systems class' },
  { name: 'FDE and Agentic AI', className: 'FDE and Agentic AI class' },
  { name: 'AI-Powered Content Creation', className: 'AI Content Creation class' },
] as const;
export const DAYS_PER_CATEGORY = 4;
export const categoryOf = (day: number) => CATEGORIES[Math.min(CATEGORIES.length - 1, Math.floor((day - 1) / DAYS_PER_CATEGORY))];

export interface ArcTheme {
  day: number;
  category: string;
  /** Set by the team; shown only once announced (the day before) */
  topic: string | null;
  prompt: string | null;
}
/** A day's prize. The server sends it only once the team has confirmed it. */
export interface ArcPrize {
  name: string;
  description: string | null;
  imageUrl: string | null;
}
export interface ArcState {
  phase: 'not_set' | 'upcoming' | 'between' | 'open' | 'ended';
  day: number | null;
  startDate: string | null;
  days: number;
  today: (ArcTheme & { opensAt: string; closesAt: string }) | null;
  next: { day: number; category: string; opensAt: string } | null;
  /** The next theme, announced a day ahead (tomorrow's, or Day 1 before the start) */
  upNext: (ArcTheme & { date: string | null; closesAt: string | null }) | null;
  /** The prize for the day people are entering now, once confirmed */
  prize: (ArcPrize & { day: number }) | null;
  announce: { day: number; at: string } | null;
  themes: ArcTheme[];
}
export interface ArcEntry {
  day: number;
  code: string;
  title: string;
  problem: string;
  idea: string;
  howItWorks: string;
  firstTest: string;
  tools: string | null;
  fileName?: string | null;
  updatedAt: string;
}
export interface ArcMe {
  user: {
    name: string;
    firstName: string;
    phone: string;
    collegeCity: string | null;
    year: string | null;
    branch: string | null;
    email: string | null;
    publishOk: boolean;
    classUpdatesOk: boolean;
    createdAt: string;
  };
  points: number;
  validEntries: number;
  streak: number;
  today: ArcEntry | null;
  entries: { day: number; code: string; title: string; updatedAt: string }[];
}

/** Challenge state + the signed-in participant (if any). */
export function useArc() {
  const [state, setState] = useState<ArcState | null>(null);
  const [me, setMe] = useState<ArcMe | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);

  const loadState = useCallback(() => {
    arcApi<ArcState>('/arc/state')
      .then(setState)
      .catch(() => {});
  }, []);

  const loadMe = useCallback(async () => {
    if (!arcToken()) {
      setMe(null);
      setMeLoaded(true);
      return null;
    }
    try {
      const m = await arcApi<ArcMe>('/arc/me', { auth: true });
      setMe(m);
      return m;
    } catch (e) {
      if (e instanceof ArcError && e.status === 401) setArcToken(null);
      setMe(null);
      return null;
    } finally {
      setMeLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadState();
    loadMe();
    // Re-check now and then so 9:00 AM / 11:59 PM switch without a reload
    const t = setInterval(loadState, 60_000);
    // Logged in or out somewhere else on the page (the header's Log in button)
    const onAccount = () => loadMe();
    window.addEventListener(ACCOUNT_EVENT, onAccount);
    return () => {
      clearInterval(t);
      window.removeEventListener(ACCOUNT_EVENT, onAccount);
    };
  }, [loadState, loadMe]);

  return { state, me, meLoaded, reloadState: loadState, reloadMe: loadMe };
}

/** "11:59 PM" in IST for an ISO time. */
export const istTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).toUpperCase();
export const istDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
