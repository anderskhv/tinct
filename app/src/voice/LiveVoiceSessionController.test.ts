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


it('keeps backend prompts out of Live context after transcript and location updates', () => {
  const controller = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn() })
  const sent: Array<any> = []
  const context = { bookId: 'bible', bookTitle: 'The Bible', chapterLabel: 'Job 8', chapterNumber: 444, paragraphIndex: 0, visibleText: 'Old backend prompt' }
  Object.assign(controller, { ready: true, dc: { readyState: 'open', send: (value: string) => sent.push(JSON.parse(value)) }, input: { context, instructions: context.visibleText } })
  const prompt = 'You listen, reason and speak yourself. Full private conversation history.'
  controller.updateContext({ ...context, visibleText: prompt }, prompt)
  controller.updateContext({ ...context, visibleText: prompt + ' Updated turn.' }, prompt + ' Updated turn.')
  const frontend = sent.filter(event => event.type === 'session.thinking.append')
  expect(frontend).toHaveLength(1)
  expect(frontend[0].content).toContain('Job 8')
  expect(frontend[0].content).not.toContain('speak yourself')
  expect(frontend[0].content).not.toContain('conversation history')
  expect(sent.at(-1).session.delegation.responses.instructions).toBe(prompt + ' Updated turn.')
  controller.updateContext({ ...context, paragraphIndex: 1, visibleText: prompt }, prompt)
  expect(sent.filter(event => event.type === 'session.thinking.append')).toHaveLength(2)
})

it('sends the preparation welcome to Live once, without a Realtime response trigger', () => {
  const controller = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn() })
  const sent: Array<any> = []
  const greeting = 'Let’s prepare you for your reading of The Art of War.'
  Object.assign(controller, { dc: { readyState: 'open', send: (value: string) => sent.push(JSON.parse(value)) }, input: { greeting } })
  controller.handleEvent({ type: 'session.started' })
  controller.handleEvent({ type: 'session.started' })
  expect(sent).toHaveLength(1)
  expect(sent[0].type).toBe('session.instructions.append')
  expect(sent[0].delegation_id).toBeNull()
  expect(sent[0].content).toContain(greeting)
  expect(controller.getSnapshot().connection).toBe('connected')
})

it('counts one question across transcript fragments and stops before an eleventh question', () => {
  let used = 8
  const onBeforeUserTurn = vi.fn(() => { if (used >= 10) return false; used++; return true })
  const onTurn = vi.fn()
  const controller = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn, onBeforeUserTurn })
  const stop = vi.spyOn(controller, 'stop')
  for (let question=0;question<2;question++) {
    controller.handleEvent({ type:'session.input_transcript.delta',delta:'Why ' })
    controller.handleEvent({ type:'session.input_transcript.delta',delta:'this passage?' })
    controller.handleEvent({ type:'response.event',delegation_id:'q'+question,event:{type:'response.created'} })
  }
  expect(used).toBe(10)
  expect(onBeforeUserTurn).toHaveBeenCalledTimes(2)
  expect(onTurn).toHaveBeenCalledTimes(2)
  controller.handleEvent({type:'session.input_transcript.delta',delta:'One more?'})
  expect(stop).toHaveBeenCalledOnce()
  expect(used).toBe(10)
  expect(onTurn).toHaveBeenCalledTimes(2)
})

it('collects experiment backend and spoken output separately without changing normal sessions', () => {
  const onVoiceDiagnostic = vi.fn()
  const c = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn(), onVoiceDiagnostic })
  c.handleEvent({ type: 'session.output_transcript.delta', delta: 'Normal' })
  expect(onVoiceDiagnostic).not.toHaveBeenCalled()
  Object.assign(c, { input: { voiceExperiment: { label: 'Test' } } })
  c.handleEvent({ type: 'session.output_transcript.delta', delta: 'Spoken' })
  c.handleEvent({ type: 'response.event', delegation_id: 'd', event: { type: 'response.output_text.delta', delta: 'Backend' } })
  expect(onVoiceDiagnostic.mock.calls.map(call => call[0])).toEqual([
    expect.objectContaining({ type: 'assistant.transcript', text: 'Spoken' }),
    expect.objectContaining({ type: 'backend.text', text: 'Backend', id: 'd' }),
  ])
})

it('publishes reader location at connection, before the first question', () => {
  const c = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn() })
  const sent: any[] = []
  Object.assign(c, { dc: { readyState: 'open', send: (x: string) => sent.push(JSON.parse(x)) }, input: { context: { bookTitle: 'The Bible', chapterLabel: 'Genesis 1', chapterNumber: 1 } } })
  c.handleEvent({ type: 'session.started' })
  c.handleEvent({ type: 'session.started' })
  expect(sent).toHaveLength(1)
  expect(sent[0]).toMatchObject({ type: 'session.thinking.append', delegation_id: null })
  expect(sent[0].content).toContain('Genesis 1')
})

it('keeps an old search continuation attached to its original turn after a Keller follow-up', async () => {
  const onTurn = vi.fn(), onVoiceDiagnostic = vi.fn(), onBeforeUserTurn = vi.fn(() => true)
  const c = new LiveVoiceSessionController({ onSnapshot: vi.fn(), onTurn, onVoiceDiagnostic, onBeforeUserTurn })
  const sent: any[] = []
  let resolveSearch!: (x: unknown) => void
  const search = vi.spyOn(c as any, 'runTool').mockImplementation(() => new Promise(resolve => { resolveSearch = resolve }))
  Object.assign(c, { ready: true, dc: { readyState: 'open', send: (x: string) => sent.push(JSON.parse(x)) }, input: { voiceExperiment: { label: 'Regression' } } })
  const backend = (id: string, event: any) => c.handleEvent({ type: 'response.event', delegation_id: id, event })
  c.handleEvent({ type: 'session.input_transcript.delta', delta: 'Compare creation stories.' })
  backend('old', { type: 'response.created' })
  backend('old', { type: 'response.output_item.done', item: { type: 'function_call', name: 'search_reading_sources', call_id: 'search', arguments: '{}' } })
  backend('old', { type: 'response.completed' })
  await vi.waitFor(() => expect(search).toHaveBeenCalledOnce())
  c.handleEvent({ type: 'session.output_transcript.delta', delta: 'An initial comparison.' })
  c.handleEvent({ type: 'session.input_transcript.delta', delta: 'Has Tim Keller ' })
  resolveSearch({ result: { ok: false, reason: 'search_unavailable' } })
  await vi.waitFor(() => expect(sent.some(e => e.type === 'response.item.create')).toBe(true))
  const result = JSON.parse(sent.find(e => e.type === 'response.item.create').item.output)
  expect(result.superseded).toBe(true)
  expect(result.result.result.reason).toBe('search_unavailable')
  backend('old', { type: 'response.created' })
  backend('old', { type: 'response.output_text.delta', delta: 'Could not verify the old comparison.' })
  backend('old', { type: 'response.completed' })
  c.handleEvent({ type: 'session.input_transcript.delta', delta: 'spoken about this?' })
  backend('keller', { type: 'response.created' })
  backend('keller', { type: 'response.output_text.delta', delta: 'Keller discusses this in a sermon.' })
  expect(onBeforeUserTurn).toHaveBeenCalledTimes(2)
  expect(onTurn).toHaveBeenCalledWith('user', 'Has Tim Keller spoken about this?')
  const superseded = onVoiceDiagnostic.mock.calls.map(([e]) => e).filter(e => e.type === 'response.superseded')
  expect(superseded).toEqual([expect.objectContaining({ id: 'old' })])
  expect(sent.some(e => e.type === 'session.instructions.append' && e.content.includes('Do not speak that earlier answer'))).toBe(true)
  expect(sent.filter(e => e.type === 'response.create')).toHaveLength(1)
})
