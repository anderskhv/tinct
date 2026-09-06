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
  labFootProgress,
  labFootProgressPages,
  labProgressKnobLive,
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
      totalPages: 22,
      chapterPercent: 18,
      chapterNumber: 2,
      chapterWordsRead: 180,
      chapterWordCounts: [
        { number: 1, wordCount: 1000 },
        { number: 2, wordCount: 1000 },
      ],
      wordsPerPage: 100,
    }
    expect(labReaderProgressLabel({ ...shared, mode: 'book' })).toBe('12 / 20 of book · 59%')
    expect(labReaderProgressLabel({ ...shared, mode: 'chapter' })).toBe('4 / 22 of chapter · 18%')
  })

  it('adds thousands separators to reader page totals', () => {
    expect(labReaderProgressLabel({
      mode: 'book',
      currentPage: 1,
      totalPages: 10,
      chapterPercent: 50,
      chapterNumber: 1,
      chapterWordsRead: 4_799,
      chapterWordCounts: [{ number: 1, wordCount: 8_921 }],
      wordsPerPage: 1,
    })).toBe('4,799 / 8,921 of book · 54%')
  })

  it('points Library at the lab library, never /app', () => {
    expect(LAB_LIBRARY_URL).toBe('/lab/library')
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
