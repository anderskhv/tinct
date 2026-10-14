// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IDLE_VOICE_SNAPSHOT, type VoiceUiSnapshot } from '../voice/session'

const mocks = vi.hoisted(() => ({ onSnapshot: null as null | ((s: VoiceUiSnapshot) => void) }))

vi.mock('../voice/GrokVoiceSessionController', () => ({
  GrokVoiceSessionController: class {
    constructor(callbacks: { onSnapshot: (s: VoiceUiSnapshot) => void }) { mocks.onSnapshot = callbacks.onSnapshot }
    getSnapshot() { return IDLE_VOICE_SNAPSHOT }
    getCaptureDiagnostics() { return {} }
    updateContext() {}
    unlockLabAudioContext() {}
    dispose() {}
    stop() {}
  },
}))

import { useVoiceSession, type UseVoiceSessionOptions } from './useVoiceSession'

const options = {
  authToken: null, isAnonymous: true, bookId: 'b', bookTitle: 'B', bookAuthor: 'A', chapterNumber: 1, chapterTitle: 'One',
  chapterParagraphs: ['p'], paragraphIndex: 0, visibleText: 'p', isAudioPlaying: false,
  pausePlayback: () => null, resumePlayback: () => {}, recordMessage: () => {}, appendLocalMessage: () => {},
  onNeedAuth: () => {}, onInsufficientBalance: () => {},
} as UseVoiceSessionOptions

const flush = () => act(() => new Promise(resolve => setTimeout(resolve, 0)))

describe('useVoiceSession screen wake lock', () => {
  let sentinels: Array<{ released: boolean; release: ReturnType<typeof vi.fn> }>
  let request: ReturnType<typeof vi.fn>
  let visibility: DocumentVisibilityState
  beforeEach(() => {
    sentinels = []
    visibility = 'visible'
    request = vi.fn(async () => {
      const s = { released: false, release: vi.fn(async () => { s.released = true }) }
      sentinels.push(s)
      return s
    })
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } })
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility })
  })
  afterEach(() => {
    delete (navigator as unknown as { wakeLock?: unknown }).wakeLock
    delete (document as unknown as { visibilityState?: unknown }).visibilityState
  })

  it('holds the lock while Talk is active, re-acquires on return, releases on end', async () => {
    renderHook(() => useVoiceSession(options))
    await flush()
    expect(request).not.toHaveBeenCalled()

    act(() => mocks.onSnapshot!({ ...IDLE_VOICE_SNAPSHOT, isActive: true, state: 'listening' }))
    await flush()
    expect(request).toHaveBeenCalledTimes(1)

    // Page hidden: the browser drops the lock; back to visible: it is requested again.
    visibility = 'hidden'
    sentinels[0].released = true
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    visibility = 'visible'
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    await flush()
    expect(request).toHaveBeenCalledTimes(2)

    // Talk ends (stop, close or error all return the idle snapshot).
    act(() => mocks.onSnapshot!({ ...IDLE_VOICE_SNAPSHOT, error: 'Microphone disconnected.' }))
    await flush()
    expect(sentinels[1].release).toHaveBeenCalledTimes(1)
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    await flush()
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('does not throw where the Wake Lock API is unsupported', async () => {
    delete (navigator as unknown as { wakeLock?: unknown }).wakeLock
    renderHook(() => useVoiceSession(options))
    expect(() => act(() => mocks.onSnapshot!({ ...IDLE_VOICE_SNAPSHOT, isActive: true }))).not.toThrow()
    expect(() => act(() => mocks.onSnapshot!(IDLE_VOICE_SNAPSHOT))).not.toThrow()
    await flush()
  })
})
