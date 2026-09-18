// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { ChainSpeechPlayer } from './ChainSpeechPlayer'

function audio() {
  const sources: any[] = []
  const context = {
    state: 'running', currentTime: 0,
    createBuffer: (_: number, count: number, rate: number) => ({ duration: count / rate, getChannelData: () => new Float32Array(count) }),
    createBufferSource: () => { const source = { connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null as any }; sources.push(source); return source },
    resume: vi.fn().mockResolvedValue(undefined), suspend: vi.fn().mockResolvedValue(undefined),
  }
  return { context: context as any, sources }
}
afterEach(() => vi.useRealTimers())
it('schedules PCM before the response finishes and handles samples split across network chunks', async () => {
  const a = audio()
  let input!: ReadableStreamDefaultController<Uint8Array>
  const response = new Response(new ReadableStream({ start(c) { input = c } }))
  const completed = vi.fn()
  const player = new ChainSpeechPlayer(a.context, {} as any, async () => response, vi.fn(), completed, vi.fn(), vi.fn())
  player.enqueue('A complete thought.')
  input.enqueue(new Uint8Array([1, 0, 2]))
  await vi.waitFor(() => expect(a.sources).toHaveLength(1))
  expect(a.sources[0].start).toHaveBeenCalled()
  expect(completed).not.toHaveBeenCalled()
  input.enqueue(new Uint8Array([0])); input.close()
  await vi.waitFor(() => expect(a.sources).toHaveLength(2))
  a.sources.forEach(s => s.onended())
  await vi.waitFor(() => expect(completed).toHaveBeenCalledWith('A complete thought.'))
  player.cancel()
})
it('stops scheduled sound and discards late queued audio on interruption', async () => {
  const a = audio()
  let resolve!: (response: Response) => void
  const request = vi.fn().mockImplementationOnce(async () => new Response(new Uint8Array([1, 0])))
    .mockImplementationOnce(() => new Promise<Response>(r => { resolve = r }))
  const completed = vi.fn()
  const player = new ChainSpeechPlayer(a.context, {} as any, request, vi.fn(), completed, vi.fn(), vi.fn())
  player.enqueue('First thought.'); player.enqueue('Never heard.')
  await vi.waitFor(() => expect(a.sources).toHaveLength(1))
  player.cancel()
  expect(a.sources[0].stop).toHaveBeenCalled()
  resolve(new Response(new Uint8Array([2, 0])))
  await new Promise(r => setTimeout(r, 20))
  expect(a.sources).toHaveLength(1)
  expect(completed).not.toHaveBeenCalled()
})
