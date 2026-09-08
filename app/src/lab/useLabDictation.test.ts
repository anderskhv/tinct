// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabDictation } from './useLabDictation'
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
it('dictates into the draft and ignores late recognition after stop or book switch', () => {
  let recognition: any
  class Recognition {
    onstart: any; onresult: any; onend: any; onerror: any
    start = vi.fn(); stop = vi.fn()
    constructor() { recognition = this }
  }
  vi.stubGlobal('SpeechRecognition', Recognition)
  const onDraft = vi.fn()
  const { result, rerender } = renderHook(({ book }) => useLabDictation(book, onDraft), { initialProps: { book: 'romeo-and-juliet' } })
  act(() => result.current.toggle('Tell me'))
  expect(result.current.state).toBe('starting')
  act(() => recognition.onstart())
  expect(result.current.state).toBe('listening')
  const lateResult = recognition.onresult
  act(() => recognition.onresult({ results: [{ 0: { transcript: 'about the feud' }, isFinal: false }] }))
  expect(onDraft).toHaveBeenLastCalledWith('Tell me about the feud')
  act(() => result.current.stop())
  act(() => lateResult({ results: [{ 0: { transcript: 'late words' }, isFinal: true }] }))
  expect(onDraft).toHaveBeenCalledTimes(1)
  expect(recognition.stop).toHaveBeenCalledTimes(1)
  act(() => result.current.toggle(''))
  const previous = recognition
  rerender({ book: 'bible' })
  expect(previous.stop).toHaveBeenCalledTimes(1)
  expect(result.current.state).toBe('idle')
})
it('reports unavailable dictation without starting a conversation', () => {
  vi.stubGlobal('SpeechRecognition', undefined)
  vi.stubGlobal('webkitSpeechRecognition', undefined)
  const { result } = renderHook(() => useLabDictation('bible', vi.fn()))
  act(() => result.current.toggle(''))
  expect(result.current.notice).toContain('unavailable')
  expect(result.current.state).toBe('idle')
})
