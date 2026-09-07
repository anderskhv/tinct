import { describe, expect, it, vi } from 'vitest'
import { LAB_RECAP_ROUTE, type LabRecapRequest } from '../recapSummary'
import {
  RECAP_SUMMARY_STORAGE_KEY,
  RECAP_SUMMARY_STORAGE_MAX,
  readStoredRecapSummary,
  requestLabRecapSummary,
  storeRecapSummary,
} from './recapSummaryClient'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value) },
    dump: () => Object.fromEntries(map),
  }
}

const request: LabRecapRequest = { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 645, paragraphIndex: 3, completed: false, bookTitle: 'The Bible' }

describe('stored recap summaries', () => {
  it('round-trips a summary under its key and ignores garbage', () => {
    const storage = memoryStorage()
    expect(readStoredRecapSummary(storage, 'k1')).toBeNull()
    storeRecapSummary(storage, 'k1', 'So far the proverbs contrast the quiet home with the house full of strife.', 1000)
    expect(readStoredRecapSummary(storage, 'k1')).toMatch(/^So far/)
    storage.setItem(RECAP_SUMMARY_STORAGE_KEY, '{not json')
    expect(readStoredRecapSummary(storage, 'k1')).toBeNull()
    expect(readStoredRecapSummary(null, 'k1')).toBeNull()
  })

  it('keeps only the newest entries', () => {
    const storage = memoryStorage()
    for (let index = 0; index < RECAP_SUMMARY_STORAGE_MAX + 5; index += 1) storeRecapSummary(storage, `k${index}`, `summary ${index}`, index)
    expect(readStoredRecapSummary(storage, 'k0')).toBeNull()
    expect(readStoredRecapSummary(storage, 'k4')).toBeNull()
    expect(readStoredRecapSummary(storage, 'k5')).toBe('summary 5')
    expect(readStoredRecapSummary(storage, `k${RECAP_SUMMARY_STORAGE_MAX + 4}`)).toBe(`summary ${RECAP_SUMMARY_STORAGE_MAX + 4}`)
  })
})

describe('requestLabRecapSummary', () => {
  it('posts the place to the recap route with the bearer token and returns the summary', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ summary: '  The chapter opens with … ', coverage: { chapterNumber: 645, throughParagraph: 3, paragraphCount: 6, complete: false, fromChapterNumber: null }, model: 'claude-sonnet-5', version: 'lab-recap-v1', cached: false }),
    }))
    const result = await requestLabRecapSummary({ request, token: 'jwt', fetchImpl })
    expect(result).toMatchObject({ ok: true, response: { summary: 'The chapter opens with …', cached: false } })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(LAB_RECAP_ROUTE)
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer jwt')
    expect(JSON.parse(String(init.body))).toEqual(request)
  })

  it('sends no Authorization header when signed out', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ summary: 'x', coverage: {} }) }))
    await requestLabRecapSummary({ request, token: null, fetchImpl })
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.headers).not.toHaveProperty('Authorization')
  })

  it('reports failures instead of fabricating a line', async () => {
    const failing = vi.fn(async () => ({ ok: false, status: 502, json: async () => ({ error: 'Summary unavailable' }) }))
    expect(await requestLabRecapSummary({ request, fetchImpl: failing })).toEqual({ ok: false, error: 'recap route returned 502' })
    const empty = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ summary: '', coverage: {} }) }))
    expect(await requestLabRecapSummary({ request, fetchImpl: empty })).toEqual({ ok: false, error: 'recap route returned no summary' })
    const throwing = vi.fn(async () => { throw new Error('offline') })
    expect(await requestLabRecapSummary({ request, fetchImpl: throwing })).toEqual({ ok: false, error: 'offline' })
  })
})
