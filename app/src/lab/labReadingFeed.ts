import { biblicalBookId, parseBiblicalPlaceTitle, resumePlace, type LabBookPlace, type LabChapterRef, type LabPositionState } from './labPosition'
import type { LabChatHistoryState } from './labTalkHistory'

export type LabFeedCardKind = 'now' | 'talk' | 'highlight' | 'peek'

export interface LabFeedHighlight {
  id: string
  text: string
  paragraphIndex: number
}

export interface LabFeedCurrent {
  bookId: string
  headerBook: string
  chapterNumber: number
  sequentialChapter: number
  paragraphIndex: number
  wordIndex?: number
  line?: string
}

export interface LabFeedCard {
  id: string
  kind: LabFeedCardKind
  bookId: string
  headerBook: string
  chapterNumber: number
  sequentialChapter: number
  paragraphIndex: number
  wordIndex: number
  kicker: string
  line?: string
  action?: string
  updatedAt: number
}

function oneLine(text: string, max = 140): string {
  const clean = text.replace(/[\u00b9\u00b2\u00b3\u2070-\u2079]/g, '').replace(/^\d+\s*/, '').replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1).trimEnd() + '…'
}

export function labFeedPassageLine(text: string, max = 140): string {
  return oneLine(text, max)
}

export function labelPlace(headerBook: string, chapterNumber: number, suffix?: string): string {
  const base = `${headerBook} ${chapterNumber}`
  return suffix ? `${base} · ${suffix}` : base
}

function sequentialFor(
  bookId: string,
  chapterNumber: number,
  chapters: LabChapterRef[],
  pin?: LabBookPlace | null,
): number {
  if (pin && pin.bookId === bookId && pin.chapterNumber === chapterNumber) return pin.sequentialChapter
  const hit = chapters.find((item) => {
    const parsed = parseBiblicalPlaceTitle(item.title)
    return biblicalBookId(parsed.book) === bookId && Number(parsed.chapter) === chapterNumber
  })
  return hit?.number ?? pin?.sequentialChapter ?? chapterNumber
}

export function labFeedHighlightCards(
  highlights: LabFeedHighlight[] | undefined,
  current: LabFeedCurrent,
): LabFeedCard[] {
  if (!highlights || highlights.length === 0) return []
  return highlights.map((mark) => ({
    id: `highlight:${mark.id}`,
    kind: 'highlight' as const,
    bookId: current.bookId,
    headerBook: current.headerBook,
    chapterNumber: current.chapterNumber,
    sequentialChapter: current.sequentialChapter,
    paragraphIndex: mark.paragraphIndex,
    wordIndex: 0,
    kicker: labelPlace(current.headerBook, current.chapterNumber, 'highlight'),
    line: oneLine(mark.text),
    updatedAt: 0,
  }))
}

export function buildLabReadingFeed(input: {
  position: LabPositionState
  chat: LabChatHistoryState
  current: LabFeedCurrent
  chapters?: LabChapterRef[]
  highlights?: LabFeedHighlight[]
}): LabFeedCard[] {
  const chapters = input.chapters ?? []
  const settled = resumePlace(input.position)
  const cards: LabFeedCard[] = []

  if (settled) {
    const sameBook = settled.bookId === input.current.bookId
    cards.push({
      id: `now:${settled.bookId}`,
      kind: 'now',
      bookId: settled.bookId,
      headerBook: settled.headerBook,
      chapterNumber: settled.chapterNumber,
      sequentialChapter: settled.sequentialChapter,
      paragraphIndex: settled.paragraphIndex,
      wordIndex: settled.wordIndex,
      kicker: labelPlace(settled.headerBook, settled.chapterNumber, 'now'),
      line: sameBook ? input.current.line : undefined,
      action: 'Continue',
      updatedAt: settled.updatedAt,
    })
  } else {
    cards.push({
      id: `now:${input.current.bookId}`,
      kind: 'now',
      bookId: input.current.bookId,
      headerBook: input.current.headerBook,
      chapterNumber: input.current.chapterNumber,
      sequentialChapter: input.current.sequentialChapter,
      paragraphIndex: input.current.paragraphIndex,
      wordIndex: input.current.wordIndex ?? 0,
      kicker: labelPlace(input.current.headerBook, input.current.chapterNumber, 'now'),
      line: input.current.line,
      action: 'Continue',
      updatedAt: 0,
    })
  }

  const talks = Object.values(input.chat.books)
    .map((book) => {
      const conversation = [...book.conversations].sort((a, b) => b.endTimestamp - a.endTimestamp)[0]
      if (!conversation) return null
      const user = [...conversation.messages].reverse().find(item => item.role === 'user')
      const line = user?.content || conversation.preview
      if (!line) return null
      const chapterNumber = conversation.chapterNumber || book.conversations[0]?.chapterNumber || 1
      const pin = input.position.books[book.bookId]
      return {
        id: `talk:${book.bookId}:${conversation.id}`,
        kind: 'talk' as const,
        bookId: book.bookId,
        headerBook: book.headerBook,
        chapterNumber,
        sequentialChapter: sequentialFor(book.bookId, chapterNumber, chapters, pin),
        paragraphIndex: conversation.paragraphIndex ?? pin?.paragraphIndex ?? 0,
        wordIndex: pin?.wordIndex ?? 0,
        kicker: labelPlace(book.headerBook, chapterNumber, 'asked'),
        line: oneLine(line),
        updatedAt: book.updatedAt,
      } satisfies LabFeedCard
    })
    .filter((item): item is LabFeedCard => item !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt)
  cards.push(...talks)

  cards.push(...labFeedHighlightCards(input.highlights, input.current))

  const peekFromSettled = settled && settled.bookId !== input.current.bookId
  if (peekFromSettled) {
    cards.push({
      id: `peek:${input.current.bookId}`,
      kind: 'peek',
      bookId: input.current.bookId,
      headerBook: input.current.headerBook,
      chapterNumber: input.current.chapterNumber,
      sequentialChapter: input.current.sequentialChapter,
      paragraphIndex: input.current.paragraphIndex,
      wordIndex: input.current.wordIndex ?? 0,
      kicker: labelPlace(input.current.headerBook, input.current.chapterNumber, 'peeked'),
      updatedAt: 0,
    })
  }

  return cards
}
