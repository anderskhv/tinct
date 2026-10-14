/**
 * Before you start (the margin reader's primer): the model's JSON answer and
 * a stored primer, validated. The Worker uses it to check what a reader
 * stores (routes/userBooks.ts). Its twin is public/lab/margin/primer-parse.js
 * (the PDF reader's static-page copy); one test (src/primerParse.test.ts)
 * runs both against the same cases, so change them together.
 *
 * The model answers with JSON only (docs/margin/PROMPTS.md, chapter action `primer`):
 *   {"gist":"…","claims":[{"text":"…","cite":"{p. 12}"}],"keepInMind":["…"],"map":[{"title":"…","pages":"pp. 9–10"}]}
 * A stored primer adds when it was made and the unit it is for: { …, madeAt, unitKey }.
 * Pure: no browser or Worker APIs.
 */

export interface PrimerClaim { text: string; cite: string }
export interface PrimerSection { title: string; pages: string }
export interface Primer {
  gist: string
  claims: PrimerClaim[]
  keepInMind: string[]
  map: PrimerSection[]
}
export interface StoredPrimer extends Primer {
  /** When it was made: ISO 8601, UTC. */
  madeAt: string
  unitKey: string
}

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
})

/** A unit's key: "all" for a PDF without an outline, else the client's name for a top-level entry (e.g. "outline-3"). */
export const PRIMER_UNIT_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/

/** Trimmed, inner runs of whitespace made one space, cut to `max` characters (never inside a surrogate pair). */
function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  // eslint-disable-next-line no-control-regex
  const text = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim()
  return Array.from(text).slice(0, max).join('').trim()
}

function list<T>(value: unknown, { min, max }: { min: number; max: number }, item: (entry: unknown) => T | null): T[] | null {
  if (!Array.isArray(value)) return null
  const out: T[] = []
  for (const entry of value) {
    const parsed = item(entry)
    if (parsed) out.push(parsed)
    if (out.length === max) break
  }
  return out.length >= min ? out : null
}

/**
 * The primer's content, validated: strings trimmed and capped, cite tokens
 * kept as written text (the client turns them into tags), each list held to
 * its counts. Null when any part is missing or too short.
 */
export function normalizePrimer(value: unknown): Primer | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const v = value as Record<string, unknown>
  const L = PRIMER_LIMITS
  const gist = clean(v.gist, L.gistChars)
  if (!gist) return null
  const claims = list<PrimerClaim>(v.claims, L.claims, entry => {
    if (typeof entry === 'string') {
      const text = clean(entry, L.itemChars)
      return text ? { text, cite: '' } : null
    }
    if (!entry || typeof entry !== 'object') return null
    const e = entry as Record<string, unknown>
    const text = clean(e.text, L.itemChars)
    return text ? { text, cite: clean(e.cite, L.citeChars) } : null
  })
  const keepInMind = list<string>(v.keepInMind, L.keepInMind, entry => clean(entry, L.itemChars) || null)
  const map = list<PrimerSection>(v.map, L.map, entry => {
    if (!entry || typeof entry !== 'object') return null
    const e = entry as Record<string, unknown>
    const title = clean(e.title, L.titleChars)
    return title ? { title, pages: clean(e.pages, L.pagesChars) } : null
  })
  if (!claims || !keepInMind || !map) return null
  return { gist, claims, keepInMind, map }
}

/** The first JSON object in the model's text: bare, in a ``` fence, or with prose around it. */
function jsonObject(text: unknown): unknown {
  const source = String(text ?? '').trim()
  const fenced = /```(?:json|JSON)?\s*([\s\S]*?)```/.exec(source)
  const candidates = [source, fenced ? fenced[1].trim() : '']
  const start = source.indexOf('{')
  const end = source.lastIndexOf('}')
  if (start >= 0 && end > start) candidates.push(source.slice(start, end + 1))
  for (const candidate of candidates) {
    if (!candidate || candidate[0] !== '{') continue
    try {
      const parsed: unknown = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
    } catch { /* the next candidate */ }
  }
  return null
}

/** The model's answer as a primer, or null when it is not one. */
export function parsePrimer(text: unknown): Primer | null {
  return normalizePrimer(jsonObject(text))
}

/** A stored primer: its content plus when it was made (ISO, UTC) and its unit's key. Null when out of shape. */
export function normalizeStoredPrimer(value: unknown): StoredPrimer | null {
  const primer = normalizePrimer(value)
  if (!primer) return null
  const v = value as Record<string, unknown>
  const madeAt = typeof v.madeAt === 'string' && ISO_RE.test(v.madeAt) && !Number.isNaN(Date.parse(v.madeAt)) ? v.madeAt : null
  const unitKey = typeof v.unitKey === 'string' && PRIMER_UNIT_KEY_RE.test(v.unitKey) ? v.unitKey : null
  if (!madeAt || !unitKey) return null
  return { ...primer, madeAt, unitKey }
}
