// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { LiveVoiceSessionController } from './LiveVoiceSessionController'
import type { StartVoiceSessionInput } from './VoiceSessionController'

afterEach(() => vi.useRealTimers())
it('keeps a paused and corrected question together until backend work begins', () => {
  vi.useFakeTimers()
  const onTurn = vi.fn()
  const controller = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn })
  controller.handleEvent({ type: 'session.input_transcript.delta', delta: 'Wait a second, has ' })
  vi.advanceTimersByTime(5000)
  expect(onTurn).not.toHaveBeenCalled()
  controller.handleEvent({ type: 'session.input_transcript.delta', delta: 'Tim Keller written on this topic?' })
  controller.handleEvent({ type: 'response.event', delegation_id: 'd1', event: { type: 'response.created' } })
  expect(onTurn).toHaveBeenLastCalledWith('user', 'Wait a second, has Tim Keller written on this topic?')
  controller.handleEvent({ type: 'session.output_transcript.delta', delta: 'His book ' })
  vi.advanceTimersByTime(5000)
  controller.handleEvent({ type: 'session.output_transcript.delta', delta: 'discusses suffering.' })
  controller.handleEvent({ type: 'session.input_transcript.delta', delta: 'Tell me more.' })
  expect(onTurn).toHaveBeenLastCalledWith('assistant', 'His book discusses suffering.')
  controller.stop()
  expect(onTurn).toHaveBeenLastCalledWith('user', 'Tell me more.')
  vi.runAllTimers()
  expect(onTurn).toHaveBeenCalledTimes(3)
})

it('does not persist replacement characters as a question', () => {
  const onTurn = vi.fn()
  const controller = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn })
  controller.handleEvent({ type: 'session.input_transcript.delta', delta: '\uFFFD' })
  controller.stop()
  expect(onTurn).not.toHaveBeenCalled()
})

it('collects function calls before an empty terminal snapshot and submits all outputs before continuation', async () => {
  const onApplicationTool = vi.fn().mockResolvedValue({ output: { ok: true }, responseInstructions: 'Use the source evidence.' })
  const controller = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn(), onApplicationTool })
  const sent: Array<{ type: string }> = []
  // Transport seam: avoid microphone and live API access in regression tests.
  Object.assign(controller, { ready: true, dc: { readyState: 'open', send: (value: string) => sent.push(JSON.parse(value)) }, input: { tools: [{ name: 'find_passage' }] } as StartVoiceSessionInput })
  controller.handleEvent({ type: 'response.event', delegation_id: 'd1', event: { type: 'response.created', response: { id: 'r1' } } })
  const call = { type: 'response.event', delegation_id: 'd1', event: { type: 'response.output_item.done', item: { type: 'function_call', name: 'find_passage', call_id: 'c1', arguments: '{}' } } }
  controller.handleEvent(call); controller.handleEvent(call)
  controller.handleEvent({ type: 'response.event', delegation_id: 'd1', event: { type: 'response.completed', response: { id: 'r1' } } })
  await vi.waitFor(() => expect(sent).toHaveLength(2))
  expect(onApplicationTool).toHaveBeenCalledOnce()
  expect(JSON.parse((sent[0] as any).item.output)).toEqual({ result: { ok: true }, responseInstructions: 'Use the source evidence.' })
  expect(sent.map(event => event.type)).toEqual(['response.item.create', 'response.create'])
})


it.each([false, true])('honors the navigation playback outcome (%s)', async (resumePlayback) => {
  const resume = vi.fn()
  const skip = vi.fn().mockResolvedValue({ resumePlayback })
  const controller = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn() })
  const anchor = { bookId: 'bible', editionKey: 'web-en', chapterNumber: 443, paragraphIndex: 1, paragraphNumber: 2, offsetSeconds: 0 }
  Object.assign(controller, { input: { context: anchor, audio: { skipPlayback: skip, resumePlayback: resume } }, anchor })
  controller.handleEvent({ type: 'response.event', delegation_id: 'd1', event: { type: 'response.created' } })
  controller.handleEvent({ type: 'response.event', delegation_id: 'd1', event: { type: 'response.output_item.done', item: { type: 'function_call', name: 'next_chapter', call_id: 'skip', arguments: '{}' } } })
  controller.handleEvent({ type: 'response.event', delegation_id: 'd1', event: { type: 'response.completed' } })
  await vi.waitFor(() => expect(skip).toHaveBeenCalledOnce())
  expect(resume).toHaveBeenCalledTimes(resumePlayback ? 1 : 0)
  if (resumePlayback) expect(resume).toHaveBeenCalledWith(anchor, undefined)
})


it.each([false, true])('uses explicit tool playback intent despite a garbled caption (%s)', async (playAudio) => {
  const resume = vi.fn()
  const controller = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn() })
  const anchor = { bookId: 'bible', editionKey: 'web-en', chapterNumber: 443, paragraphIndex: 1, paragraphNumber: 2, offsetSeconds: 0 }
  Object.assign(controller, { input: { context: anchor, audio: { resumePlayback: resume } }, anchor })
  controller.handleEvent({ type: 'session.input_transcript.delta', delta: 'Please \uFFFD audiobook' })
  controller.handleEvent({ type: 'response.event', delegation_id: 'd1', event: { type: 'response.created' } })
  controller.handleEvent({ type: 'response.event', delegation_id: 'd1', event: { type: 'response.output_item.done', item: { type: 'function_call', name: 'resume_audiobook', call_id: 'resume', arguments: JSON.stringify({ play_audio: playAudio }) } } })
  controller.handleEvent({ type: 'response.event', delegation_id: 'd1', event: { type: 'response.completed' } })
  await vi.waitFor(() => expect(resume).toHaveBeenCalledWith(anchor, playAudio))
})
