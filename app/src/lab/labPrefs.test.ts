// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_LAB_PREFS,
  LAB_LIBRARY_URL,
  LAB_PREFS_KEY,
  labFootProgress,
  labFootProgressPages,
  labProgressKnobLive,
  parseLabPrefs,
  readLabPrefs,
  writeLabPrefs,
} from './labPrefs'

afterEach(() => {
  try { localStorage.removeItem(LAB_PREFS_KEY) } catch { /* jsdom */ }
})

describe('lab prefs', () => {
  it('points Library at the public Tinct library hub, never /app', () => {
    expect(LAB_LIBRARY_URL).toBe('/read/')
    expect(LAB_LIBRARY_URL).not.toContain('/app')
    expect(LAB_LIBRARY_URL).not.toContain('library')
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
