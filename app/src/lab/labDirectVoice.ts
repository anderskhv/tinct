import { loadEditionWindow } from '../data/editionLoader'
import type { VoiceApplicationToolResult } from '../voice/types'
import type { LabAskContext } from './labAsk'

export const BOOK_PASSAGE_TOOL = {
  type: 'function', name: 'get_book_passage',
  description: 'Read exact text from the current book and edition without moving the reader. Specify a chapter number or an exact chapter title (for example Genesis 2). Only current and earlier chapters are available. Paragraph indices start at zero. Fetch another window if needed; never invent unseen text.',
  parameters: { type: 'object', properties: {
    chapter_number: { type: 'integer', minimum: 1 },
    chapter_title: { type: 'string' },
    from_paragraph: { type: 'integer', minimum: 0 },
  }, additionalProperties: false },
} as const

/**
 * Reference material for Talk: the reader's position, the passage around it and
 * the latest conversation (including an Explain quote and its explanation).
 * Data only; the instructions themselves live in grokConfig.ts.
 */
export function buildLabTalkReference(
  context: LabAskContext,
  turns: Array<{ role: string; content: string; highlightedText?: string; cancelled?: boolean }>,
): string {
  const index = Math.max(0, Math.min(context.paragraphIndex, Math.max(0, context.paragraphs.length - 1)))
  const from = Math.max(0, index - 1)
  const excerpt = context.paragraphs.slice(from, index + 2).map((text, i) => ({ paragraphIndex: from + i, text: text.slice(0, 1200) }))
  const recentConversation = turns
    .filter(turn => !turn.cancelled && turn.content.trim())
    .slice(-4)
    .map(turn => ({
      role: turn.role,
      ...(turn.highlightedText ? { quote: turn.highlightedText.slice(0, 1200) } : {}),
      content: turn.content.replace(/\s+/g, ' ').trim().slice(0, 1200),
    }))
  return JSON.stringify({
    book: context.bookTitle,
    author: context.bookAuthor,
    edition: context.editionLabel || context.editionKey,
    chapter: context.chapterLabel,
    chapterNumber: context.chapterNumber,
    ...(context.pageNumber ? { page: `${context.pageNumber}${context.totalPages ? ` of ${context.totalPages}` : ''}` } : {}),
    paragraphIndex: index,
    ...(context.readingAngle ? { readingAngle: context.readingAngle.slice(0, 240) } : {}),
    excerpt,
    ...(recentConversation.length ? { recentConversation } : {}),
  })
}

export async function retrieveVoicePassage(context: LabAskContext, args: Record<string, unknown>): Promise<VoiceApplicationToolResult> {
  // Exact text is a grounding aid, not a precondition for answering: a failed
  // lookup must never become the spoken reply.
  const failed = (reason: string): VoiceApplicationToolResult => ({output: {ok:false, reason},responseInstructions:
    `${reason === 'later_chapter_spoiler_boundary'
      ? 'The reader has not reached that chapter, so its exact text is not available. If the reader asked about what comes later, that is a requested spoiler: answer it. Otherwise avoid spoiling it.'
      : 'The exact text is not available.'} Answer the reader\'s actual question from your knowledge of the book, without quoting or inventing wording. Never mention the lookup, a passage, retrieval or a failure. Do not move the reader.`})
  if (!context.bookId || !context.editionKey) return failed('book_unavailable')
  const current = context.chapterNumber || 1
  const edition = await loadEditionWindow(context.bookId, context.editionKey, current)
  const title = typeof args.chapter_title === 'string' ? args.chapter_title.trim().toLowerCase() : ''
  const requested = title ? edition.chapters.find(ch => ch.title.trim().toLowerCase() === title)?.number : (args.chapter_number ?? current)
  if (typeof requested !== 'number' || !Number.isInteger(requested) || requested < 1) return failed('chapter_not_found')
  if (requested > current) return failed('later_chapter_spoiler_boundary')
  const from = args.from_paragraph ?? 0
  if (typeof from !== 'number' || !Number.isInteger(from) || from < 0) return failed('invalid_paragraph')
  const data = requested === current ? edition : await loadEditionWindow(context.bookId, context.editionKey, requested)
  const chapter = data.chapters.find(ch => ch.number === requested)
  if (!chapter?.paragraphs.length || from >= chapter.paragraphs.length) return failed('passage_not_found')
  const paragraphs = chapter.paragraphs.slice(from, from + 6).map((text, i) => ({index:from+i,text:text.slice(0,5000),truncated:text.length>5000}))
  return {output:{ok:true,book_id:context.bookId,edition_key:context.editionKey,chapter_number:requested,chapter_title:chapter.title,total_paragraphs:chapter.paragraphs.length,paragraphs},responseInstructions:'Answer the reader using the retrieved text and conversation context. Distinguish quotation from interpretation. If more text is required, retrieve another window. Do not narrate the retrieval or change reading position.'}
}
