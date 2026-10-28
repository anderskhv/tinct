import type { PrimerQuote } from './model'

interface ReaderSource { bookId: string; editionKey: string; chapterNumber: number }
/** Resolve only a quote that still belongs to the currently displayed edition and section. */
export function primerPassageIndex(request: ReaderSource, current: ReaderSource & { paragraphs: readonly string[] }, quote: PrimerQuote): number | null {
  if (request.bookId !== current.bookId || request.editionKey !== current.editionKey || request.chapterNumber !== current.chapterNumber) return null
  const match = /^chapter-(\d+):paragraph-(\d+)$/.exec(quote.passageId)
  if (!match || Number(match[1]) !== current.chapterNumber) return null
  const index = Number(match[2])
  if (!Number.isSafeInteger(index) || index >= current.paragraphs.length || !quote.text) return null
  const text = current.paragraphs[index].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.includes(quote.text) ? index : null
}

/** Validate a whole-book quote against its exact destination before navigation. */
export async function resolveBookPrimerPassage(
  request: ReaderSource,
  quote: PrimerQuote,
  load: (chapterNumber: number) => Promise<{ paragraphs: readonly string[] } | null>,
  isCurrent: () => boolean,
): Promise<{ chapterNumber: number; paragraphIndex: number; wordIndex: number } | null> {
  const match = /^chapter-(\d+):paragraph-(\d+)$/.exec(quote.passageId)
  if (!match || !isCurrent()) return null
  const chapterNumber = Number(match[1])
  if (!Number.isSafeInteger(chapterNumber) || chapterNumber < 1) return null
  try {
    const chapter = await load(chapterNumber)
    if (!chapter || !isCurrent()) return null
    const destination = { ...request, chapterNumber }
    const paragraphIndex = primerPassageIndex(destination, { ...destination, paragraphs: chapter.paragraphs }, quote)
    return paragraphIndex === null ? null : { chapterNumber, paragraphIndex, wordIndex: 0 }
  } catch { return null }
}
