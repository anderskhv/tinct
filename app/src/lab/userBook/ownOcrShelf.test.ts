/**
 * My shelf says "Recognising text…" under a scan whose text the account is
 * recognising, from the account's status (GET /api/user-books/ocr/{hex}); a
 * switch that is off (404), a job finished or never started, or an account that
 * cannot be asked says nothing. Only the scans this device keeps are asked about.
 */
import { describe, expect, it, vi } from 'vitest'
import { OCR_SHELF_LINE, ocrShelfLines } from './ownOcrShelf'

const [A, B, C, D] = ['a1', 'b2', 'c3', 'd4'].map(p => p.repeat(12))
const reply = (status: number, body?: unknown) => new Response(body === undefined ? null : JSON.stringify(body), { status })

describe('ocrShelfLines', () => {
  it('names the scans being recognised, asking the account once for each, with the reader’s token', async () => {
    const states: Record<string, Response> = {
      [A]: reply(200, { state: 'running', tier: 'premium' }),
      [B]: reply(200, { state: 'uploading', tier: 'premium' }),
      [C]: reply(200, { state: 'done', tier: 'premium' }),
      [D]: reply(200, { state: 'none', tier: 'premium' }),
    }
    const fetchImpl = vi.fn(async (url: string) => states[url.split('/').pop()!])
    const lines = await ocrShelfLines([A, B, C, D, A], { token: 'token-1', fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(lines).toEqual(new Map([[A, 'Recognising text…'], [B, 'Recognising text…']]))
    expect(OCR_SHELF_LINE).toBe('Recognising text…')
    expect(fetchImpl).toHaveBeenCalledTimes(4)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`/api/user-books/ocr/${A}`)
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-1')
  })

  it('says nothing when recognition is off (404), offline, signed out, or there is no scan', async () => {
    expect(await ocrShelfLines([A], { token: 'token-1', fetchImpl: (async () => reply(404, { error: 'Not found' })) as unknown as typeof fetch })).toEqual(new Map())
    expect(await ocrShelfLines([A], { token: 'token-1', fetchImpl: (async () => { throw new TypeError('offline') }) as unknown as typeof fetch })).toEqual(new Map())
    const never = vi.fn()
    expect(await ocrShelfLines([A], { token: null, fetchImpl: never as unknown as typeof fetch })).toEqual(new Map())
    expect(await ocrShelfLines([], { token: 'token-1', fetchImpl: never as unknown as typeof fetch })).toEqual(new Map())
    expect(never).not.toHaveBeenCalled()
  })
})
