// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { ChainedVoiceSessionController } from './ChainedVoiceSessionController'
import { STREAMED_VOICE_EXPERIMENT } from './voiceLab'

const encode = (event: unknown) => new TextEncoder().encode('data: ' + JSON.stringify(event) + '\n\n')
function harness(tools: any[] = []) {
  const requests: { body: any; signal: AbortSignal; stream: ReadableStreamDefaultController<Uint8Array> }[] = []
  vi.stubGlobal('fetch', vi.fn((_url, init) => {
    let controller!: ReadableStreamDefaultController<Uint8Array>
    const stream = new ReadableStream<Uint8Array>({ start(c) { controller = c } })
    requests.push({ body: JSON.parse(init.body), signal: init.signal, stream: controller })
    return Promise.resolve(new Response(stream))
  }))
  const onTurn = vi.fn(), onApplicationTool = vi.fn().mockResolvedValue({ output: { ok: true, text: 'Evidence' } })
  const player = { busy: true, enqueue: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn() }
  const controller = new ChainedVoiceSessionController({ onSnapshot: vi.fn(), onTurn, onApplicationTool })
  const resumePlayback = vi.fn()
  Object.assign(controller, {
    ui: { ...controller.getSnapshot(), isActive: true },
    input: { voiceExperiment: STREAMED_VOICE_EXPERIMENT, authToken: 'test', context: { bookId: 'bible', bookTitle: 'Bible', bookAuthor: '', chapterLabel: 'Matthew 10', chapterText: 'Sparrows are in this chapter.' }, tools, audio: { resumePlayback } },
    player, anchor: { bookId: 'bible', chapterNumber: 1 },
  })
  return { controller, requests, player, onTurn, onApplicationTool, resumePlayback }
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })
it('streams the first complete thought before answer completion; yes is never discarded', async () => {
  const h = harness()
  h.controller.acceptUtterance('What did Keller say?')
  await vi.waitFor(() => expect(h.requests).toHaveLength(1))
  h.requests[0].stream.enqueue(encode({ type: 'response.output_text.delta', delta: 'Do you mean Tim Keller, the pastor? ' }))
  await vi.waitFor(() => expect(h.player.enqueue).toHaveBeenCalledWith('Do you mean Tim Keller, the pastor?'))
  h.controller.acceptUtterance('Yes')
  await vi.waitFor(() => expect(h.requests).toHaveLength(2))
  expect(h.requests[0].signal.aborted).toBe(true)
  expect(h.requests[1].body.messages.at(-1)).toEqual({ role: 'user', content: 'Yes' })
  expect(h.requests[1].body.instructions).toContain('Do you mean Tim Keller')
  expect(h.requests[1].body.instructions).toContain('NOT fully heard')
  h.controller.stop()
})
it('keeps research alive through status checks and an exact repeated question', async () => {
  const h = harness()
  h.controller.acceptUtterance('Has Keller written on suffering?')
  h.controller.acceptUtterance('Still looking?')
  h.controller.acceptUtterance('Has Keller written on suffering?')
  expect(h.requests).toHaveLength(1)
  expect(h.requests[0].signal.aborted).toBe(false)
  h.controller.stop()
})
it('cancels old work on correction and never speaks its late result', async () => {
  const h = harness()
  h.controller.acceptUtterance('Explain the sparrows.')
  h.controller.acceptUtterance('Actually explain the harvest.')
  h.requests[0].stream.enqueue(encode({ type: 'response.output_text.delta', delta: 'This old sparrow answer must never be spoken. ' }))
  h.requests[0].stream.close()
  h.requests[1].stream.enqueue(encode({ type: 'response.output_text.delta', delta: 'The harvest image makes urgency concrete. ' }))
  await vi.waitFor(() => expect(h.player.enqueue).toHaveBeenCalledWith('The harvest image makes urgency concrete.'))
  expect(h.player.enqueue).not.toHaveBeenCalledWith('This old sparrow answer must never be spoken.')
  h.controller.stop()
})
it('preserves transcription commit order even when completion events are reversed', async () => {
  vi.useFakeTimers()
  const h = harness()
  h.controller.handleEvent({ type: 'input_audio_buffer.committed', item_id: 'a' })
  h.controller.handleEvent({ type: 'input_audio_buffer.committed', item_id: 'b' })
  h.controller.handleEvent({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'b', transcript: 'Tim Keller?' })
  await vi.advanceTimersByTimeAsync(150)
  expect(h.requests).toHaveLength(0)
  h.controller.handleEvent({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'a', transcript: 'Has' })
  await vi.advanceTimersByTimeAsync(150)
  expect(h.requests[0].body.messages.at(-1).content).toBe('Has Tim Keller?')
  h.controller.stop()
})
it('continues after reader tools without a second research model', async () => {
  const h = harness([{ type: 'function', name: 'get_book_passage', parameters: {} }, { type: 'function', name: 'search_reading_sources' }, { type: 'function', name: 'ask_companion' }])
  h.controller.acceptUtterance('What was in the preceding chapter?')
  expect(h.requests[0].body.tools.map((x: any) => x.name)).toEqual(['get_book_passage'])
  const call = { type: 'function_call', name: 'get_book_passage', call_id: 'c1', arguments: '{}' }
  h.requests[0].stream.enqueue(encode({ type: 'response.output_item.done', item: call }))
  h.requests[0].stream.enqueue(encode({ type: 'response.completed', response: { output: [call] } }))
  h.requests[0].stream.close()
  await vi.waitFor(() => expect(h.requests).toHaveLength(2))
  expect(h.onApplicationTool).toHaveBeenCalledWith('get_book_passage', {}, 'c1')
  expect(h.requests[1].body.messages.at(-1).output).toContain('Evidence')
  h.controller.stop()
})
it('honors an explicit audiobook request and closes the voice turn', async () => {
  const h = harness([{ type: 'function', name: 'resume_audiobook', parameters: {} }])
  h.controller.acceptUtterance('Play the audiobook.')
  h.requests[0].stream.enqueue(encode({ type: 'response.output_item.done', item: { type: 'function_call', name: 'resume_audiobook', call_id: 'play', arguments: '{"play_audio":true}' } }))
  h.requests[0].stream.enqueue(encode({ type: 'response.completed' }))
  h.requests[0].stream.close()
  await vi.waitFor(() => expect(h.resumePlayback).toHaveBeenCalledWith({ bookId: 'bible', chapterNumber: 1 }, true))
  expect(h.controller.getSnapshot().isActive).toBe(false)
})

it('waits for an interruption transcript before executing a reader action', async () => {
  vi.useFakeTimers()
  const h = harness([{ type: 'function', name: 'resume_audiobook', parameters: {} }])
  h.controller.acceptUtterance('Play the audiobook.')
  h.controller.handleEvent({ type: 'input_audio_buffer.speech_started' })
  h.requests[0].stream.enqueue(encode({ type: 'response.output_item.done', item: { type: 'function_call', name: 'resume_audiobook', call_id: 'play', arguments: '{"play_audio":true}' } }))
  h.requests[0].stream.enqueue(encode({ type: 'response.completed' })); h.requests[0].stream.close()
  await vi.advanceTimersByTimeAsync(150)
  expect(h.resumePlayback).not.toHaveBeenCalled()
  h.controller.handleEvent({ type: 'input_audio_buffer.speech_stopped' })
  h.controller.handleEvent({ type: 'input_audio_buffer.committed', item_id: 'correction' })
  h.controller.handleEvent({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'correction', transcript: 'No, stay here.' })
  await vi.advanceTimersByTimeAsync(200)
  expect(h.resumePlayback).not.toHaveBeenCalled()
  expect(h.requests).toHaveLength(2)
  h.controller.stop()
})
