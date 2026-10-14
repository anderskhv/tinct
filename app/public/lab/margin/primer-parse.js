// Before you start (the margin reader's primer), for the PDF reader's static page.
// Dependency-free ESM, no browser APIs. Its twin is app/src/companion/primerParse.ts (the
// Worker's copy, which validates what is stored); one test (src/primerParse.test.ts) runs
// both against the same cases, so change them together.
//
// The model answers with JSON only (docs/margin/PROMPTS.md, chapter action `primer`):
//   {"gist":"…","claims":[{"text":"…","cite":"{p. 12}"}],"keepInMind":["…"],"map":[{"title":"…","pages":"pp. 9–10"}]}
// A stored primer adds when it was made and the unit it is for: { …, madeAt, unitKey }.

/** Counts and caps. A list longer than its maximum keeps its first items; shorter than its minimum is invalid. */
export const PRIMER_LIMITS = Object.freeze({
  claims: Object.freeze({ min: 3, max: 5 }),
  keepInMind: Object.freeze({ min: 1, max: 3 }),
  map: Object.freeze({ min: 3, max: 8 }),
  gistChars: 600,
  itemChars: 400,
  titleChars: 200,
  citeChars: 40,
  pagesChars: 40,
});

/** A unit's key: "all" for a PDF without an outline, else the client's name for a top-level entry (e.g. "outline-3"). */
export const PRIMER_UNIT_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

/** Trimmed, inner runs of whitespace made one space, cut to `max` characters (never inside a surrogate pair). */
function clean(value, max) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  const text = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();
  return Array.from(text).slice(0, max).join('').trim();
}

function list(value, { min, max }, item) {
  if (!Array.isArray(value)) return null;
  const out = [];
  for (const entry of value) {
    const parsed = item(entry);
    if (parsed) out.push(parsed);
    if (out.length === max) break;
  }
  return out.length >= min ? out : null;
}

/**
 * The primer's content, validated: strings trimmed and capped, cite tokens kept as written
 * text (the client turns them into tags), each list held to its counts. Null when any part
 * is missing or too short.
 * -> { gist, claims: [{ text, cite }], keepInMind: [string], map: [{ title, pages }] } | null
 */
export function normalizePrimer(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const L = PRIMER_LIMITS;
  const gist = clean(value.gist, L.gistChars);
  if (!gist) return null;
  const claims = list(value.claims, L.claims, entry => {
    if (typeof entry === 'string') {
      const text = clean(entry, L.itemChars);
      return text ? { text, cite: '' } : null;
    }
    if (!entry || typeof entry !== 'object') return null;
    const text = clean(entry.text, L.itemChars);
    return text ? { text, cite: clean(entry.cite, L.citeChars) } : null;
  });
  const keepInMind = list(value.keepInMind, L.keepInMind, entry => clean(entry, L.itemChars) || null);
  const map = list(value.map, L.map, entry => {
    if (!entry || typeof entry !== 'object') return null;
    const title = clean(entry.title, L.titleChars);
    return title ? { title, pages: clean(entry.pages, L.pagesChars) } : null;
  });
  if (!claims || !keepInMind || !map) return null;
  return { gist, claims, keepInMind, map };
}

/** The first JSON object in the model's text: bare, in a ``` fence, or with prose around it. */
function jsonObject(text) {
  const source = String(text ?? '').trim();
  const fenced = /```(?:json|JSON)?\s*([\s\S]*?)```/.exec(source);
  const candidates = [source, fenced ? fenced[1].trim() : ''];
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start >= 0 && end > start) candidates.push(source.slice(start, end + 1));
  for (const candidate of candidates) {
    if (!candidate || candidate[0] !== '{') continue;
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch { /* the next candidate */ }
  }
  return null;
}

/** The model's answer as a primer, or null when it is not one. */
export function parsePrimer(text) {
  return normalizePrimer(jsonObject(text));
}

/** A stored primer: its content plus when it was made (ISO, UTC) and its unit's key. Null when out of shape. */
export function normalizeStoredPrimer(value) {
  const primer = normalizePrimer(value);
  if (!primer) return null;
  const madeAt = typeof value.madeAt === 'string' && ISO_RE.test(value.madeAt) && !Number.isNaN(Date.parse(value.madeAt)) ? value.madeAt : null;
  const unitKey = typeof value.unitKey === 'string' && PRIMER_UNIT_KEY_RE.test(value.unitKey) ? value.unitKey : null;
  if (!madeAt || !unitKey) return null;
  return { ...primer, madeAt, unitKey };
}
