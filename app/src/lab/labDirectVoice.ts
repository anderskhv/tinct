import { editionNumberingNote } from '../companion/editionNotes'
import { authorshipNote, promptAuthor } from '../companion/authorship'
import { loadEditionWindow } from '../data/editionLoader'
import type { VoiceApplicationToolResult } from '../voice/types'
import type { LabAskContext } from './labAsk'

/** Most chapters one get_book_passage call may return, as typed chat's read_chapter. */
export const VOICE_PASSAGE_MAX_CHAPTERS = 14
/** Characters of chapter text one call returns: a whole typical chapter, or a fair share of each in a range. */
export const VOICE_PASSAGE_CHAR_BUDGET = 24_000

export const BOOK_PASSAGE_TOOL = {
  type: 'function', name: 'get_book_passage',
  description: 'Read text from the current book and edition without moving the reader. Specify a chapter number or an exact chapter title (for example Genesis 2). For a recap or summary of several chapters, pass chapter_number and through_chapter_number together (up to 14 chapters) in one call. Only the reader\'s current and earlier chapters can be read; never request a later chapter. For questions about later parts of the book, answer from your own knowledge instead. Paragraph indices start at zero; a long chapter returns next_from_paragraph to continue. Never quote text you have not retrieved, and never tell the reader what text you have or offer to pull a chapter up: read it and answer.',
  parameters: { type: 'object', properties: {
    chapter_number: { type: 'integer', minimum: 1 },
    through_chapter_number: { type: 'integer', minimum: 1 },
    chapter_title: { type: 'string' },
    from_paragraph: { type: 'integer', minimum: 0 },
  }, additionalProperties: false },
} as const

/** How Talk's reference describes a kept explanation. Descriptive data: Talk's instructions stay in grokConfig.ts. */
export const SHOWN_EXPLANATION_LABEL = 'Brief explanation the reader was shown, written by a quicker model. Unverified: not your earlier answer, and it may need a gentle correction.'

/**
 * Reference material for Talk: the reader's position, the passage around it and
 * the latest conversation (including an Explain quote and its explanation).
 * Data only; the instructions themselves live in grokConfig.ts.
 */
export function buildLabTalkReference(
  context: LabAskContext,
  turns: Array<{ role: string; content: string; highlightedText?: string; cancelled?: boolean; shownExplanation?: boolean }>,
): string {
  const index = Math.max(0, Math.min(context.paragraphIndex, Math.max(0, context.paragraphs.length - 1)))
  const from = Math.max(0, index - 1)
  const excerpt = context.paragraphs.slice(from, index + 2).map((text, i) => ({ paragraphIndex: from + i, text: text.slice(0, 1200) }))
  // A kept quick-model explanation is labelled as what it is, as in typed
  // chat: something the reader was shown, unverified, not the companion's turn.
  const recentConversation = turns
    .filter(turn => !turn.cancelled && turn.content.trim())
    .slice(-4)
    .flatMap((turn, index, list) => {
      if (turn.shownExplanation && turn.role === 'user') return []
      const quote = turn.shownExplanation
        ? (list[index - 1]?.shownExplanation && list[index - 1]?.role === 'user' ? list[index - 1].highlightedText : undefined)
        : turn.highlightedText
      return [{
        role: turn.shownExplanation ? 'shown_explanation' : turn.role,
        ...(turn.shownExplanation ? { about: SHOWN_EXPLANATION_LABEL } : {}),
        ...(quote ? { quote: quote.slice(0, 1200) } : {}),
        content: turn.content.replace(/\s+/g, ' ').trim().slice(0, 1200),
      }]
    })
  const numberingNote = editionNumberingNote(context.bookId, context.editionKey)
  return JSON.stringify({
    book: context.bookTitle,
    author: promptAuthor(context.bookAuthor, context.authorship),
    ...(context.authorship ? { authorship: authorshipNote(context.bookAuthor, context.authorship) } : {}),
    edition: context.editionLabel || context.editionKey,
    chapter: context.chapterLabel,
    chapterNumber: context.chapterNumber,
    ...(context.pageNumber ? { page: `${context.pageNumber}${context.totalPages ? ` of ${context.totalPages}` : ''}` } : {}),
    paragraphIndex: index,
    ...(context.readingAngle ? { readingAngle: context.readingAngle.slice(0, 240) } : {}),
    ...(numberingNote ? { editionNote: numberingNote } : {}),
    excerpt,
    ...(recentConversation.length ? { recentConversation } : {}),
  })
}

const PASSAGE_ANSWER_INSTRUCTIONS = 'Answer the reader using the retrieved text and conversation context. Distinguish quotation from interpretation. If more text is required, retrieve it before answering. Never tell the reader what text you have or lack and never offer to pull up or read a chapter: answer, filling any gap from your knowledge of the book. Do not narrate the retrieval or change reading position.'

/** Whole paragraphs (each at most 5,000 characters) from `from` until the character budget, always at least one. */
function paragraphWindow(paragraphs: string[], from: number, budget: number) {
  const out: Array<{ index: number; text: string; truncated: boolean }> = []
  let used = 0
  for (let i = from; i < paragraphs.length; i++) {
    const text = paragraphs[i].slice(0, 5000)
    if (out.length > 0 && used + text.length > budget) break
    out.push({ index: i, text, truncated: text.length < paragraphs[i].length })
    used += text.length
  }
  const next = from + out.length
  return { paragraphs: out, ...(next < paragraphs.length ? { next_from_paragraph: next } : {}) }
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
  // Grok can fan out one call per later chapter; refuse those before loading anything.
  if (typeof args.chapter_number === 'number' && args.chapter_number > current) return failed('later_chapter_spoiler_boundary')
  if (typeof args.through_chapter_number === 'number' && args.through_chapter_number > current) return failed('later_chapter_spoiler_boundary')
  const edition = await loadEditionWindow(context.bookId, context.editionKey, current)
  const title = typeof args.chapter_title === 'string' ? args.chapter_title.trim().toLowerCase() : ''
  const requested = title ? edition.chapters.find(ch => ch.title.trim().toLowerCase() === title)?.number : (args.chapter_number ?? current)
  if (typeof requested !== 'number' || !Number.isInteger(requested) || requested < 1) return failed('chapter_not_found')
  if (requested > current) return failed('later_chapter_spoiler_boundary')
  const from = args.from_paragraph ?? 0
  if (typeof from !== 'number' || !Number.isInteger(from) || from < 0) return failed('invalid_paragraph')
  const through = args.through_chapter_number
  if (typeof through === 'number' && Number.isInteger(through) && through > requested) {
    // One call for a recap of several chapters, as typed chat's read_chapter range.
    const last = Math.min(through, requested + VOICE_PASSAGE_MAX_CHAPTERS - 1)
    const numbers = Array.from({ length: last - requested + 1 }, (_, i) => requested + i)
    const share = Math.floor(VOICE_PASSAGE_CHAR_BUDGET / numbers.length)
    const loaded = await Promise.all(numbers.map(async number => {
      const data = number === current ? edition : await loadEditionWindow(context.bookId!, context.editionKey!, number).catch(() => null)
      return data?.chapters.find(ch => ch.number === number) ?? null
    }))
    const chapters = loaded.flatMap(chapter => chapter?.paragraphs.length
      ? [{ chapter_number: chapter.number, chapter_title: chapter.title, total_paragraphs: chapter.paragraphs.length, ...paragraphWindow(chapter.paragraphs, 0, share) }]
      : [])
    if (!chapters.length) return failed('passage_not_found')
    return {output:{ok:true,book_id:context.bookId,edition_key:context.editionKey,chapters,...(last < through ? { continue_from_chapter: last + 1 } : {})},responseInstructions:PASSAGE_ANSWER_INSTRUCTIONS}
  }
  const data = requested === current ? edition : await loadEditionWindow(context.bookId, context.editionKey, requested)
  const chapter = data.chapters.find(ch => ch.number === requested)
  if (!chapter?.paragraphs.length || from >= chapter.paragraphs.length) return failed('passage_not_found')
  return {output:{ok:true,book_id:context.bookId,edition_key:context.editionKey,chapter_number:requested,chapter_title:chapter.title,total_paragraphs:chapter.paragraphs.length,...paragraphWindow(chapter.paragraphs, from, VOICE_PASSAGE_CHAR_BUDGET)},responseInstructions:PASSAGE_ANSWER_INSTRUCTIONS}
}
