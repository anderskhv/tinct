// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { emptyLabPositionState, type LabPositionState } from './labPosition'
import { LAB_POSITION_TAB_KEY, createLabPositionSync, putLabPositionCloud, readLabTabId } from './labPositionStore'

function state(paragraph: number): LabPositionState {
  return { ...emptyLabPositionState('device-1'), books: { master: { bookId: 'master', headerBook: 'master', chapterNumber: 2,
    sequentialChapter: 2, paragraphIndex: paragraph, wordIndex: 0, updatedAt: 1000 + paragraph, deviceId: 'device-1', rev: paragraph } },
  lastSettledBookId: 'master', lastSettledAt: 1000 + paragraph, updatedAt: 1000 + paragraph }
}

describe('position write labels for the server history', () => {
  afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })

  it('keeps one random tab id in sessionStorage and adds this page load', () => {
    const id = readLabTabId()
    expect(id).toMatch(/^[a-f0-9]{8}\.[a-f0-9]{4}$/)
    expect(sessionStorage.getItem(LAB_POSITION_TAB_KEY)).toBe(id.split('.')[0])
    expect(readLabTabId()).toBe(id)
  })

  it('sends tab, build and reason beside the record, leaving the record itself unchanged', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    const record = state(62)
    const before = JSON.stringify(record)
    await putLabPositionCloud('tok', record, { reason: 'page-turn' })
    await putLabPositionCloud('tok', record)
    const bodies = (fetchMock.mock.calls as unknown as [string, RequestInit][]).map(([, init]) => JSON.parse(String(init.body)))
    expect(bodies[0].client).toEqual({ tab: readLabTabId(), build: 'dev', reason: 'page-turn' })
    expect(bodies[1].client).toEqual({ tab: readLabTabId(), build: 'dev' })
    const { client: _client, ...sent } = bodies[0]
    expect(sent).toEqual(JSON.parse(before))
    expect(JSON.stringify(record)).toBe(before)
  })

  it('passes the reason through the sync queue, and labels a retried write', async () => {
    const put = vi.fn(async () => true)
    const sync = createLabPositionSync({ token: 'tok', online: () => true, put })
    sync.persist(state(62), { reason: 'hide', keepalive: true })
    await Promise.resolve()
    expect((put.mock.calls[0] as unknown[])[2]).toEqual({ reason: 'hide', keepalive: true })
    // A failed write leaves the record dirty; flushing it later is labelled a retry.
    put.mockResolvedValueOnce(false)
    sync.persist(state(70), {})
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(put).toHaveBeenCalledTimes(2)
    await sync.flush()
    expect(put).toHaveBeenCalledTimes(3)
    expect((put.mock.calls[2] as unknown[])[2]).toMatchObject({ reason: 'retry' })
  })
})
