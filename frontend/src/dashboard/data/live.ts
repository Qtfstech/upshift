import {useEffect, useState} from 'react';
import {api, ApiError} from './api';
import type {Dataset, SalesData} from './types';

export class LiveAuthError extends Error {}

export interface OwnerData {
  dataset: Dataset;
  isSample: boolean;
}

/** One person's ad-spend sheet, as stored by the backend. */
export interface LiveOwner {
  id: string;
  name: string;
  /** What each line of spend is called: Babu runs workshops, Vasudha runs campaigns */
  unit: 'workshop' | 'campaign';
  /** Usual file name, shown until the sheet has been read */
  fileHint: string;
  data: OwnerData | null;
  fileName: string | null;
  sheetName: string | null;
  checks: string[];
  warnings: string[];
  error: string | null;
}

export interface LiveSales {
  data: SalesData | null;
  error: string | null;
}

export interface LiveResult {
  fetchedAt: string;
  owners: LiveOwner[];
  sales: LiveSales;
  /** True while showing the copy saved on this device, before the latest data has arrived */
  fromCache?: boolean;
}

const EVENT = 'upshift-dashboard:live';
let current: LiveResult | null = null;

export const getLive = () => current;

function setLive(r: LiveResult | null) {
  current = r;
  window.dispatchEvent(new Event(EVENT));
}

export function clearLive() {
  setLive(null);
}

/**
 * Ask the backend for the latest data (it reads the sheets every 5 minutes and keeps them in MySQL).
 * `fresh` (the Refresh button) makes it read the sheets first, which takes a few seconds.
 */
export async function fetchLive(password: string, fresh = false): Promise<LiveResult> {
  let json: LiveResult;
  try {
    json = await api<LiveResult>(`/feed${fresh ? '?fresh=1' : ''}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) throw new LiveAuthError(e.message);
    throw e;
  }
  const result = {...json, fromCache: false};
  setLive(result);
  saveCache(result, password).catch(() => {});
  return result;
}

// ---- Saved copy on this device -------------------------------------------------------------------------
// The last data that loaded is kept in localStorage, encrypted with a key derived from the dashboard password
// (PBKDF2 + AES-GCM). Signing in can then show it at once while the latest data loads, and nobody can read it
// from the browser without the password. A wrong password simply fails to decrypt it.

const CACHE_KEY = 'upshift-dashboard:live-cache-v2';
const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b instanceof Uint8Array ? b : new Uint8Array(b))));
const unb64 = (s: string) => {
  const bin = atob(s);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

try {
  localStorage.removeItem('upshift-dashboard:live-cache'); // copy saved by the version without a backend
} catch {
  /* storage unavailable */
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {name: 'PBKDF2', salt, iterations: 150_000, hash: 'SHA-256'},
    base,
    {name: 'AES-GCM', length: 256},
    false,
    ['encrypt', 'decrypt'],
  );
}

async function saveCache(result: LiveResult, password: string) {
  if (!crypto?.subtle || !password) return;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const data = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, new TextEncoder().encode(JSON.stringify(result)));
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({salt: b64(salt), iv: b64(iv), data: b64(data)}));
  } catch {
    /* storage full or blocked — just no instant start next time */
  }
}

/** Show the saved copy, if there is one and the password opens it. Returns false otherwise. */
export async function loadCache(password: string): Promise<boolean> {
  try {
    if (!crypto?.subtle || !password) return false;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return false;
    const {salt, iv, data} = JSON.parse(raw);
    const key = await deriveKey(password, unb64(salt));
    const plain = await crypto.subtle.decrypt({name: 'AES-GCM', iv: unb64(iv)}, key, unb64(data));
    const result = JSON.parse(new TextDecoder().decode(plain)) as LiveResult;
    if (!current) setLive({...result, fromCache: true}); // never replace fresher data
    return true;
  } catch {
    return false; // wrong password, or an old/corrupt copy
  }
}

/** Latest data (null until the first load finishes). */
export function useLive() {
  const [state, setState] = useState(getLive);
  useEffect(() => {
    const on = () => setState(getLive());
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return state;
}
