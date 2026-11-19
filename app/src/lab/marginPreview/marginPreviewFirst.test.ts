// @vitest-environment jsdom
// Margin view's first chapter first (Anders, 22 Oct 2026): the chapters at the place as soon as they are in, the
// whole book after them, both opening at the same place.
import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { marginPreviewWindowChapters } from './marginPreviewModel'
import { loadMarginPreviewBook, loadMarginPreviewBookParts } from './marginPreviewLoad'
import { startMarginPreviewFrame, marginPreviewFrameSrc } from './marginPreviewFrame'
import { LAB_POSITION_STORAGE_KEY, type LabBookPlace } from '../labPosition'
import type { EditionData } from '../../types'

const edition = JSON.parse(readFileSync(resolve(__dirname, '../../../public/data/editions/frankenstein-modern-en.json'), 'utf8')) as EditionData
const manifest = JSON.parse(readFileSync(resolve(__dirname, '../../../public/data/editions-chapters/frankenstein-modern-en/manifest.json'), 'utf8')) as { chapters: Array<{ number: number; title: string; paragraphCount: number; wordCount: number }> }

/** The loader's chapter window round `center` (editionLoader loadEditionWindow's shape). */
function windowOf(center: number): EditionData {
  const loaded = [center - 1, center, center + 1].filter(n => manifest.chapters.some(c => c.number === n))
  return {
    chapters: manifest.chapters.map(entry => ({
      number: entry.number, title: entry.title, paragraphCount: entry.paragraphCount, wordCount: entry.wordCount,
      paragraphs: loaded.includes(entry.number) ? edition.chapters.find(c => Number(c.number) === entry.number)!.paragraphs : [],
    })),
    windowed: { complete: false, centerChapter: center, loadedChapters: loaded },
  } as EditionData
}
const place = (p: Partial<LabBookPlace>): LabBookPlace => ({ bookId: 'frankenstein', headerBook: 'frankenstein', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 0, wordIndex: 0, primaryEditionKey: 'modern-en', updatedAt: 1000, deviceId: 'd', rev: 1, ...p })
const record = (p: LabBookPlace) => ({ books: { [p.bookId]: p }, finished: {}, hidden: {}, lastSettledBookId: p.bookId, lastSettledAt: p.updatedAt, updatedAt: p.updatedAt, deviceId: 'd' })
const later = <T,>(value: T, ms: number) => new Promise<T>(r => setTimeout(() => r(value), ms))

describe('the chapters at the place first', () => {
  beforeEach(() => { localStorage.clear() })

  it('a window: every chapter, the ones outside it pending with an estimated length', () => {
    const chapters = marginPreviewWindowChapters(windowOf(9))!
    expect(chapters).toHaveLength(manifest.chapters.length)
    expect(chapters.filter(c => !c.pending).map(c => c.number)).toEqual([8, 9, 10])
    const pending = chapters.find(c => c.number === 1)!
    expect(pending).toMatchObject({ pending: true, paragraphs: [] })
    expect(pending.chars).toBeGreaterThan(manifest.chapters[0].wordCount * 4)
    expect(chapters.find(c => c.number === 9)!.paragraphs.length).toBe(manifest.chapters[8].paragraphCount)
    // The whole book is not a window.
    expect(marginPreviewWindowChapters(edition)).toBeNull()
  })

  it('opens the first part at the same place as the whole book, sooner', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(record(place({ chapterNumber: 9, sequentialChapter: 9, paragraphIndex: 4, wordIndex: 5 }))))
    const centers: number[] = []
    const parts = loadMarginPreviewBookParts('frankenstein', {
      readToken: async () => null,
      loadEditionImpl: () => later(edition, 60),
      loadWindowImpl: async (_id, _key, center) => { centers.push(center); return windowOf(center) },
    })
    const first = await parts.first
    const full = await parts.full
    expect(centers).toEqual([9])
    expect(first?.partial).toBe(true)
    expect(first?.start).toEqual(full.start)
    expect(full.start).toMatchObject({ chapterNumber: 9, paragraphIndex: 4, wordIndex: 5 })
    expect(first?.chapters.map(c => c.number)).toEqual(full.chapters.map(c => c.number))
    expect(full.partial).toBeUndefined()
    expect(full.chapters.some(c => c.pending)).toBe(false)
  })

  it('none when the whole book is in first, when there is no window, or when the place is outside it', async () => {
    const quick = loadMarginPreviewBookParts('frankenstein', { readToken: async () => null, loadEditionImpl: async () => edition, loadWindowImpl: () => later(windowOf(1), 60) })
    expect(await quick.first).toBeNull()
    const whole = loadMarginPreviewBookParts('frankenstein', { readToken: async () => null, loadEditionImpl: async () => edition, loadWindowImpl: null })
    expect(await whole.first).toBeNull()
    const elsewhere = loadMarginPreviewBookParts('frankenstein', { readToken: async () => null, loadEditionImpl: () => later(edition, 60), loadWindowImpl: async () => windowOf(20) })
    expect(await elsewhere.first).toBeNull()
    // loadMarginPreviewBook is the whole book, as before.
    expect((await loadMarginPreviewBook('frankenstein', { readToken: async () => null, loadEditionImpl: async () => edition })).partial).toBeUndefined()
  })

  it('refuses the Bible in both parts', async () => {
    const parts = loadMarginPreviewBookParts('bible', { readToken: async () => null })
    expect(await parts.first).toBeNull()
    await expect(parts.full).rejects.toThrow()
  })

  it('the frame starts as MarginPreview draws it', () => {
    const frame = startMarginPreviewFrame('frankenstein')!
    expect(frame.parentElement).toBe(document.body)
    expect(frame.dataset.testid).toBe('margin-preview-frame')
    expect(frame.getAttribute('src')).toBe(marginPreviewFrameSrc('frankenstein'))
    expect(frame.style.position).toBe('fixed')
    frame.remove()
  })
})
