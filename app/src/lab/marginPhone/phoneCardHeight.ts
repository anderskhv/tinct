import { aiLengthFor, type AiLength, type AiLengthAction } from '../../aiSettings'
import { readAiSettings } from '../labAiPrefs'
import { storage } from '../../services/storage'

/**
 * How tall the phone's bottom card opens, and how it holds that height while an answer arrives.
 *
 * Anders, 9 Nov 2026: "open the card at the expected height and scroll down from there". Anders, 13 Nov 2026
 * (iPhone recording, Simplify on Proverbs 26:1): the card opened tall, the short answer came, and the card dropped
 * to fit it, so the whole screen jumped: "it shouldn't jump. It should rather just have a blank space than not. And
 * then it should try to calibrate to the length of the AI responses given."
 *
 * So: the card opens at the height this kind of answer usually reaches at the reader's length setting, learnt on
 * this device from the answers it has shown (phoneCardOpeningShare). Once open it never shrinks on its own: a
 * shorter answer leaves blank space at the card's foot, above the follow-up field. A longer one grows the card, in
 * a few steps, up to its cap (70% of the visible height). Only the reader makes it smaller: by closing it or opening
 * another card.
 */

/**
 * The expected height of each kind of card, as a share of the visible height (a 390×844 phone), at each length in
 * AI settings. Tuned against the prompts: Brief is "a sentence or two, at most 40 words" (three or four lines on
 * the card); Standard Explain about 70 words, Ask about 110; Detailed what the prompts write unshortened. Simplify
 * (one plain rewrite as long as the selection), Define, Evaluate, Counterpoint and Quiz have no Length row and read
 * the same at every length. Primer, Recap and Catch me up are a timeline of beats. At most 70% (the card's own cap),
 * so the page's lines above stay in view. Kinds not listed (Talk, a note, a character) keep the content-sized card,
 * as does any card with nothing on its way (a saved card, Chat before a question): only an answer on its way holds it.
 * These are only the first guess: the device's own answers replace them (PHONE_CARD_HEIGHTS_KEY).
 */
const STANDARD_SHARE: Readonly<Record<string, number>> = {
  define: 0.4,
  explain: 0.55, simplify: 0.32, figure: 0.55, related: 0.55,
  ask: 0.6, chat: 0.6, factcheck: 0.6, counterpoint: 0.6,
  quiz: 0.55, 'unit-quiz': 0.55, 'unit-quiz-preparing': 0.55,
  primer: 0.7, recap: 0.7, summary: 0.7, catchup: 0.7, 'book-summary': 0.7,
  'chapter-notes-primer': 0.7, 'chapter-notes-end': 0.7, 'chapter-notes-sofar': 0.7,
}
const CHAPTER_KINDS = ['primer', 'recap', 'summary', 'catchup', 'book-summary', 'chapter-notes-primer', 'chapter-notes-end', 'chapter-notes-sofar']
export const PHONE_CARD_EXPECTED_SHARE: Readonly<Record<AiLength, Readonly<Record<string, number>>>> = {
  brief: { ...STANDARD_SHARE, explain: 0.3, ask: 0.36, chat: 0.36, ...Object.fromEntries(CHAPTER_KINDS.map(kind => [kind, 0.5])) },
  standard: STANDARD_SHARE,
  detailed: { ...STANDARD_SHARE, explain: 0.65, ask: 0.7, chat: 0.7 },
}

/** The Length row in AI settings that sets how long a card's answer is (aiSettings.ts), or null for a kind without one. */
export function phoneCardLengthRow(kind: string): AiLengthAction | null {
  if (kind === 'explain') return 'explain'
  if (kind === 'ask' || kind === 'chat') return 'ask'
  if (kind === 'primer' || kind === 'chapter-notes-primer') return 'primer'
  if (CHAPTER_KINDS.includes(kind)) return 'summary'
  return null
}

/** The reader's length for a card kind (General's Length row), or null for a kind the setting does not change. */
export function phoneCardLength(kind: string): AiLength | null {
  const row = phoneCardLengthRow(kind)
  return row ? aiLengthFor(readAiSettings(), row) : null
}

/** The default expected share of the visible height for a card kind, or null when the card is sized by its content. */
export function phoneCardExpectedShare(kind: string, length: AiLength | null = 'standard'): number | null {
  const share = PHONE_CARD_EXPECTED_SHARE[length ?? 'standard'][kind]
  return typeof share === 'number' ? share : null
}

// --- Calibration: what this device's answers have measured ------------------------------------------------------

/**
 * Kept in this browser only (storage.ts, `tinct:` prefix, cleared on sign-out): per card kind and length, a moving
 * average of the share of the visible height the card reached with its first answer, and how many answers it has
 * seen. Numbers only, no text; never sent anywhere.
 */
export const PHONE_CARD_HEIGHTS_KEY = 'pcard-heights'
export interface PhoneCardHeightEntry { share: number; n: number }
export type PhoneCardHeights = Record<string, PhoneCardHeightEntry>
/** Each new answer counts this much once a few have been seen (the first ones are averaged evenly). */
export const PHONE_CARD_CALIBRATION_WEIGHT = 0.35
/** Room left above the average, so an answer a line longer than usual still fits without growing the card. */
export const PHONE_CARD_CALIBRATION_PAD = 0.035
/** No card opens lower than this share: the label, two lines and the follow-up field. */
export const PHONE_CARD_MIN_SHARE = 0.2
export const PHONE_CARD_MAX_SHARE = 0.7
/** At most this many kind/length entries are kept. */
const PHONE_CARD_HEIGHTS_MAX = 64

export function phoneCardHeightKey(kind: string, length: AiLength | null): string {
  return `${kind}:${length ?? 'any'}`
}

const clampShare = (share: number) => Math.min(PHONE_CARD_MAX_SHARE, Math.max(PHONE_CARD_MIN_SHARE, share))

export function readPhoneCardHeights(): PhoneCardHeights {
  const raw = storage.get<unknown>(PHONE_CARD_HEIGHTS_KEY)
  if (!raw || typeof raw !== 'object') return {}
  const out: PhoneCardHeights = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const entry = value as Partial<PhoneCardHeightEntry> | null
    if (entry && typeof entry.share === 'number' && Number.isFinite(entry.share) && entry.share > 0 && typeof entry.n === 'number' && entry.n > 0) {
      out[key] = { share: Math.min(PHONE_CARD_MAX_SHARE, entry.share), n: Math.min(1000, Math.floor(entry.n)) }
    }
  }
  return out
}

/** The store with one more measured answer folded in (pure). */
export function phoneCardCalibrated(store: PhoneCardHeights, key: string, share: number): PhoneCardHeights {
  if (!(share > 0) || !Number.isFinite(share)) return store
  const measured = Math.min(PHONE_CARD_MAX_SHARE, share)
  const before = store[key]
  const n = (before?.n ?? 0) + 1
  const weight = Math.max(1 / n, PHONE_CARD_CALIBRATION_WEIGHT)
  const next = before ? before.share + (measured - before.share) * weight : measured
  const out: PhoneCardHeights = { ...store, [key]: { share: Math.round(next * 1000) / 1000, n: Math.min(1000, n) } }
  const keys = Object.keys(out)
  if (keys.length > PHONE_CARD_HEIGHTS_MAX) for (const drop of keys.filter(k => k !== key).slice(0, keys.length - PHONE_CARD_HEIGHTS_MAX)) delete out[drop]
  return out
}

/** Remembers how tall a card of this kind and length was with its first answer, as a share of the visible height. */
export function recordPhoneCardHeight(kind: string, length: AiLength | null, share: number): void {
  if (!(share > 0)) return
  storage.set(PHONE_CARD_HEIGHTS_KEY, phoneCardCalibrated(readPhoneCardHeights(), phoneCardHeightKey(kind, length), share))
}

/**
 * The share of the visible height a card opens at while its answer is on its way: the device's average for this
 * kind and length with a little room above it, else the default table; null for a content-sized card.
 */
export function phoneCardOpeningShare(kind: string, length: AiLength | null, store: PhoneCardHeights = readPhoneCardHeights()): number | null {
  const fallback = phoneCardExpectedShare(kind, length)
  if (fallback === null) return null
  const learnt = store[phoneCardHeightKey(kind, length)]
  return learnt ? clampShare(learnt.share + PHONE_CARD_CALIBRATION_PAD) : fallback
}

/**
 * The expected height in pixels on a screen `visibleHeight` tall, or null for a content-sized card. Without a
 * `store`, the default table at `length` (Standard unless given).
 */
export function phoneCardExpectedHeight(kind: string, visibleHeight: number, length: AiLength | null = 'standard', store?: PhoneCardHeights): number | null {
  const share = store ? phoneCardOpeningShare(kind, length, store) : phoneCardExpectedShare(kind, length)
  return share === null || !(visibleHeight > 0) ? null : Math.round(visibleHeight * share)
}

// --- The hold ---------------------------------------------------------------------------------------------------

/** Content less than this much taller than the held height does not grow the card (a sub-pixel or a border). */
export const PHONE_CARD_GROW_SLACK_PX = 4
/** When an answer outgrows the card, it grows this share of the visible height past the content, so it steps rarely. */
export const PHONE_CARD_GROW_HEADROOM = 0.1

export interface PhoneCardHoldInput {
  /** The kind's opening height (phoneCardExpectedHeight), or null for a content-sized card. */
  expected: number | null
  /** Whether an answer is on its way or streaming in the card. */
  busy: boolean
  /** The card's height as it stands now. */
  current: number
  /** The card's height if it were as tall as its content. */
  natural?: number
  /** The tallest the card may be (its max-height); growing stops there. */
  cap?: number
  /** Extra room added when the card grows (PHONE_CARD_GROW_HEADROOM of the visible height). */
  headroom?: number
}

/**
 * One step of the card's height. `held` is the height the card is held at (null: as tall as its content). It
 * never comes back lower than it went in: while an answer is on its way the card is held at its expected height
 * or higher; once the answer has ended it keeps that height (spare room is blank space at its foot); content taller
 * than the held height grows it, with some headroom, up to `cap`.
 */
export function phoneCardHoldStep(held: number | null, input: PhoneCardHoldInput): { held: number | null } {
  if (input.expected === null) return { held: null }
  let next = held
  if (input.busy) next = Math.max(held ?? input.current, input.expected)
  if (next === null) return { held: null }
  const natural = input.natural
  if (typeof natural === 'number' && natural > next + PHONE_CARD_GROW_SLACK_PX) {
    const cap = typeof input.cap === 'number' && input.cap > 0 ? input.cap : Infinity
    next = Math.max(next, Math.min(cap, natural + (input.headroom ?? 0)))
  }
  return { held: Math.round(next) }
}
