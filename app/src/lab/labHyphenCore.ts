/**
 * Where a word may break, given a language's patterns already in hand: the
 * rules of labHyphenate without its loading, so that code which imports its
 * patterns statically (the Worker's share images, src/share/shareHyphenate.ts)
 * breaks words exactly as the reader does. Pure: no DOM, no dynamic import.
 */

/**
 * Typographic minimums: never leave one letter stranded before the hyphen, nor
 * fewer than three after it. Below this a break costs more than the ragged line
 * it saves ("a-bundance", "multitud-es").
 */
export const HYPHEN_MIN_HEAD = 2
export const HYPHEN_MIN_TAIL = 3
/** Shorter than this and a break is never worth it. */
export const HYPHEN_MIN_WORD = HYPHEN_MIN_HEAD + HYPHEN_MIN_TAIL
/**
 * A capitalised word shorter than this is left whole. Capitals are no bar to
 * a break ("Ar-mies", "Be-hold", "Is-rael"), but a short one is usually a
 * name, and "Ju-dah" or "Sa-rah" split across two lines reads worse than the
 * looser line it saves.
 */
export const HYPHEN_MIN_CAPITALISED = 6

export interface Hyphenator { hyphenate: (word: string) => string[] }

/** Letters only: the alphabetic core of a token, and where it starts. */
function core(token: string): { text: string; offset: number } | null {
  const match = /^[^\p{L}]*(\p{L}[\p{L}’']*)/u.exec(token)
  if (!match) return null
  return { text: match[1], offset: match.index + match[0].length - match[1].length }
}

/**
 * Character offsets in `token` after which a hyphen may be drawn, ascending
 * (labHyphenate `hyphenationBreaks`). `guess` is labSyllableFallback's guess,
 * given only where the caller wants it (the phone reader, English): it is
 * used for a word the patterns leave whole, never for one they break.
 */
export function dictionaryBreaks(engine: Hyphenator, token: string, guess: ((word: string) => number[]) | null = null): number[] {
  if (!token || /\d/.test(token)) return []
  // A word that already contains a hyphen is left alone. Breaking "well-known"
  // would put a discretionary hyphen beside a real one, and a reader cannot
  // tell which belongs to the text — the one place a wrong break changes what
  // the book says rather than only how it looks.
  if (/[-‐‑–—]/.test(token)) return []
  const piece = core(token)
  if (!piece || piece.text.length < HYPHEN_MIN_WORD) return []
  // An all-caps word ("LORD", "HOLINESS") is a title or an abbreviation, never
  // broken; a short capitalised one is usually a name (HYPHEN_MIN_CAPITALISED).
  const letters = piece.text.replace(/['’]/g, '')
  if (letters === letters.toUpperCase() && letters !== letters.toLowerCase()) return []
  if (letters[0] !== letters[0].toLowerCase() && letters.length < HYPHEN_MIN_CAPITALISED) return []
  let parts: string[]
  try { parts = engine.hyphenate(piece.text) } catch { return [] }
  // A word the patterns do not break at all (a name, often: "Zechariah",
  // "Kutuzov") gets the rule-based guess instead, held to stricter minimums
  // (labSyllableFallback). A possessive they leave whole is guessed on the
  // bare name.
  if (parts.length < 2) {
    if (!guess) return []
    const bare = piece.text.replace(/['’]s$/, '')
    return guess(bare).map(at => piece.offset + at)
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
