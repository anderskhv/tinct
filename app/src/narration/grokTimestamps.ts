/** xAI timestamp envelopes are aligned to graphemes, not UTF-16 offsets. */
export interface GrokTimingEnvelope {
  audio: string
  content_type?: string
  duration: number
  audio_timestamps: { graph_chars: string[]; graph_times: number[][] }
}
export interface GrokWordSegment { text: string; start: number; end: number }

/** Preserve provider spans, including overlapping spans for normalized numbers.
 * Pronunciation replacements are deliberately unsupported: their graphemes
 * describe replacement text, which cannot safely highlight the original.
 */
export function grokWordSegments(payload: GrokTimingEnvelope, expectedText: string): GrokWordSegment[] {
  const chars = payload.audio_timestamps?.graph_chars
  const times = payload.audio_timestamps?.graph_times
  if (!Array.isArray(chars) || !Array.isArray(times) || chars.length !== times.length
    || chars.some(char => typeof char !== 'string') || chars.join('') !== expectedText
    || !Number.isFinite(payload.duration) || payload.duration <= 0) throw new Error('grok_timing_text_mismatch')
  const words: GrokWordSegment[] = []
  let current: GrokWordSegment | null = null
  const flush = () => { if (current) words.push(current); current = null }
  for (let index = 0; index < chars.length; index++) {
    const span = times[index]
    if (!Array.isArray(span) || span.length !== 2 || !span.every(Number.isFinite)
      || span[0] < 0 || span[1] < span[0] || span[1] > payload.duration + 0.1) throw new Error('grok_invalid_timing')
    for (const char of chars[index]) {
      if (/\s/u.test(char)) { flush(); continue }
      if (!current) current = { text: char, start: span[0], end: span[1] }
      else { current.text += char; current.start = Math.min(current.start, span[0]); current.end = Math.max(current.end, span[1]) }
    }
  }
  flush()
  if (!words.length || words.some((word, index) => index > 0 && word.start < words[index - 1].start)) throw new Error('grok_invalid_word_order')
  return words
}
