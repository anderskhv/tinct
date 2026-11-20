/**
 * Scanning errors in a reader's converted PDF ("J&sus", "tbe", "on.some", "con- tinued"),
 * shared by the Worker route (`worker/routes/ownTextRepair.ts`) and the reader
 * (`lab/userBook/ownTextRepair.ts`). Pure.
 *
 * Anders, 2 Nov 2026: a converted scan read "J&sus" and similar. The cheap way: the
 * device first flags only paragraphs with a word that cannot be right (a symbol or a
 * digit inside a word, punctuation glued between two words, a word split by a
 * line-break hyphen, a replacement character), and only those paragraphs are sent,
 * in small batches, to a fast model that may fix clear character errors and nothing
 * else. Every returned paragraph must stay within a small edit distance of what was
 * sent, or it is dropped and the original kept: the model can never rewrite a book.
 */
export const OWN_TEXT_REPAIR_ROUTE = '/api/own-text-repair'
/** Paragraphs per request. */
export const OWN_TEXT_REPAIR_BATCH = 12
/** A paragraph longer than this is not sent (a scan's paragraph is rarely longer). */
export const OWN_TEXT_REPAIR_MAX_PARAGRAPH = 1_500
/** At most this many paragraphs of one book are sent: a file worse than this needs scanning again, not patching. */
export const OWN_TEXT_REPAIR_MAX_PARAGRAPHS = 600
/** Figure placeholders (labFigures FIGURE_MARK) are never sent or changed. */
const FIGURE_MARK = '￼'

export interface OwnTextRepairItem { id: string; text: string }
export interface OwnTextRepairRequest { book: string; items: OwnTextRepairItem[] }
export interface OwnTextRepairResponse { items: OwnTextRepairItem[] }

// A word holding a symbol between letters: "J&sus", "th|s", "Go#d".
const SYMBOL_INSIDE = /\p{L}[&@#$%^*|\\~<>{}=+_]\p{L}/u
// A digit between letters ("Je5us", "wor1d"), or a word starting with a digit that is not a number ("1ike", "0f"; not "1st", "4th", "1990s").
const DIGIT_INSIDE = /\p{L}\d+\p{L}|(?:^|[\s(“"'‘])\d+(?!(?:st|nd|rd|th|s|am|pm|km|kg|cm|mm|m|g)\b)\p{Ll}{2,}/u
// Punctuation glued between two lower-case words ("on.some", "said,that"); a URL, an address or "e.g." is not one.
const GLUED = /\p{Ll}{2,}[.,;:!?]\p{Ll}{2,}/u
// A word split by a line-break hyphen and a space ("con- tinued"); "pre- and post-war" is not flagged.
const SPLIT_HYPHEN = /\p{Ll}{2,}- (?!(?:and|or|nor|to|og|eller|til)\b)\p{Ll}{2,}/u
// The replacement character, a stray negation sign or a soft hyphen left visible.
const DEBRIS = /[�¬]/u
const WEB_LIKE = /(?:https?:\/\/|www\.|@\S+\.|\.(?:com|org|net|edu|gov|io|dk|uk)\b)/i

/** Why a paragraph is suspect, or null when it looks clean. */
export function suspectReason(text: string): string | null {
  if (!text || text.length > OWN_TEXT_REPAIR_MAX_PARAGRAPH || text.includes(FIGURE_MARK)) return null
  if (DEBRIS.test(text)) return 'debris'
  if (SYMBOL_INSIDE.test(text)) return 'symbol'
  if (DIGIT_INSIDE.test(text)) return 'digit'
  if (SPLIT_HYPHEN.test(text)) return 'hyphen'
  if (GLUED.test(text.split(/\s+/).filter(word => !WEB_LIKE.test(word)).join(' '))) return 'glued'
  return null
}

/** Edit distance, stopping early once it passes `limit` (returns limit + 1). */
export function boundedEditDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
      current.push(value)
      if (value < best) best = value
    }
    if (best > limit) return limit + 1
    previous = current
  }
  return previous[b.length]
}

/** The most characters a repair may change in a paragraph of this length. */
export function repairBudget(length: number): number {
  return Math.max(3, Math.ceil(length * 0.06))
}

/**
 * The fixed paragraph, when it is an acceptable repair of `original`: non-empty, a small
 * edit, its figure marks and every digit run that was not inside a word unchanged.
 * Otherwise null (the original is kept).
 */
export function acceptedRepair(original: string, fixed: unknown): string | null {
  if (typeof fixed !== 'string') return null
  const next = fixed.replace(/\s+/g, ' ').trim()
  const before = original.replace(/\s+/g, ' ').trim()
  if (!next || next === before) return null
  if (next.split(FIGURE_MARK).length !== before.split(FIGURE_MARK).length) return null
  const numbers = (text: string) => (text.match(/(?<![\p{L}\d])\d[\d.,:]*(?![\p{L}\d])/gu) ?? []).join(' ')
  if (numbers(next) !== numbers(before)) return null
  return boundedEditDistance(before, next, repairBudget(before.length)) <= repairBudget(before.length) ? next : null
}
