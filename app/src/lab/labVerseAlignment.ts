import { isLabVerseMarker, labVerseMarkerDisplay, tokenizeHearingWords, type ChapterPageSegment } from './labHearing'

/** A run of compare-edition words, in the compare edition's own coordinates. */
export interface ComparePiece { paragraphIndex: number; from: number; to: number }

export interface VerseAlignment {
  /** The compare words that belong beside a primary segment. */
  pieces: (segment: Pick<ChapterPageSegment, 'paragraphIndex' | 'from' | 'to'>) => ComparePiece[]
}

interface VerseStart { paragraphIndex: number; wordIndex: number; verse: string }

function verseStarts(paragraphs: string[]): { starts: VerseStart[]; words: ReturnType<typeof tokenizeHearingWords>[] } {
  const words = paragraphs.map(text => tokenizeHearingWords(text))
  const starts: VerseStart[] = []
  words.forEach((paragraph, paragraphIndex) => paragraph.forEach((word, wordIndex) => {
    if (isLabVerseMarker(word.text)) starts.push({ paragraphIndex, wordIndex, verse: labVerseMarkerDisplay(word.text) })
  }))
  return { starts, words }
}

/**
 * Pair two editions of one Bible chapter verse by verse when they set out the
 * text differently (BSB sets poetry line by line; KJV runs verses together).
 *
 * A primary segment is shown beside the compare text of the verses it opens.
 * A verse only the compare edition has (KJV Matthew 17:21, which BSB leaves
 * empty) rides with the verse before it, so no compare text is ever dropped;
 * a verse only the primary has shows nothing opposite. Text before the first
 * compare verse joins the first shared verse. Returns null when either side
 * carries no verse numbers, or they share none: then there is nothing to pair.
 */
export function buildVerseAlignment(primary: string[], compare: string[]): VerseAlignment | null {
  const main = verseStarts(primary)
  const other = verseStarts(compare)
  if (!main.starts.length || !other.starts.length) return null
  const primaryVerses = new Set(main.starts.map(start => start.verse))
  if (!other.starts.some(start => primaryVerses.has(start.verse))) return null

  // Compare word ranges owned by each primary verse, in reading order.
  const owned = new Map<string, ComparePiece[]>()
  const add = (verse: string, paragraphIndex: number, from: number, to: number) => {
    if (to <= from) return
    const list = owned.get(verse) ?? []
    const last = list[list.length - 1]
    if (last && last.paragraphIndex === paragraphIndex && last.to === from) last.to = to
    else list.push({ paragraphIndex, from, to })
    owned.set(verse, list)
  }
  const span = (verse: string, start: { paragraphIndex: number; wordIndex: number }, end: { paragraphIndex: number; wordIndex: number } | null) => {
    const lastParagraph = end ? end.paragraphIndex : other.words.length - 1
    for (let p = start.paragraphIndex; p <= lastParagraph; p += 1) {
      const from = p === start.paragraphIndex ? start.wordIndex : 0
      const to = end && p === end.paragraphIndex ? end.wordIndex : other.words[p].length
      add(verse, p, from, to)
    }
  }
  const firstShared = other.starts.find(start => primaryVerses.has(start.verse))!.verse
  span(firstShared, { paragraphIndex: 0, wordIndex: 0 }, other.starts[0])
  let owner = firstShared
  other.starts.forEach((start, index) => {
    if (primaryVerses.has(start.verse)) owner = start.verse
    span(owner, start, other.starts[index + 1] ?? null)
  })

  const opened = new Map<number, VerseStart[]>()
  for (const start of main.starts) opened.set(start.paragraphIndex, [...(opened.get(start.paragraphIndex) ?? []), start])
  return {
    pieces(segment) {
      const verses = (opened.get(segment.paragraphIndex) ?? [])
        .filter(start => start.wordIndex >= segment.from && start.wordIndex < segment.to)
        .map(start => start.verse)
      // Anything before the first primary verse belongs with it.
      const first = main.starts[0]
      if (segment.paragraphIndex === first.paragraphIndex && segment.from <= first.wordIndex && first.wordIndex < segment.to && !verses.includes(first.verse)) verses.unshift(first.verse)
      const pieces: ComparePiece[] = []
      for (const verse of [...new Set(verses)]) {
        for (const piece of owned.get(verse) ?? []) {
          const last = pieces[pieces.length - 1]
          if (last && last.paragraphIndex === piece.paragraphIndex && last.to === piece.from) last.to = piece.to
          else pieces.push({ ...piece })
        }
      }
      return pieces
    },
  }
}

/** Verse pairing is only needed where the paragraphing differs. */
export function needsVerseAlignment(primary: string[], compare: string[]): boolean {
  return compare.length > 0 && primary.length !== compare.length
}

/**
 * Consecutive primary segments that share one compare cell: a segment that
 * opens verses starts a group; the continuation lines after it (BSB poetry
 * lines without a verse number) join it. Renderer and paginator both use this.
 */
export function verseGroups<T extends Pick<ChapterPageSegment, 'paragraphIndex' | 'from' | 'to'>>(
  segments: T[],
  alignment: VerseAlignment,
): { segments: T[]; pieces: ComparePiece[]; start: number }[] {
  const groups: { segments: T[]; pieces: ComparePiece[]; start: number }[] = []
  segments.forEach((segment, index) => {
    const pieces = alignment.pieces(segment)
    const current = groups[groups.length - 1]
    if (!current || pieces.length) groups.push({ segments: [segment], pieces, start: index })
    else current.segments.push(segment)
  })
  return groups
}
