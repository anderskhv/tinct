/**
 * Where a justified prose paragraph is hyphenated, chosen by the reader rather
 * than left to the browser (Anders, iPhone, 6 Oct 2026).
 *
 * `hyphens: auto` hyphenates wherever the next word's head fits, so a phone
 * column set runs of three, four, five hyphenated lines, and hyphenated lines
 * that were spaced well enough without it. It also does nothing at all where
 * the browser has no dictionary (desktop Chromium on Linux, every headless
 * check), so the pages a check measures were not the pages a phone shows.
 *
 * Instead, once the edition's patterns are loaded (labHyphenate), each prose
 * paragraph is laid out once, unhyphenated and ragged, in the reader's own
 * column, and walked line by line. A line is offered a hyphen only when
 * justifying it without one would space its words beyond `PLAN_GAP_EM`, never
 * as the third hyphenated line in a row, and only at a dictionary break whose
 * head (with its hyphen) actually fits the room the line has. The chosen
 * break becomes a discretionary hyphen inside that one word, drawn as CSS
 * generated content (`.lab-syl::after`), so a word's text, a copy, a
 * selection, a highlight and every word index are exactly as before. The
 * browser still breaks the lines; it simply has only the chosen breaks to use,
 * and uses one only where the word overflows the line, which is where the plan
 * expected it.
 *
 * Plans are kept per paragraph text for the column they were made in (width,
 * font, spacing); a different column makes new ones. A paragraph with a plan
 * paints with `has-hyphen-plan` (`hyphens: manual`) in the measured and the
 * visible page alike; one without (Compare, a paragraph set as a heading or a
 * list, a book whose language has no patterns) keeps the browser's own.
 */
import { hyphenationBreaks, hyphenatorReady, type HyphenLang } from './labHyphenate'
import { tokenizeHearingWords, isLabVerseMarker } from './labHearing'
import { paragraphKind, wordLink } from './labParagraphStyle'
import { presentationLineRanges } from './labVerseLines'

/**
 * A line whose words justifying would set further apart than this (in ems,
 * space included) is loose enough to deserve a hyphen. A normal space in the
 * reading face is about a quarter em; 0.55em is a little over twice that,
 * where justified type starts to look gappy on a narrow column.
 */
export const PLAN_GAP_EM = 0.55
/** The looseness that earns a second hyphenated line in a row. */
export const PLAN_SECOND_GAP_EM = 0.8
/** Never more hyphenated lines in a row than this. */
export const PLAN_MAX_RUN = 2

export type HyphenPlan = ReadonlyMap<number, number>

const EMPTY: HyphenPlan = new Map()
let activeKey = ''
const plans = new Map<string, HyphenPlan>()
/** Each planned paragraph's words, so a break is drawn only in the whole word it was planned for. */
const planWords = new Map<string, readonly string[]>()

if (typeof document !== 'undefined') {
  // A face that arrives after a plan was made changes every width it measured:
  // the next measurement plans afresh. The plans stay until then, because a
  // page already laid out with them must keep painting with them (a render
  // in between, such as Play, must never move a word).
  document.fonts?.addEventListener?.('loadingdone', () => { activeKey = '' })
}

/** The plan for a paragraph in the current column, or null when it has none (the browser hyphenates). */
export function hyphenPlanFor(text: string | undefined): HyphenPlan | null {
  return text ? plans.get(text) ?? null : null
}

/**
 * The character offset in word `wordIndex` of `text` after which a hyphen may
 * be drawn, if planned, and only where `shown` is that whole word: the tail of
 * a word continued from the previous page ("cording" of "ac-cording") is
 * painted as it is, never split at the whole word's break.
 */
export function plannedBreak(text: string | undefined, wordIndex: number, shown: string): number | undefined {
  const at = hyphenPlanFor(text)?.get(wordIndex)
  return at != null && planWords.get(text!)?.[wordIndex] === shown ? at : undefined
}

/** ` has-hyphen-plan` for a paragraph painted with its plan, else ''. */
export function hyphenPlanClass(text: string | undefined, usePlans = true): string {
  return usePlans && hyphenPlanFor(text) ? ' has-hyphen-plan' : ''
}

/** Test seam. */
export function resetHyphenPlans(): void {
  activeKey = ''
  plans.clear()
  planWords.clear()
}

/** Test seam: install a plan directly. */
export function setHyphenPlanForTest(text: string, plan: Map<number, number>): void {
  plans.set(text, plan)
  planWords.set(text, tokenizeHearingWords(text).map(word => word.text))
}

/** Prose a plan can be made for: no kind (an index line is one), no verse lineation. */
export function plannable(text: string, words: Array<{ text: string }>): boolean {
  if (!text || words.length < 2 || paragraphKind(text)) return false
  return !presentationLineRanges(text, 0, words.length)
}

interface PlacedLine { first: number; last: number; right: number; items: number; endsSplit: boolean; startsSplit: boolean }

/** The painted lines of a measured paragraph, from its word spans' rects. */
function readLines(p: HTMLElement): PlacedLine[] {
  const lines: PlacedLine[] = []
  let top = -Infinity
  let lineHeight = parseFloat(getComputedStyle(p).lineHeight) || 0
  p.querySelectorAll<HTMLElement>('.lab-hearing-word').forEach((span, wordIndex) => {
    const rects = [...span.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0)
    rects.forEach((rect, part) => {
      if (!lineHeight) lineHeight = rect.height
      if (rect.top > top + lineHeight / 2) {
        lines.push({ first: wordIndex, last: wordIndex, right: rect.right, items: 1, endsSplit: false, startsSplit: part > 0 })
        top = rect.top
      } else {
        const line = lines[lines.length - 1]
        line.last = wordIndex
        line.right = Math.max(line.right, rect.right)
        line.items += 1
      }
      lines[lines.length - 1].endsSplit = part < rects.length - 1
    })
  })
  return lines
}

/** The text node holding a word's own letters, with the offset of its first. */
function wordTextNode(span: HTMLElement, word: string): Text | null {
  const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) if ((node as Text).data === word) return node as Text
  return null
}

/**
 * Plan one paragraph in `p` (already in the column). `render` lays the
 * paragraph out with a given plan. Exported for tests.
 */
export function planParagraph(
  p: HTMLElement,
  words: Array<{ text: string }>,
  breaksOf: (wordIndex: number) => number[],
  render: (plan: Map<number, number>) => void,
  gapEm = PLAN_GAP_EM,
  secondGapEm = PLAN_SECOND_GAP_EM,
): Map<number, number> {
  const plan = new Map<number, number>()
  const style = getComputedStyle(p)
  const fontSize = parseFloat(style.fontSize) || 16
  const box = () => p.getBoundingClientRect()
  const contentRight = () => box().right - (parseFloat(style.paddingRight) || 0)
  // A space and a hyphen in this paragraph's face.
  const probe = document.createElement('span')
  probe.textContent = '-'
  p.append(probe)
  const hyphen = probe.getBoundingClientRect().width
  probe.textContent = ' '
  const space = probe.getBoundingClientRect().width || fontSize / 4
  probe.remove()
  render(plan)
  let from = 0
  for (let guard = 0; guard < 400; guard += 1) {
    const lines = readLines(p)
    const right = contentRight()
    const spans = [...p.querySelectorAll<HTMLElement>('.lab-hearing-word')]
    let changed = false
    for (let index = from; index < lines.length - 1; index += 1) {
      const line = lines[index]
      if (line.endsSplit || line.items < 2) continue
      let run = 0
      for (let back = index - 1; back >= 0 && lines[back].endsSplit; back -= 1) run += 1
      if (run >= PLAN_MAX_RUN) continue
      const room = right - line.right
      // A second hyphen in a row only for a line that would be clearly loose:
      // the allowance is kept for the worst lines rather than spent on the first.
      if ((space + room / (line.items - 1)) / fontSize <= (run > 0 ? secondGapEm : gapEm)) continue
      const next = lines[index + 1]
      if (next.startsSplit) continue
      const wordIndex = next.first
      const token = words[wordIndex]?.text ?? ''
      const node = spans[wordIndex] && wordTextNode(spans[wordIndex], token)
      if (!node) continue
      const points = breaksOf(wordIndex)
      const range = document.createRange()
      for (let at = points.length - 1; at >= 0; at -= 1) {
        range.setStart(node, 0)
        range.setEnd(node, points[at])
        if (space + range.getBoundingClientRect().width + hyphen > room) continue
        plan.set(wordIndex, points[at])
        render(plan)
        // Lines before this one are unchanged; read again from here.
        from = index
        changed = true
        break
      }
      if (changed) break
    }
    if (!changed) break
  }
  return plan
}

/**
 * Make plans for `paragraphs` in the column `host` lays paragraphs out in
 * (a measuring stage of the reading width). `paint` builds a paragraph's
 * measurement markup with a plan (labMeasureParagraphInto). Without loaded
 * patterns nothing is planned and every paragraph keeps the browser's own
 * hyphenation, exactly as before.
 */
export function planHyphenation(
  host: HTMLElement,
  paragraphs: string[],
  lang: HyphenLang | null,
  paint: (p: HTMLElement, words: Array<{ text: string; emphasis?: boolean }>, text: string, plan: Map<number, number>) => void,
): void {
  if (!lang || !hyphenatorReady(lang) || typeof document === 'undefined') return
  const p = document.createElement('p')
  p.className = 'lab-hearing-line has-hyphen-plan is-hyphen-planning'
  host.append(p)
  try {
    const style = getComputedStyle(p)
    const width = p.getBoundingClientRect().width
    if (!(width > 0)) return
    const key = [lang, Math.round(width * 10), style.fontFamily, style.fontSize, style.fontWeight, style.wordSpacing, style.letterSpacing, style.paddingLeft, style.paddingRight].join('|')
    if (key !== activeKey) { activeKey = key; plans.clear(); planWords.clear() }
    for (const text of paragraphs) {
      if (plans.has(text)) continue
      const words = tokenizeHearingWords(text)
      if (!plannable(text, words)) continue
      // Never inside a verse number or a link (a link paints its own label).
      const breaksOf = (index: number) => isLabVerseMarker(words[index].text) || wordLink(text, index, words[index].text)
        ? [] : hyphenationBreaks(words[index].text, lang)
      const plan = planParagraph(p, words, breaksOf, current => paint(p, words, text, current))
      plans.set(text, plan.size ? plan : EMPTY)
      planWords.set(text, words.map(word => word.text))
    }
  } finally {
    p.remove()
  }
}
