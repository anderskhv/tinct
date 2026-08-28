import { describe, expect, it } from 'vitest'
import { measureSpeechBounds, wordTimesFromMeasuredSpeech } from './labAudioMeasure'

function syntheticBuffer(durationSec: number, speech: { start: number; end: number }, rate = 1000): AudioBuffer {
  const length = Math.ceil(durationSec * rate)
  const data = new Float32Array(length)
  const from = Math.floor(speech.start * rate)
  const to = Math.floor(speech.end * rate)
  for (let i = from; i < to; i++) data[i] = 0.25
  return {
    sampleRate: rate,
    length,
    duration: length / rate,
    numberOfChannels: 1,
    getChannelData: () => data,
  } as AudioBuffer
}

describe('labAudioMeasure', () => {
  it('finds speech inside leading and trailing silence', () => {
    const buffer = syntheticBuffer(10, { start: 2, end: 8 })
    const bounds = measureSpeechBounds(buffer)
    expect(bounds.start).toBeGreaterThanOrEqual(1.5)
    expect(bounds.start).toBeLessThan(2.5)
    expect(bounds.end).toBeGreaterThan(7.5)
    expect(bounds.end).toBeLessThanOrEqual(10)
  })

  it('maps words only across the measured speech span', () => {
    const words = wordTimesFromMeasuredSpeech('one two three four', { start: 2, end: 8 }, 10)
    expect(words).toHaveLength(4)
    expect(words?.[0].start).toBeCloseTo(2)
    expect(words?.[3].end).toBeCloseTo(8)
    expect(words?.[3].end).toBeLessThan(10)
  })
})
