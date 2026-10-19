import {createHash} from 'node:crypto';

/** Entry text checks: link rejection, HTML stripping, and the auto-flags that hold an entry back from the judging pack. */

/** Any http(s) link, www., or a domain-looking word (example.com, site.in …). */
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|in|net|org|io|co|ai|app|dev|me|xyz|info|link|ly|gl)\b)/i;
export const hasLink = (s: string) => LINK.test(s);

/** Plain text only: drop tags, collapse spaces (newlines kept). */
export const plain = (s: string) =>
  s
    .replace(/<[^>]*>/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const normalise = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export interface EntryText {
  title: string;
  problem: string;
  idea: string;
  howItWorks: string;
  firstTest: string;
  tools?: string | null;
}

const body = (e: EntryText) => [e.title, e.problem, e.idea, e.howItWorks, e.firstTest].join('\n');

export const contentHash = (e: EntryText) => createHash('sha256').update(normalise(body(e))).digest('hex');

/** Word 3-grams, for near-duplicate checks. */
export function shingles(e: EntryText) {
  const words = normalise(body(e)).split(' ').filter(Boolean);
  const set = new Set<string>();
  for (let i = 0; i + 2 < words.length; i++) set.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  return set;
}

export function similarity(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let both = 0;
  for (const x of a) if (b.has(x)) both++;
  return both / (a.size + b.size - both);
}

const INSTRUCTION = /\b(ignore (all|any|the|previous|above)|system prompt|you are (a|the) judge|rank (this|me|it) (first|top|1)|give (this|me) (full|maximum|100)|as an ai|disregard (the|all|previous))/i;

// A short list of common English and Hindi/Telugu (romanised) abuse words. Extend as needed.
const PROFANITY = /\b(fuck\w*|shit\w*|bitch\w*|bastard|asshole|dick|cunt|madarchod|behenchod|bhenchod|chutiya\w*|gandu|randi|lanja|dengey|puku)\b/i;

/** Mostly one repeated character, very few letters, or long runs of the same character. */
function looksLikeGibberish(s: string) {
  const compact = s.replace(/\s+/g, '');
  if (!compact) return true;
  const letters = (compact.match(/[\p{L}\p{M}]/gu) ?? []).length; // marks too: Hindi and Telugu vowel signs
  if (letters / compact.length < 0.5) return true;
  const counts = new Map<string, number>();
  for (const ch of compact.toLowerCase()) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  const top = Math.max(...counts.values());
  if (top / compact.length > 0.35) return true;
  if (/(.)\1{9,}/.test(compact)) return true;
  return false;
}

/** Reasons to hold an entry back for a person to check. Duplicates are checked separately (they need other entries). */
export function textFlags(e: EntryText) {
  const all = [body(e), e.tools ?? ''].join('\n');
  const reasons: string[] = [];
  if (INSTRUCTION.test(all)) reasons.push('instruction-like phrase');
  if (PROFANITY.test(all)) reasons.push('profanity');
  // Only the boxes that were filled (the short form uses just "idea")
  if ([e.problem, e.idea, e.howItWorks, e.firstTest].filter(Boolean).some(looksLikeGibberish)) reasons.push('gibberish or repeated characters');
  return reasons;
}

/** Replace the participant's own name (each part of it, 3+ letters) with "[name]" for the judging pack. */
export function maskName(text: string, fullName: string) {
  let out = text;
  for (const part of fullName.split(/\s+/).filter((p) => p.length >= 3)) {
    out = out.replace(new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '[name]');
  }
  return out;
}
