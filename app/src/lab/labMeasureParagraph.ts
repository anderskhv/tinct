import { isLabVerseMarker, labVerseMarkerDisplay } from './labHearing'

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
export function labMeasureParagraphInto(p: HTMLElement, words: MeasurableWord[]): HTMLElement {
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
  const children: Node[] = []
  for (let index = 0; index < words.length; index += 1) {
    if (isLabVerseMarker(words[index].text) && words[index + 1]) {
      const unit = document.createElement('span')
      unit.className = 'lab-verse-unit'
      unit.append(makeWord(index), makeWord(index + 1))
      children.push(unit)
      index += 1
    } else children.push(makeWord(index))
  }
  p.replaceChildren(...children)
  return p
}
