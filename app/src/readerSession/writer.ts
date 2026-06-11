import type { BookReadingLog, ChatMessage, ReadingPosition } from '../types'
import { isValidLocation } from './reducer'
import type { ChatMessageWithLocation, ReaderBookContext, ReaderLocation, ReaderPersistenceSnapshot } from './types'

export function positionFromLocation(
  location: ReaderLocation,
  now: number,
  layout?: { currentPage: number; totalPages: number },
): ReadingPosition {
  const totalPages = layout && layout.totalPages > 1 ? layout.totalPages : 1
  const currentPage = totalPages > 1
    ? Math.min(Math.max(0, layout?.currentPage ?? 0), totalPages - 1)
    : 0
  return {
    bookId: location.bookId,
    chapterNumber: location.chapterNumber,
    currentPage,
    totalPages,
    scrollFraction: location.scrollFraction,
    updatedAt: now,
    lastParagraphIndex: location.paragraphIndex,
  }
}

export function canPersistLocation(location: ReaderLocation, context: ReaderBookContext, status: 'ready' | 'switching-book' | 'loading-edition'): ReaderPersistenceSnapshot {
  if (status !== 'ready') {
    return { location, canWrite: false, reason: status }
  }
  if (!isValidLocation(location, context)) {
    return { location, canWrite: false, reason: 'invalid-location' }
  }
  return { location, canWrite: true }
}

export function applyReadingEvent(args: {
  log: BookReadingLog | null
  location: ReaderLocation
  context: ReaderBookContext
  mode: 'read' | 'listened'
  event: 'chapter-opened' | 'paragraph-seen' | 'chapter-completed'
  now: number
}): BookReadingLog | null {
  const { log, location, context, mode, event, now } = args
  if (!isValidLocation(location, context)) return log
  const existingLog: BookReadingLog = log?.bookId === location.bookId
    ? log
    : { bookId: location.bookId, chapters: {}, updatedAt: 0 }
  const existing = existingLog.chapters[location.chapterNumber]
  const record = existing ?? {
    chapterNumber: location.chapterNumber,
    editions: [location.editionKey],
    editionUsage: [],
    readCount: 0,
    firstReadAt: now,
    lastReadAt: now,
    completed: false,
  }
  const editionUsage = [...(record.editionUsage ?? [])]
  const usageIndex = editionUsage.findIndex(entry => entry.key === location.editionKey && entry.mode === mode)
  const paragraphCount = context.editionData?.chapters.find(ch => ch.number === location.chapterNumber)?.paragraphs.length ?? 0
  const percent = paragraphCount > 0 && location.paragraphIndex !== undefined
    ? Math.round(((location.paragraphIndex + 1) / paragraphCount) * 100)
    : undefined
  if (usageIndex >= 0) {
    editionUsage[usageIndex] = {
      ...editionUsage[usageIndex],
      percent: Math.max(editionUsage[usageIndex].percent ?? 0, percent ?? 0) || editionUsage[usageIndex].percent,
    }
  } else {
    editionUsage.push({ key: location.editionKey, mode, percent })
  }

  const opened = event === 'chapter-opened'
  const nextRecord = {
    ...record,
    editions: record.editions.includes(location.editionKey)
      ? record.editions
      : [...record.editions, location.editionKey],
    editionUsage,
    readCount: opened ? record.readCount + 1 : record.readCount,
    firstReadAt: record.firstReadAt || now,
    lastReadAt: now,
    completed: record.completed || event === 'chapter-completed',
    lastParagraphIndex: location.paragraphIndex ?? record.lastParagraphIndex,
    totalParagraphs: paragraphCount || record.totalParagraphs,
  }

  return {
    ...existingLog,
    updatedAt: now,
    chapters: {
      ...existingLog.chapters,
      [location.chapterNumber]: nextRecord,
    },
  }
}

export function bindChatMessageToLocation(message: ChatMessage, location: ReaderLocation, context: ReaderBookContext): ChatMessageWithLocation | null {
  if (!isValidLocation(location, context)) return null
  if (message.bookId && message.bookId !== location.bookId) return null
  if (message.chapterNumber !== undefined && message.chapterNumber !== location.chapterNumber) return null
  return {
    ...message,
    bookId: location.bookId,
    chapterNumber: location.chapterNumber,
    paragraphIndex: message.paragraphIndex ?? location.paragraphIndex,
  }
}

export function inheritAssistantLocation(userMessage: ChatMessageWithLocation, assistantMessage: ChatMessage): ChatMessageWithLocation | null {
  if (assistantMessage.bookId && assistantMessage.bookId !== userMessage.bookId) return null
  if (assistantMessage.chapterNumber !== undefined && assistantMessage.chapterNumber !== userMessage.chapterNumber) return null
  return {
    ...assistantMessage,
    bookId: userMessage.bookId,
    chapterNumber: userMessage.chapterNumber,
    paragraphIndex: userMessage.paragraphIndex,
  }
}
