// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IDLE_VOICE_SNAPSHOT } from '../voice/session'

// Talk's session code loads when Talk is used, not with the reader's first
// page (15 Oct 2026). The reader warms it once its first page is up.
const mocks = vi.hoisted(() => ({
  constructed: 0,
  started: 0,
  adopted: [] as unknown[],
  unlocked: 0,
}))

vi.mock('../voice/GrokVoiceSessionController', () => ({
  GrokVoiceSessionController: class {
    constructor() { mocks.constructed += 1 }
    getSnapshot() { return { ...IDLE_VOICE_SNAPSHOT, isActive: mocks.started > 0 } }
    getCaptureDiagnostics() { return {} }
    updateContext() {}
    unlockLabAudioContext() { mocks.unlocked += 1 }
    adoptLabAudioContext(context: unknown) { mocks.adopted.push(context) }
    async start() { mocks.started += 1 }
    dispose() {}
    stop() {}
  },
}))

import { useVoiceSession, type UseVoiceSessionOptions } from './useVoiceSession'

const options = {
  authToken: 'token', isAnonymous: false, bookId: 'b', bookTitle: 'B', bookAuthor: 'A', chapterNumber: 1, chapterTitle: 'One',
  chapterParagraphs: ['p'], paragraphIndex: 0, visibleText: 'p', isAudioPlaying: false,
  pausePlayback: () => null, resumePlayback: () => {}, recordMessage: () => {}, appendLocalMessage: () => {},
  onNeedAuth: () => {}, onInsufficientBalance: () => {},
} as UseVoiceSessionOptions

const flush = () => act(() => new Promise(resolve => setTimeout(resolve, 0)))

afterEach(() => {
  mocks.constructed = 0
  mocks.started = 0
  mocks.adopted = []
  mocks.unlocked = 0
  vi.unstubAllGlobals()
})

describe('useVoiceSession loads Talk’s code on demand', () => {
  it('loads nothing while the reader holds it cold, and everything on Start', async () => {
    const { result } = renderHook(() => useVoiceSession({ ...options, warm: false }))
    await flush()
    expect(mocks.constructed).toBe(0)
    await act(async () => { await result.current.start() })
    expect(mocks.constructed).toBe(1)
    expect(mocks.started).toBe(1)
  })

  it('warms when asked, once', async () => {
    const { rerender } = renderHook(({ warm }) => useVoiceSession({ ...options, warm }), { initialProps: { warm: false } })
    await flush()
    expect(mocks.constructed).toBe(0)
    rerender({ warm: true })
    await flush()
    rerender({ warm: true })
    await flush()
    expect(mocks.constructed).toBe(1)
  })

  it('unlocks audio in the tap itself before the code has loaded, and hands that context over', async () => {
    const contexts: Array<{ state: string; resume: () => Promise<void>; close: () => Promise<void> }> = []
    vi.stubGlobal('AudioContext', class {
      state = 'suspended'
      constructor() { contexts.push(this as never) }
      resume() { this.state = 'running'; return Promise.resolve() }
      close() { this.state = 'closed'; return Promise.resolve() }
    })
    const { result } = renderHook(() => useVoiceSession({ ...options, warm: false }))
    await flush()
    // The tap: synchronous, before any code has loaded.
    act(() => { result.current.unlockAudio() })
    expect(contexts).toHaveLength(1)
    expect(contexts[0].state).toBe('running')
    await act(async () => { await result.current.start() })
    expect(mocks.adopted).toEqual([contexts[0]])
    expect(mocks.started).toBe(1)
  })
})
