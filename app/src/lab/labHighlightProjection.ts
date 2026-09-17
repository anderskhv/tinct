import { tokenizeWithEmphasis } from './labEmphasis'
import { isLabVerseMarker, labVerseMarkerDisplay } from './labHearing'
import { buildHighlightRange, type LabHighlight, type LabHighlightRange } from './labHighlights'

/** A verse is the stable passage unit across Bible editions, not a word offset. */
export function projectHighlight(mark: LabHighlight, source: string[], target: string[], alignedParagraphs = false): LabHighlight | null {
  const sourceWords = source.flatMap((paragraph, p) => tokenizeWithEmphasis(paragraph).map((word, w) => ({ text: word.text, p, w })))
  const selected = sourceWords.filter(word => (word.p > mark.paragraphIndex || word.p === mark.paragraphIndex && word.w >= mark.fromWord)
    && (word.p < mark.endParagraphIndex || word.p === mark.endParagraphIndex && word.w < mark.toWord))
  if (!selected.length) return null
  const selectedSet = new Set(selected)
  let verse: string | null = null
  const verses = new Set<string>()
  for (const word of sourceWords) {
    if (isLabVerseMarker(word.text)) verse = labVerseMarkerDisplay(word.text)
    if (selectedSet.has(word) && verse) verses.add(verse)
  }
  const targetWords = target.flatMap((paragraph, p) => tokenizeWithEmphasis(paragraph).map((word, w) => ({ text: word.text, p, w })))
  // Exact wording preserves partial selections where the translation shares it.
  const quote = selected.map(word => word.text).join(' ')
  const joined = targetWords.map(word => word.text).join(' ')
  const offsets = new Map<number, number>()
  let offset = 0
  targetWords.forEach((word, index) => { offsets.set(offset, index); offset += word.text.length + 1 })
  const candidates: typeof targetWords[] = []
  let found = joined.indexOf(quote)
  while (found >= 0 && candidates.length < 2) {
    const start = offsets.get(found)
    const end = found + quote.length
    if (start != null && (end === joined.length || joined[end] === ' ')) candidates.push(targetWords.slice(start, start + selected.length))
    found = joined.indexOf(quote, found + 1)
  }
  let match = candidates.length === 1 ? candidates[0] : null
  if (!match && verses.size) {
    verse = null
    match = targetWords.filter(word => {
      if (isLabVerseMarker(word.text)) verse = labVerseMarkerDisplay(word.text)
      return verse != null && verses.has(verse)
    })
    // Missing verse markers must not silently produce an unrelated partial mark.
    if (![...verses].every(v => match!.some(word => isLabVerseMarker(word.text) && labVerseMarkerDisplay(word.text) === v))) return null
  }
  if (!match?.length && alignedParagraphs && source.length === target.length) {
    // Without word alignment, use the corresponding passage, never guessed word offsets.
    match = targetWords.filter(word => word.p >= mark.paragraphIndex && word.p <= mark.endParagraphIndex)
  }
  if (!match?.length) return null
  const first = match[0], last = match[match.length - 1]
  return { ...mark, paragraphIndex: first.p, fromWord: first.w, endParagraphIndex: last.p, toWord: last.w + 1 }
}
export function highlightPassage(mark: LabHighlight, paragraphs: string[]): LabHighlightRange | null {
  return buildHighlightRange(paragraphs, { paragraphIndex: mark.paragraphIndex, wordIndex: mark.fromWord }, { paragraphIndex: mark.endParagraphIndex, wordIndex: mark.toWord - 1 })
}
