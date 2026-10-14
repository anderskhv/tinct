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
 * head (with its hyphen) actually fits the room the line has; a verse number
 * that starts the next line moves up only with the head of its word. The chosen
 * break becomes a discretionary hyphen inside that one word, drawn as CSS
 * generated content (`.lab-syl::after`), so a word's text, a copy, a
 * selection, a highlight and every word index are exactly as before. The
 * browser still breaks the lines; it simply has only the chosen breaks to use,
 * and uses one only where the word overflows the line, which is where the plan
 * expected it.
 *
 * Plans are kept per paragraph text for the column they were made in (width,
 * font, spacing, which of the reading face's files have loaded); a different
 * column makes new ones, and the last few columns' plans are kept for a return
 * to them. A paragraph with a plan
 * paints with `has-hyphen-plan` (`hyphens: manual`) in the measured and the
 * visible page alike; one without (Compare, a paragraph set as a heading or a
 * list, a book whose language has no patterns) keeps the browser's own.
 */
import { hyphenationBreaks, hyphenatorReady, type HyphenLang } from './labHyphenate'
import { tokenizeHearingWords, isLabVerseMarker } from './labHearing'
import { paragraphSetRagged, wordLink } from './labParagraphStyle'
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

/**
 * Plans for one layout: the column's width and face, and how much of the
 * reading face has loaded (layoutKey). A plan is a pure function of its
 * paragraph and its layout, so it is made once per layout and kept: going
 * back to a layout (Compare off, narration's paint, the other edition on
 * standby) reuses it rather than planning the chapter again.
 */
interface PlanSet {
  plans: Map<string, HyphenPlan>
  /** Each planned paragraph's words, so a break is drawn only in the whole word it was planned for. */
  words: Map<string, readonly string[]>
}

/** Layouts kept, most recent last. A few cover a phone's rotations and Compare. */
const MAX_LAYOUTS = 4
const layouts = new Map<string, PlanSet>()
/** The layout the reading page was last measured in: what paints read. */
let active: PlanSet = { plans: new Map(), words: new Map() }

function planSetFor(key: string): PlanSet {
  let set = layouts.get(key)
  if (set) layouts.delete(key)
  else set = { plans: new Map(), words: new Map() }
  layouts.set(key, set)
  while (layouts.size > MAX_LAYOUTS) layouts.delete(layouts.keys().next().value!)
  return set
}

/**
 * The reading face's loaded faces, counted: a face that arrives after a plan
 * was made changes every width it measured, so it is part of the layout.
 * A toolbar face (Plex Mono, Inter) loading later changes nothing.
 */
function faceState(fontFamily: string): string {
  const family = fontFamily.split(',')[0]?.trim().replace(/^["']|["']$/g, '').toLowerCase()
  if (!family || typeof document === 'undefined' || !document.fonts) return ''
  let loaded = 0
  document.fonts.forEach(face => { if (face.status === 'loaded' && face.family.replace(/^["']|["']$/g, '').toLowerCase() === family) loaded += 1 })
  return String(loaded)
}

/** The plan for a paragraph in the current column, or null when it has none (the browser hyphenates). */
export function hyphenPlanFor(text: string | undefined): HyphenPlan | null {
  return text ? active.plans.get(text) ?? null : null
}

/**
 * The character offset in word `wordIndex` of `text` after which a hyphen may
 * be drawn, if planned, and only where `shown` is that whole word: the tail of
 * a word continued from the previous page ("cording" of "ac-cording") is
 * painted as it is, never split at the whole word's break.
 */
export function plannedBreak(text: string | undefined, wordIndex: number, shown: string): number | undefined {
  const at = hyphenPlanFor(text)?.get(wordIndex)
  return at != null && active.words.get(text!)?.[wordIndex] === shown ? at : undefined
}

/** ` has-hyphen-plan` for a paragraph painted with its plan, else ''. */
export function hyphenPlanClass(text: string | undefined, usePlans = true): string {
  return usePlans && hyphenPlanFor(text) ? ' has-hyphen-plan' : ''
}

/** Test seam. */
export function resetHyphenPlans(): void {
  layouts.clear()
  active = { plans: new Map(), words: new Map() }
}

/** Test seam: install a plan directly. */
export function setHyphenPlanForTest(text: string, plan: Map<number, number>): void {
  active.plans.set(text, plan)
  active.words.set(text, tokenizeHearingWords(text).map(word => word.text))
}

/** Prose a plan can be made for (a list item is prose): not set apart (an index line is), no verse lineation. */
export function plannable(text: string, words: Array<{ text: string }>): boolean {
  if (!text || words.length < 2 || paragraphSetRagged(text)) return false
  return !presentationLineRanges(text, 0, words.length)
}

interface PlacedLine { first: number; last: number; right: number; top: number; items: number; endsSplit: boolean; startsSplit: boolean }

/**
 * The painted lines of a measured paragraph, read from its word spans' rects
 * only as far as planning asks: a line and the start of the next. Reading the
 * whole paragraph again after every break, each read forcing a layout, made
 * planning one chapter cost a second or more on a phone.
 */
function lineReader(p: HTMLElement) {
  let spans = [...p.querySelectorAll<HTMLElement>('.lab-hearing-word')]
  const lineHeight = parseFloat(getComputedStyle(p).lineHeight) || 0
  let lines: PlacedLine[] = []
  /** The next word to read. */
  let word = 0
  const readWord = () => {
    const above = lines[lines.length - 1]
    const rects = [...spans[word].getClientRects()].filter(rect => rect.width > 0 && rect.height > 0)
    rects.forEach((rect, part) => {
      const last = lines[lines.length - 1]
      if (!last || rect.top > last.top + (lineHeight || rect.height) / 2) {
        lines.push({ first: word, last: word, right: rect.right, top: rect.top, items: 1, endsSplit: false, startsSplit: part > 0 })
      } else if (last === above && last.last === word) {
        // The head of a split word, already read with the line above.
        return
      } else {
        last.last = word
        last.right = Math.max(last.right, rect.right)
        last.items += 1
      }
      lines[lines.length - 1].endsSplit = part < rects.length - 1
    })
    word += 1
  }
  return {
    /** Line `index`, read through the start of the line after it; undefined past the end. */
    line(index: number): PlacedLine | undefined {
      while (word < spans.length && lines.length <= index + 1) readWord()
      return lines[index]
    },
    spans: () => spans,
    /** Lines from `index` on may have moved; those above are unchanged. */
    invalidateFrom(index: number) {
      if (spans.length && !spans[0].isConnected) {
        // The paragraph was painted afresh: read it all again.
        spans = [...p.querySelectorAll<HTMLElement>('.lab-hearing-word')]
        lines = []
        word = 0
        return
      }
      if (index >= lines.length) return
      word = lines[index].first
      lines = lines.slice(0, index)
    },
  }
}

/** The text node holding a word's own letters, with the offset of its first. */
function wordTextNode(span: HTMLElement, word: string): Text | null {
  const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) if ((node as Text).data === word) return node as Text
  return null
}

/**
 * Draw one planned break into a laid-out paragraph in place, exactly as the
 * paint draws it (appendPlannedWord: the head in a `lab-syl` span, then the
 * tail), so only the lines after it lay out again. False if it cannot.
 */
export function splitWordInPlace(node: Text, at: number): boolean {
  if (at <= 0 || at >= node.data.length || !node.parentNode) return false
  const tail = node.splitText(at)
  const head = document.createElement('span')
  head.className = 'lab-syl'
  node.parentNode.insertBefore(head, tail)
  head.appendChild(node)
  return true
}

/** A space and a hyphen in `p`'s face, measured with a probe in it. */
function faceMetrics(p: HTMLElement, fontSize: number): { space: number; hyphen: number } {
  const probe = document.createElement('span')
  probe.textContent = '-'
  p.append(probe)
  const hyphen = probe.getBoundingClientRect().width
  probe.textContent = ' '
  const space = probe.getBoundingClientRect().width || fontSize / 4
  probe.remove()
  return { space, hyphen }
}

/**
 * Plan one paragraph in `p` (already in the column). `render` lays the
 * paragraph out with a given plan; given `changed` (the one break just added,
 * in the word's own text node) it may draw that break in place instead.
 * `metrics` (a space and a hyphen in this face) is measured when not given.
 * Exported for tests.
 */
export function planParagraph(
  p: HTMLElement,
  words: Array<{ text: string }>,
  breaksOf: (wordIndex: number) => number[],
  render: (plan: Map<number, number>, changed?: { wordIndex: number; node: Text; at: number }) => void,
  gapEm = PLAN_GAP_EM,
  secondGapEm = PLAN_SECOND_GAP_EM,
  metrics?: { space: number; hyphen: number },
): Map<number, number> {
  const plan = new Map<number, number>()
  const style = getComputedStyle(p)
  const fontSize = parseFloat(style.fontSize) || 16
  const { space, hyphen } = metrics ?? faceMetrics(p, fontSize)
  render(plan)
  const right = p.getBoundingClientRect().right - (parseFloat(style.paddingRight) || 0)
  const lines = lineReader(p)
  // One Range per paragraph, not per candidate: every live Range is updated on
  // every DOM change in the document, so hundreds of them (alive until
  // collected) slowed every later page trial.
  const range = document.createRange()
  for (let index = 0; ;) {
    const line = lines.line(index)
    const next = lines.line(index + 1)
    if (!line || !next) break
    let planned = false
    let run = 0
    for (let back = index - 1; back >= 0 && lines.line(back)!.endsSplit; back -= 1) run += 1
    const room = right - line.right
    // A second hyphen in a row only for a line that would be clearly loose:
    // the allowance is kept for the worst lines rather than spent on the first.
    if (!line.endsSplit && line.items >= 2 && run < PLAN_MAX_RUN && !next.startsSplit && !plan.has(next.first)
      && (space + room / (line.items - 1)) / fontSize > (run > 0 ? secondGapEm : gapEm)) {
      // A verse number is welded to the word after it (a no-break space, in
      // one `.lab-verse-unit`), so a line that ends before "⁶ Shemaiah" can
      // only take the number together with the head of that word ("⁶ She-"),
      // measured from the number; never the number alone (Nehemiah 12,
      // Anders, iPhone, Oct 2026).
      const lead = isLabVerseMarker(words[next.first]?.text ?? '') && next.first + 1 < words.length ? next.first : -1
      const wordIndex = lead >= 0 ? lead + 1 : next.first
      const span = lines.spans()[wordIndex]
      const leadSpan = lead >= 0 ? lines.spans()[lead] : undefined
      const node = span && (lead < 0 || leadSpan) ? wordTextNode(span, words[wordIndex]?.text ?? '') : null
      const points = node && !plan.has(wordIndex) ? breaksOf(wordIndex) : []
      for (let at = points.length - 1; at >= 0; at -= 1) {
        if (leadSpan) range.setStartBefore(leadSpan)
        else range.setStart(node!, 0)
        range.setEnd(node!, points[at])
        if (space + range.getBoundingClientRect().width + hyphen > room) continue
        plan.set(wordIndex, points[at])
        render(plan, { wordIndex, node: node!, at: points[at] })
        // Lines above this one are unchanged; this one is read again.
        lines.invalidateFrom(index)
        planned = true
        break
      }
    }
    if (!planned) index += 1
  }
  range.detach()
  return plan
}

/**
 * Make plans for `paragraphs` in the column `host` lays paragraphs out in
 * (a measuring stage of the reading width). `paint` builds a paragraph's
 * measurement markup with a plan (labMeasureParagraphInto). Without loaded
 * patterns nothing is planned and every paragraph keeps the browser's own
 * hyphenation, exactly as before. Returns the layout the plans belong to
 * ('' when nothing was planned), so a measurement can be keyed by it.
 */
export function planHyphenation(
  host: HTMLElement,
  paragraphs: string[],
  lang: HyphenLang | null,
  paint: (p: HTMLElement, words: Array<{ text: string; emphasis?: boolean }>, text: string, plan: Map<number, number>) => void,
): string {
  if (!lang || !hyphenatorReady(lang) || typeof document === 'undefined') return ''
  const p = document.createElement('p')
  p.className = 'lab-hearing-line has-hyphen-plan is-hyphen-planning'
  host.append(p)
  try {
    const style = getComputedStyle(p)
    const width = p.getBoundingClientRect().width
    if (!(width > 0)) return ''
    const key = [lang, Math.round(width * 10), style.fontFamily, faceState(style.fontFamily), style.fontSize, style.fontWeight, style.wordSpacing, style.letterSpacing, style.paddingLeft, style.paddingRight].join('|')
    active = planSetFor(key)
    const { plans, words: planWords } = active
    // Every paragraph is planned in this one face: measure its space and hyphen once.
    let metrics: { space: number; hyphen: number } | undefined
    for (const text of paragraphs) {
      if (plans.has(text)) continue
      const words = tokenizeHearingWords(text)
      if (!plannable(text, words)) continue
      // Never inside a verse number or a link (a link paints its own label).
      const breaksOf = (index: number) => isLabVerseMarker(words[index].text) || wordLink(text, index, words[index].text)
        ? [] : hyphenationBreaks(words[index].text, lang, true)
      // The first layout is painted whole; each break after it is drawn in place.
      metrics ??= faceMetrics(p, parseFloat(style.fontSize) || 16)
      const plan = planParagraph(p, words, breaksOf, (current, changed) => {
        if (!changed || !splitWordInPlace(changed.node, changed.at)) paint(p, words, text, current)
      }, PLAN_GAP_EM, PLAN_SECOND_GAP_EM, metrics)
      plans.set(text, plan.size ? plan : EMPTY)
      planWords.set(text, words.map(word => word.text))
    }
    return key
  } finally {
    p.remove()
  }
}
