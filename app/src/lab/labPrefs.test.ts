// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import {
  labCompactFootProgress,
  DEFAULT_LAB_PREFS,
  LAB_ACCOUNT_URL,
  LAB_LIBRARY_URL,
  LAB_SIGN_IN_URL,
  labAccountUrl,
  labSignInUrl,
  LAB_MAX_FONT_SIZE,
  LAB_MIN_FONT_SIZE,
  LAB_PREFS_KEY,
  LAB_ACCESSIBILITY_FONTS,
  LAB_FONT_LABELS,
  LAB_READING_FONTS,
  LAB_V1_DEFAULT_FONT,
  LAB_V2_DEFAULT_FONT,
  labFontFamilyCss,
  labReadingFont,
  labFootProgress,
  labFootProgressPages,
  labProgressKnobLive,
  labBookPageEstimate,
  labChapterWordWeights,
  labReaderProgressLabel,
  parseLabPrefs,
  parseLabStoredPrefs,
  readLabPrefs,
  writeLabPrefs,
} from './labPrefs'

afterEach(() => {
  try { localStorage.removeItem(LAB_PREFS_KEY) } catch { /* jsdom */ }
})

describe('lab prefs', () => {
  it('keeps mobile progress compact because the chapter is already in the header', () => {
    expect(labCompactFootProgress('Genesis 1 — 5 / 9')).toBe('5 / 9')
    expect(labCompactFootProgress('Genesis 1 — 56%')).toBe('56%')
    expect(labCompactFootProgress('82%')).toBe('82%')
  })

  it('toggles between total-book and explicit chapter progress', () => {
    const shared = {
      currentPage: 4,
      totalPages: 10,
      chapterPercent: 18,
      chapterNumber: 2,
      chapterWordsRead: 180,
      chapterWordCounts: [
        { number: 1, wordCount: 1000 },
        { number: 2, wordCount: 1000 },
      ],
      wordsPerPage: 100,
    }
    // Ten pages of chapter one lie behind page four of chapter two.
    expect(labReaderProgressLabel({ ...shared, mode: 'book' })).toBe('14 / 20 of book · 70%')
    expect(labReaderProgressLabel({ ...shared, mode: 'chapter' })).toBe('4 / 10 of chapter · 18%')
  })

  it('adds thousands separators to reader page totals', () => {
    expect(labReaderProgressLabel({
      mode: 'book',
      currentPage: 3,
      totalPages: 333,
      chapterPercent: 1,
      chapterNumber: 2,
      chapterWordCounts: [
        { number: 1, wordCount: 900_000 },
        { number: 2, wordCount: 100_000 },
      ],
      wordsPerPage: 300,
    })).toBe('3,003 / 3,333 of book · 90%')
  })

  it('numbers the book continuously: one page per page turn, and the percentage agrees', () => {
    const chapterWeights = [
      { number: 1, wordCount: 4_000 },
      { number: 2, wordCount: 4_000 },
      { number: 3, wordCount: 4_000 },
    ]
    const at = (currentPage: number) => labBookPageEstimate({
      currentPage,
      totalPages: 20,
      chapterNumber: 2,
      chapterWeights,
      wordsPerPage: 200,
    })
    // Chapter one is 20 estimated pages, so chapter two opens on page 21.
    expect(at(1).page).toBe(21)
    for (let page = 1; page < 20; page += 1) {
      expect(at(page + 1).page).toBe(at(page).page + 1)
    }
    // The spread's two leaves are always N and N+1, never a repeat.
    expect(at(5).page + 1).toBe(at(6).page)
    // The figure in the foot is the same quantity, so it cannot contradict it.
    const mid = at(10)
    expect(mid.percent).toBe(Math.round((mid.page / mid.totalPages) * 100))
    expect(mid.totalPages).toBe(60)
    expect(mid.honest).toBe(true)
  })

  it('weights Bible chapters by paragraph count when no per-chapter words ship', () => {
    // The Bible manifest carries 1,189 chapters with paragraph counts only;
    // laying them all out is never worth it, so the catalogue total is spread.
    const chapterWeights = [
      { number: 1, paragraphCount: 30 },
      { number: 2, paragraphCount: 10 },
      { number: 3, paragraphCount: 10 },
    ]
    const estimate = labBookPageEstimate({
      currentPage: 2,
      totalPages: 5,
      chapterNumber: 2,
      chapterWeights,
      wordsPerPage: 300,
      bookWordCount: 50_000,
    })
    // Chapter one holds 30/50 of 50,000 words = 30,000 words = 100 pages.
    expect(estimate.page).toBe(102)
    expect(estimate.honest).toBe(true)
    expect(labChapterWordWeights(chapterWeights, 50_000).map(c => c.wordCount)).toEqual([30_000, 10_000, 10_000])
  })

  it('falls back to a chapter-shaped guess when nothing weights the chapters', () => {
    const estimate = labBookPageEstimate({
      currentPage: 2,
      totalPages: 5,
      chapterNumber: 3,
      chapterWeights: [{ number: 1 }, { number: 2 }, { number: 3 }],
      wordsPerPage: 300,
    })
    expect(estimate).toEqual({ page: 12, totalPages: 15, percent: 80, honest: false })
  })

  it('points Library at the lab library, never /app', () => {
    expect(LAB_LIBRARY_URL).toBe('/library')
    expect(LAB_LIBRARY_URL).not.toContain('/app')
    expect(LAB_LIBRARY_URL).not.toContain('?')
    expect(LAB_LIBRARY_URL).not.toBe('/read/library')
    expect(LAB_LIBRARY_URL).not.toBe('/read?view=library')
  })

  it('defaults to page of chapter and persists every knob', () => {
    expect(DEFAULT_LAB_PREFS.progressDisplay).toEqual({ metric: 'page', scope: 'chapter' })
    const next = parseLabPrefs({
      darkMode: true,
      fontFamily: 'baskerville',
      fontSize: 1.8,
      progressDisplay: { metric: 'time', scope: 'section' },
      audioEdition: 'web-en',
    })
    expect(next.darkMode).toBe(true)
    expect(next.fontFamily).toBe('baskerville')
    expect(next.fontSize).toBe(1.8)
    expect(next.progressDisplay).toEqual({ metric: 'time', scope: 'section' })
    expect(next.audioEdition).toBe('web-en')
    writeLabPrefs(next)
    expect(readLabPrefs().progressDisplay.scope).toBe('section')
  })

  it('migrates one legacy appearance into both profiles without losing shared choices', () => {
    const migrated = parseLabStoredPrefs({
      primaryEdition: 'web-en',
      compareEdition: 'kjv-en',
      audioEdition: 'web-en',
      audioSpeed: 1.75,
      compareOpen: true,
      darkMode: true,
      fontFamily: 'baskerville',
      fontSize: 1.8,
      alignment: 'left',
      lineSpacing: 'open',
      margins: 'wide',
      paragraphSpacing: 'generous',
      progressDisplay: { metric: 'percent', scope: 'book' },
    })

    expect(migrated.version).toBe(2)
    expect(migrated.shared).toEqual({
      primaryEdition: 'web-en',
      compareEdition: 'kjv-en',
      audioEdition: 'web-en',
      audioSpeed: 1.75,
      compareOpen: true,
    })
    expect(migrated.phone).toEqual(migrated.desktop)
    expect(migrated.phone).toMatchObject({
      theme: 'dark',
      fontFamily: 'baskerville',
      fontSize: 1.8,
      alignment: 'left',
      lineSpacing: 'open',
      margins: 'wide',
      paragraphSpacing: 'generous',
      progressDisplay: { metric: 'percent', scope: 'book' },
    })
  })

  it('updates only the active appearance profile while editions, Compare, and audio stay shared', () => {
    localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({
      primaryEdition: 'web-en',
      compareEdition: 'kjv-en',
      audioEdition: 'web-en',
      audioSpeed: 1.5,
      compareOpen: true,
      theme: 'book',
      fontSize: 1.2,
      alignment: 'justify',
    }))

    writeLabPrefs({
      ...readLabPrefs('phone'),
      theme: 'dark',
      fontSize: 1.6,
      alignment: 'left',
      audioSpeed: 2,
    }, 'phone')
    writeLabPrefs({
      ...readLabPrefs('desktop'),
      theme: 'light',
      fontSize: 1,
      alignment: 'justify',
    }, 'desktop')

    const phone = readLabPrefs('phone')
    const desktop = readLabPrefs('desktop')
    expect(phone).toMatchObject({ theme: 'dark', fontSize: 1.6, alignment: 'left' })
    expect(desktop).toMatchObject({ theme: 'light', fontSize: 1, alignment: 'justify' })
    expect(phone.primaryEdition).toBe('web-en')
    expect(desktop.primaryEdition).toBe('web-en')
    expect(phone.compareOpen).toBe(true)
    expect(desktop.compareOpen).toBe(true)
    expect(phone.audioEdition).toBe('web-en')
    expect(desktop.audioEdition).toBe('web-en')
    expect(phone.audioSpeed).toBe(2)
    expect(desktop.audioSpeed).toBe(2)
  })

  it('offers a genuinely smaller size and clamps imported preferences', () => {
    expect(LAB_MIN_FONT_SIZE).toBe(0.8)
    expect(LAB_MAX_FONT_SIZE).toBe(2.2)
    expect(parseLabPrefs({ fontSize: 0.1 }).fontSize).toBe(LAB_MIN_FONT_SIZE)
    expect(parseLabPrefs({ fontSize: 9 }).fontSize).toBe(LAB_MAX_FONT_SIZE)
    expect(parseLabPrefs({ audioSpeed: 9 }).audioSpeed).toBe(3)
  })

  it('formats the foot strip from cheap knobs and keeps page/chapter as fallback', () => {
    expect(labProgressKnobLive('page', 'chapter')).toBe(true)
    expect(labProgressKnobLive('percent', 'chapter')).toBe(true)
    expect(labProgressKnobLive('percent', 'book')).toBe(true)
    expect(labProgressKnobLive('time', 'chapter')).toBe(false)
    expect(labProgressKnobLive('location', 'book')).toBe(false)
    expect(labProgressKnobLive('page', 'section')).toBe(false)
    expect(labFootProgress({
      chapterNumber: 1,
      chapterLabel: 'Book 1',
      currentPage: 4,
      totalPages: 7,
      percent: 55,
    })).toBe('Book 1 — 4 / 7')
    expect(labFootProgressPages(4, 7)).toBe('4 / 7')
    expect(labFootProgress({
      chapterNumber: 643,
      chapterLabel: 'Proverbs 16',
      currentPage: 3,
      totalPages: 12,
      percent: 25,
    })).toBe('Proverbs 16 — 3 / 12')
    const proverbs = labFootProgress({
      chapterNumber: 644,
      chapterLabel: 'Proverbs 16',
      currentPage: 3,
      totalPages: 12,
      percent: 25,
    })
    expect(proverbs).toContain('Proverbs')
    expect(proverbs).toContain('16')
    expect(proverbs).not.toContain('644')
    expect(proverbs).not.toContain('Chapter 644')
    expect(labFootProgress({
      chapterNumber: 643,
      chapterLabel: 'Proverbs 15',
      currentPage: 4,
      totalPages: 7,
      percent: 55,
      metric: 'percent',
      scope: 'chapter',
    })).toBe('Proverbs 15 — 55%')
    expect(labFootProgress({
      chapterNumber: 119,
      currentPage: 1,
      totalPages: 3,
      percent: 10,
      chapterCount: 1189,
      metric: 'percent',
      scope: 'book',
    })).toBe('10%')
    expect(labFootProgress({
      chapterNumber: 643,
      currentPage: 4,
      totalPages: 7,
      percent: 55,
      metric: 'time',
      scope: 'book',
    })).toBe('Chapter 643 — 4 / 7')
  })
})

describe('lab sign-in URLs', () => {
  it('return to the reader path they were given and default to the library', () => {
    expect(labSignInUrl('/lab/reader?voice=v2')).toBe('/lab/sign-in?returnTo=%2Flab%2Freader%3Fvoice%3Dv2')
    expect(labAccountUrl('/lab/phone')).toBe('/lab/sign-in?mode=account&returnTo=%2Flab%2Fphone')
    expect(labSignInUrl()).toBe(LAB_SIGN_IN_URL)
    expect(labAccountUrl('')).toBe(LAB_ACCOUNT_URL)
    expect(LAB_SIGN_IN_URL).toBe(`/lab/sign-in?returnTo=${encodeURIComponent(LAB_LIBRARY_URL)}`)
  })
})

describe('the reading faces', () => {
  it('offers Literata first and keeps Atkinson in its own accessibility group', () => {
    expect(LAB_READING_FONTS).toEqual(['literata', 'garamond', 'baskerville', 'sourceserif'])
    expect(LAB_ACCESSIBILITY_FONTS).toEqual(['atkinson'])
    expect(LAB_READING_FONTS).not.toContain('atkinson')
    expect(LAB_FONT_LABELS.literata).toBe('Literata')
    expect(LAB_FONT_LABELS.atkinson).toBe('Atkinson Hyperlegible')
  })

  it('sets each face in its own family, with a face that exists behind it', () => {
    expect(labFontFamilyCss('literata')).toContain("'Literata'")
    expect(labFontFamilyCss('atkinson')).toContain("'Atkinson Hyperlegible'")
    // Every face falls back to one the reader already ships.
    for (const family of [...LAB_READING_FONTS, ...LAB_ACCESSIBILITY_FONTS]) {
      expect(labFontFamilyCss(family)).toMatch(/(EB Garamond|IBM Plex Sans)/)
    }
  })

  it('moves the default in V2 only, and never moves a face a reader picked', () => {
    // Never chosen: the new reader gets the new default, today's reader does not.
    expect(labReadingFont(null, true)).toBe(LAB_V2_DEFAULT_FONT)
    expect(labReadingFont(null, false)).toBe(LAB_V1_DEFAULT_FONT)
    expect(LAB_V2_DEFAULT_FONT).toBe('literata')
    expect(LAB_V1_DEFAULT_FONT).toBe('garamond')
    // Chosen: the choice holds in both chromes, including the old three.
    for (const family of ['garamond', 'baskerville', 'sourceserif', 'literata', 'atkinson'] as const) {
      expect(labReadingFont(family, true)).toBe(family)
      expect(labReadingFont(family, false)).toBe(family)
    }
  })

  it('carries a stored face across the store that did not know it', () => {
    // The three the store has always known parse unchanged...
    for (const family of ['garamond', 'baskerville', 'sourceserif'] as const) {
      expect(parseLabPrefs({ fontFamily: family }).fontFamily).toBe(family)
    }
    // ...the two it did not, too, and a face nobody can read is "never chosen"
    // rather than a face nobody picked.
    expect(parseLabPrefs({ fontFamily: 'literata' }).fontFamily).toBe('literata')
    expect(parseLabPrefs({ fontFamily: 'atkinson' }).fontFamily).toBe('atkinson')
    expect(parseLabPrefs({ fontFamily: 'papyrus' }).fontFamily).toBeNull()
    expect(DEFAULT_LAB_PREFS.fontFamily).toBeNull()
  })

  it('round-trips a new face through the store', () => {
    writeLabPrefs({ ...DEFAULT_LAB_PREFS, fontFamily: 'atkinson' })
    expect(readLabPrefs().fontFamily).toBe('atkinson')
    expect(parseLabStoredPrefs(JSON.parse(localStorage.getItem(LAB_PREFS_KEY)!)).phone.fontFamily).toBe('atkinson')
  })
})
