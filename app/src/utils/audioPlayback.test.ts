import { afterEach, describe, expect, it, vi } from 'vitest'
import { playAudioTransition, setAudioSource, shouldForceAudioLoad } from './audioPlayback'

type Listener = () => void

function fakeAudio(play: () => Promise<void>) {
  const listeners = new Map<string, Set<Listener>>()
  return {
    src: '',
    load: vi.fn(),
    play: vi.fn(play),
    addEventListener: vi.fn((name: string, fn: Listener) => {
      const set = listeners.get(name) ?? new Set<Listener>()
      set.add(fn)
      listeners.set(name, set)
    }),
    removeEventListener: vi.fn((name: string, fn: Listener) => listeners.get(name)?.delete(fn)),
    emit(name: string) { for (const fn of [...(listeners.get(name) ?? [])]) fn() },
  } as unknown as HTMLAudioElement & { emit: (name: string) => void }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('audio paragraph transitions', () => {
  it('does not force load in mobile web', () => {
    vi.stubGlobal('window', { Capacitor: { isNativePlatform: () => false, getPlatform: () => 'web' } })
    const audio = fakeAudio(async () => {})
    setAudioSource(audio, '/next.mp3')
    expect(audio.src).toBe('/next.mp3')
    expect(audio.load).not.toHaveBeenCalled()
    expect(shouldForceAudioLoad()).toBe(false)
  })

  it('retains the Android WebView forced reload', () => {
    vi.stubGlobal('window', { Capacitor: { isNativePlatform: () => true, getPlatform: () => 'android' } })
    const audio = fakeAudio(async () => {})
    setAudioSource(audio, '/next.mp3')
    expect(audio.load).toHaveBeenCalledTimes(1)
  })

  it('retries one transient transition rejection when media is ready', async () => {
    const audio = fakeAudio(vi.fn()
      .mockRejectedValueOnce(new DOMException('interrupted', 'AbortError'))
      .mockResolvedValueOnce(undefined))
    audio.src = '/next.mp3'
    const result = playAudioTransition(audio, '/next.mp3', () => true, undefined, 10_000)
    await Promise.resolve()
    audio.emit('canplay')
    await expect(result).resolves.toBe(true)
    expect(audio.play).toHaveBeenCalledTimes(2)
  })

  it('does not resume after an explicit pause cancels intent', async () => {
    let continuePlayback = true
    const audio = fakeAudio(vi.fn().mockRejectedValueOnce(new DOMException('interrupted', 'AbortError')))
    audio.src = '/next.mp3'
    const result = playAudioTransition(audio, '/next.mp3', () => continuePlayback, undefined, 10_000)
    await Promise.resolve()
    continuePlayback = false
    audio.emit('canplay')
    await expect(result).resolves.toBe(false)
    expect(audio.play).toHaveBeenCalledTimes(1)
  })

  it('does not start a transition after playback intent was already cleared', async () => {
    const audio = fakeAudio(async () => {})
    audio.src = '/next.mp3'
    await expect(playAudioTransition(audio, '/next.mp3', () => false)).resolves.toBe(false)
    expect(audio.play).not.toHaveBeenCalled()
  })
})
