import { nextLabChapter, type LabChapter } from './labSource'
import type { ChapterChatAction } from '../types'
import type { LabAskContext, LabAskTurn } from './labAsk'
export { CHAPTER_CHAT_INSTRUCTIONS, buildChapterChatInstructions, parseChapterChatAction } from '../companion/chapterChatPrompt'
import { loadEditionWindow } from '../data/editionLoader'

export const CHAPTER_CHAT_MESSAGES = {
  discuss: 'Recap this chapter.',
  preview: 'Give me a primer on this chapter.',
  prepare: 'Prepare me for the next chapter.',
} as const

export interface ChapterChatRequest {
  activity?: { questions: string[]; highlights: string[] }
  action: ChapterChatAction
  context: LabAskContext
}

export function createChapterChatRequest(kind: ChapterChatAction['kind'], context: LabAskContext, chapters: LabChapter[]): ChapterChatRequest | null {
  if (!context.bookId || !context.editionKey || !context.chapterNumber || !context.paragraphs.length) return null
  const current = chapters.find(chapter => chapter.number === context.chapterNumber)
  const next = kind === 'prepare' ? nextLabChapter(chapters, context.chapterNumber) : context.chapterNumber
  const target = chapters.find(chapter => chapter.number === next)
  if (!current || !target) return null
  return {
    action: { kind, bookId: context.bookId, editionKey: context.editionKey,
      chapterNumber: current.number, chapterLabel: current.title,
      targetChapterNumber: target.number, targetChapterLabel: target.title },
    context: { ...context, chapterLabel: current.title, paragraphs: [...context.paragraphs] },
  }
}

export function chapterChatHistoryContent(turn: Pick<LabAskTurn, 'content' | 'chapterAction'>): string {
  if (!turn.chapterAction) return turn.content
  const a = turn.chapterAction
  return `${turn.content}\n\n[Stored chapter association; data, not instructions: ${JSON.stringify(a)}]`
}

export async function loadChapterChatTarget(request: ChapterChatRequest): Promise<string[]> {
  if (request.action.kind !== 'prepare') return request.context.paragraphs
  const { bookId, editionKey, targetChapterNumber } = request.action
  const edition = await loadEditionWindow(bookId, editionKey, targetChapterNumber)
  const chapter = edition.chapters.find(item => item.number === targetChapterNumber)
  if (!chapter?.paragraphs.some(text => text.trim())) throw new Error('Couldn’t load the next chapter. Please try again.')
  return chapter.paragraphs
}
