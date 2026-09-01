import { sentenceStartWordIndex, tokenizeHearingWords } from './labHearing'

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
