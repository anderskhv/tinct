/**
 * Recognising a scan's text answers the reader's yes at once (Anders, 20 Oct 2026): before the
 * account is asked, "Recognising text…" with a determinate bar of the book's pages, then the
 * bar follows the line's own count (pdf-ocr.js view and progress). Nothing is sent: no account.
 */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../', import.meta.url))
type Status = Record<string, unknown> & { state: string }
interface Ocr {
  SHELF: string
  view: (status: Status | null, local?: Record<string, unknown>, pages?: number) => { kind: string; text: string } | null
  progress: (status: Status | null, local?: Record<string, unknown>, pages?: number) => { done: number; total: number } | null
}
let ocr: Ocr
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/pdf-ocr.js')
  ocr = (globalThis as unknown as { TinctPdfOcr: Ocr }).TinctPdfOcr
})
const status = (state: string, extra: Record<string, unknown> = {}): Status => ({ state, pages: 250, uploaded: 0, done: 0, failed: 0, blank: 0, tier: 'premium', ...extra })

describe('the yes, before the account answers', () => {
  it('is "Recognising text…" (the shelf line) with a bar at 0 of the book\'s pages', () => {
    expect(ocr.view({ state: 'starting', tier: 'premium', pages: 0 }, {}, 42)).toEqual({ kind: 'progress', text: ocr.SHELF })
    expect(ocr.SHELF).toBe('Recognising text…')
    expect(ocr.progress({ state: 'starting', tier: 'premium', pages: 0 }, {}, 42)).toEqual({ done: 0, total: 42 })
  })
  it('has no bar while the number of pages is not known', () => {
    expect(ocr.progress({ state: 'starting', tier: 'premium', pages: 0 }, {}, 0)).toBeNull()
  })
})

describe('the bar follows the line\'s own count', () => {
  it('pages prepared while sending, then pages recognised', () => {
    expect(ocr.progress(status('uploading', { uploaded: 38, blank: 2 }))).toEqual({ done: 40, total: 250 })
    expect(ocr.progress(status('uploading', { uploaded: 10 }), { prepared: 40 })).toEqual({ done: 40, total: 250 })
    expect(ocr.progress(status('running', { uploaded: 248, blank: 2, done: 118 }))).toEqual({ done: 120, total: 250 })
    expect(ocr.progress(status('running', { done: 300 }))).toEqual({ done: 250, total: 250 })
  })
  it('none for a free account, a pause for the month, or a finished job', () => {
    expect(ocr.progress(status('running', { tier: 'none', done: 10 }))).toBeNull()
    expect(ocr.progress(status('paused', { reason: 'account_pages' }))).toBeNull()
    expect(ocr.progress(status('done', { done: 250 }))).toBeNull()
    expect(ocr.progress(null)).toBeNull()
  })
})
