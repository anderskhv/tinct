import { describe, expect, it, vi } from 'vitest'
import { isFullPageImage, isImageScan, recogniseScan, samplePages, type PdfOps, type ScanOcrApi } from './scanRecognition'
import type { UserBookEdition } from './userEdition'

/**
 * Scans are read from their page images whatever text layer they carry (Anders, 3 Nov 2026:
 * "The Case for Christ" read "pOltrayed", "Andthis", "1 think" from its scanner's layer).
 */
const OPS: PdfOps = { save: 1, restore: 2, transform: 3, paintImageXObject: 4, paintInlineImageXObject: 5, paintImageMaskXObject: 6 }
const VIEW = [0, 0, 600, 800]
const scanPage = { fnArray: [1, 3, 4, 2], argsArray: [[], [600, 0, 0, 800, 0, 0], ['img'], []] }
const textPage = { fnArray: [1, 3, 4, 2], argsArray: [[], [200, 0, 0, 150, 50, 50], ['figure'], []] }

describe('telling a scan from a PDF with text of its own', () => {
  it('samples the first page, the eighth and the middle', () => {
    expect(samplePages(0)).toEqual([])
    expect(samplePages(1)).toEqual([1])
    expect(samplePages(5)).toEqual([1, 3, 5])
    expect(samplePages(400)).toEqual([1, 8, 200])
  })

  it('a page drawn as one image over most of it is a scanned page; a figure on a text page is not', () => {
    expect(isFullPageImage(scanPage.fnArray, scanPage.argsArray, VIEW, OPS)).toBe(true)
    expect(isFullPageImage(textPage.fnArray, textPage.argsArray, VIEW, OPS)).toBe(false)
    // The image's own transform after a scale of the page (nested matrices multiply).
    expect(isFullPageImage([1, 3, 3, 4, 2], [[], [2, 0, 0, 2, 0, 0], [300, 0, 0, 400, 0, 0], ['img'], []], VIEW, OPS)).toBe(true)
    // Restored before the image: the scale no longer applies.
    expect(isFullPageImage([1, 3, 2, 4], [[], [600, 0, 0, 800, 0, 0], [], ['img']], VIEW, OPS)).toBe(false)
  })

  it('is a scan only when every sampled page is a full-page image', async () => {
    const pdf = (pages: Record<number, typeof scanPage>) => ({
      numPages: 12,
      getPage: vi.fn(async (n: number) => ({ view: VIEW, getOperatorList: async () => pages[n] ?? scanPage, cleanup: vi.fn() })),
    })
    expect(await isImageScan(pdf({}), OPS)).toBe(true)
    const mixed = pdf({ 6: textPage })
    expect(await isImageScan(mixed, OPS)).toBe(false)
    expect(mixed.getPage.mock.calls.map(([n]) => n)).toEqual([1, 6])
  })
})

describe('recognising a scan, once its kind is known', () => {
  const recognised = { source: 'ocr', converter: 2, chapters: [] } as unknown as UserBookEdition
  const deps = (status: Awaited<ReturnType<ScanOcrApi['status']>>, edition: UserBookEdition | null = recognised) => {
    const keep = vi.fn(async () => {})
    const run = vi.fn(async () => edition)
    return { keep, run, api: { status: vi.fn(async () => status), edition: vi.fn(async () => edition) } }
  }

  it('starts by itself for Premium and the trial and keeps the text when it is ready', async () => {
    for (const tier of ['premium', 'trial']) {
      const d = deps({ state: 'none', tier, stored: true })
      expect(await recogniseScan('ab', d)).toBe('kept')
      expect(d.run).toHaveBeenCalledOnce()
      expect(d.keep).toHaveBeenCalledWith(recognised)
    }
    const going = deps({ state: 'running', tier: 'premium' }, null)
    expect(await recogniseScan('ab', going)).toBe('started')
    expect(going.keep).not.toHaveBeenCalled()
  })

  it('keeps text recognised on another device without sending anything', async () => {
    const d = deps({ state: 'done', tier: 'none' })
    expect(await recogniseScan('ab', d)).toBe('kept')
    expect(d.run).not.toHaveBeenCalled()
    expect(d.keep).toHaveBeenCalledWith(recognised)
  })

  it('starts nothing for a free account, with the switch off, offline, before the account copy is in, or past a month\'s ceiling', async () => {
    const cases: Array<[Awaited<ReturnType<ScanOcrApi['status']>>, string]> = [
      [{ state: 'none', tier: 'none', stored: true }, 'free'],
      [null, 'off'],
      [undefined, 'unavailable'],
      [{ state: 'none', tier: 'premium', stored: false }, 'not-stored'],
      [{ state: 'paused', tier: 'premium', reason: 'account_pages' }, 'paused'],
    ]
    for (const [status, outcome] of cases) {
      const d = deps(status)
      expect(await recogniseScan('ab', d)).toBe(outcome)
      expect(d.run).not.toHaveBeenCalled()
      expect(d.keep).not.toHaveBeenCalled()
    }
    // Premium back after it had lapsed: the paused job goes on.
    const back = deps({ state: 'paused', tier: 'premium', reason: 'premium_required' })
    expect(await recogniseScan('ab', back)).toBe('kept')
  })
})
