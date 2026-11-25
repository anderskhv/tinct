import { describe, expect, it } from 'vitest'
import {
  LAB_SAVE_PLACE_KEY,
  SAVE_PLACE_EVERY_END_UNTIL,
  chapterEndBoxDue,
  chapterEndKey,
  decideChapterEndBox,
  lastReadingAt,
  localDay,
  markChapterEndBoxSeen,
  markWelcomeBackSeen,
  readSavePlace,
  welcomeBackDue,
  type SavePlaceStorage,
} from './labSavePlace'

function memoryStorage(): SavePlaceStorage & { map: Map<string, string> } {
  const map = new Map<string, string>()
  return { map, getItem: key => map.get(key) ?? null, setItem: (key, value) => { map.set(key, value) } }
}

/** A reader reaching chapter ends 1, 2, 3, … of one book: which of them showed the box (seen at once when shown). */
function walk(ends: number, storage: SavePlaceStorage): number[] {
  const shown: number[] = []
  for (let chapter = 1; chapter <= ends; chapter++) {
    const key = chapterEndKey('odyssey', chapter)
    if (decideChapterEndBox(key, storage) === 'show') { shown.push(chapter); markChapterEndBoxSeen(key, storage) }
  }
  return shown
}

describe('save your place: the chapter-end frequency rule', () => {
  it('shows at every chapter end until it has been seen ten times, then at every fifth', () => {
    const storage = memoryStorage()
    expect(walk(30, storage)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30])
    expect(readSavePlace(storage).shown).toBe(14)
  })

  it('is a pure rule on the counts', () => {
    expect(chapterEndBoxDue({ shown: 0, skipped: 0 })).toBe(true)
    expect(chapterEndBoxDue({ shown: SAVE_PLACE_EVERY_END_UNTIL - 1, skipped: 0 })).toBe(true)
    expect(chapterEndBoxDue({ shown: SAVE_PLACE_EVERY_END_UNTIL, skipped: 0 })).toBe(false)
    expect(chapterEndBoxDue({ shown: SAVE_PLACE_EVERY_END_UNTIL, skipped: 3 })).toBe(false)
    expect(chapterEndBoxDue({ shown: SAVE_PLACE_EVERY_END_UNTIL, skipped: 4 })).toBe(true)
  })

  it('counts a chapter end passed over once, however often the reader comes back to it', () => {
    const storage = memoryStorage()
    walk(10, storage)
    const key = chapterEndKey('odyssey', 11)
    expect(decideChapterEndBox(key, storage)).toBe('none')
    expect(decideChapterEndBox(key, storage)).toBe('none')
    expect(readSavePlace(storage).skipped).toBe(1)
  })

  it('a box shown but not yet seen shows again; never counted until seen', () => {
    const storage = memoryStorage()
    const key = chapterEndKey('odyssey', 1)
    expect(decideChapterEndBox(key, storage)).toBe('show')
    expect(decideChapterEndBox(key, storage)).toBe('show')
    expect(readSavePlace(storage).shown).toBe(0)
  })
})

describe('save your place: seen, then gone for good', () => {
  it('never shows again at a chapter end where it was seen, on scroll back or reload', () => {
    const storage = memoryStorage()
    const key = chapterEndKey('frankenstein', 1)
    expect(decideChapterEndBox(key, storage)).toBe('show')
    markChapterEndBoxSeen(key, storage)
    markChapterEndBoxSeen(key, storage)
    expect(readSavePlace(storage)).toMatchObject({ shown: 1, ends: [key] })
    expect(decideChapterEndBox(key, storage)).toBe('none')
    // Another book's chapter end of the same number is its own.
    expect(decideChapterEndBox(chapterEndKey('odyssey', 1), storage)).toBe('show')
  })

  it('keeps everything under one tinct: key, so sign-out wipes it', () => {
    const storage = memoryStorage()
    markChapterEndBoxSeen(chapterEndKey('bible', 3), storage)
    markWelcomeBackSeen(Date.UTC(2026, 10, 25, 12), storage)
    expect(LAB_SAVE_PLACE_KEY.startsWith('tinct:')).toBe(true)
    expect([...storage.map.keys()]).toEqual([LAB_SAVE_PLACE_KEY])
  })

  it('survives a storage that throws or holds rubbish', () => {
    const broken: SavePlaceStorage = { getItem: () => { throw new Error('private mode') }, setItem: () => { throw new Error('private mode') } }
    expect(decideChapterEndBox('bible:1', broken)).toBe('show')
    expect(() => markChapterEndBoxSeen('bible:1', broken)).not.toThrow()
    expect(() => markWelcomeBackSeen(Date.now(), broken)).not.toThrow()
    const rubbish = memoryStorage()
    rubbish.setItem(LAB_SAVE_PLACE_KEY, '{nope')
    expect(readSavePlace(rubbish)).toEqual({ shown: 0, skipped: 0, ends: [], returnDay: null })
  })
})

describe('save your place: welcome back once a day', () => {
  const at = (day: number, hour: number) => new Date(2026, 10, day, hour, 0, 0).getTime()

  it('shows on a later calendar day than the previous reading on this device', () => {
    expect(welcomeBackDue({ signedIn: false, previousReadingAt: at(24, 23), now: at(25, 0), returnDay: null })).toBe(true)
    expect(welcomeBackDue({ signedIn: false, previousReadingAt: at(20, 9), now: at(25, 9), returnDay: null })).toBe(true)
  })

  it('not on the same day, not on a first visit, never signed in', () => {
    expect(welcomeBackDue({ signedIn: false, previousReadingAt: at(25, 1), now: at(25, 23), returnDay: null })).toBe(false)
    expect(welcomeBackDue({ signedIn: false, previousReadingAt: null, now: at(25, 9), returnDay: null })).toBe(false)
    expect(welcomeBackDue({ signedIn: true, previousReadingAt: at(20, 9), now: at(25, 9), returnDay: null })).toBe(false)
  })

  it('at most once per calendar day: seen today, not again today; tomorrow again', () => {
    const storage = memoryStorage()
    markWelcomeBackSeen(at(25, 10), storage)
    const { returnDay } = readSavePlace(storage)
    expect(returnDay).toBe(localDay(at(25, 10)))
    expect(welcomeBackDue({ signedIn: false, previousReadingAt: at(20, 9), now: at(25, 18), returnDay })).toBe(false)
    expect(welcomeBackDue({ signedIn: false, previousReadingAt: at(20, 9), now: at(26, 8), returnDay })).toBe(true)
  })

  it('reads the latest reading session on the device from reading memory', () => {
    expect(lastReadingAt(null)).toBeNull()
    expect(lastReadingAt({ sessions: {} })).toBeNull()
    const session = (startedAt: number, lastActiveAt: number) => ({ startedAt, lastActiveAt }) as never
    expect(lastReadingAt({ sessions: { a: session(at(20, 9), at(20, 10)), b: session(at(22, 9), at(22, 11)) } })).toBe(at(22, 11))
  })
})
