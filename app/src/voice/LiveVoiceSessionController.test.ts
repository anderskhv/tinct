// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { LiveVoiceSessionController } from './LiveVoiceSessionController'
import type { StartVoiceSessionInput } from './VoiceSessionController'

afterEach(() => vi.useRealTimers())
it('keeps overlapping input and output captions separate and flushes them on close', () => {
  vi.useFakeTimers()
  const onTurn = vi.fn()
  const controller = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn })
  controller.handleEvent({ type: 'session.input_transcript.delta', delta: 'What does ' })
  controller.handleEvent({ type: 'session.output_transcript.delta', delta: 'This means ' })
  controller.handleEvent({ type: 'session.input_transcript.delta', delta: 'this mean?' })
  controller.handleEvent({ type: 'session.output_transcript.delta', delta: 'something.' })
  controller.stop()
  expect(onTurn.mock.calls).toEqual([['user', 'What does this mean?'], ['assistant', 'This means something.']])
  vi.runAllTimers()
  expect(onTurn).toHaveBeenCalledTimes(2)
})

it('collects function calls before an empty terminal snapshot and submits all outputs before continuation', async () => {
  const onApplicationTool = vi.fn().mockResolvedValue({ output: { ok: true } })
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
  expect(sent.map(event => event.type)).toEqual(['response.item.create', 'response.create'])
})
