import { describe, expect, it } from 'vitest'
import type { ChapterHearingPage } from './labHearing'
import {
  LISTEN_PLACE_MIN_GAP_MS,
  sameListenPlace,
  voiceReadingPlace,
  voiceSaveStep,
  voiceStep,
  type ListenSaveMark,
} from './labListenPlace'

// The Master and Margarita, chapter 4: the report this guards (26 Nov 2026).
const CHAPTER = { bookId: 'master-and-margarita', chapterNumber: 4 }
const following = (overrides: Partial<Parameters<typeof voiceReadingPlace>[0]> = {}): Parameters<typeof voiceReadingPlace>[0] => ({
  follow: { kind: 'word', paragraphIndex: 56, wordIndex: 55 },
  place: { paragraphIndex: 56, wordIndex: 55 },
  following: true,
  browsing: false,
  changingChapter: false,
  listening: CHAPTER,
  shown: CHAPTER,
  ...overrides,
})

// Paragraph 0 runs over two pages; paragraphs 1 and 2 share the third.
const pages: ChapterHearingPage[] = [
  { paragraphIndex: 0, from: 0, to: 63, segments: [{ paragraphIndex: 0, from: 0, to: 63 }] },
  { paragraphIndex: 0, from: 63, to: 78, segments: [{ paragraphIndex: 0, from: 63, to: 78 }] },
  { paragraphIndex: 1, from: 0, to: 25, segments: [{ paragraphIndex: 1, from: 0, to: 25 }, { paragraphIndex: 2, from: 0, to: 40 }] },
]

describe('the voice is the reader\'s place only while the reader follows it', () => {
  it('names the word being read, in the chapter on screen', () => {
    expect(voiceReadingPlace(following())).toEqual({ sequentialChapter: 4, paragraphIndex: 56, wordIndex: 55 })
  })

  it('takes a paragraph-level voice at the word the page chose for it', () => {
    expect(voiceReadingPlace(following({ follow: { kind: 'paragraph', paragraphIndex: 56 }, place: { paragraphIndex: 56, wordIndex: 12 } })))
      .toEqual({ sequentialChapter: 4, paragraphIndex: 56, wordIndex: 12 })
  })

  it('is nothing when there is no voice, the player is not showing it, or the start is still loading', () => {
    expect(voiceReadingPlace(following({ follow: { kind: 'none' } }))).toBeNull()
    expect(voiceReadingPlace(following({ following: false }))).toBeNull()
  })

  it('is nothing while the reader browses away from the voice', () => {
    expect(voiceReadingPlace(following({ browsing: true }))).toBeNull()
  })

  it('is nothing when the page has not taken the voice\'s word as its place', () => {
    // A start-of-chapter blip mid-chapter: the page keeps paragraph 56.
    expect(voiceReadingPlace(following({ follow: { kind: 'word', paragraphIndex: 0, wordIndex: 0 } }))).toBeNull()
    // The reader tapped another word: the place is theirs, and their tap saved it.
    expect(voiceReadingPlace(following({ place: { paragraphIndex: 56, wordIndex: 3 } }))).toBeNull()
  })

  it('is nothing when the voice reads another chapter or book than the one on screen', () => {
    expect(voiceReadingPlace(following({ shown: { ...CHAPTER, chapterNumber: 5 } }))).toBeNull()
    expect(voiceReadingPlace(following({ shown: { bookId: 'frankenstein', chapterNumber: 4 } }))).toBeNull()
  })

  it('is nothing while a chapter change is under way: a next chapter\'s first word is never saved under the chapter just ended', () => {
    expect(voiceReadingPlace(following({ changingChapter: true, follow: { kind: 'word', paragraphIndex: 0, wordIndex: 0 }, place: { paragraphIndex: 0, wordIndex: 0 } }))).toBeNull()
  })
})

describe('the step the voice is in', () => {
  const at = (paragraphIndex: number, wordIndex: number) => ({ sequentialChapter: 4, paragraphIndex, wordIndex })

  it('is its page where the reader turns pages', () => {
    expect(voiceStep(at(0, 10), pages)).toEqual({ key: '4:page:0', pageIndex: 0 })
    expect(voiceStep(at(0, 62), pages).key).toBe('4:page:0')
    expect(voiceStep(at(0, 63), pages)).toEqual({ key: '4:page:1', pageIndex: 1 })
    // Two paragraphs on one page are one step.
    expect(voiceStep(at(1, 3), pages).key).toBe(voiceStep(at(2, 30), pages).key)
  })

  it('is its paragraph where the reader scrolls', () => {
    expect(voiceStep(at(1, 3), null)).toEqual({ key: '4:paragraph:1', pageIndex: null })
    expect(voiceStep(at(2, 30), null).key).toBe('4:paragraph:2')
  })

  it('differs between chapters', () => {
    expect(voiceStep({ sequentialChapter: 5, paragraphIndex: 0, wordIndex: 10 }, pages).key).not.toBe(voiceStep(at(0, 10), pages).key)
  })
})

describe('saving as the voice reads on', () => {
  const T0 = 1_795_700_000_000 // Play is pressed

  it('only remembers the first step: Play saved its own place', () => {
    expect(voiceSaveStep(null, '4:page:1', T0)).toEqual({ mark: { key: '4:page:1', at: T0 }, save: false })
  })

  it('saves nothing while the voice stays on the same page', () => {
    const mark: ListenSaveMark = { key: '4:page:1', at: T0 }
    expect(voiceSaveStep(mark, '4:page:1', T0 + 60_000)).toEqual({ mark, save: false })
  })

  it('saves when the voice reaches a new page', () => {
    const mark: ListenSaveMark = { key: '4:page:1', at: T0 }
    expect(voiceSaveStep(mark, '4:page:2', T0 + 35_000)).toEqual({ mark: { key: '4:page:2', at: T0 + 35_000 }, save: true })
  })

  it('holds a page reached too soon after the last save, then saves it once the gap is over', () => {
    const mark: ListenSaveMark = { key: '4:paragraph:17', at: T0 }
    const early = voiceSaveStep(mark, '4:paragraph:18', T0 + LISTEN_PLACE_MIN_GAP_MS - 1)
    expect(early).toEqual({ mark, save: false })
    // A later word of the same new paragraph: the mark still names the old one, so this one saves.
    expect(voiceSaveStep(early.mark, '4:paragraph:18', T0 + LISTEN_PLACE_MIN_GAP_MS)).toEqual({ mark: { key: '4:paragraph:18', at: T0 + LISTEN_PLACE_MIN_GAP_MS }, save: true })
  })

  it('a whole listening session saves once a page: fifteen minutes to page 25 leaves the place on page 25', () => {
    let mark: ListenSaveMark | null = null
    const saved: string[] = []
    // A word every 0.4 s, a page every 36 s, from page 1 at Play to page 25.
    for (let ms = 0; ms <= 15 * 60_000; ms += 400) {
      const key = `4:page:${1 + Math.min(24, Math.floor(ms / 36_000))}`
      const step = voiceSaveStep(mark, key, T0 + ms)
      mark = step.mark
      if (step.save) saved.push(key)
    }
    expect(saved).toHaveLength(24)
    expect(saved[saved.length - 1]).toBe('4:page:25')
  })
})

describe('the place last saved is not saved again', () => {
  const heard = { sequentialChapter: 4, paragraphIndex: 56, wordIndex: 55 }

  it('matches the same chapter, paragraph and word', () => {
    expect(sameListenPlace(heard, { ...heard })).toBe(true)
  })

  it('differs by any of the three, and from nothing', () => {
    expect(sameListenPlace(heard, { ...heard, wordIndex: 56 })).toBe(false)
    expect(sameListenPlace(heard, { ...heard, paragraphIndex: 57 })).toBe(false)
    expect(sameListenPlace(heard, { ...heard, sequentialChapter: 5 })).toBe(false)
    expect(sameListenPlace(heard, null)).toBe(false)
    expect(sameListenPlace(null, null)).toBe(false)
  })
})
