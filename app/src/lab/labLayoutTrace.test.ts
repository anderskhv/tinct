// @vitest-environment jsdom
import { createElement } from 'react'
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LAYOUT_TRACE_LOG_KEY,
  LAYOUT_TRACE_ON_KEY,
  TRACE_CAP,
  flushLayoutTraceForTest,
  installLayoutTraceListeners,
  layoutTrace,
  layoutTraceEntries,
  layoutTraceJson,
  layoutTraceOn,
  resetLayoutTraceForTest,
  tracePage,
} from './labLayoutTrace'
import { LabNativePaginator } from './LabNativePaginator'

beforeEach(() => {
  resetLayoutTraceForTest()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/reader')
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  resetLayoutTraceForTest()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
})

describe('layout trace, flag off', () => {
  it('records nothing, writes no storage and adds no listeners', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
    const addWindow = vi.spyOn(window, 'addEventListener')
    expect(layoutTraceOn()).toBe(false)
    layoutTrace('paint-shrink', { ch: 9 })
    const stop = installLayoutTraceListeners()
    stop()
    flushLayoutTraceForTest()
    expect(layoutTraceEntries()).toEqual([])
    expect(setItem).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()
    expect(addWindow).not.toHaveBeenCalled()
    expect(sessionStorage.length).toBe(0)
  })

  it('a paginator measures exactly as before: no trace entry, no storage', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const onPages = vi.fn()
    stubColumnLayout()
    render(createElement(LabNativePaginator, { chapterTitle: 'Chapter', paragraphs: ['one two three'], layoutKey: '9:web', onPages }))
    await waitFor(() => expect(onPages).toHaveBeenCalled())
    expect(layoutTraceEntries()).toEqual([])
    expect(setItem).not.toHaveBeenCalled()
  })
})

describe('layout trace, flag on', () => {
  it('turns on from ?layoutTrace=1 and stays on in this tab', () => {
    window.history.replaceState(null, '', '/reader?book=bible&layoutTrace=1')
    expect(layoutTraceOn()).toBe(true)
    expect(sessionStorage.getItem(LAYOUT_TRACE_ON_KEY)).toBe('1')
    resetLayoutTraceForTest()
    window.history.replaceState(null, '', '/reader?book=bible')
    expect(layoutTraceOn()).toBe(true)
  })

  it('?layoutTrace=0 turns it off and drops the saved trace', () => {
    sessionStorage.setItem(LAYOUT_TRACE_ON_KEY, '1')
    sessionStorage.setItem(LAYOUT_TRACE_LOG_KEY, '{"o":1,"e":[]}')
    window.history.replaceState(null, '', '/reader?layoutTrace=0')
    expect(layoutTraceOn()).toBe(false)
    expect(sessionStorage.getItem(LAYOUT_TRACE_ON_KEY)).toBeNull()
    expect(sessionStorage.getItem(LAYOUT_TRACE_LOG_KEY)).toBeNull()
  })

  it('stamps entries relative to the first, with the viewport and focus', () => {
    window.history.replaceState(null, '', '/reader?layoutTrace=1')
    let clock = 5000
    vi.spyOn(Date, 'now').mockImplementation(() => clock)
    layoutTrace('open', { card: 'card:character' })
    clock = 5250
    layoutTrace('close', { card: 'card:character' })
    const [first, second] = layoutTraceEntries()
    expect(first).toMatchObject({ t: 0, k: 'open', card: 'card:character', ih: window.innerHeight, ae: 'body', open: [] })
    expect(second).toMatchObject({ t: 250, k: 'close' })
    expect(Object.keys(first)).toEqual(expect.arrayContaining(['vh', 'vs', 'vo']))
  })

  it('keeps only the last entries (ring buffer) and survives a reload', () => {
    window.history.replaceState(null, '', '/reader?layoutTrace=1')
    for (let i = 0; i < TRACE_CAP + 50; i += 1) layoutTrace('page', { idx: i }, false)
    const entries = layoutTraceEntries()
    expect(entries).toHaveLength(TRACE_CAP)
    expect(entries[0].idx).toBe(50)
    expect(entries[TRACE_CAP - 1].idx).toBe(TRACE_CAP + 49)
    flushLayoutTraceForTest()
    resetLayoutTraceForTest()
    window.history.replaceState(null, '', '/reader')
    expect(layoutTraceOn()).toBe(true)
    expect(layoutTraceEntries()).toHaveLength(TRACE_CAP)
    expect(JSON.parse(layoutTraceJson()).e).toHaveLength(TRACE_CAP)
  })

  it('records the page map a paginator publishes, with the box it used', async () => {
    window.history.replaceState(null, '', '/reader?layoutTrace=1')
    const onPages = vi.fn()
    stubColumnLayout()
    render(createElement(LabNativePaginator, { chapterTitle: 'Chapter', paragraphs: ['one two three'], layoutKey: '9:web', onPages }))
    await waitFor(() => expect(onPages).toHaveBeenCalled())
    const kinds = layoutTraceEntries().map(entry => entry.k)
    expect(kinds).toContain('paginator-schedule')
    const map = layoutTraceEntries().find(entry => entry.k === 'native-map')
    expect(map).toMatchObject({ how: 'columns', n: 1, pw: 300, key: '9' })
  })

  it('names pages by indices only', () => {
    expect(tracePage({ paragraphIndex: 3, from: 4, to: 20, segments: [{ paragraphIndex: 3, from: 4, to: 20 }, { paragraphIndex: 4, from: 0, to: 7 }] })).toEqual([3, 4, 4, 7])
  })
})

/** A one-column layout jsdom cannot paint: every word on page 0 of a 300px column. */
function stubColumnLayout() {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => window.setTimeout(() => cb(0), 0))
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
  const rect = { left: 0, top: 0, right: 300, bottom: 600, width: 300, height: 600, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect)
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{ ...rect, width: 10, height: 10, right: 10, bottom: 10 }] as unknown as DOMRectList)
}
