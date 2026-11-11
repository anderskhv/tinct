/**
 * A reader's place carried through a book's edition anchors (labEditionAnchorsBuild.ts: what an anchor is and how
 * they are found). Here: the anchors of a chapter as a mapping between the two texts on screen, and the files.
 */
import type { EditionAnchorFile } from './labEditionAnchorsBuild'

export type { ChapterAnchors, EditionAnchorFile } from './labEditionAnchorsBuild'

/** A chapter's anchors as a mapping between two texts on screen, in their own word offsets. */
export interface AnchorMap {
  /** A word offset in the text read (from its chapter start) as the word offset in the other text. */
  map(offset: number): number
}

const sum = (counts: readonly number[]) => counts.reduce((total, n) => total + n, 0)
const same = (x: readonly number[], y: readonly number[]) => x.length === y.length && x.every((n, i) => n === y[i])

/** An offset in a text aligned paragraph by paragraph with another, as the offset in that other (same paragraph, same share of it). */
function throughParagraphs(from: readonly number[], to: readonly number[]): (offset: number) => number {
  const fromStart: number[] = []
  const toStart: number[] = []
  let f = 0
  let t = 0
  from.forEach((count, i) => { fromStart.push(f); toStart.push(t); f += count; t += to[i] })
  const toTotal = t
  return (offset) => {
    if (offset >= f) return toTotal
    let p = 0
    while (p + 1 < from.length && fromStart[p + 1] <= offset) p += 1
    return toStart[p] + (from[p] > 0 ? Math.round((offset - fromStart[p]) * to[p] / from[p]) : 0)
  }
}

/** Piecewise between anchor pairs; the very start is the start, and anything before the first pair is that pair. */
function throughAnchors(pairs: ReadonlyArray<readonly [number, number]>): (offset: number) => number {
  return (offset) => {
    if (offset <= 0) return 0
    if (offset <= pairs[0][0]) return pairs[0][1]
    for (let i = 1; i < pairs.length; i += 1) {
      const [x0, y0] = pairs[i - 1]
      const [x1, y1] = pairs[i]
      if (offset <= x1) return x1 > x0 ? Math.round(y0 + (offset - x0) * (y1 - y0) / (x1 - x0)) : y1
    }
    return pairs[pairs.length - 1][1]
  }
}

/**
 * The mapping from the text read (`from`) to the other (`to`), or null when the anchors do not fit these two texts:
 * another book or pair, no such chapter, or word counts that are not the ones the anchors were counted against (the
 * edition's text has changed since). Null means share of the chapter, as without anchors.
 *
 * `aligned(key)`: the edition is paragraphed like the file's `a` (the registry's `aligned !== false`), so it reads
 * through `a`: same paragraph, same share of it, then the anchors.
 */
export function chapterAnchorMap(
  file: EditionAnchorFile | null | undefined,
  context: {
    bookId: string
    chapterNumber: number
    from: { edition: string; counts: readonly number[] }
    to: { edition: string; counts: readonly number[] }
    aligned: (editionKey: string) => boolean
  },
): AnchorMap | null {
  if (!file || file.format !== 'tinct-edition-anchors' || file.version !== 1 || file.bookId !== context.bookId) return null
  const chapter = file.chapters?.[String(context.chapterNumber)]
  if (!chapter || chapter.anchors.length < 2) return null
  const side = (edition: string) => (edition === file.b ? 'b' : edition === file.a || context.aligned(edition) ? 'a' : null)
  const fromSide = side(context.from.edition)
  const toSide = side(context.to.edition)
  if (!fromSide || !toSide || fromSide === toSide) return null
  const fits = (which: 'a' | 'b', edition: string, counts: readonly number[]) => (edition === file[which]
    ? same(counts, chapter[which])
    // An edition read through `a` has its own word counts, and `a`'s paragraphs.
    : which === 'a' && counts.length === chapter.a.length)
  if (!fits(fromSide, context.from.edition, context.from.counts) || !fits(toSide, context.to.edition, context.to.counts)) return null
  const forward = fromSide === 'a'
  const pairs = forward ? chapter.anchors : chapter.anchors.map(([x, y]) => [y, x] as [number, number])
  const anchors = throughAnchors(pairs)
  const enter = context.from.edition === file[fromSide] ? null : throughParagraphs(context.from.counts, chapter.a)
  const leave = context.to.edition === file[toSide] ? null : throughParagraphs(chapter.a, context.to.counts)
  const total = sum(context.to.counts)
  return {
    map(offset) {
      const inFile = enter ? enter(Math.max(0, offset)) : Math.max(0, offset)
      const out = anchors(inFile)
      return Math.max(0, Math.min(total, leave ? leave(out) : out))
    },
  }
}

const files = import.meta.glob<{ default: EditionAnchorFile }>('../data/editionAnchors/*.json')
const loaded = new Map<string, Promise<EditionAnchorFile | null>>()

/** The anchors written for a book, or null (most books have none). Loaded once, only for a book that has them. */
export function loadEditionAnchors(bookId: string): Promise<EditionAnchorFile | null> {
  let task = loaded.get(bookId)
  if (!task) {
    const load = files[`../data/editionAnchors/${bookId}.json`]
    task = load ? load().then(module => module.default, () => null) : Promise.resolve(null)
    loaded.set(bookId, task)
  }
  return task
}

/** A place in the text read as the place in the other text, through the anchors. Counts are each text's words per paragraph. */
export function mapPlaceThroughAnchors(
  map: AnchorMap, sourceCounts: readonly number[], targetCounts: readonly number[],
  place: { paragraphIndex: number; wordIndex: number },
): { paragraphIndex: number; wordIndex: number } {
  return placeAtWordOffset(targetCounts, map.map(wordOffsetOfPlace(sourceCounts, place)))
}

/** A place as its word offset from the chapter's start. */
export function wordOffsetOfPlace(counts: readonly number[], place: { paragraphIndex: number; wordIndex: number }): number {
  if (counts.length === 0) return 0
  const paragraph = Math.max(0, Math.min(Math.floor(place.paragraphIndex) || 0, counts.length - 1))
  let before = 0
  for (let i = 0; i < paragraph; i += 1) before += counts[i]
  return before + Math.max(0, Math.min(Math.floor(place.wordIndex) || 0, Math.max(0, counts[paragraph] - 1)))
}

/** The paragraph and word at a word offset from the chapter's start (a wordless paragraph is passed over). */
export function placeAtWordOffset(counts: readonly number[], offset: number): { paragraphIndex: number; wordIndex: number } {
  let left = Math.max(0, Math.floor(offset) || 0)
  let last = 0
  for (let i = 0; i < counts.length; i += 1) {
    if (counts[i] <= 0) continue
    if (left < counts[i]) return { paragraphIndex: i, wordIndex: left }
    left -= counts[i]
    last = i
  }
  return { paragraphIndex: last, wordIndex: Math.max(0, (counts[last] ?? 1) - 1) }
}
