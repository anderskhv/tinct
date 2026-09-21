/** Test-only fixtures for the narration pilot. Not imported by app code. */

/** MPEG-1 Layer III, 128 kbps, 44.1 kHz, no padding: 417-byte frames of 1152 samples (~26.1 ms). */
export function syntheticMp3(frames: number): Uint8Array {
  const frameLength = 417
  const bytes = new Uint8Array(frames * frameLength)
  for (let i = 0; i < frames; i += 1) {
    const at = i * frameLength
    bytes[at] = 0xff
    bytes[at + 1] = 0xfb
    bytes[at + 2] = 0x90
    bytes[at + 3] = 0x00
  }
  return bytes
}

export const SYNTHETIC_FRAME_SECONDS = 1152 / 44100

/** Frames for a plausible narration pace of ~14 characters per second. */
export function framesForText(text: string): number {
  return Math.max(40, Math.ceil((text.length / 14) / SYNTHETIC_FRAME_SECONDS))
}

/** A Fish `/v1/tts/stream/with-timestamp` SSE body narrating `text` word by word. */
export function fishTimestampSseFor(text: string, options: { chunkSeq?: number; dropEvery?: number } = {}): string {
  const frames = framesForText(text)
  const duration = frames * SYNTHETIC_FRAME_SECONDS
  const audio = syntheticMp3(frames)
  const words = text.split(' ').filter(Boolean)
  const segments = words
    .map((word, index) => ({ text: word, start: round(duration * index / words.length), end: round(duration * (index + 1) / words.length) }))
    .filter((_, index) => !options.dropEvery || (index + 1) % options.dropEvery !== 0)
  const half = Math.floor(audio.length / 2)
  const first = { audio_base64: Buffer.from(audio.slice(0, half)).toString('base64'), chunk_seq: options.chunkSeq ?? 0, chunk_audio_offset_sec: 0, alignment: null }
  const second = {
    audio_base64: Buffer.from(audio.slice(half)).toString('base64'),
    chunk_seq: options.chunkSeq ?? 0,
    chunk_audio_offset_sec: 0,
    alignment: { audio_duration: round(duration), segments },
  }
  return `data: ${JSON.stringify(first)}\n\ndata: ${JSON.stringify(second)}\n\n`
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}
