// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { setUsageReportTransport } from '../utils/usageReport'
import { useLabListenReport } from './useLabListenReport'

afterEach(() => {
  cleanup()
  setUsageReportTransport(null)
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const reported = (post: ReturnType<typeof vi.fn>) => post.mock.calls.map(call => (call[1] as { seconds: number }).seconds)

describe('useLabListenReport', () => {
  it('reports every five minutes of playback, then the rest on hide, with the same total', () => {
    vi.useFakeTimers()
    const post = vi.fn()
    setUsageReportTransport(post)
    renderHook(() => useLabListenReport(true, 'odyssey'))
    act(() => { vi.advanceTimersByTime(4 * 60_000) })
    expect(post).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(60_000) })
    expect(reported(post)).toEqual([300])
    act(() => { vi.advanceTimersByTime(40_000) })
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    visibility.mockRestore()
    expect(reported(post)).toEqual([300, 40])
    // pagehide right after sends nothing new (nothing pending).
    act(() => { window.dispatchEvent(new Event('pagehide')) })
    expect(reported(post)).toEqual([300, 40])
  })

  it('flushes on pagehide and on stop', () => {
    vi.useFakeTimers()
    const post = vi.fn()
    setUsageReportTransport(post)
    const { rerender } = renderHook(({ playing }) => useLabListenReport(playing, 'iliad'), { initialProps: { playing: true } })
    act(() => { vi.advanceTimersByTime(20_000) })
    act(() => { window.dispatchEvent(new Event('pagehide')) })
    expect(reported(post)).toEqual([20])
    act(() => { vi.advanceTimersByTime(15_000) })
    rerender({ playing: false })
    expect(reported(post)).toEqual([20, 15])
    expect(post.mock.calls[0][0]).toBe('/api/narration/listen')
  })
})
