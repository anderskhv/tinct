import { describe, expect, it } from 'vitest'
import { getBook } from '../../data/bookRegistry'
import { DEFAULT_LAB_PREFS } from '../labPrefs'
import { emptyLabPositionState, type LabBookPlace } from '../labPosition'
import { heardPlace, marginListenSnapshot, marginNarrationPlan, withAudioPlace } from './marginListenModel'

const frankenstein = getBook('frankenstein')!
const grok = { enabled: true, provider: 'grok', voices: [{ key: 'f', label: 'Ara', persona: 'female' as const }, { key: 'm', label: 'Helios', persona: 'male' as const }] }

describe('marginNarrationPlan: what the book reader would play for the edition shown', () => {
  it('an English edition with the narration on plays that edition on demand, in the reader’s voice', () => {
    const plan = marginNarrationPlan({ bookId: 'frankenstein', editions: frankenstein.editions, editionKey: 'modern-en', chapterNumber: 3, prefs: { ...DEFAULT_LAB_PREFS, voicePersona: 'male' }, info: grok, signedIn: false })
    expect(plan).toEqual({ voice: 'm', narration: true, audioEdition: 'modern-en', unavailable: false })
  })
  it('the edition shown decides, not the reader’s main edition', () => {
    const plan = marginNarrationPlan({ bookId: 'frankenstein', editions: frankenstein.editions, editionKey: 'original-en', chapterNumber: 1, prefs: { ...DEFAULT_LAB_PREFS, primaryEdition: 'modern-en' }, info: grok, signedIn: true })
    expect(plan.audioEdition).toBe('original-en')
    expect(plan.narration).toBe(true)
  })
  it('narration switched off on the server: an English edition cannot be heard (no fallback to old recordings)', () => {
    const plan = marginNarrationPlan({ bookId: 'frankenstein', editions: frankenstein.editions, editionKey: 'modern-en', chapterNumber: 1, prefs: DEFAULT_LAB_PREFS, info: { enabled: false, provider: 'grok', voices: [] }, signedIn: false })
    expect(plan).toMatchObject({ narration: false, voice: null, unavailable: true })
  })
})

describe('withAudioPlace: the audio place is the book reader’s place on this device', () => {
  const known: LabBookPlace = { bookId: 'frankenstein', headerBook: 'frankenstein', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 4, wordIndex: 1, pageIndex: 7, primaryEditionKey: 'modern-en', compareEditionKey: 'original-en', readerMode: 'read', contentRevision: 'a'.repeat(64), updatedAt: 1000, deviceId: 'd', rev: 3 }
  const base = { ...emptyLabPositionState('d'), books: { frankenstein: known, odyssey: { ...known, bookId: 'odyssey', headerBook: 'odyssey' } }, lastSettledBookId: 'odyssey', lastSettledAt: 900 }

  it('moves this book’s place to the word heard, newer, and settles on it; other books are untouched', () => {
    const next = withAudioPlace(base, { bookId: 'frankenstein', editionKey: 'modern-en', at: { chapterNumber: 5, paragraphIndex: 12, wordIndex: 3 }, now: 5000, deviceId: 'd' })
    expect(next.books.frankenstein).toMatchObject({ chapterNumber: 5, sequentialChapter: 5, paragraphIndex: 12, wordIndex: 3, primaryEditionKey: 'modern-en', compareEditionKey: 'original-en', contentRevision: 'a'.repeat(64), updatedAt: 5000, rev: 4 })
    // The book reader's page index belongs to its own layout: dropped, so it pages to the place itself.
    expect(next.books.frankenstein.pageIndex).toBeUndefined()
    expect(next.books.odyssey).toBe(base.books.odyssey)
    expect(next.lastSettledBookId).toBe('frankenstein')
    expect(next.lastSettledAt).toBe(5000)
  })
  it('heard in another edition: that edition, without the old edition’s revision', () => {
    const next = withAudioPlace(base, { bookId: 'frankenstein', editionKey: 'original-en', at: { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 }, now: 5000, deviceId: 'd' })
    expect(next.books.frankenstein.primaryEditionKey).toBe('original-en')
    expect(next.books.frankenstein.contentRevision).toBeUndefined()
  })
  it('a first place for the book, and always newer than the one it replaces (a clock behind)', () => {
    const fresh = withAudioPlace(emptyLabPositionState('d'), { bookId: 'dracula', editionKey: 'modern-en', at: { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0 }, now: 10, deviceId: 'd' })
    expect(fresh.books.dracula).toMatchObject({ bookId: 'dracula', headerBook: 'dracula', readerMode: 'read', rev: 1 })
    const behind = withAudioPlace(base, { bookId: 'frankenstein', editionKey: 'modern-en', at: { chapterNumber: 2, paragraphIndex: 5, wordIndex: 0 }, now: 10, deviceId: 'd' })
    expect(behind.books.frankenstein.updatedAt).toBeGreaterThan(known.updatedAt)
  })
})

describe('heardPlace and the snapshot the frame draws', () => {
  it('a word, a paragraph, or nothing yet', () => {
    expect(heardPlace(3, { kind: 'word', paragraphIndex: 4, wordIndex: 9 })).toEqual({ chapterNumber: 3, paragraphIndex: 4, wordIndex: 9 })
    expect(heardPlace(3, { kind: 'paragraph', paragraphIndex: 4 })).toEqual({ chapterNumber: 3, paragraphIndex: 4, wordIndex: 0 })
    expect(heardPlace(3, { kind: 'none' })).toBeNull()
    expect(heardPlace(null, { kind: 'word', paragraphIndex: 4, wordIndex: 9 })).toBeNull()
  })
  const input = { available: true, playing: false, pending: false, buffering: false, hasSource: false, speed: 1.25, chapterNumber: 2, chapterTitle: 'Chapter 2', follow: { kind: 'none' as const }, chapterTime: 0, chapterDuration: 0, narration: { status: 'idle' as const }, starting: false, dismissed: false }
  it('idle: no transport; starting: loading with the transport up; playing; paused keeps it up until closed', () => {
    expect(marginListenSnapshot(input)).toMatchObject({ status: 'idle', open: false })
    expect(marginListenSnapshot({ ...input, starting: true })).toMatchObject({ status: 'loading', pending: true, open: true })
    expect(marginListenSnapshot({ ...input, playing: true, hasSource: true, follow: { kind: 'word', paragraphIndex: 1, wordIndex: 2 } })).toMatchObject({ status: 'playing', open: true, follow: { paragraphIndex: 1, wordIndex: 2 } })
    expect(marginListenSnapshot({ ...input, hasSource: true })).toMatchObject({ status: 'paused', open: true })
    expect(marginListenSnapshot({ ...input, hasSource: true, dismissed: true })).toMatchObject({ status: 'paused', open: false })
  })
  it('a sentence-level follow names its words; an error carries its message', () => {
    const s = marginListenSnapshot({ ...input, playing: true, follow: { kind: 'word', paragraphIndex: 1, wordIndex: 5, granularity: 'sentence', span: { from: 3, to: 9, start: 0, end: 1 } } })
    expect(s.follow).toEqual({ paragraphIndex: 1, wordIndex: 5, from: 3, to: 9 })
    expect(marginListenSnapshot({ ...input, narration: { status: 'error', message: 'Audio could not start. Try again.' } })).toMatchObject({ status: 'error', message: 'Audio could not start. Try again.', open: true })
  })
})
