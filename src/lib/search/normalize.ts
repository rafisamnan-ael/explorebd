/** Bilingual (Bangla + Latin) text normalisation for search. */

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;
const PUNCT = /[.,'"’`“”()\[\]{}\-_/\\|:;!?@#$%^&*+=~<>০-৯]/g;

export function stripDiacritics(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Lowercase, strip diacritics/zero-width/punctuation, collapse whitespace. */
export function normalizeText(input: string): string {
  return stripDiacritics(
    input
      .normalize('NFC')
      .replace(ZERO_WIDTH, '')
      .replace(PUNCT, ' ')
      .toLowerCase(),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove every non-alphanumeric / non-Bangla character for loose matching. */
export function compact(input: string): string {
  return normalizeText(input).replace(/[^\p{L}\p{N}]/gu, '');
}

/** Normalise Bengali digits to ASCII digits. */
export function normalizeDigits(input: string): string {
  const bn = '০১২৩৪৫৬৭৮৯';
  return input.replace(/[০-৯]/g, (d) => String(bn.indexOf(d)));
}

export interface SearchableRecord {
  primary: string[];
  secondary?: string[];
}

/**
 * Returns a score from 0 (no match) to 1 (exact/prefix match).
 * Handles both Bangla and Latin queries.
 */
export function scoreMatch(query: string, record: SearchableRecord): number {
  const q = normalizeText(query);
  if (!q) return 0;
  const qCompact = compact(query);
  const fields = [...record.primary, ...(record.secondary ?? [])].filter(Boolean);

  let best = 0;
  for (const field of fields) {
    const f = normalizeText(field);
    if (!f) continue;
    if (f === q) {
      best = Math.max(best, 1);
      continue;
    }
    if (f.startsWith(q)) {
      best = Math.max(best, 0.9);
      continue;
    }
    if (f.split(' ').some((word) => word.startsWith(q))) {
      best = Math.max(best, 0.8);
      continue;
    }
    if (f.includes(q)) {
      best = Math.max(best, 0.65);
      continue;
    }
    const fCompact = compact(field);
    if (qCompact && fCompact.includes(qCompact)) {
      best = Math.max(best, 0.55);
    }
  }
  return best;
}

export function matchesQuery(query: string, record: SearchableRecord): boolean {
  return scoreMatch(query, record) > 0;
}
