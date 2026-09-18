import { expect, it } from 'vitest'
import { readEvents, retainsPendingQuestion, sourceLinks, takeThought } from './chainProtocol'
import { parseVoiceExperiment, STREAMED_VOICE_EXPERIMENT } from './voiceLab'

it('reassembles fragmented SSE frames and UTF-8 without dropping a response', async () => {
  const bytes = new TextEncoder().encode('data: {"type":"delta","text":"Kierkegård"}\r\n\r\ndata: {"type":"done"}\n\n')
  const events: any[] = []
  await readEvents(new ReadableStream({ start(c) { for (const b of bytes) c.enqueue(new Uint8Array([b])); c.close() } }), e => events.push(e))
  expect(events).toEqual([{ type: 'delta', text: 'Kierkegård' }, { type: 'done' }])
})
it('starts after a whole thought but not a title, partial token or short lead-in', () => {
  expect(takeThought('Dr. Keller argued that suffering is not proof of guilt. There')).toEqual({ text: 'Dr. Keller argued that suffering is not proof of guilt.', rest: 'There' })
  expect(takeThought('The question is about providence')).toBeNull()
  expect(takeThought('The question is about providence.', true)?.text).toBe('The question is about providence.')
})
it('retains status/exact repeat while allowing clarification and correction to advance', () => {
  expect(retainsPendingQuestion('Still looking?', 'Has Keller written about this?')).toBe(true)
  expect(retainsPendingQuestion('Has Keller written about this?', 'Has Keller written about this?')).toBe(true)
  expect(retainsPendingQuestion('Yes', 'Did you mean Keller?')).toBe(false)
  expect(retainsPendingQuestion('No, I meant Kierkegaard', 'Has Keller written about this?')).toBe(false)
})
it('uses only real citation annotations, deduplicates links and rejects executable URLs', () => {
  expect(sourceLinks([{ type: 'url_citation', url: 'https://example.org/book', title: 'Book' }, { type: 'url_citation', url: 'https://example.org/book' }, { type: 'url_citation', url: 'javascript:alert(1)' }])).toBe('[Book](https://example.org/book)')
})
it('preserves chain transport in saved presets and rejects unknown transports', () => {
  expect(parseVoiceExperiment(JSON.parse(JSON.stringify(STREAMED_VOICE_EXPERIMENT)))).toEqual(STREAMED_VOICE_EXPERIMENT)
  expect(parseVoiceExperiment({ ...STREAMED_VOICE_EXPERIMENT, transport: 'unknown' })).toBeNull()
})
