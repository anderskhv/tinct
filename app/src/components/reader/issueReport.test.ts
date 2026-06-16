import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { submitIssueReport } from './issueReport'

const baseInput = {
  bookId: 'odyssey',
  editionKey: 'original-en',
  chapterNumber: 3,
  paragraphIndex: 12,
  selectedText: 'rosy-fingered dawn',
  tag: 'typo',
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('submitIssueReport', () => {
  it('POSTs the report and returns the parsed reportId', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ reportId: 'r123' }) } as never)

    const result = await submitIssueReport({ ...baseInput, comment: 'hello' })
    expect(result.reportId).toBe('r123')

    const [, init] = fetchMock.mock.calls[0]
    expect(init?.method).toBe('POST')
    const body = JSON.parse(init?.body as string)
    expect(body).toMatchObject({ bookId: 'odyssey', tag: 'typo', comment: 'hello', paragraphIndex: 12 })
  })

  it('includes the Authorization header only when a token is given', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) } as never)

    await submitIssueReport({ ...baseInput, authToken: 'tok' })
    const withTok = (fetchMock.mock.calls[0][1]?.headers ?? {}) as Record<string, string>
    expect(withTok['Authorization']).toBe('Bearer tok')

    fetchMock.mockClear()
    await submitIssueReport(baseInput)
    const without = (fetchMock.mock.calls[0][1]?.headers ?? {}) as Record<string, string>
    expect(without['Authorization']).toBeUndefined()
  })

  it('throws on a non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as never)
    await expect(submitIssueReport(baseInput)).rejects.toThrow('500')
  })
})
