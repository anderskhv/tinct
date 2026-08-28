import { chapterWordsFromText, type TimedWord } from './labFollow'

export interface SpeechBounds {
  start: number
  end: number
}

const WINDOW_SEC = 0.02
const RMS_THRESHOLD = 0.012
const EDGE_PAD_SEC = 0.04

function rmsWindow(data: Float32Array, from: number, to: number): number {
  const end = Math.min(to, data.length)
  if (end <= from) return 0
  let sum = 0
  for (let i = from; i < end; i++) sum += data[i] * data[i]
  return Math.sqrt(sum / (end - from))
}

/** Measure where narration starts and ends in a decoded clip (not the file padding). */
export function measureSpeechBounds(buffer: AudioBuffer): SpeechBounds {
  const data = buffer.getChannelData(0)
  const rate = buffer.sampleRate
  const window = Math.max(1, Math.floor(rate * WINDOW_SEC))
  const duration = data.length / rate
  if (duration <= 0) return { start: 0, end: 0 }

  let startSample = 0
  for (let i = 0; i < data.length; i += window) {
    if (rmsWindow(data, i, i + window) >= RMS_THRESHOLD) {
      startSample = i
      break
    }
  }

  let endSample = data.length - 1
  for (let i = data.length - window; i >= 0; i -= window) {
    if (rmsWindow(data, i, i + window) >= RMS_THRESHOLD) {
      endSample = Math.min(data.length - 1, i + window)
      break
    }
  }

  const start = Math.max(0, startSample / rate - EDGE_PAD_SEC)
  const end = Math.min(duration, endSample / rate + EDGE_PAD_SEC)
  if (end <= start) return { start: 0, end: duration }
  return { start, end }
}

/** Even word slices only inside measured speech — never across trailing MP3 pad. */
export function wordTimesFromMeasuredSpeech(
  text: string,
  bounds: SpeechBounds,
  fileDuration?: number,
): TimedWord[] | undefined {
  const tokens = chapterWordsFromText(text)
  if (tokens.length === 0) return undefined
  const cap = typeof fileDuration === 'number' && fileDuration > 0 ? fileDuration : bounds.end
  const speechEnd = Math.min(bounds.end, cap)
  const speechStart = Math.max(0, Math.min(bounds.start, speechEnd))
  const span = speechEnd - speechStart
  if (span <= 0) return undefined
  const unit = span / tokens.length
  return tokens.map((word, index) => ({
    text: word,
    start: speechStart + index * unit,
    end: speechStart + (index + 1) * unit,
  }))
}

export async function decodeAudioClip(url: string): Promise<AudioBuffer | null> {
  if (typeof AudioContext === 'undefined') return null
  const res = await fetch(url)
  if (!res.ok) return null
  const bytes = await res.arrayBuffer()
  const ctx = new AudioContext()
  try {
    return await ctx.decodeAudioData(bytes.slice(0))
  } catch {
    return null
  } finally {
    try { await ctx.close() } catch { /* jsdom */ }
  }
}

export async function measureWordTimesFromAudioUrl(
  text: string,
  url: string,
  fileDuration?: number,
): Promise<TimedWord[] | undefined> {
  const buffer = await decodeAudioClip(url)
  if (!buffer) return undefined
  const bounds = measureSpeechBounds(buffer)
  return wordTimesFromMeasuredSpeech(text, bounds, fileDuration ?? buffer.duration)
}
