// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { acquireBrowserAudioSession } from './browserAudioSession'

afterEach(() => vi.unstubAllGlobals())

it('keeps capture mode through overlapping playback ownership and restores the original mode', () => {
  const audioSession = { type: 'auto' }
  vi.stubGlobal('navigator', { audioSession })
  const narration = acquireBrowserAudioSession('playback')
  expect(audioSession.type).toBe('playback')
  const talk = acquireBrowserAudioSession('play-and-record')
  narration()
  const resumed = acquireBrowserAudioSession('playback')
  expect(audioSession.type).toBe('play-and-record')
  talk()
  expect(audioSession.type).toBe('playback')
  narration() // Releasing an old owner cannot reset the current owner.
  expect(audioSession.type).toBe('playback')
  resumed()
  expect(audioSession.type).toBe('auto')
})

it('is harmless when the optional API is absent or rejects a mode', () => {
  vi.stubGlobal('navigator', {})
  expect(() => acquireBrowserAudioSession('playback')()).not.toThrow()
  vi.stubGlobal('navigator', { audioSession: { get type() { return 'auto' }, set type(_) { throw new Error('unsupported') } } })
  expect(() => acquireBrowserAudioSession('playback')()).not.toThrow()
})
