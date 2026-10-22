// @vitest-environment jsdom
// The desktop margin view (Anders, 2026-10-20): Tinct paper as the book reader sets its leaf, and the Layout
// switch (Margin · Two-page · Compare) keeping the place and the opt-in.
import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CLASSIC_READER_KEY, decideMarginPreview, marginPreviewAtForPage, marginPreviewBookForPage } from './marginPreviewFlag'
import { isMarginPreviewBook, marginPreviewCompareEdition, marginPreviewLayoutHref, marginPreviewPaper, marginPreviewReturnHref } from './marginPreviewModel'
import { loadMarginPreviewBook } from './marginPreviewLoad'
import { getBook } from '../../data/bookRegistry'
import { DEFAULT_LAB_PREFS, type LabPrefs } from '../labPrefs'
import { deepLinkView, readerHandoffFromUrlParams } from '../labReaderHandoff'
import type { EditionData } from '../../types'

const isPreviewBook = (id: string) => isMarginPreviewBook(getBook(id))
const decide = (search: string, classic = false) => decideMarginPreview({ search, classic, handoffBookId: null, isPreviewBook })
const prefs = (over: Partial<LabPrefs> = {}): LabPrefs => ({ ...DEFAULT_LAB_PREFS, ...over } as LabPrefs)

describe('Tinct paper: the book reader’s desktop leaf', () => {
  it('sets the text as the leaf does for the window (measured: 1440 → 19.22px over 617.8px, 1280 → 17.48px over 542.6px)', () => {
    const wide = marginPreviewPaper(prefs(), 1440), narrow = marginPreviewPaper(prefs(), 1280)
    expect(wide.fontSize).toBeCloseTo(19.2246, 3)
    expect(wide.measure).toBeCloseTo(617.8, 1)
    expect(narrow.fontSize).toBeCloseTo(17.4769, 3)
    expect(narrow.measure).toBeCloseTo(542.6, 1)
    expect(wide).toMatchObject({ lineHeight: 1.48, paragraphGap: 0.28, align: 'justify' })
    expect(wide.headingSize / wide.fontSize).toBeCloseTo(1.58 / 1.42, 5)
  })
  it('follows the reader’s own size, spacing, margins, alignment and font', () => {
    const own = marginPreviewPaper(prefs({ fontSize: 1.3, fontSizeExplicit: true, lineSpacing: 'open', paragraphSpacing: 'generous', margins: 'wide', alignment: 'left', alignmentExplicit: true }), 1440)
    expect(own.fontSize).toBeCloseTo(16 * 1.42, 3)
    expect(own).toMatchObject({ lineHeight: 1.62, paragraphGap: 0.55, align: 'left' })
    expect(own.measure).toBeCloseTo((1440 - 62 - 2 * 43.2 * 1.45 - 56) / 2, 3)
    expect(marginPreviewPaper(prefs({ alignmentExplicit: false }), 1440, { shakespeare: true }).align).toBe('left')
  })
})

describe('the Layout switch', () => {
  const place = { editionKey: 'modern-en', chapterNumber: 5, paragraphIndex: 3, wordIndex: 7 }
  it('Two-page and Compare: the book reader’s deep link to the same place, in that layout', () => {
    expect(marginPreviewLayoutHref('frankenstein', 'two-page', place, 'original-en')).toBe('/reader?book=frankenstein&edition=modern-en&chapter=5&paragraph=3&word=7&compare=original-en&view=two-page')
    expect(marginPreviewLayoutHref('frankenstein', 'compare', place, 'modern-en')).toBe('/reader?book=frankenstein&edition=modern-en&chapter=5&paragraph=3&word=7&view=compare')
    const params = new URLSearchParams(marginPreviewLayoutHref('frankenstein', 'compare', place, 'original-en').split('?')[1])
    expect(deepLinkView(params)).toBe('compare')
    expect(readerHandoffFromUrlParams(params)).toMatchObject({ bookId: 'frankenstein', primaryEditionKey: 'modern-en', compareEditionKey: 'original-en', savedPlace: { chapterNumber: 5, paragraphIndex: 3, wordIndex: 7 }, startAtSavedPlace: true })
  })
  it('leaves the Classic reader choice alone for Two-page and Compare: their link keeps the book reader for that visit', () => {
    for (const classic of [false, true]) {
      for (const view of ['two-page', 'compare'] as const) {
        const search = marginPreviewLayoutHref('frankenstein', view, place, 'original-en').split('?')[1]
        expect(decide('?' + search, classic)).toMatchObject({ bookId: null, classic: null })
      }
      expect(decide('?book=frankenstein&view=two-page', classic)).toMatchObject({ bookId: null, classic: null })
    }
  })
  it('Margin from the book reader: margin view at that place, read once and dropped from the address', () => {
    const href = marginPreviewReturnHref('frankenstein', place)
    expect(href).toBe('/reader?book=frankenstein&margin=1&edition=modern-en&chapter=5&paragraph=3&word=7')
    expect(decide('?' + href.split('?')[1], true)).toEqual({ bookId: 'frankenstein', classic: 'clear', search: '?book=frankenstein&margin=1', consumeHandoff: false, at: { editionKey: 'modern-en', chapterNumber: 5, paragraphIndex: 3, wordIndex: 7 } })
    // Launch (22 Oct 2026): a plain chapter link opens margin view at the chapter too; the Classic reader keeps the book reader's own.
    expect(decide('?book=frankenstein&chapter=5').at).toEqual({ editionKey: null, chapterNumber: 5, paragraphIndex: 0, wordIndex: 0 })
    expect(decide('?book=frankenstein&chapter=5', true).bookId).toBeNull()
  })
  it('applies it on the page: the address loses the place, the Classic reader is cleared, the place is handed to the load', () => {
    localStorage.setItem(CLASSIC_READER_KEY, '1')
    window.history.replaceState(null, '', marginPreviewReturnHref('frankenstein', place))
    expect(marginPreviewBookForPage(isPreviewBook)).toBe('frankenstein')
    expect(window.location.search).toBe('?book=frankenstein&margin=1')
    expect(localStorage.getItem(CLASSIC_READER_KEY)).toBeNull()
    expect(marginPreviewAtForPage()).toEqual({ editionKey: 'modern-en', chapterNumber: 5, paragraphIndex: 3, wordIndex: 7 })
  })
  it('keeps the reader’s compare edition, else the book’s pair', () => {
    const book = getBook('frankenstein')!
    expect(marginPreviewCompareEdition(book, { compareOpen: true, compareEdition: 'original-en' }, 'modern-en')).toBe('original-en')
    expect(marginPreviewCompareEdition(book, { compareOpen: true, compareEdition: 'modern-en' }, 'modern-en')).not.toBe('modern-en')
  })
})

describe('loading at the named place', () => {
  beforeEach(() => { localStorage.clear() })
  const edition = JSON.parse(readFileSync(resolve(__dirname, '../../../public/data/editions/frankenstein-modern-en.json'), 'utf8')) as EditionData
  it('opens there, in that edition, newer than any place kept so far', async () => {
    const number = Number(edition.chapters[4].number)
    const loaded = await loadMarginPreviewBook('frankenstein', { storage: localStorage, readToken: async () => null, loadEditionImpl: async () => edition, at: { editionKey: 'modern-en', chapterNumber: number, paragraphIndex: 2, wordIndex: 3 }, now: () => 5000 })
    expect(loaded.editionKey).toBe('modern-en')
    expect(loaded.start).toEqual({ chapterNumber: number, paragraphIndex: 2, wordIndex: 3, updatedAt: 5000 })
  })
})
