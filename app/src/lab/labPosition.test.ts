import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  biblicalBookId,
  chapterExistsOnClient,
  createLabPositionController,
  emptyLabPositionState,
  mergeLabPositionStates,
  mergeLabPositionStatesByTime,
  parseBiblicalPlaceTitle,
  parseLabPositionState,
  placeFromChapterRef,
  resumePlace,
  shouldApplyCloudBookPlace,
  type LabBookPlace,
  type LabChapterRef,
  type LabPositionState,
} from './labPosition'

const DEVICE = 'device-a'

const CHAPTERS: LabChapterRef[] = [
  { number: 1, title: 'Genesis 1' },
  { number: 3, title: 'Genesis 3' },
  { number: 50, title: 'Genesis 50' },
  { number: 1047, title: 'Romans 1' },
  { number: 1054, title: 'Romans 8' },
  { number: 1147, title: 'James 1' },
]

function place(partial: Partial<LabBookPlace> & Pick<LabBookPlace, 'bookId' | 'headerBook'>): LabBookPlace {
  return {
    chapterNumber: 1,
    sequentialChapter: 1,
    paragraphIndex: 0,
    wordIndex: 0,
    updatedAt: 1_000,
    deviceId: DEVICE,
    rev: 1,
    ...partial,
  }
}

function romans(over: Partial<LabBookPlace> = {}): LabBookPlace {
  return place({
    bookId: 'romans',
    headerBook: 'Romans',
    chapterNumber: 8,
    sequentialChapter: 1054,
    paragraphIndex: 2,
    wordIndex: 4,
    updatedAt: 5_000,
    rev: 5,
    ...over,
  })
}

function genesis(over: Partial<LabBookPlace> = {}): LabBookPlace {
  return place({
    bookId: 'genesis',
    headerBook: 'Genesis',
    chapterNumber: 1,
    sequentialChapter: 1,
    paragraphIndex: 0,
    wordIndex: 0,
    ...over,
  })
}

function james(over: Partial<LabBookPlace> = {}): LabBookPlace {
  return place({
    bookId: 'james',
    headerBook: 'James',
    chapterNumber: 1,
    sequentialChapter: 1147,
    paragraphIndex: 0,
    wordIndex: 0,
    ...over,
  })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('biblical book identity', () => {
  it('keys by biblical book, never bible', () => {
    expect(biblicalBookId('Genesis')).toBe('genesis')
    expect(biblicalBookId('Romans')).toBe('romans')
    expect(biblicalBookId('James')).toBe('james')
    expect(biblicalBookId('Song of Solomon')).toBe('song-of-solomon')
    expect(biblicalBookId('2 Samuel')).toBe('2-samuel')
    expect(parseBiblicalPlaceTitle('James 1')).toEqual({ book: 'James', chapter: '1' })
    const fromList = placeFromChapterRef({
      chapters: CHAPTERS,
      sequentialChapter: 1147,
      paragraphIndex: 3,
      wordIndex: 9,
      deviceId: DEVICE,
      now: 10,
      rev: 2,
    })
    expect(fromList.bookId).toBe('james')
    expect(fromList.chapterNumber).toBe(1)
    expect(fromList.sequentialChapter).toBe(1147)
  })

  it('keeps a catalogue book and chapter as one coherent non-Bible tuple', () => {
    const place = placeFromChapterRef({
      chapters: [{ number: 1, title: 'Book 1' }, { number: 2, title: 'Book 2' }],
      sequentialChapter: 2,
      paragraphIndex: 4,
      wordIndex: 7,
      deviceId: DEVICE,
      now: 10,
      rev: 2,
      bookId: 'odyssey',
      headerBook: 'The Odyssey',
    })
    expect(place).toMatchObject({
      bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 2,
      sequentialChapter: 2, paragraphIndex: 4, wordIndex: 7,
    })
    expect(chapterExistsOnClient(place, [{ number: 1, title: 'Book 1' }, { number: 2, title: 'Book 2' }])).toBe(true)
    expect(chapterExistsOnClient({ ...place, sequentialChapter: 3, chapterNumber: 3 }, [{ number: 1, title: 'Book 1' }, { number: 2, title: 'Book 2' }])).toBe(false)
  })
})

describe('same-book cloud apply', () => {
  it('ignores cloud for a different bookId', () => {
    expect(shouldApplyCloudBookPlace({
      contextBookId: 'genesis',
      incoming: james({ updatedAt: 9_000 }),
      local: genesis(),
      chapters: CHAPTERS,
    })).toBe(false)
  })

  it('does not overwrite when cloud is older than local', () => {
    expect(shouldApplyCloudBookPlace({
      contextBookId: 'romans',
      incoming: romans({ updatedAt: 1_000, rev: 99 }),
      local: romans({ updatedAt: 5_000, rev: 5 }),
      chapters: CHAPTERS,
    })).toBe(false)
  })

  it('applies newer cloud for the same book when the chapter exists', () => {
    expect(shouldApplyCloudBookPlace({
      contextBookId: 'romans',
      incoming: romans({ updatedAt: 9_000, paragraphIndex: 6, wordIndex: 2 }),
      local: romans(),
      chapters: CHAPTERS,
    })).toBe(true)
  })

  it('never applies sequential chapter 1147 (James) onto Genesis or Romans', () => {
    const incoming = james({ updatedAt: 99_000, rev: 99 })
    expect(shouldApplyCloudBookPlace({
      contextBookId: 'genesis',
      incoming,
      local: genesis(),
      chapters: CHAPTERS,
    })).toBe(false)
    expect(shouldApplyCloudBookPlace({
      contextBookId: 'romans',
      incoming,
      local: romans(),
      chapters: CHAPTERS,
    })).toBe(false)
    expect(shouldApplyCloudBookPlace({
      contextBookId: 'james',
      incoming,
      local: james({ updatedAt: 1 }),
      chapters: CHAPTERS,
    })).toBe(true)
    expect(chapterExistsOnClient(incoming, [
      { number: 1, title: 'Genesis 1' },
      { number: 1047, title: 'Romans 1' },
    ])).toBe(false)
  })

  it('merge keeps per-book pins and ignores a further James chapter', () => {
    const local: LabPositionState = {
      ...emptyLabPositionState(DEVICE),
      books: { genesis: genesis({ updatedAt: 8_000 }), romans: romans() },
      lastSettledBookId: 'romans',
      lastSettledAt: 5_000,
      updatedAt: 8_000,
    }
    const cloud: LabPositionState = {
      ...emptyLabPositionState('device-b'),
      books: { james: james({ updatedAt: 90_000 }) },
      lastSettledBookId: 'james',
      lastSettledAt: 90_000,
      updatedAt: 90_000,
    }
    const merged = mergeLabPositionStates(local, cloud, CHAPTERS)
    expect(merged.books.genesis?.paragraphIndex).toBe(0)
    expect(merged.books.romans?.sequentialChapter).toBe(1054)
    expect(merged.books.james?.sequentialChapter).toBe(1147)
    expect(merged.lastSettledBookId).toBe('james')
    expect(resumePlace(merged)?.bookId).toBe('james')

    const olderJamesResume = mergeLabPositionStates(local, {
      ...cloud,
      lastSettledAt: 2_000,
    }, CHAPTERS)
    expect(olderJamesResume.lastSettledBookId).toBe('romans')
    expect(olderJamesResume.books.romans?.wordIndex).toBe(4)
  })
})

describe('dwell and peek', () => {
  it('does not let a short Genesis peek overwrite the Romans pin or resume book', () => {
    const persisted: LabPositionState[] = []
    const controller = createLabPositionController({
      deviceId: DEVICE,
      now: () => 10_000,
      persist: (state) => { persisted.push(state) },
    })
    controller.replace({
      ...emptyLabPositionState(DEVICE),
      books: { romans: romans() },
      lastSettledBookId: 'romans',
      lastSettledAt: 5_000,
      updatedAt: 5_000,
    })

    controller.note({ place: genesis({ paragraphIndex: 1, wordIndex: 3 }), reason: 'chapter-jump', now: 10_000 })
    expect(controller.state().books.genesis).toBeUndefined()
    expect(controller.state().books.romans?.wordIndex).toBe(4)
    expect(controller.resume()?.bookId).toBe('romans')

    controller.note({ place: genesis({ paragraphIndex: 1, wordIndex: 3 }), reason: 'hide', now: 13_000 })
    expect(controller.state().books.genesis).toBeUndefined()
    expect(controller.resume()?.bookId).toBe('romans')
  })

  it('promotes a book after a page turn or Play, and after dwell', () => {
    vi.useFakeTimers()
    vi.setSystemTime(20_000)
    const controller = createLabPositionController({
      deviceId: DEVICE,
      schedule: (fn, ms) => {
        const id = setTimeout(fn, ms)
        return () => clearTimeout(id)
      },
    })
    controller.replace({
      ...emptyLabPositionState(DEVICE),
      books: { romans: romans() },
      lastSettledBookId: 'romans',
      lastSettledAt: 5_000,
      updatedAt: 5_000,
    })

    controller.note({ place: genesis({ paragraphIndex: 2, wordIndex: 1 }), reason: 'chapter-jump', now: 20_000 })
    expect(controller.resume()?.bookId).toBe('romans')

    controller.note({ place: genesis({ paragraphIndex: 2, wordIndex: 8 }), reason: 'page-turn', now: 21_000 })
    expect(controller.resume()?.bookId).toBe('genesis')
    expect(controller.state().books.genesis?.wordIndex).toBe(8)
    expect(controller.state().books.romans?.wordIndex).toBe(4)

    controller.note({ place: romans({ paragraphIndex: 2, wordIndex: 4 }), reason: 'chapter-jump', now: 22_000 })
    controller.note({ place: james({ paragraphIndex: 0, wordIndex: 2 }), reason: 'chapter-jump', now: 22_500 })
    expect(controller.resume()?.bookId).toBe('genesis')
    vi.advanceTimersByTime(25_000)
    expect(controller.resume()?.bookId).toBe('james')
    expect(controller.state().books.genesis?.wordIndex).toBe(8)
  })
})

describe('leaving a visited book', () => {
  it('settles the visited book on hide after real reading, before the dwell timer', () => {
    const controller = createLabPositionController({
      deviceId: DEVICE,
      schedule: () => () => {},
    })
    controller.replace({
      ...emptyLabPositionState(DEVICE),
      books: { romans: romans() },
      lastSettledBookId: 'romans',
      lastSettledAt: 5_000,
      updatedAt: 5_000,
    })

    // Jump into James 1, read to the end of the short chapter, tap into James 2.
    controller.note({ place: james({ sequentialChapter: 1147, paragraphIndex: 0, wordIndex: 0 }), reason: 'chapter-jump', now: 10_000 })
    controller.note({ place: james({ sequentialChapter: 1148, chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 }), reason: 'chapter-jump', now: 14_000 })
    expect(controller.resume()?.bookId).toBe('romans')

    // Leave 4s later: iOS never fired the 25s dwell, but reading happened.
    controller.note({ place: james({ sequentialChapter: 1148, chapterNumber: 2, paragraphIndex: 1, wordIndex: 3 }), reason: 'hide', now: 18_000 })
    expect(controller.resume()).toMatchObject({ bookId: 'james', sequentialChapter: 1148, paragraphIndex: 1, wordIndex: 3 })
    expect(controller.state().books.romans?.wordIndex).toBe(4)
  })

  it('still treats jump-then-leave with no reading as a peek', () => {
    const controller = createLabPositionController({ deviceId: DEVICE, schedule: () => () => {} })
    controller.replace({
      ...emptyLabPositionState(DEVICE),
      books: { romans: romans() },
      lastSettledBookId: 'romans',
      lastSettledAt: 5_000,
      updatedAt: 5_000,
    })
    controller.note({ place: james(), reason: 'chapter-jump', now: 10_000 })
    controller.note({ place: james(), reason: 'hide', now: 12_000 })
    expect(controller.resume()?.bookId).toBe('romans')
    expect(controller.state().books.james).toBeUndefined()
  })
})

describe('write timing', () => {
  it('writes a page turn to the local store synchronously and only debounces the rest', () => {
    const causes: string[] = []
    let scheduled: (() => void) | null = null
    const controller = createLabPositionController({
      deviceId: DEVICE,
      persist: (_state, cause, reason) => { causes.push(`${cause}:${reason}`) },
      schedule: (fn) => {
        scheduled = fn
        return () => { scheduled = null }
      },
    })
    controller.replace({
      ...emptyLabPositionState(DEVICE),
      books: { romans: romans() },
      lastSettledBookId: 'romans',
      lastSettledAt: 5_000,
      updatedAt: 5_000,
    })
    controller.note({ place: romans({ paragraphIndex: 3, wordIndex: 0 }), reason: 'page-turn', now: 6_000 })
    expect(causes).toEqual(['local:page-turn'])
    expect(controller.state().books.romans?.paragraphIndex).toBe(3)
    scheduled!()
    expect(causes).toEqual(['local:page-turn', 'debounce:page-turn'])

    controller.note({ place: romans({ paragraphIndex: 3, wordIndex: 0 }), reason: 'hide', now: 7_000 })
    expect(causes[causes.length - 1]).toBe('immediate:hide')
  })
})

describe('time-ordered merge (no chapter gate)', () => {
  it('keeps the newer per-book place and the newer settle from either side', () => {
    const older: LabPositionState = {
      ...emptyLabPositionState(DEVICE),
      books: { romans: romans({ updatedAt: 5_000 }), genesis: genesis({ updatedAt: 9_000, wordIndex: 9 }) },
      lastSettledBookId: 'romans',
      lastSettledAt: 5_000,
      updatedAt: 9_000,
    }
    const newer: LabPositionState = {
      ...emptyLabPositionState('device-b'),
      books: { romans: romans({ updatedAt: 7_000, wordIndex: 40, deviceId: 'device-b' }), genesis: genesis({ updatedAt: 1_000 }) },
      lastSettledBookId: 'romans',
      lastSettledAt: 7_000,
      updatedAt: 7_000,
    }
    const merged = mergeLabPositionStatesByTime(older, newer)
    expect(merged.books.romans?.wordIndex).toBe(40)
    expect(merged.books.genesis?.wordIndex).toBe(9)
    expect(merged.lastSettledAt).toBe(7_000)
    expect(merged.updatedAt).toBe(9_000)
    expect(merged.deviceId).toBe('device-b')

    // Reverse direction: an older incoming record cannot regress anything.
    const back = mergeLabPositionStatesByTime(merged, older)
    expect(back.books.romans?.wordIndex).toBe(40)
    expect(back.lastSettledAt).toBe(7_000)
  })
})

describe('offline save + reload', () => {
  it('restores the exact word of the settled book', () => {
    const controller = createLabPositionController({ deviceId: DEVICE })
    controller.note({
      place: romans({ paragraphIndex: 4, wordIndex: 11 }),
      reason: 'play',
      now: 30_000,
    })
    const snap = controller.state()
    const reloaded = parseLabPositionState(JSON.parse(JSON.stringify(snap)), DEVICE)
    expect(resumePlace(reloaded)).toMatchObject({
      bookId: 'romans',
      sequentialChapter: 1054,
      paragraphIndex: 4,
      wordIndex: 11,
    })
  })

  it('activates a selected catalogue book immediately with one coherent reader tuple', () => {
    const controller = createLabPositionController({ deviceId: DEVICE })
    controller.replace({
      ...emptyLabPositionState(DEVICE),
      books: { romans: romans() },
      lastSettledBookId: 'romans',
      lastSettledAt: 5_000,
      updatedAt: 5_000,
    })
    const meditations = place({
      bookId: 'meditations',
      headerBook: 'Meditations',
      chapterNumber: 4,
      sequentialChapter: 4,
      paragraphIndex: 3,
      wordIndex: 8,
      pageIndex: 6,
      primaryEditionKey: 'original-en',
      compareEditionKey: 'modern-en',
      readerMode: 'compare',
    })

    controller.note({ place: meditations, reason: 'open-book', now: 10_000 })
    const reloaded = parseLabPositionState(JSON.parse(JSON.stringify(controller.state())), DEVICE)

    expect(resumePlace(reloaded)).toMatchObject({
      bookId: 'meditations', chapterNumber: 4, sequentialChapter: 4,
      paragraphIndex: 3, wordIndex: 8, pageIndex: 6,
      primaryEditionKey: 'original-en', compareEditionKey: 'modern-en', readerMode: 'compare',
    })
    expect(reloaded.books.romans?.wordIndex).toBe(4)
  })

  it('persists a mode change without mixing it with another book', () => {
    const controller = createLabPositionController({ deviceId: DEVICE })
    controller.note({
      place: place({
        bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 1, sequentialChapter: 1,
        paragraphIndex: 2, wordIndex: 5, pageIndex: 3, primaryEditionKey: 'original-en',
        compareEditionKey: 'modern-en', readerMode: 'read',
      }),
      reason: 'open-book',
      now: 20_000,
    })
    controller.note({
      place: place({
        bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 1, sequentialChapter: 1,
        paragraphIndex: 2, wordIndex: 5, pageIndex: 3, primaryEditionKey: 'original-en',
        compareEditionKey: 'modern-en', readerMode: 'compare', rev: 2,
      }),
      reason: 'mode-change',
      now: 21_000,
    })
    expect(controller.resume()).toMatchObject({
      bookId: 'odyssey', paragraphIndex: 2, wordIndex: 5,
      primaryEditionKey: 'original-en', compareEditionKey: 'modern-en', readerMode: 'compare',
    })
  })
})
