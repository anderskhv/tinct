import { LAB_ORPHAN_PAGE_WORDS, chapterPageSegments, isLabVerseMarker, labVerseMarkerDisplay, sentenceStartWordIndex, tokenizeHearingWords, type ChapterHearingPage, type ChapterPageSegment } from './labHearing'

export interface LabCompareAnchor {
  paragraphIndex: number
  wordIndex: number
}

const NEARBY_SENTENCE_WORDS = 10

/**
 * Map a visible word between structurally aligned editions.
 *
 * Paragraph identity is the durable cross-edition anchor. Word counts are
 * edition-local, so the fine position is expressed as progress through that
 * paragraph. A nearby sentence boundary makes the landing feel intentional,
 * while long sentences retain their relative position instead of jumping far
 * backwards.
 */
export function mapLabCompareAnchor(
  sourceParagraphs: string[],
  targetParagraphs: string[],
  anchor: LabCompareAnchor,
  alignment?: LabCompareAlignment | null,
): LabCompareAnchor {
  if (targetParagraphs.length === 0) return { paragraphIndex: 0, wordIndex: 0 }
  const aligned = alignment ? alignedEndpoint(alignment, sourceParagraphs, targetParagraphs, anchor, 'start') : null
  if (aligned) return aligned
  const paragraphIndex = Math.max(0, Math.min(anchor.paragraphIndex, targetParagraphs.length - 1))
  const sourceText = sourceParagraphs[Math.max(0, Math.min(anchor.paragraphIndex, Math.max(0, sourceParagraphs.length - 1)))] || ''
  const targetText = targetParagraphs[paragraphIndex] || ''
  const sourceWords = tokenizeHearingWords(sourceText)
  const targetWords = tokenizeHearingWords(targetText)
  if (targetWords.length === 0) return { paragraphIndex, wordIndex: 0 }
  if (sourceWords.length === 0) return { paragraphIndex, wordIndex: 0 }

  // Verse-marked text carries its own alignment, finer than the paragraph:
  // the verse the source word sits in is the verse the target begins at.
  // Proverbs 17 is six paragraphs of several verses each; a page beginning
  // at verse 15 has to land on verse 15, not on a proportional guess at it.
  // Bible editions keep their own paragraphing (BSB breaks poetry into lines),
  // so the verse is looked for across the chapter when the same paragraph
  // index does not hold it, and a verse line without its own marker belongs
  // to the last verse opened before it.
  const sourceIndex = Math.max(0, Math.min(anchor.paragraphIndex, Math.max(0, sourceParagraphs.length - 1)))
  const verse = labVerseAtOrBefore(sourceWords, Math.max(0, Math.min(anchor.wordIndex, sourceWords.length - 1)))
    ?? labVerseBeforeParagraph(sourceParagraphs, sourceIndex)
  if (verse !== null) {
    const target = labVerseWordIndex(targetWords, verse)
    if (target !== null) return { paragraphIndex, wordIndex: target }
    const elsewhere = labVerseLocation(targetParagraphs, verse)
    if (elsewhere) return elsewhere
  }

  const sourceDenominator = Math.max(1, sourceWords.length - 1)
  const sourceWord = Math.max(0, Math.min(anchor.wordIndex, sourceDenominator))
  const progress = sourceWord / sourceDenominator
  const proportionalWord = Math.max(0, Math.min(
    targetWords.length - 1,
    Math.round(progress * Math.max(0, targetWords.length - 1)),
  ))
  const sentenceStart = sentenceStartWordIndex(targetWords, proportionalWord)
  const wordIndex = proportionalWord - sentenceStart <= NEARBY_SENTENCE_WORDS
    ? sentenceStart
    : proportionalWord
  return { paragraphIndex, wordIndex }
}

function pageOf(segments: ChapterPageSegment[]): ChapterHearingPage | null {
  const clean = segments.filter(segment => segment.to > segment.from)
  const first = clean[0]
  if (!first) return null
  return { ...first, segments: clean.length > 1 ? clean : undefined }
}

/**
 * Split a page map so that a page begins exactly at `anchor`.
 *
 * The compare page is anchored, not found: the compare edition's own breaks
 * put the primary page's first verse wherever they put it — often mid-page,
 * a page that began six verses earlier — and the reader was landing there.
 * The page that holds the anchor is cut in two at the anchor, segments and
 * all, so the page shown begins at the same verse the primary page begins
 * at. A map that already has a page starting there is returned unchanged.
 */
export function splitLabPagesAtAnchor(
  pages: ChapterHearingPage[],
  anchor: LabCompareAnchor,
): ChapterHearingPage[] {
  const index = pages.findIndex(page => chapterPageSegments(page).some(segment => (
    segment.paragraphIndex === anchor.paragraphIndex
    && anchor.wordIndex >= segment.from
    && anchor.wordIndex < segment.to
  )))
  if (index < 0) return pages
  const segments = chapterPageSegments(pages[index])
  const at = segments.findIndex(segment => (
    segment.paragraphIndex === anchor.paragraphIndex
    && anchor.wordIndex >= segment.from
    && anchor.wordIndex < segment.to
  ))
  const hit = segments[at]
  if (at === 0 && hit.from === anchor.wordIndex) return pages
  const before = segments.slice(0, at)
  if (anchor.wordIndex > hit.from) before.push({ ...hit, to: anchor.wordIndex })
  const after: ChapterPageSegment[] = [{ ...hit, from: anchor.wordIndex }, ...segments.slice(at + 1)]
  const head = pageOf(before)
  const tail = pageOf(after)
  if (!head || !tail) return pages
  const next = pages.slice()
  next.splice(index, 1, head, tail)
  return next
}

/** The number of the verse `wordIndex` sits in, or null when the text carries no markers. */
export function labVerseAtOrBefore(words: Array<{ text: string }>, wordIndex: number): string | null {
  for (let index = Math.min(wordIndex, words.length - 1); index >= 0; index -= 1) {
    if (isLabVerseMarker(words[index].text)) return labVerseMarkerDisplay(words[index].text)
  }
  return null
}

/** Where verse `verse` begins in `words` — the marker's own index — or null. */
export function labVerseWordIndex(words: Array<{ text: string }>, verse: string): number | null {
  const index = words.findIndex(word => isLabVerseMarker(word.text) && labVerseMarkerDisplay(word.text) === verse)
  return index < 0 ? null : index
}

/** The last verse opened in any paragraph before `paragraphIndex`, or null. */
function labVerseBeforeParagraph(paragraphs: string[], paragraphIndex: number): string | null {
  for (let index = paragraphIndex - 1; index >= 0; index -= 1) {
    const words = tokenizeHearingWords(paragraphs[index] || '')
    const verse = words.length ? labVerseAtOrBefore(words, words.length - 1) : null
    if (verse !== null) return verse
  }
  return null
}

/**
 * Where `verse` begins anywhere in the chapter. A verse an edition leaves
 * empty (BSB omits Matthew 17:21) lands on the nearest earlier verse it has;
 * the page is a place to read from, not a claim that the verses correspond.
 */
export function labVerseLocation(paragraphs: string[], verse: string): LabCompareAnchor | null {
  const tokenized = paragraphs.map(text => tokenizeHearingWords(text))
  const find = (wanted: string) => {
    for (let paragraphIndex = 0; paragraphIndex < tokenized.length; paragraphIndex += 1) {
      const wordIndex = labVerseWordIndex(tokenized[paragraphIndex], wanted)
      if (wordIndex !== null) return { paragraphIndex, wordIndex }
    }
    return null
  }
  const exact = find(verse)
  if (exact || !/^\d+$/.test(verse)) return exact
  for (let earlier = Number(verse) - 1; earlier >= 1; earlier -= 1) {
    const found = find(String(earlier))
    if (found) return found
  }
  return null
}

// ---------------------------------------------------------------- page end

/**
 * Where the compare passage for a main page ends: the first compare word
 * after it, so the passage is [mapped start, this). `end` is the main page's
 * end in the same form, the word after its last word (`to` of its last
 * segment).
 *
 * The same rules as the start. Verse-marked text includes the whole verse
 * the page's last word sits in: a WEB page that reaches the start of verse
 * 16 maps to a KJV passage through the end of verse 16. Prose maps the
 * position proportionally within the aligned paragraph and finishes the
 * sentence when its end is near. A page that ends with its paragraph ends
 * the passage with the same paragraph.
 */
export function mapLabCompareEnd(
  sourceParagraphs: string[],
  targetParagraphs: string[],
  end: LabCompareAnchor,
  alignment?: LabCompareAlignment | null,
): LabCompareAnchor {
  if (targetParagraphs.length === 0) return { paragraphIndex: 0, wordIndex: 0 }
  // The page's last word: an end at a paragraph's first word means the page
  // ended with the paragraph before it.
  let paragraph = Math.max(0, Math.min(end.paragraphIndex, Math.max(0, sourceParagraphs.length - 1)))
  let after = Math.max(0, end.wordIndex)
  while (after === 0 && paragraph > 0) {
    paragraph -= 1
    after = tokenizeHearingWords(sourceParagraphs[paragraph] || '').length
  }
  const sourceWords = tokenizeHearingWords(sourceParagraphs[paragraph] || '')
  if (after === 0 || sourceWords.length === 0) return passageEndAt(targetParagraphs, Math.min(paragraph, targetParagraphs.length - 1), 0)
  after = Math.min(after, sourceWords.length)

  if (alignment) {
    const aligned = alignedEndpoint(alignment, sourceParagraphs, targetParagraphs, { paragraphIndex: paragraph, wordIndex: after }, 'end')
    if (aligned) return aligned
  }

  const verse = labVerseAtOrBefore(sourceWords, after - 1) ?? labVerseBeforeParagraph(sourceParagraphs, paragraph)
  if (verse !== null) {
    const opened = labVerseLocation(targetParagraphs, verse)
    if (opened) return nextVerseStart(targetParagraphs, opened)
  }

  const targetIndex = Math.max(0, Math.min(paragraph, targetParagraphs.length - 1))
  const targetWords = tokenizeHearingWords(targetParagraphs[targetIndex] || '')
  if (after >= sourceWords.length || targetWords.length === 0) return passageEndAt(targetParagraphs, targetIndex, targetWords.length)
  const proportional = Math.max(1, Math.min(targetWords.length, Math.round((after / sourceWords.length) * targetWords.length)))
  // Finish the sentence the page ends in when its end is near: the mirror of
  // the start, which steps back to a nearby sentence start.
  for (let word = proportional; word <= Math.min(targetWords.length, proportional + NEARBY_SENTENCE_WORDS); word += 1) {
    if (word === targetWords.length || sentenceStartWordIndex(targetWords, word) === word) return passageEndAt(targetParagraphs, targetIndex, word)
  }
  return { paragraphIndex: targetIndex, wordIndex: proportional }
}

/** The passage end as the next word to read: the end of a paragraph is the start of the next one. */
function passageEndAt(paragraphs: string[], paragraphIndex: number, wordIndex: number): LabCompareAnchor {
  const length = tokenizeHearingWords(paragraphs[paragraphIndex] || '').length
  if (wordIndex >= length && paragraphIndex + 1 < paragraphs.length) return { paragraphIndex: paragraphIndex + 1, wordIndex: 0 }
  return { paragraphIndex, wordIndex: Math.min(wordIndex, length) }
}

/** The first verse marker after `opened`, anywhere later in the chapter; the chapter's end when none. */
function nextVerseStart(paragraphs: string[], opened: LabCompareAnchor): LabCompareAnchor {
  for (let paragraphIndex = opened.paragraphIndex; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
    const words = tokenizeHearingWords(paragraphs[paragraphIndex] || '')
    const from = paragraphIndex === opened.paragraphIndex ? opened.wordIndex + 1 : 0
    for (let wordIndex = from; wordIndex < words.length; wordIndex += 1) {
      if (isLabVerseMarker(words[wordIndex].text)) return { paragraphIndex, wordIndex }
    }
  }
  const last = paragraphs.length - 1
  return { paragraphIndex: last, wordIndex: tokenizeHearingWords(paragraphs[last] || '').length }
}

function samePlace(a: LabCompareAnchor, b: LabCompareAnchor): boolean {
  return a.paragraphIndex === b.paragraphIndex && a.wordIndex === b.wordIndex
}

function beforePlace(a: LabCompareAnchor, b: LabCompareAnchor): boolean {
  return a.paragraphIndex < b.paragraphIndex || (a.paragraphIndex === b.paragraphIndex && a.wordIndex < b.wordIndex)
}

function pageIndexHolding(pages: ChapterHearingPage[], place: LabCompareAnchor): number {
  return pages.findIndex(page => chapterPageSegments(page).some(segment => (
    segment.paragraphIndex === place.paragraphIndex && place.wordIndex >= segment.from && place.wordIndex < segment.to
  )))
}

function pageWords(page: ChapterHearingPage): number {
  return chapterPageSegments(page).reduce((sum, segment) => sum + Math.max(0, segment.to - segment.from), 0)
}

/** Words that land on one compare page with a little room left for the extra paragraph breaks a cut page can carry. */
const PASSAGE_FIT = 0.92

/**
 * The compare pages for a flip whose passage is [start, end).
 *
 * When the passage fits one page it gets one: the measured map is cut at the
 * start and at the end, so the page shown is exactly the equivalent of the
 * main page. A passage inside one measured page always fits; one that spills
 * onto the next page fits when its words do not exceed a full page of the
 * same map. Otherwise the map is left as it is (`fits: false`) and the reader
 * is shown where the passage ends instead. Font size is never touched: the
 * painted page's own overflow correction still has the last word.
 */
export function labComparePassagePages(
  pages: ChapterHearingPage[],
  start: LabCompareAnchor,
  end: LabCompareAnchor,
): { pages: ChapterHearingPage[]; fits: boolean } {
  if (!beforePlace(start, end)) return { pages, fits: false }
  const first = pageIndexHolding(pages, start)
  if (first < 0) return { pages, fits: false }
  // The page holding the passage's last word.
  let last = pageIndexHolding(pages, end)
  if (last < 0) last = pages.length - 1
  else if (pages[last] && samePlace(pageStart(pages[last]), end)) last -= 1
  let fits = last === first
  if (!fits && last === first + 1) {
    const words = passageWords(pages, first, last, start, end)
    // A full page of this map: the chapter's last page is usually short.
    const full = Math.max(pageWords(pages[first]), last < pages.length - 1 ? pageWords(pages[last]) : 0)
    fits = words <= full * PASSAGE_FIT
  }
  if (!fits) return { pages, fits: false }
  // Re-cut the pages the passage touches into: what comes before it, the
  // passage itself on one page, and what follows it. Every word keeps
  // exactly one page.
  const before: ChapterPageSegment[] = []
  const inside: ChapterPageSegment[] = []
  const after: ChapterPageSegment[] = []
  for (const segment of pages.slice(first, last + 1).flatMap(chapterPageSegments)) {
    const cuts = [segment.from, segment.to]
    if (segment.paragraphIndex === start.paragraphIndex) cuts.push(start.wordIndex)
    if (segment.paragraphIndex === end.paragraphIndex) cuts.push(end.wordIndex)
    const points = [...new Set(cuts.filter(at => at >= segment.from && at <= segment.to))].sort((a, b) => a - b)
    for (let index = 0; index + 1 < points.length; index += 1) {
      const piece = { ...segment, from: points[index], to: points[index + 1] }
      const at = { paragraphIndex: segment.paragraphIndex, wordIndex: piece.from }
      const list = beforePlace(at, start) ? before : beforePlace(at, end) ? inside : after
      const previous = list[list.length - 1]
      if (previous && previous.paragraphIndex === piece.paragraphIndex && previous.to === piece.from) previous.to = piece.to
      else list.push(piece)
    }
  }
  // A cut can leave a line or two of the neighbouring page on its own. That
  // is an orphan, not a page: it rides with the page next to it, and the
  // painted page's overflow correction moves anything that no longer fits.
  const count = (segments: ChapterPageSegment[]) => segments.reduce((sum, segment) => sum + segment.to - segment.from, 0)
  const previous = first > 0 && count(before) > 0 && count(before) <= LAB_ORPHAN_PAGE_WORDS ? pages[first - 1] : null
  const following = last + 1 < pages.length && count(after) > 0 && count(after) <= LAB_ORPHAN_PAGE_WORDS ? pages[last + 1] : null
  const cut = [
    previous ? pageOf(joined([...chapterPageSegments(previous), ...before])) : pageOf(before),
    pageOf(inside),
    following ? pageOf(joined([...after, ...chapterPageSegments(following)])) : pageOf(after),
  ].filter((page): page is ChapterHearingPage => page !== null)
  const next = pages.slice()
  const from = previous ? first - 1 : first
  next.splice(from, last - from + 1 + (following ? 1 : 0), ...cut)
  return { pages: next, fits: true }
}

/** Segments with neighbouring ranges of one paragraph joined. */
function joined(segments: ChapterPageSegment[]): ChapterPageSegment[] {
  const out: ChapterPageSegment[] = []
  for (const segment of segments) {
    const previous = out[out.length - 1]
    if (previous && previous.paragraphIndex === segment.paragraphIndex && previous.to === segment.from) out[out.length - 1] = { ...previous, to: segment.to }
    else out.push({ ...segment })
  }
  return out
}

function pageStart(page: ChapterHearingPage): LabCompareAnchor {
  const first = chapterPageSegments(page)[0]
  return { paragraphIndex: first?.paragraphIndex ?? page.paragraphIndex, wordIndex: first?.from ?? page.from }
}

function passageWords(pages: ChapterHearingPage[], first: number, last: number, start: LabCompareAnchor, end: LabCompareAnchor): number {
  let words = 0
  for (let index = first; index <= last; index += 1) {
    for (const segment of chapterPageSegments(pages[index])) {
      const from = segment.paragraphIndex === start.paragraphIndex ? Math.max(segment.from, start.wordIndex) : segment.from
      const to = segment.paragraphIndex === end.paragraphIndex ? Math.min(segment.to, end.wordIndex) : segment.to
      const inside = !beforePlace({ paragraphIndex: segment.paragraphIndex, wordIndex: segment.to }, start)
        && beforePlace({ paragraphIndex: segment.paragraphIndex, wordIndex: segment.from }, end)
      if (inside) words += Math.max(0, to - from)
    }
  }
  return words
}

// ------------------------------------------------ sentence alignment (off)

/**
 * Sentence-alignment data for one book (books/align/HANDOFF-codex.md, format
 * version 1). Prepared, not in use: no file is loaded and no book passes an
 * alignment to the mapping above. Turning it on for a book is a release
 * decision of its own.
 *
 * Segments tile both paragraphs in order, as half-open word ranges in the
 * served paragraph's tokens: `m` match and `u` unresolved block carry both
 * sides, `s` is source-only and `t` target-only.
 */
export type LabAlignSegment =
  | ['m' | 'u', number, number, number, number]
  | ['s' | 't', number, number]

export interface LabAlignFile {
  format: string
  version: number
  bookId: string
  source: { edition: string; sha256: string }
  target: { edition: string; sha256: string }
  /** The recorded sign-off. Null means the file must never reach a reader. */
  approved: { by: string; date: string; basis?: string; sampleFile?: string } | null
  chapters: Record<string, Record<string, { status?: string; segments: LabAlignSegment[] }>>
}

/** One chapter of an approved file, oriented from the edition on screen to the one flipped to. */
export interface LabCompareAlignment {
  paragraph(paragraphIndex: number): LabAlignSegment[] | null
  /** True when the edition on screen is the file's target. */
  reversed: boolean
}

/**
 * The alignment for a flip, or null when anything is off: an unknown format,
 * an unapproved file, editions that are not this pair, or a fingerprint that
 * differs from the served editions the reader loaded. Null means the flip
 * maps exactly as it does without alignment.
 */
export function labCompareAlignment(
  file: LabAlignFile | null | undefined,
  context: {
    bookId: string
    chapterNumber: number
    main: { edition: string; sha256: string }
    compare: { edition: string; sha256: string }
  },
): LabCompareAlignment | null {
  if (!file || file.format !== 'tinct-edition-align' || file.version !== 1) return null
  if (!file.approved || file.bookId !== context.bookId) return null
  const forward = file.source.edition === context.main.edition && file.target.edition === context.compare.edition
  const reversed = file.source.edition === context.compare.edition && file.target.edition === context.main.edition
  if (!forward && !reversed) return null
  const [mainSide, compareSide] = forward ? [file.source, file.target] : [file.target, file.source]
  if (!mainSide.sha256 || mainSide.sha256 !== context.main.sha256 || compareSide.sha256 !== context.compare.sha256) return null
  const chapter = file.chapters?.[String(context.chapterNumber)]
  if (!chapter) return null
  return { reversed, paragraph: index => chapter[String(index)]?.segments ?? null }
}

interface OrientedSegment { kind: 'm' | 'u' | 'main' | 'other'; main: [number, number] | null; other: [number, number] | null }

/** Segments seen from the screen's edition; null unless they tile both live paragraphs exactly. */
function orientedSegments(alignment: LabCompareAlignment, paragraphIndex: number, mainLength: number, otherLength: number): OrientedSegment[] | null {
  const raw = alignment.paragraph(paragraphIndex)
  if (!raw?.length) return null
  const segments: OrientedSegment[] = raw.map(segment => {
    const [kind] = segment
    if (kind === 'm' || kind === 'u') {
      const [, a, b, c, d] = segment as ['m' | 'u', number, number, number, number]
      return alignment.reversed ? { kind, main: [c, d], other: [a, b] } : { kind, main: [a, b], other: [c, d] }
    }
    const [, a, b] = segment
    const onMain = (kind === 's') !== alignment.reversed
    return { kind: onMain ? 'main' : 'other', main: onMain ? [a, b] : null, other: onMain ? null : [a, b] }
  })
  const tiles = (side: 'main' | 'other', length: number) => {
    let at = 0
    for (const segment of segments) {
      const range = segment[side]
      if (!range) continue
      if (range[0] !== at || range[1] < range[0]) return false
      at = range[1]
    }
    return at === length
  }
  return tiles('main', mainLength) && tiles('other', otherLength) ? segments : null
}

/**
 * An endpoint through the alignment (handoff: "How to map an endpoint").
 * Never interpolates inside a segment: a matched sentence the page covers at
 * least half of belongs to the passage, otherwise the passage starts at the
 * next one (start) or stops at the previous one (end). An unresolved block is
 * taken whole; one-sided material on screen has no counterpart and moves the
 * endpoint to its neighbour's. Null hands the endpoint to the fallback.
 */
function alignedEndpoint(
  alignment: LabCompareAlignment,
  sourceParagraphs: string[],
  targetParagraphs: string[],
  point: LabCompareAnchor,
  endpoint: 'start' | 'end',
): LabCompareAnchor | null {
  const paragraphIndex = point.paragraphIndex
  if (paragraphIndex >= sourceParagraphs.length || paragraphIndex >= targetParagraphs.length) return null
  const mainLength = tokenizeHearingWords(sourceParagraphs[paragraphIndex] || '').length
  const otherLength = tokenizeHearingWords(targetParagraphs[paragraphIndex] || '').length
  const segments = orientedSegments(alignment, paragraphIndex, mainLength, otherLength)
  if (!segments) return null
  const word = endpoint === 'start' ? point.wordIndex : point.wordIndex - 1
  const at = segments.findIndex(segment => segment.main && word >= segment.main[0] && word < segment.main[1])
  if (at < 0) return null
  const hit = segments[at]
  const nextOther = () => segments.slice(at + 1).find(segment => segment.other)?.other?.[0] ?? otherLength
  const previousOther = () => segments.slice(0, at).reverse().find(segment => segment.other)?.other?.[1] ?? 0
  let wordIndex: number
  if (!hit.other) wordIndex = endpoint === 'start' ? nextOther() : previousOther()
  else if (hit.kind === 'u') wordIndex = endpoint === 'start' ? hit.other[0] : hit.other[1]
  else {
    const [from, to] = hit.main!
    const covered = endpoint === 'start' ? to - point.wordIndex : point.wordIndex - from
    const whole = covered * 2 >= to - from
    wordIndex = endpoint === 'start'
      ? (whole ? hit.other[0] : nextOther())
      : (whole ? hit.other[1] : previousOther())
  }
  return endpoint === 'end' ? passageEndAt(targetParagraphs, paragraphIndex, wordIndex) : { paragraphIndex, wordIndex: Math.min(wordIndex, Math.max(0, otherLength - 1)) }
}
