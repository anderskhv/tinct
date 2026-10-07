/**
 * Where a word may be broken, for the ONE break the browser cannot make for us:
 * the one at a page edge.
 *
 * Inside a page `hyphens: auto` already does this and does it well, but the
 * browser never says where it broke, and a page is a range of whole words — so
 * a page whose last line has room for "mul-" but not "multitudes" simply ends
 * short. That is the ragged page bottom. To fill it we have to choose the break
 * ourselves, which is what the patterns below are for.
 *
 * The patterns are ~27KB (en) and ~5KB (da) of JSON, so they are loaded on
 * demand rather than shipped in the reader's first bytes. Until they arrive
 * `hyphenationBreaks` returns nothing, and the paginator simply breaks between
 * words as it always has — a slightly ragged page, never a wrong one.
 */

export type HyphenLang = 'en' | 'da'

/**
 * Typographic minimums: never leave one letter stranded before the hyphen, nor
 * fewer than three after it. Below this a break costs more than the ragged line
 * it saves ("a-bundance", "multitud-es").
 */
export const HYPHEN_MIN_HEAD = 2
export const HYPHEN_MIN_TAIL = 3
/** Shorter than this and a break is never worth it. */
export const HYPHEN_MIN_WORD = HYPHEN_MIN_HEAD + HYPHEN_MIN_TAIL

interface Hyphenator { hyphenate: (word: string) => string[] }

const engines = new Map<HyphenLang, Hyphenator>()
const loading = new Map<HyphenLang, Promise<void>>()
/** labSyllableFallback's guess, loaded with the English patterns (not in the first bytes). */
let guessBreaks: ((word: string) => number[]) | null = null

/** The reading language of an edition key such as `modern-da` / `original-en`. */
export function hyphenLangForEdition(editionKey: string | null | undefined): HyphenLang | null {
  if (!editionKey) return null
  if (/-da$/.test(editionKey)) return 'da'
  if (/-en$/.test(editionKey)) return 'en'
  return null
}

/**
 * Fetch the patterns for a language, once. Safe to call on every render: the
 * in-flight promise is shared and a failure is remembered as "no hyphenation"
 * rather than retried on every page turn.
 */
export function loadHyphenator(lang: HyphenLang): Promise<void> {
  if (engines.has(lang)) return Promise.resolve()
  const existing = loading.get(lang)
  if (existing) return existing
  const task = (async () => {
    const [{ default: Hypher }, patterns, fallback] = await Promise.all([
      import('hypher'),
      lang === 'da' ? import('hyphenation.da') : import('hyphenation.en-us'),
      lang === 'en' ? import('./labSyllableFallback') : null,
    ])
    if (fallback) guessBreaks = fallback.fallbackBreaks
    const Engine = Hypher as unknown as new (p: unknown) => Hyphenator
    engines.set(lang, new Engine((patterns as { default: unknown }).default ?? patterns))
  })().catch(() => { /* stay unhyphenated rather than break the reader */ })
  loading.set(lang, task)
  return task
}

/** True once a language's patterns are in memory and breaks are available. */
export function hyphenatorReady(lang: HyphenLang): boolean {
  return engines.has(lang)
}

/** Letters only: the alphabetic core of a token, and where it starts. */
function core(token: string): { text: string; offset: number } | null {
  const match = /^[^\p{L}]*(\p{L}[\p{L}’']*)/u.exec(token)
  if (!match) return null
  return { text: match[1], offset: match.index + match[0].length - match[1].length }
}

/**
 * Character offsets in `token` after which a hyphen may be drawn, ascending.
 * An offset of 3 on "multitudes" means "mul-" ends the line and "titudes"
 * begins the next.
 *
 * Returns nothing for anything a break would damage: a token with digits
 * (verse numbers), one too short to split, a language whose patterns have
 * not loaded. A word the patterns decline to break gets only the cautious
 * rule-based guess of labSyllableFallback (English), and only with `guess`.
 */
export function hyphenationBreaks(token: string, lang: HyphenLang, guess = false): number[] {
  const engine = engines.get(lang)
  if (!engine || !token || /\d/.test(token)) return []
  // A word that already contains a hyphen is left alone. Breaking "well-known"
  // would put a discretionary hyphen beside a real one, and a reader cannot
  // tell which belongs to the text — the one place a wrong break changes what
  // the book says rather than only how it looks.
  if (/[-\u2010\u2011\u2013\u2014]/.test(token)) return []
  const piece = core(token)
  if (!piece || piece.text.length < HYPHEN_MIN_WORD) return []
  let parts: string[]
  try { parts = engine.hyphenate(piece.text) } catch { return [] }
  // With `guess` (the phone reader, which places its own hyphens), a word the
  // patterns do not break at all (a name, often: "Zechariah", "Kutuzov") gets
  // the rule-based guess instead, English only and held to stricter minimums
  // (labSyllableFallback). A word they break is never guessed at. A
  // possessive they leave whole is guessed on the bare name.
  if (parts.length < 2) {
    if (!guess || lang !== 'en' || !guessBreaks) return []
    const bare = piece.text.replace(/['’]s$/, '')
    return guessBreaks(bare).map(at => piece.offset + at)
  }
  const breaks: number[] = []
  let head = 0
  for (let index = 0; index < parts.length - 1; index += 1) {
    head += parts[index].length
    const tail = piece.text.length - head
    if (head >= HYPHEN_MIN_HEAD && tail >= HYPHEN_MIN_TAIL) breaks.push(piece.offset + head)
  }
  return breaks
}

/** A dash the book itself prints, after which any browser may end a line. */
const HARD_BREAK_DASH_RE = /[-\u2010\u2013\u2014]/
/** A page-edge fragment that ends on the book's own dash draws no hyphen of its own. */
export const HARD_BREAK_FRAGMENT_RE = /[-\u2010\u2013\u2014]$/

/**
 * Character offsets just after a dash the text already contains, where a
 * browser ends a line without adding anything: "twenty-|third",
 * "him\u2014|and". At a page edge the reader must offer the same break, or a
 * page whose last line has room for "twenty-" ends before it and its last
 * line is cut short (Esther 8:9, Anders, 6 Oct 2026).
 *
 * Unlike `hyphenationBreaks` nothing is inserted: the fragment shows the
 * book's own dash, so no reader can mistake it for a discretionary hyphen.
 * Only a dash between two letters counts, never one in a number or at either
 * end of the token, and a non-breaking hyphen (U+2011) never breaks.
 */
export function hardBreaks(token: string): number[] {
  if (!token || /\d/.test(token)) return []
  const breaks: number[] = []
  for (let index = 1; index < token.length - 1; index += 1) {
    if (!HARD_BREAK_DASH_RE.test(token[index])) continue
    if (!/\p{L}/u.test(token[index - 1]) || !/\p{L}/u.test(token[index + 1])) continue
    const head = index + 1
    if (head >= HYPHEN_MIN_HEAD && token.length - head >= 2) breaks.push(head)
  }
  return breaks
}

/**
 * Every break a page edge may use, ascending: the book's own dashes always,
 * and dictionary hyphenation once a language's patterns are in memory
 * (with `guess`, as the phone reader asks, also labSyllableFallback's guess
 * for a word the patterns leave whole; desktop keeps the dictionary only).
 */
export function pageEdgeBreaks(token: string, lang: HyphenLang | null, guess = false): number[] {
  const hard = hardBreaks(token)
  const soft = lang ? hyphenationBreaks(token, lang, guess) : []
  if (hard.length === 0) return soft
  return [...new Set([...hard, ...soft])].sort((a, b) => a - b)
}

/**
 * The longest break that keeps the head within `maxHeadChars`, or null when no
 * break fits. The paginator asks this once it knows how much of the last line
 * is free.
 */
export function longestBreakWithin(token: string, lang: HyphenLang, maxHeadChars: number): number | null {
  let best: number | null = null
  for (const point of hyphenationBreaks(token, lang)) {
    if (point <= maxHeadChars) best = point
    else break
  }
  return best
}

/** Reset between tests. */
export function __resetHyphenatorsForTest(): void {
  engines.clear()
  loading.clear()
}
