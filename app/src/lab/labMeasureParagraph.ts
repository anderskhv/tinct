import { isLabVerseMarker, labVerseMarkerDisplay } from './labHearing'
import { verseLineRanges } from './labVerseLines'

export interface MeasurableWord {
  text: string
  emphasis?: boolean
}

/**
 * Spacing belongs inside the word span, exactly as `renderWordGroups` in
 * `LabPassage` composes it. A word that follows a verse marker carries no
 * space: the marker's own trailing no-break space already separates them.
 */
export function labMeasuredWordSpacing(
  word: MeasurableWord,
  wordIndex: number,
  previous?: MeasurableWord,
): string {
  if (wordIndex <= 0 || word.text.startsWith("'") || word.text.startsWith(',') || word.text.startsWith('.')) return ''
  return previous && isLabVerseMarker(previous.text) ? '' : ' '
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
  const makeWord = (index: number): HTMLElement => {
    const span = document.createElement('span')
    span.className = 'lab-hearing-word'
    const spacing = labMeasuredWordSpacing(words[index], index, words[index - 1])
    if (spacing) span.append(spacing)
    const word = words[index]
    const content: Node = isLabVerseMarker(word.text)
      ? (() => {
          const marker = document.createElement('span')
          marker.className = 'lab-verse-mark'
          marker.textContent = labVerseMarkerDisplay(word.text) + (index < words.length - 1 ? '\u00a0' : '')
          return marker
        })()
      : document.createTextNode(word.text)
    if (word.emphasis) {
      const em = document.createElement('em')
      em.append(content)
      span.append(em)
    } else span.append(content)
    return span
  }
  const children: Array<{ at: number; node: Node }> = []
  for (let index = 0; index < words.length; index += 1) {
    if (isLabVerseMarker(words[index].text) && words[index + 1]) {
      const unit = document.createElement('span')
      unit.className = 'lab-verse-unit'
      unit.append(makeWord(index), makeWord(index + 1))
      children.push({ at: index, node: unit })
      index += 1
    } else children.push({ at: index, node: makeWord(index) })
  }
  // Verse lineation is a block per line, and a block is taller and narrower
  // than the same words run together. The measured page has to carry it for
  // the same reason it carries verse-marker markup (see above): a paginator
  // that packs against a paragraph shape the reader never sees puts the page
  // breaks in the wrong places.
  const ranges = lineation
    ? verseLineRanges(lineation.text, lineation.from, lineation.from + words.length)
    : null
  if (!ranges) {
    p.replaceChildren(...children.map(child => child.node))
    return p
  }
  const base = lineation!.from
  p.replaceChildren(...ranges.map(([start, end]) => {
    const line = document.createElement('span')
    line.className = 'lab-verse-line'
    line.append(...children.filter(child => base + child.at >= start && base + child.at < end).map(child => child.node))
    return line
  }))
  return p
}
