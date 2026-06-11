import { describe, expect, it } from 'vitest'
import type { Book, BookReadingLog, ChatMessage, EditionData } from '../types'
import { initialReaderSession, isValidLocation, readerSessionReducer } from './reducer'
import { applyReadingEvent, bindChatMessageToLocation, canPersistLocation, inheritAssistantLocation, positionFromLocation } from './writer'
import type { ReaderBookContext, ReaderLocation } from './types'

const book: Book = {
  id: 'the-awakening',
  title: 'The Awakening',
  author: 'Kate Chopin',
  editions: [
    { key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: true },
    { key: 'modern-da', language: 'da', style: 'modern', label: 'Modern Danish', aligned: true },
  ],
}

const bible: Book = {
  id: 'bible',
  title: 'Bible',
  author: 'Various',
  editions: [
    { key: 'kjv-en', language: 'en', style: 'kjv', label: 'KJV', aligned: true },
  ],
}

function editionData(chapters: number, paragraphs = 3): EditionData {
  return {
    chapters: Array.from({ length: chapters }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
      paragraphs: Array.from({ length: paragraphs }, (_p, j) => `p${j}`),
    })),
  }
}

const awakeningContext: ReaderBookContext = { book, editionData: editionData(39, 4) }
const bibleContext: ReaderBookContext = { book: bible, editionData: editionData(1189, 2) }

function location(patch: Partial<ReaderLocation> = {}): ReaderLocation {
  return {
    bookId: 'the-awakening',
    chapterNumber: 30,
    paragraphIndex: 1,
    scrollFraction: 0.25,
    editionKey: 'original-en',
    activeView: 'read',
    source: 'init',
    revision: 0,
    ...patch,
  }
}

describe('readerSessionReducer', () => {
  it('enters switching-book and refuses writes until edition data validates a new location', () => {
    const state = initialReaderSession(location({ chapterNumber: 39 }))
    const switching = readerSessionReducer(state, { type: 'OPEN_BOOK', bookId: 'bible', now: 100 })

    expect(switching.status).toBe('switching-book')
    expect(canPersistLocation(switching.location, awakeningContext, switching.status)).toMatchObject({
      canWrite: false,
      reason: 'switching-book',
    })

    const ready = readerSessionReducer(switching, {
      type: 'EDITION_READY',
      context: bibleContext,
      restored: { chapterNumber: 483, editionKey: 'kjv-en', scrollFraction: 0.2, activeView: 'read' },
      now: 110,
    })

    expect(ready.status).toBe('ready')
    expect(ready.location).toMatchObject({ bookId: 'bible', chapterNumber: 483, editionKey: 'kjv-en' })
    expect(canPersistLocation(ready.location, bibleContext, ready.status).canWrite).toBe(true)
  })

  it('rejects cross-book restored locations instead of pairing old chapter with new book', () => {
    const state = initialReaderSession(location())
    const restored = readerSessionReducer(state, {
      type: 'RESTORE_POSITION',
      location: location({ bookId: 'bible', chapterNumber: 483, editionKey: 'kjv-en' }),
      context: awakeningContext,
      source: 'cloud-restore',
      now: 100,
    })

    expect(restored).toBe(state)
  })

  it('audio paragraph changes are first-class location updates', () => {
    const state = initialReaderSession(location({ chapterNumber: 5, paragraphIndex: 0, scrollFraction: 0 }))
    const next = readerSessionReducer(state, {
      type: 'AUDIO_PARAGRAPH_CHANGED',
      chapterNumber: 5,
      paragraphIndex: 2,
      context: awakeningContext,
      now: 100,
    })

    expect(next.location).toMatchObject({
      chapterNumber: 5,
      paragraphIndex: 2,
      scrollFraction: 2 / 3,
      source: 'audio',
    })
  })

  it('audio chapter completion opens the next chapter at the start', () => {
    const state = initialReaderSession(location({ chapterNumber: 5, paragraphIndex: 3, scrollFraction: 1 }))
    const next = readerSessionReducer(state, {
      type: 'AUDIO_CHAPTER_COMPLETED',
      context: awakeningContext,
      now: 100,
    })

    expect(next.location).toMatchObject({
      chapterNumber: 6,
      paragraphIndex: undefined,
      scrollFraction: 0,
      source: 'audio',
    })
  })

  it('hidden non-reader views cannot commit layout position', () => {
    const state = initialReaderSession(location({ activeView: 'chat' }))
    const next = readerSessionReducer(state, {
      type: 'READER_LAYOUT_READY',
      page: 4,
      totalPages: 10,
      firstVisibleParagraph: 3,
      view: 'chat',
      context: awakeningContext,
      now: 100,
    })

    expect(next).toBe(state)
  })
})

describe('readerSession writer', () => {
  it('does not synthesize prior Bible chapters as completed from a deep position', () => {
    const loc = location({ bookId: 'bible', chapterNumber: 483, paragraphIndex: 1, editionKey: 'kjv-en' })
    const log = applyReadingEvent({
      log: null,
      location: loc,
      context: bibleContext,
      mode: 'read',
      event: 'chapter-opened',
      now: 100,
    })

    expect(Object.keys(log?.chapters ?? {})).toEqual(['483'])
    expect(log?.chapters[482]).toBeUndefined()
    expect(log?.chapters[483]).toMatchObject({ completed: false, readCount: 1 })
  })

  it('only marks the current chapter completed on a completion event', () => {
    const loc = location({ bookId: 'bible', chapterNumber: 483, paragraphIndex: 1, editionKey: 'kjv-en' })
    const log = applyReadingEvent({
      log: null,
      location: loc,
      context: bibleContext,
      mode: 'listened',
      event: 'chapter-completed',
      now: 100,
    })

    expect(Object.keys(log?.chapters ?? {})).toEqual(['483'])
    expect(log?.chapters[483].completed).toBe(true)
  })

  it('binds user chat messages to the current location and rejects cross-book messages', () => {
    const msg: ChatMessage = { id: 'm1', role: 'user', content: 'summarize', timestamp: 100 }
    expect(bindChatMessageToLocation(msg, location(), awakeningContext)).toMatchObject({
      bookId: 'the-awakening',
      chapterNumber: 30,
      paragraphIndex: 1,
    })

    const bibleMsg: ChatMessage = { ...msg, id: 'm2', bookId: 'bible' }
    expect(bindChatMessageToLocation(bibleMsg, location(), awakeningContext)).toBeNull()
  })

  it('assistant replies inherit the user message location snapshot', () => {
    const user = bindChatMessageToLocation(
      { id: 'u1', role: 'user', content: 'what is this about?', timestamp: 100 },
      location({ chapterNumber: 30, paragraphIndex: 2 }),
      awakeningContext,
    )
    expect(user).not.toBeNull()

    const assistant = inheritAssistantLocation(user!, {
      id: 'a1',
      role: 'assistant',
      content: 'Chapter 30 is about...',
      timestamp: 120,
    })

    expect(assistant).toMatchObject({
      bookId: 'the-awakening',
      chapterNumber: 30,
      paragraphIndex: 2,
    })
  })

  it('validates position before converting it to a storage row', () => {
    const loc = location({ chapterNumber: 293 })
    expect(isValidLocation(loc, awakeningContext)).toBe(false)
    expect(canPersistLocation(loc, awakeningContext, 'ready')).toMatchObject({
      canWrite: false,
      reason: 'invalid-location',
    })
    expect(positionFromLocation(location({ chapterNumber: 30 }), 100)).toMatchObject({
      bookId: 'the-awakening',
      chapterNumber: 30,
      scrollFraction: 0.25,
      updatedAt: 100,
    })
  })

  it('preserves layout page fields while keeping location as canonical content position', () => {
    expect(positionFromLocation(location({ chapterNumber: 30, scrollFraction: 0.5 }), 100, { currentPage: 7, totalPages: 15 })).toMatchObject({
      bookId: 'the-awakening',
      chapterNumber: 30,
      currentPage: 7,
      totalPages: 15,
      scrollFraction: 0.5,
    })
  })
})
