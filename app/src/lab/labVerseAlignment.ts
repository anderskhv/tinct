import type { AnchorMap } from './labEditionAnchors'
import { leadingPreface } from './labEditionSwitch'
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

/** A compare paragraph start this near the proportional point is taken instead of it (words). */
const PARAGRAPH_SNAP_WORDS = 30
/** A compare line or sentence start this near the proportional point is taken instead of it (words). */
const BREAK_SNAP_WORDS = 12
const SENTENCE_END = /[.!?;:]["'”’)\]]*$/

/**
 * Pair two editions of one chapter whose paragraphs do not line up and carry no verse numbers (Pope's verse
 * Odyssey beside Butler's prose; a Danish edition that keeps its own paragraphing; Anders, 11 Nov 2026).
 *
 * Nothing in the text says which paragraph answers which, so none is claimed: a primary segment is shown beside
 * the compare words the same share of the way through the chapter, by words. Each primary paragraph begins beside
 * a compare paragraph start when one is near, else a verse line or sentence start, so no line is cut mid-phrase
 * where it can be helped. The compare text is tiled exactly: every word appears once, in order, beside whichever
 * primary segments cover the chapter.
 */
export function buildProportionalAlignment(primary: string[], compare: string[], anchors?: AnchorMap | null): VerseAlignment | null {
  const mainCounts = primary.map(text => tokenizeHearingWords(text).length)
  const otherWords = compare.map(text => tokenizeHearingWords(text))
  const mainStart: number[] = []
  let mainTotal = 0
  for (const count of mainCounts) { mainStart.push(mainTotal); mainTotal += count }
  const otherStart: number[] = []
  let otherTotal = 0
  for (const words of otherWords) { otherStart.push(otherTotal); otherTotal += words.length }
  if (mainTotal === 0 || otherTotal === 0) return null

  // Where the compare text may be divided without cutting a phrase: paragraph, verse-line and sentence starts.
  const paragraphBreaks = otherStart.filter((start, index) => otherWords[index].length > 0)
  const softBreaks: number[] = []
  compare.forEach((text, index) => {
    const words = otherWords[index]
    if (!words.length) return
    softBreaks.push(otherStart[index])
    if (text.includes('\n')) {
      // A verse edition's own lines (registerNewlineVerseLines): the words of each line, counted as the tokenizer does.
      let at = 0
      for (const line of text.split('\n')) {
        if (at > 0 && at < words.length) softBreaks.push(otherStart[index] + at)
        at += tokenizeHearingWords(line).length
      }
    }
    words.forEach((word, wordIndex) => {
      if (wordIndex + 1 < words.length && SENTENCE_END.test(word.text)) softBreaks.push(otherStart[index] + wordIndex + 1)
    })
  })
  softBreaks.sort((a, b) => a - b)
  const nearest = (sorted: number[], at: number, within: number): number | null => {
    let low = 0
    let high = sorted.length - 1
    while (low < high) {
      const mid = (low + high) >> 1
      if (sorted[mid] < at) low = mid + 1
      else high = mid
    }
    const after = sorted[low]
    const before = sorted[low - 1]
    const best = before !== undefined && (after === undefined || at - before <= after - at) ? before : after
    return best !== undefined && Math.abs(best - at) <= within ? best : null
  }
  // An edition's own opening (a verse translation's prose argument, labEditionSwitch leadingPreface) answers nothing
  // in the other: it stands at the head, beside the other's opening if that has one, and the share is of the rest.
  const mainPreface = leadingPreface(primary) ? mainCounts[0] : 0
  const otherPreface = leadingPreface(compare) ? otherWords[0].length : 0
  const mainBody = mainTotal - mainPreface
  const otherBody = otherTotal - otherPreface
  const byShare = mainBody > 0 && otherBody > 0
    ? (offset: number) => (offset <= mainPreface
      ? (mainPreface > 0 ? offset * otherPreface / mainPreface : 0)
      : otherPreface + (offset - mainPreface) * otherBody / mainBody)
    : (offset: number) => offset * otherTotal / mainTotal
  // The book's anchors (labEditionAnchors.ts), when it has them for these two texts: the compare word opposite is
  // found through the rare words both translations share, and share of the text is used only between two of them.
  const share = anchors ? (offset: number) => anchors.map(offset) : byShare

  // Each primary paragraph's compare start, never before the one above it.
  const paragraphAt: number[] = []
  mainStart.forEach((start, index) => {
    const raw = share(start)
    const previous = paragraphAt[index - 1] ?? 0
    // A break the paragraph above already begins at is not this one's: two paragraphs that fall in one compare
    // paragraph (a question and its answer) would otherwise share its start, and the first would show nothing.
    const free = (at: number | null) => (at !== null && (at > previous || raw <= previous) ? at : null)
    // Through anchors the start is already a sentence of the compare text: it is not moved to a paragraph further off.
    const at = index === 0 ? 0 : (anchors ? null : free(nearest(paragraphBreaks, raw, PARAGRAPH_SNAP_WORDS))) ?? free(nearest(softBreaks, raw, BREAK_SNAP_WORDS)) ?? Math.round(raw)
    paragraphAt.push(Math.max(previous, Math.min(otherTotal, at)))
  })
  paragraphAt.push(otherTotal)
  // A point inside a primary paragraph: its own share, on a line or sentence start when one is near, within the
  // paragraph's compare span. Monotonic in the offset, so consecutive segments tile the compare text.
  const pointAt = (paragraphIndex: number, word: number): number => {
    if (word <= 0) return paragraphAt[paragraphIndex]
    if (word >= mainCounts[paragraphIndex]) return paragraphAt[paragraphIndex + 1]
    const raw = share(mainStart[paragraphIndex] + word)
    const at = nearest(softBreaks, raw, BREAK_SNAP_WORDS) ?? Math.round(raw)
    return Math.max(paragraphAt[paragraphIndex], Math.min(paragraphAt[paragraphIndex + 1], at))
  }

  return {
    pieces(segment) {
      if (segment.paragraphIndex < 0 || segment.paragraphIndex >= mainCounts.length) return []
      const from = pointAt(segment.paragraphIndex, segment.from)
      const to = pointAt(segment.paragraphIndex, segment.to)
      const pieces: ComparePiece[] = []
      for (let index = 0; index < otherWords.length && otherStart[index] < to; index += 1) {
        const start = otherStart[index]
        const end = start + otherWords[index].length
        if (end <= from) continue
        const a = Math.max(from, start) - start
        const b = Math.min(to, end) - start
        if (b > a) pieces.push({ paragraphIndex: index, from: a, to: b })
      }
      return pieces
    },
  }
}

/**
 * The pairing Compare sets its rows by, or null for paragraph beside paragraph: verse by verse where a Bible pair
 * is paragraphed differently, by anchors and share of the chapter where the pair is marked unaligned (`approximate`).
 */
export function compareRowAlignment(primary: string[], compare: string[], approximate = false, anchors?: AnchorMap | null): VerseAlignment | null {
  const verses = needsVerseAlignment(primary, compare) ? buildVerseAlignment(primary, compare) : null
  return verses ?? (approximate && compare.length > 0 ? buildProportionalAlignment(primary, compare, anchors) : null)
}

/**
 * Compare shows the Compare edition on the LEFT and the reader's main edition on the right (Anders, 11 Nov 2026).
 *
 * Rows are paired top to top and a page ends when either side is full, so the taller text fills its page and the
 * other follows with white space. Verse set line by line runs about 1.8 times as tall as the prose opposite it
 * (Butler | Pope, Book 7: the left page 28 to 76 per cent filled). The left page should be the full one, so the
 * verse goes there. A change of sides on screen only: the main edition is still the main edition (the saved place,
 * audio, Explain, what Compare returns to).
 *
 * The rule: the pair's paragraphs do not line up, the Compare edition is `style: 'verse'`, and the main edition is not.
 * Aligned pairs, verse as the main edition, and two prose or two verse editions keep their sides.
 */
export function compareSidesSwapped(pair: { unaligned: boolean; mainStyle: string | undefined; compareStyle: string | undefined }): boolean {
  return pair.unaligned && pair.compareStyle === 'verse' && pair.mainStyle !== 'verse'
}
