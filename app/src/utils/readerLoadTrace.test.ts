// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { markReaderLoadTrace, readerLoadTraceForTest, resetReaderLoadTraceForTest, startReaderLoadTrace } from './readerLoadTrace'

afterEach(() => {
  resetReaderLoadTraceForTest()
  window.history.replaceState({}, '', '/')
  vi.restoreAllMocks()
})

it('records only timing phases and categorical outcomes when explicitly enabled', () => {
  window.history.replaceState({}, '', '/reader?loadTrace=1')
  let current = 100
  vi.spyOn(performance, 'now').mockImplementation(() => current)
  startReaderLoadTrace()
  markReaderLoadTrace('auth_session_start', { startOf: 'auth' })
  current = 412
  markReaderLoadTrace('auth_session_resolved', { endOf: 'auth', outcome: 'session' })
  expect(readerLoadTraceForTest()).toEqual([
    { phase: 'reader_boot_start', atMs: 0 },
    { phase: 'auth_session_start', atMs: 0 },
    { phase: 'auth_session_resolved', atMs: 312, durationMs: 312, outcome: 'session' },
  ])
})

it('is inert unless perf or loadTrace is requested and ignores duplicate phases', () => {
  startReaderLoadTrace()
  markReaderLoadTrace('auth_session_start', { startOf: 'auth' })
  expect(readerLoadTraceForTest()).toEqual([])

  resetReaderLoadTraceForTest()
  window.history.replaceState({}, '', '/reader?perf=1')
  startReaderLoadTrace()
  markReaderLoadTrace('auth_session_start')
  markReaderLoadTrace('auth_session_start')
  expect(readerLoadTraceForTest().map(entry => entry.phase)).toEqual([
    'reader_boot_start',
    'auth_session_start',
  ])
})
