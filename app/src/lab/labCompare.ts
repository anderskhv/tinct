import { chapterPageSegments, isLabVerseMarker, labVerseMarkerDisplay, sentenceStartWordIndex, tokenizeHearingWords, type ChapterHearingPage, type ChapterPageSegment } from './labHearing'

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
): LabCompareAnchor {
  if (targetParagraphs.length === 0) return { paragraphIndex: 0, wordIndex: 0 }
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
  const verse = labVerseAtOrBefore(sourceWords, Math.max(0, Math.min(anchor.wordIndex, sourceWords.length - 1)))
  if (verse !== null) {
    const target = labVerseWordIndex(targetWords, verse)
    if (target !== null) return { paragraphIndex, wordIndex: target }
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
