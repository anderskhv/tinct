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
