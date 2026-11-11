/**
 * The reader's place carried between two editions whose paragraphs do not line up (Pope's Odyssey beside Butler's;
 * Anders, 11 Nov 2026: "we need total consistency").
 *
 * Aligned editions share paragraph numbers, so a switch keeps the paragraph. Unaligned ones share only the chapter:
 * the place is carried as how far into the chapter the reader is, by words, and lands on the paragraph and word at
 * the same share of the other edition's chapter. One mapping for every surface (the book reader on the phone and
 * the desktop, the margin reader); each passes its own word counts, as it numbers words.
 *
 * Going back is exact: the switch is remembered (this tab only), and a reader who returns to the edition they came
 * from without having moved gets the very place they left, not a second approximation of it.
 */

export interface EditionPlace {
  paragraphIndex: number
  wordIndex: number
}

const whole = (n: number) => Math.max(0, Math.floor(Number.isFinite(n) ? n : 0))
/** A paragraph without words (a figure, a rule) still takes a place in the chapter. */
const weight = (count: number) => Math.max(1, whole(count))

/**
 * Paragraphs at the head of a chapter that only this edition has, and so count for nothing in the other: a verse
 * translation's prose argument (Pope opens every book of the Odyssey with one) before its first line of verse.
 * Told from the text alone: a first paragraph not set in verse lines in a chapter otherwise set in them. -> 0 or 1.
 */
export function leadingPreface(texts: readonly string[]): number {
  if (texts.length < 3 || setInLines(texts[0])) return 0
  const rest = texts.slice(1)
  return rest.filter(setInLines).length >= rest.length * 0.8 ? 1 : 0
}
/** Verse as an edition stores it: lines ended by newlines, none longer than a verse line runs (labVerseLines.ts). */
const setInLines = (text: string) => text.includes('\n') && text.split('\n').every(line => line.length <= 100)

const bodyOf = (counts: readonly number[], preface: number) => (preface > 0 && preface < counts.length ? preface : 0)

/**
 * How far into the chapter a place is, by words: 0 at its first word, below 1 at its last. With a `preface`
 * (leadingPreface) the share is of the text after it, and a place inside it counts as the start.
 */
export function chapterWordFraction(counts: readonly number[], place: EditionPlace, preface = 0): number {
  if (counts.length === 0) return 0
  const skip = bodyOf(counts, preface)
  const paragraph = Math.min(whole(place.paragraphIndex), counts.length - 1)
  if (paragraph < skip) return 0
  let before = 0
  let total = 0
  counts.forEach((count, index) => {
    if (index < skip) return
    if (index < paragraph) before += weight(count)
    total += weight(count)
  })
  const offset = before + Math.min(whole(place.wordIndex), weight(counts[paragraph]) - 1)
  return total > 0 ? offset / total : 0
}

/** The paragraph and word that far into a chapter (past its `preface`, unless the share is the very start). */
export function placeAtWordFraction(counts: readonly number[], fraction: number, preface = 0): EditionPlace {
  if (counts.length === 0) return { paragraphIndex: 0, wordIndex: 0 }
  const share = Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0))
  // The start of the chapter is the start of the chapter, preface included.
  if (share === 0) return { paragraphIndex: 0, wordIndex: 0 }
  const skip = bodyOf(counts, preface)
  const total = counts.reduce((sum, count, index) => (index < skip ? sum : sum + weight(count)), 0)
  // The small nudge keeps a fraction that names a word exactly (offset / total) on that word after the division.
  let offset = Math.min(total - 1, Math.floor(share * total + 1e-9))
  for (let index = skip; index < counts.length; index += 1) {
    const size = weight(counts[index])
    if (offset < size) return { paragraphIndex: index, wordIndex: Math.min(offset, Math.max(0, whole(counts[index]) - 1)) }
    offset -= size
  }
  return { paragraphIndex: counts.length - 1, wordIndex: 0 }
}

/** A place in one edition's chapter as the place the same share of the way into another edition's. */
export function mapPlaceByWords(
  sourceCounts: readonly number[], targetCounts: readonly number[], place: EditionPlace,
  preface: { source?: number; target?: number } = {},
): EditionPlace {
  return placeAtWordFraction(targetCounts, chapterWordFraction(sourceCounts, place, preface.source), preface.target)
}

/** One switch between two editions of a chapter: the place left, and the place it landed on (once known). */
export interface EditionSwitchRecord {
  bookId: string
  chapterNumber: number
  from: EditionPlace & { editionKey: string }
  to: { editionKey: string; paragraphIndex?: number; wordIndex?: number }
  /** How far into the chapter the place left was (chapterWordFraction). */
  fraction: number
}

export const EDITION_SWITCH_KEY = 'tinct-edition-switch'

type SwitchStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
let memory: EditionSwitchRecord | null = null
const sessionStore = (): SwitchStorage | null => {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage } catch { return null }
}
const isPlace = (value: unknown): value is EditionPlace & { editionKey: string } => {
  const v = value as Record<string, unknown> | null
  return !!v && typeof v.editionKey === 'string' && Number.isInteger(v.paragraphIndex) && Number.isInteger(v.wordIndex)
    && (v.paragraphIndex as number) >= 0 && (v.wordIndex as number) >= 0
}

function parseRecord(raw: string | null): EditionSwitchRecord | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Record<string, unknown>
    const to = value.to as Record<string, unknown> | null
    if (typeof value.bookId !== 'string' || !Number.isInteger(value.chapterNumber) || !isPlace(value.from)) return null
    if (!to || typeof to.editionKey !== 'string' || typeof value.fraction !== 'number' || !(value.fraction >= 0 && value.fraction <= 1)) return null
    const landed = isPlace(to)
    if (!landed && (to.paragraphIndex !== undefined || to.wordIndex !== undefined)) return null
    return {
      bookId: value.bookId, chapterNumber: value.chapterNumber as number, fraction: value.fraction,
      from: { editionKey: value.from.editionKey, paragraphIndex: value.from.paragraphIndex, wordIndex: value.from.wordIndex },
      to: landed ? { editionKey: to.editionKey, paragraphIndex: to.paragraphIndex as number, wordIndex: to.wordIndex as number } : { editionKey: to.editionKey },
    }
  } catch { return null }
}

/** The switch remembered in this tab, if any. */
export function readEditionSwitch(storage: SwitchStorage | null = sessionStore()): EditionSwitchRecord | null {
  if (!storage) return memory
  try { return parseRecord(storage.getItem(EDITION_SWITCH_KEY)) } catch { return memory }
}

export function rememberEditionSwitch(record: EditionSwitchRecord | null, storage: SwitchStorage | null = sessionStore()): void {
  memory = record
  if (!storage) return
  try {
    if (record) storage.setItem(EDITION_SWITCH_KEY, JSON.stringify(record))
    else storage.removeItem(EDITION_SWITCH_KEY)
  } catch { /* this tab keeps it in memory */ }
}

/** The switch waiting for its landing place in `editionKey` of this chapter (the margin reader loads a new page for it). */
export function pendingEditionSwitch(at: { bookId: string; chapterNumber: number; editionKey: string }, storage: SwitchStorage | null = sessionStore()): EditionSwitchRecord | null {
  const record = readEditionSwitch(storage)
  if (!record || record.bookId !== at.bookId || record.chapterNumber !== at.chapterNumber || record.to.editionKey !== at.editionKey) return null
  return record.to.paragraphIndex === undefined ? record : null
}

/** The landing place of a pending switch, now known. */
export function landEditionSwitch(record: EditionSwitchRecord, place: EditionPlace, storage: SwitchStorage | null = sessionStore()): void {
  const current = readEditionSwitch(storage)
  // Only the switch that is still the remembered one (the first chapters and the whole book both report it).
  if (!current || current.bookId !== record.bookId || current.chapterNumber !== record.chapterNumber
    || current.to.editionKey !== record.to.editionKey || current.from.editionKey !== record.from.editionKey) return
  rememberEditionSwitch({ ...current, to: { editionKey: current.to.editionKey, paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex } }, storage)
}

/**
 * Going back: the reader is in the edition a remembered switch landed in, at the place it landed on, and asks for the
 * edition they came from. -> the exact place they left, or null (they moved, or this is another switch).
 */
export function editionSwitchReturn(
  now: { bookId: string; chapterNumber: number; editionKey: string; targetEditionKey: string; place: EditionPlace },
  opts: { storage?: SwitchStorage | null; samePlace?: (landed: EditionPlace, current: EditionPlace) => boolean } = {},
): EditionPlace | null {
  const record = readEditionSwitch(opts.storage === undefined ? sessionStore() : opts.storage)
  if (!record || record.bookId !== now.bookId || record.chapterNumber !== now.chapterNumber) return null
  if (record.to.editionKey !== now.editionKey || record.from.editionKey !== now.targetEditionKey) return null
  if (record.to.paragraphIndex === undefined || record.to.wordIndex === undefined) return null
  const landed = { paragraphIndex: record.to.paragraphIndex, wordIndex: record.to.wordIndex }
  const same = opts.samePlace ?? ((a, b) => a.paragraphIndex === b.paragraphIndex && a.wordIndex === b.wordIndex)
  return same(landed, now.place) ? { paragraphIndex: record.from.paragraphIndex, wordIndex: record.from.wordIndex } : null
}

// The edition a loaded chapter's text belongs to, by the text itself: the book reader holds the paragraphs, and a
// switch needs to know which edition is on screen whichever path loaded it.
const chapterEditions = new WeakMap<readonly string[], string>()
export function noteChapterEdition(paragraphs: readonly string[], editionKey: string): void {
  chapterEditions.set(paragraphs, editionKey)
}
export function chapterEditionKey(paragraphs: readonly string[] | null | undefined): string | undefined {
  return paragraphs ? chapterEditions.get(paragraphs) : undefined
}
