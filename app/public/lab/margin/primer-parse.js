// Before you start (the margin reader's primer), for the PDF reader's static page.
// Dependency-free ESM, no browser APIs. Its twin is app/src/companion/primerParse.ts (the
// Worker's copy, which validates what is stored); one test (src/primerParse.test.ts) runs
// both against the same cases, so change them together.
//
// The model first names the document's kind, then writes that kind's sections, as JSON only
// (docs/margin/PROMPTS.md, chapter action `primer`):
//   {"kind":"textbook","gist":"…","sections":[{"title":"What you'll learn","items":[{"text":"…","cite":"{p. 12}"}]},
//    {"title":"Terms","items":[{"term":"…","meaning":"…"}]}],"map":[{"title":"…","pages":"pp. 9–10"}]}
// A primer made before kinds (Anders, 15 Oct 2026), {"gist","claims","keepInMind","map"}, still
// reads: as a paper's, its claims and cautions the sections Key claims and Keep in mind.
// A stored primer adds when it was made and the unit it is for: { …, madeAt, unitKey }.

/** The kinds of document a primer is written for, each with its sections in order (the map always last). */
export const PRIMER_KINDS = Object.freeze({
  paper: Object.freeze(['Key claims', 'Keep in mind']),
  textbook: Object.freeze(['What you’ll learn', 'Ideas to hold onto', 'Terms']),
  narrative: Object.freeze(['Where we are', 'People', 'Threads to watch']),
  practical: Object.freeze(['What it covers', 'Steps or topics']),
  other: Object.freeze(['Key points', 'Keep in mind']),
});

/** Counts and caps. A list longer than its maximum keeps its first items; shorter than its minimum is invalid. */
export const PRIMER_LIMITS = Object.freeze({
  sections: Object.freeze({ min: 1, max: 4 }),
  items: Object.freeze({ min: 1, max: 8 }),
  map: Object.freeze({ min: 3, max: 8 }),
  /** A primer made before kinds: its claims and cautions. */
  claims: Object.freeze({ min: 3, max: 5 }),
  keepInMind: Object.freeze({ min: 1, max: 3 }),
  gistChars: 600,
  itemChars: 400,
  titleChars: 200,
  sectionTitleChars: 60,
  termChars: 120,
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

/** A point: a string, or { text, cite }. */
function point(entry, L) {
  if (typeof entry === 'string') {
    const text = clean(entry, L.itemChars);
    return text ? { text, cite: '' } : null;
  }
  if (!entry || typeof entry !== 'object') return null;
  const text = clean(entry.text, L.itemChars);
  return text ? { text, cite: clean(entry.cite, L.citeChars) } : null;
}

/** A section's item: a term with its meaning, else a point. */
function item(entry, L) {
  if (entry && typeof entry === 'object' && 'term' in entry) {
    const term = clean(entry.term, L.termChars), meaning = clean(entry.meaning, L.itemChars);
    return term && meaning ? { term, meaning } : null;
  }
  return point(entry, L);
}

/** The kind named, or "other" for any it does not know. */
function kindOf(value) {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PRIMER_KINDS, value) ? value : 'other';
}

/**
 * The primer's content, validated: strings trimmed and capped, cite tokens kept as written
 * text (the client turns them into tags), each list held to its counts. A primer of the shape
 * before kinds becomes a paper's, its claims and cautions the sections Key claims and Keep in
 * mind. Null when any part is missing or too short.
 * -> { kind, gist, sections: [{ title, items: [{ text, cite } | { term, meaning }] }], map: [{ title, pages }] } | null
 */
export function normalizePrimer(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const L = PRIMER_LIMITS;
  const gist = clean(value.gist, L.gistChars);
  if (!gist) return null;
  const map = list(value.map, L.map, entry => {
    if (!entry || typeof entry !== 'object') return null;
    const title = clean(entry.title, L.titleChars);
    return title ? { title, pages: clean(entry.pages, L.pagesChars) } : null;
  });
  if (!map) return null;
  if (Array.isArray(value.sections)) {
    const sections = list(value.sections, L.sections, entry => {
      if (!entry || typeof entry !== 'object') return null;
      const title = clean(entry.title, L.sectionTitleChars);
      const items = list(entry.items, L.items, x => item(x, L));
      return title && items ? { title, items } : null;
    });
    return sections ? { kind: kindOf(value.kind), gist, sections, map } : null;
  }
  const claims = list(value.claims, L.claims, entry => point(entry, L));
  const keepInMind = list(value.keepInMind, L.keepInMind, entry => (typeof entry === 'string' ? point(entry, L) : null));
  if (!claims || !keepInMind) return null;
  const [claimsTitle, keepTitle] = PRIMER_KINDS.paper;
  return { kind: 'paper', gist, sections: [{ title: claimsTitle, items: claims }, { title: keepTitle, items: keepInMind }], map };
}

/** The object that starts at `start` (a "{"), to its matching "}", strings and escapes respected; '' when it never closes. */
function balanced(source, start) {
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  return '';
}

/**
 * The first JSON object in the model's text: bare, in a ``` fence, or with prose around it (even
 * prose with braces of its own). Null when there is none, or when it never closes (a cut-off reply).
 */
function jsonObject(text) {
  const source = String(text ?? '').trim();
  const fenced = /```(?:json|JSON)?\s*([\s\S]*?)```/.exec(source);
  const candidates = [source, fenced ? fenced[1].trim() : ''];
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start >= 0 && end > start) candidates.push(source.slice(start, end + 1));
  for (let at = start, n = 0; at >= 0 && n < 20; at = source.indexOf('{', at + 1), n++) candidates.push(balanced(source, at));
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

/**
 * Why an answer is not a primer, for the Worker's log (never the text itself): 'empty', 'no_json'
 * (no object at all), 'invalid_json' (an object that does not parse or never closes: cut off) or
 * 'shape' (an object missing parts, or with too few of them). Null when it is a primer.
 */
export function primerFailure(text) {
  const source = String(text ?? '').trim();
  if (!source) return 'empty';
  if (!source.includes('{')) return 'no_json';
  // The answer's object starts at its first brace: when that never closes, the reply was cut off.
  const value = balanced(source, source.indexOf('{')) ? jsonObject(source) : null;
  if (!value) return 'invalid_json';
  return normalizePrimer(value) ? null : 'shape';
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
