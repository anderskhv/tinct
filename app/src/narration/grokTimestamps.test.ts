import { describe, it, expect } from 'vitest'
import { grokWordSegments } from './grokTimestamps'
function payload(text: string) {
  const chars = Array.from(text)
  return { audio: 'mock', duration: chars.length * .1, audio_timestamps: {
    graph_chars: chars, graph_times: chars.map((_, i) => [i * .1, (i + 1) * .1]),
  } }
}
describe('Grok character timestamps', () => {
  it('maps punctuation, curly quotes and Unicode without slicing UTF-16', () => {
    const text = '“Café!” 𝄞 — she said.'
    const words = grokWordSegments(payload(text), text)
    expect(words.map(word => word.text)).toEqual(['“Café!”', '𝄞', '—', 'she', 'said.'])
    expect(words.every(word => word.end >= word.start)).toBe(true)
  })
  it('retains the full normalized number span rather than shortening it to its last digit', () => {
    const p = payload('$5 today')
    p.audio_timestamps.graph_times[0] = [0, .4]
    p.audio_timestamps.graph_times[1] = [.1, .2]
    expect(grokWordSegments(p, '$5 today')[0]).toEqual({ text: '$5', start: 0, end: .4 })
  })
  it('rejects substituted or mismatched text and malformed timestamps', () => {
    expect(() => grokWordSegments(payload('Mobull'), 'Mobile')).toThrow()
    const p = payload('test'); p.audio_timestamps.graph_times[0] = [-1, 1]
    expect(() => grokWordSegments(p, 'test')).toThrow()
    expect(() => grokWordSegments({ ...payload('test'), duration: NaN }, 'test')).toThrow()
  })
})
