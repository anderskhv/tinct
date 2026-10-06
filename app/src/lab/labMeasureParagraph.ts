import { HARD_BREAK_FRAGMENT_RE } from './labHyphenate'
import { isLabVerseMarker, labVerseMarkerDisplay } from './labHearing'
import { paragraphKindClass, wordLink } from './labParagraphStyle'
import { presentationLineRanges, verseLineStarts, verseSpeakerEnd, isInternalVerseBreak } from './labVerseLines'

/**
 * The class of a page-edge fragment. One that ends on the book's own dash
 * ("twenty-") is a hard break: CSS draws no second hyphen after it.
 */
export function labFragmentClass(text: string): string {
  return HARD_BREAK_FRAGMENT_RE.test(text) ? 'lab-word-fragment is-hard-break' : 'lab-word-fragment'
}

export interface MeasurableWord {
  text: string
  emphasis?: boolean
  /** Display-only page-edge fragment; measured, never indexed. */
  fragment?: true
}

/**
 * Spacing belongs outside the word span, exactly as `renderWordGroups` in
 * `LabPassage` composes it. A word that follows a verse marker carries no
 * space: the marker's own trailing no-break space already separates them.
 */
export function labMeasuredWordSpacing(
  word: MeasurableWord,
  wordIndex: number,
  previous?: MeasurableWord,
): string {
  if (wordIndex <= 0 || word.text.startsWith("'") || word.text.startsWith(',') || word.text.startsWith('.')) return ''
  // Mirrors LabPassage.wordSpacing exactly: the measured paragraph has to hold
  // the same characters the reader paints, or pages break in the wrong places.
  return previous && isLabVerseMarker(previous.text) ? '\u00a0' : ' '
}

/**
 * Build the measurement DOM for one paragraph so that it lays out identically
 * to the painted paragraph.
 *
 * Measuring plain text instead of this markup was a real defect: a verse
 * marker paints as a small superscript inside an inline-block `lab-verse-unit`,
 * which is both narrower than the same digits in body type AND taller than the
 * line's strut. A plain-text probe therefore measured the wrong line width and
 * the wrong line height, so the desktop paginator packed pages that did not
 * match what the reader saw — a column that overflowed its box, or one that
 * stopped a line short of the bottom. One builder, two call sites, one layout.
 */
export function labMeasureParagraphInto(
  p: HTMLElement,
  words: MeasurableWord[],
  lineation?: { text?: string; from: number },
): HTMLElement {
  const makeWord = (index: number, leading = ''): HTMLElement => {
    const span = document.createElement('span')
    const word = words[index]
    // The fragment carries the CSS hyphen, so it must be measured with it.
    if (word.fragment) {
      span.className = labFragmentClass(word.text)
      span.setAttribute('aria-hidden', 'true')
      span.textContent = word.text
      return span
    }
    span.className = 'lab-hearing-word'
    // A link paints its label (a bare address shows its domain and an arrow),
    // so it is measured as painted.
    const link = lineation ? wordLink(lineation.text, lineation.from + index, word.text) : null
    const content: Node = link
      ? (() => {
          const group = document.createDocumentFragment()
          const anchor = document.createElement('a')
          anchor.className = link.end ? 'lab-link is-link-end' : 'lab-link'
          anchor.textContent = link.label
          group.append(link.lead, anchor, link.trail)
          return group
        })()
      : isLabVerseMarker(word.text)
      ? (() => {
          const marker = document.createElement('span')
          marker.className = 'lab-verse-mark'
          marker.textContent = labVerseMarkerDisplay(word.text)
          return marker
        })()
      : document.createTextNode(word.text)
    if (word.emphasis) {
      const em = document.createElement('em')
      em.append(content)
      span.append(em)
    } else span.append(content)
    // The separator that follows a verse marker belongs INSIDE the next word's
    // span, matching the reader, so a highlight starting there paints it.
    if (leading) span.prepend(document.createTextNode(leading))
    return span
  }
  // A heading, list item or label paints in its own style; measure it so.
  if (lineation && p.tagName === 'P') {
    const kind = paragraphKindClass(lineation.text, lineation.from).trim()
    if (kind) p.classList.add(...kind.split(/\s+/))
  }
  const children: Array<{ at: number; node: Node }> = []
  for (let index = 0; index < words.length; index += 1) {
    const group = document.createDocumentFragment()
    group.append(labMeasuredWordSpacing(words[index], index, words[index - 1]))
    if (isLabVerseMarker(words[index].text) && words[index + 1]) {
      const unit = document.createElement('span')
      unit.className = 'lab-verse-unit'
      unit.append(makeWord(index), makeWord(index + 1, labMeasuredWordSpacing(words[index + 1], index + 1, words[index])))
      group.append(unit)
      children.push({ at: index, node: group })
      index += 1
    } else {
      group.append(makeWord(index))
      children.push({ at: index, node: group })
    }
  }
  // Verse lineation is a block per line, and a block is taller and narrower
  // than the same words run together. The measured page has to carry it for
  // the same reason it carries verse-marker markup (see above): a paginator
  // that packs against a paragraph shape the reader never sees puts the page
  // breaks in the wrong places.
  // Count OWNED words only: a trailing display fragment is drawn inside the
  // last verse line, never as a line of its own.
  const ownedCount = words.filter(word => !word.fragment).length
  const ranges = lineation
    ? presentationLineRanges(lineation.text, lineation.from, lineation.from + ownedCount)
    : null
  if (!ranges) {
    p.replaceChildren(...children.map(child => child.node))
    return p
  }
  const base = lineation!.from
  p.replaceChildren(...ranges.map(([start, end]) => {
    const line = document.createElement('span')
    line.className = verseLineStarts(lineation?.text) ? 'lab-verse-line' : 'lab-speech-run'
    const items = children.filter(child => base + child.at >= start && base + child.at < end)
    const speakerEnd = verseSpeakerEnd(lineation?.text, start)
    if (start < speakerEnd) {
      const speaker = document.createElement('span')
      speaker.className = 'lab-verse-speaker'
      speaker.append(...items.filter(child => base + child.at < speakerEnd).map(child => child.node))
      line.append(speaker)
    }
    const dialogue = document.createElement('span')
    dialogue.className = 'lab-verse-dialogue'
    dialogue.append(...items.filter(child => base + child.at >= speakerEnd).map(child => child.node))
    line.append(dialogue)
    if (isInternalVerseBreak(lineation?.text, end)) {
      const marker = document.createElement('span')
      marker.className = 'lab-verse-break'
      marker.setAttribute('aria-hidden', 'true')
      line.append(marker)
    }
    return line
  }))
  return p
}

/**
 * A BSB poetry line joined to the visual paragraph before it (labPoetry):
 * measured exactly as LabPassage paints it -- a space, then the line's words in
 * a `lab-prose-join` span inside the same block.
 */
export function labMeasureJoinInto(
  p: HTMLElement,
  words: MeasurableWord[],
  lineation?: { text?: string; from: number },
): HTMLElement {
  const span = document.createElement('span')
  span.className = 'lab-prose-join'
  labMeasureParagraphInto(span, words, lineation)
  p.append(' ', span)
  return p
}

function inkRects(element: Element): DOMRect[] {
  return [...element.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0)
}

/**
 * The word indexes that begin a painted line, among the words of one measured
 * paragraph slice. `container` is the block (or `lab-prose-join` span) that
 * `labMeasureParagraphInto` / `labMeasureJoinInto` filled; `from` is the
 * paragraph index of its first word, which is never listed.
 *
 * The paginator needs this to move a page break back without leaving a short
 * last line: a break moved to a line start ends the page on the full line
 * above it; a break moved anywhere else ends the page partway along a line,
 * which is what left "made in science." alone on a ragged last line.
 *
 * A verse number and the word after it are one unbreakable unit, so the unit
 * starts a line at the number. A word the browser hyphenated across two lines
 * belongs to the line it starts on. A display fragment is not a word.
 */
export function measuredLineStarts(container: Element, from: number): number[] {
  const nestedJoin = container.classList.contains('lab-prose-join') ? container : null
  const words = [...container.querySelectorAll<HTMLElement>('.lab-hearing-word')]
    .filter(word => word.closest('.lab-prose-join') === nestedJoin)
  const starts: number[] = []
  let previous: DOMRect | null = null
  for (let index = 0; index < words.length; index += 1) {
    const marker = Boolean(words[index].querySelector('.lab-verse-mark')) && index + 1 < words.length
    // A verse number is set small and raised; its line is its word's line.
    const placed = marker ? words[index + 1] : words[index]
    const rects = inkRects(placed)
    if (rects.length > 0) {
      const first = rects[0]
      if (previous && index > 0 && first.top + first.height / 2 > previous.bottom) starts.push(from + index)
      previous = rects[rects.length - 1]
    }
    if (marker) index += 1
  }
  return starts
}

