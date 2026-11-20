import { continuousViewportWords } from './ContinuousReader'
import type { ContinuousReaderAnchor } from './continuousReaderWindow'

/** A painted chapter's words, the reader's own ("lab-word") or a neighbour's ("lab-opening-word"). */
export const WORDS = '[data-paragraph-index][data-word-index]:is([data-testid="lab-word"],[data-testid="lab-opening-word"])'

export type WordGeometry = { node: HTMLElement; top: number; bottom: number; height: number; anchor: ContinuousReaderAnchor }

/**
 * A painted chapter's words, measured only where they are asked about. Measuring every word of a long chapter
 * (ten thousand rects) after each change of the page held the main thread for tens of milliseconds at every
 * chapter line. Geometry is in content coordinates and kept until the page changes (`invalidate`).
 */
export interface ChapterWords {
  readonly length: number
  at: (index: number) => WordGeometry
  /** The word at `anchor` (words are in reading order: found by their indexes, nothing is measured). */
  find: (anchor: ContinuousReaderAnchor) => WordGeometry | undefined
  /** `continuousViewportWords` over the whole chapter, measuring only the words around the viewport. */
  viewport: (scrollTop: number, height: number) => ReturnType<typeof continuousViewportWords>
}

export const NO_WORDS: ChapterWords = { length: 0, at: () => { throw new RangeError('no words') }, find: () => undefined, viewport: () => continuousViewportWords([], 0, 0) }

export function chapterWords(host: HTMLElement, block: HTMLElement): ChapterWords {
  const nodes = Array.from(block.querySelectorAll<HTMLElement>(WORDS))
  const measured: WordGeometry[] = []
  const hostTop = host.getBoundingClientRect().top
  const at = (index: number) => {
    let word = measured[index]
    if (!word) {
      const node = nodes[index]
      const rect = node.getBoundingClientRect()
      const offset = host.scrollTop - hostTop
      word = measured[index] = { node, top: rect.top + offset, bottom: rect.bottom + offset, height: rect.height,
        anchor: { paragraphIndex: Number(node.dataset.paragraphIndex), wordIndex: Number(node.dataset.wordIndex) } }
    }
    return word
  }
  /** The first index whose word passes `test`, words being in reading order (a line's words may sit a little apart). */
  const firstWhere = (test: (word: WordGeometry) => boolean) => {
    let low = 0
    let high = nodes.length
    while (low < high) {
      const mid = (low + high) >> 1
      if (test(at(mid))) high = mid
      else low = mid + 1
    }
    return low
  }
  // A screen's height either side: far more than the words of one line ever sit apart, so the words the full scan
  // would find are all inside the range scanned.
  const viewport = (scrollTop: number, height: number) => {
    if (!nodes.length) return continuousViewportWords([], scrollTop, height)
    const margin = Math.max(height, 400)
    const from = Math.max(0, firstWhere(word => word.bottom > scrollTop - margin) - 1)
    const to = Math.min(nodes.length - 1, firstWhere(word => word.top >= scrollTop + height + margin))
    const range: WordGeometry[] = []
    for (let index = from; index <= to; index++) range.push(at(index))
    // The full scan falls back to the chapter's last word when no word reaches the reading line.
    if (to < nodes.length - 1 && !range.some(word => word.top >= scrollTop + Math.min(height * .24, 140))) {
      for (let index = to + 1; index < nodes.length; index++) range.push(at(index))
    }
    return continuousViewportWords(range, scrollTop, height)
  }
  const find = (anchor: ContinuousReaderAnchor) => {
    let low = 0
    let high = nodes.length - 1
    while (low <= high) {
      const mid = (low + high) >> 1
      const node = nodes[mid]
      const paragraph = Number(node.dataset.paragraphIndex), word = Number(node.dataset.wordIndex)
      if (paragraph === anchor.paragraphIndex && word === anchor.wordIndex) return at(mid)
      if (paragraph < anchor.paragraphIndex || (paragraph === anchor.paragraphIndex && word < anchor.wordIndex)) low = mid + 1
      else high = mid - 1
    }
    return undefined
  }
  return { length: nodes.length, at, find, viewport }
}
