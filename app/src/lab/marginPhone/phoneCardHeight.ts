/**
 * How tall the phone's bottom card opens, and how it holds that height while an answer streams in (Anders,
 * 9 Nov 2026: "open the card at the expected height and scroll down from there"). The card opens straight away
 * at the height its kind of answer usually reaches, the text fills it downward from the top, a longer answer
 * scrolls inside it, and the card never shrinks or climbs while the text arrives. When the stream ends shorter
 * than that, the card settles down to fit once (LabPhoneCard), so no empty band stays above the follow-up field
 * (iPhone feedback, 21 Oct 2026).
 */

/** The answer lengths a future setting may offer. Only the standard length exists today. */
export type PhoneCardLength = 'standard'

/**
 * The expected height of each kind of card, as a share of the visible height (a 390×844 phone). Tuned against
 * the prompts' lengths: Define is a sense or two; Explain and Simplify about 100 words; Ask (on the phone, Chat
 * with the passage), Evaluate and Counterpoint about 120; Quiz one question, its feedback and the field;
 * Primer, Recap and Catch me up a timeline of beats. At most 70% (the card's own cap), so the page's lines
 * above stay in view. Kinds not listed (Talk, a note, a character) keep the content-sized card, as does any
 * card with nothing on its way (a saved card, Chat before a question): only an answer on its way holds it.
 */
export const PHONE_CARD_EXPECTED_SHARE: Record<PhoneCardLength, Readonly<Record<string, number>>> = {
  standard: {
    define: 0.4,
    explain: 0.55, simplify: 0.5, figure: 0.55, related: 0.55,
    ask: 0.6, chat: 0.6, factcheck: 0.6, counterpoint: 0.6,
    quiz: 0.55, 'unit-quiz': 0.55, 'unit-quiz-preparing': 0.55,
    primer: 0.7, recap: 0.7, summary: 0.7, catchup: 0.7,
    'chapter-notes-primer': 0.7, 'chapter-notes-end': 0.7, 'chapter-notes-sofar': 0.7,
  },
}

/** The expected share of the visible height for a card kind, or null when the card is sized by its content. */
export function phoneCardExpectedShare(kind: string, length: PhoneCardLength = 'standard'): number | null {
  const share = PHONE_CARD_EXPECTED_SHARE[length][kind]
  return typeof share === 'number' ? share : null
}

/** The expected height in pixels on a screen `visibleHeight` tall, or null for a content-sized card. */
export function phoneCardExpectedHeight(kind: string, visibleHeight: number, length: PhoneCardLength = 'standard'): number | null {
  const share = phoneCardExpectedShare(kind, length)
  return share === null || !(visibleHeight > 0) ? null : Math.round(visibleHeight * share)
}

/** A finished answer this much shorter than the held height or less keeps the height: no settle for a sliver. */
export const PHONE_CARD_SETTLE_SLACK_PX = 4

export interface PhoneCardHoldInput {
  /** The kind's expected height (phoneCardExpectedHeight), or null for a content-sized card. */
  expected: number | null
  /** Whether an answer is on its way or streaming in the card. */
  busy: boolean
  /** The card's height as it stands now. */
  current: number
  /** The card's height if it were as tall as its content (measured only once the stream has ended). */
  natural?: number
}

/**
 * One step of the card's height. `held` is the height the card is held at (null: as tall as its content).
 * While busy, the card is held at its expected height or higher, and never lower than it already is. Once the
 * answer has ended, a held card whose content is shorter settles to fit (`settle`, once, then content-sized);
 * a longer one keeps its height and scrolls inside.
 */
export function phoneCardHoldStep(held: number | null, input: PhoneCardHoldInput): { held: number | null; settle?: number } {
  if (input.expected === null) return { held: null }
  if (input.busy) return { held: Math.round(Math.max(held ?? input.current, input.expected)) }
  if (held === null || typeof input.natural !== 'number') return { held }
  if (input.natural < held - PHONE_CARD_SETTLE_SLACK_PX) return { held: null, settle: Math.round(input.natural) }
  return { held }
}
