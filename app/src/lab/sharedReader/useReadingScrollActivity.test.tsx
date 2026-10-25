// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useReadingScrollActivity } from './useReadingScrollActivity'

afterEach(() => vi.useRealTimers())
it('quiets chrome during scrolling and restores it after idle, including discrete wheel events', () => {
  vi.useFakeTimers()
  const host = document.createElement('div')
  const { result } = renderHook(() => useReadingScrollActivity(host))
  expect(result.current).toBe(false)
  act(() => host.dispatchEvent(new Event('scroll')))
  expect(result.current).toBe(true)
  act(() => vi.advanceTimersByTime(120))
  act(() => host.dispatchEvent(new Event('scroll')))
  act(() => vi.advanceTimersByTime(120))
  expect(result.current).toBe(true)
  act(() => vi.advanceTimersByTime(60))
  expect(result.current).toBe(false)
  act(() => host.dispatchEvent(new Event('scroll')))
  act(() => host.dispatchEvent(new Event('scrollend')))
  expect(result.current).toBe(true) // A discrete wheel scrollend must not cancel the visible feedback.
  act(() => vi.advanceTimersByTime(180))
  expect(result.current).toBe(false)
})
it('detaches old source hosts and respects disabled phone chrome', () => {
  vi.useFakeTimers()
  const first = document.createElement('div'), second = document.createElement('div')
  const { result, rerender, unmount } = renderHook(({ host, enabled }) => useReadingScrollActivity(host, enabled), { initialProps: { host: first, enabled: true } })
  act(() => first.dispatchEvent(new Event('scroll')))
  rerender({ host: second, enabled: true })
  expect(result.current).toBe(false)
  act(() => first.dispatchEvent(new Event('scroll')))
  expect(result.current).toBe(false)
  act(() => second.dispatchEvent(new Event('scroll')))
  expect(result.current).toBe(true)
  rerender({ host: second, enabled: false })
  act(() => second.dispatchEvent(new Event('scroll')))
  expect(result.current).toBe(false)
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})
