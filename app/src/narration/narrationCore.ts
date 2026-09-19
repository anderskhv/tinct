/**
 * Fish Audio narration pilot — provider-neutral core shared by the Worker and
 * the reader. Everything here is pure: no fetch, no storage, no DOM.
 *
 * Contract summary (see docs/fish-audio-pilot-2026-09-18.md):
 *  - The narration text of a paragraph is derived from the exact displayed
 *    paragraph by `narrationTextForParagraph`. Its SHA-256 (`textHash`) is the
 *    reader's and the Worker's shared proof that they talk about the same words.
 *  - A cached recording is addressed by `narrationCacheIdentity`, which hashes
 *    the narration text together with provider, model, voice and every setting
 *    that changes the audio. Any change to any of those yields a new identity;
 *    stale audio is therefore never looked up, let alone played.
 *  - Provider timings are mapped onto the reader's whitespace tokens by
 *    `alignSegmentsToTokens`; nothing invents a word time outside a span the
 *    provider reported, and the match ratio is recorded next to the words.
 */

import { stripUnderscoreEmphasis } from '../lab/labEmphasis'

/** Bump when the cache layout or validation rules change incompatibly. */
export const NARRATION_CACHE_VERSION = 2

/** Bump when `chunkNarrationTokens` changes where it cuts; chunk audio depends on it. */
export const NARRATION_CHUNKER_VERSION = 1

export const NARRATION_PROVIDER = 'fish' as const

/**
 * Narration scope: the library's featured ("popular") shelf, English editions,
 * every chapter. Kept as a plain list so the Worker bundle does not pull the
 * catalogue in; `narrationScope.test.ts` pins it to `LAB_POPULAR_BOOK_IDS`.
 */
export const NARRATION_SCOPE_BOOK_IDS: readonly string[] = [
  'odyssey',
  'hamlet',
  'the-republic',
  'pride-and-prejudice',
  'bible',
  'frankenstein',
  'the-art-of-war',
  'the-histories',
  'crime-and-punishment',
  'jane-eyre',
  'meditations',
  'moby-dick',
  'divine-comedy',
  'iliad',
  'walden',
  'frederick-douglass',
]

export const NARRATION_PILOT_SCOPE = {
  bookIds: NARRATION_SCOPE_BOOK_IDS,
  editionKeyPattern: '^[a-z0-9-]+-en$',
} as const

/** Sentence groups handed to the provider are at most this long (Fish's own chunk ceiling). */
export const NARRATION_CHUNK_MAX_CHARS = 300

/** Word-level follow needs this share of tokens matched to provider timings. */
export const NARRATION_WORD_MATCH_THRESHOLD = 0.85

/** Paragraphs a reader may ask for in one ensure request. */
export const NARRATION_MAX_PARAGRAPHS_PER_REQUEST = 3

/** Fish Audio request settings that affect the produced audio (part of the identity). */
export interface NarrationSynthesisSettings {
  format: 'mp3'
  mp3Bitrate: 64 | 128 | 192
  latency: 'normal' | 'balanced' | 'low'
  normalize: boolean
  temperature: number
  topP: number
  speed: number
  chunkLength: number
}

export const DEFAULT_NARRATION_SETTINGS: NarrationSynthesisSettings = {
  format: 'mp3',
  mp3Bitrate: 128,
  latency: 'normal',
  normalize: true,
  temperature: 0.5,
  topP: 0.7,
  speed: 1,
  chunkLength: 300,
}

export interface NarrationIdentityInput {
  provider: typeof NARRATION_PROVIDER
  model: string
  voiceId: string
  text: string
  settings: NarrationSynthesisSettings
}

export function isPilotScope(bookId: string, editionKey: string, chapter: number): boolean {
  return NARRATION_SCOPE_BOOK_IDS.includes(bookId)
    && /^[a-z0-9-]+-en$/.test(editionKey)
    && Number.isInteger(chapter) && chapter >= 1
}

/**
 * The exact text the narrator speaks for one displayed paragraph.
 * Matched Gutenberg `_..._` emphasis pairs are dropped (the reader never
 * paints them) and whitespace runs collapse to one space. Nothing else is
 * touched, so `narrationTokens(text)` equals the reader's painted token list
 * word for word.
 */
export function narrationTextForParagraph(paragraph: string): string {
  return stripUnderscoreEmphasis(paragraph).text.replace(/\s+/g, ' ').trim()
}

/** Whitespace tokens of the narration text — one per painted word. */
export function narrationTokens(paragraph: string): string[] {
  const text = narrationTextForParagraph(paragraph)
  return text.length === 0 ? [] : text.split(' ')
}

/**
 * Printed but never spoken: Bible verse numbers as standalone superscript
 * digits. They stay in the token list (the reader paints them and indexes by
 * position) but never reach the narrator, and get no timing of their own;
 * the reader's `alignTimedWordsToText` gives them a zero-length time at the
 * next spoken word.
 */
export function isSilentNarrationToken(token: string): boolean {
  return /^[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/.test(token)
}

/** The spoken words of a token range: what the provider is sent. */
export function spokenText(tokens: string[], from = 0, to = tokens.length): string {
  return tokens.slice(from, to).filter(token => !isSilentNarrationToken(token)).join(' ')
}

/** UTF-8 byte length — Fish bills TTS per million UTF-8 bytes of input text. */
export function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

/** Canonical JSON with sorted keys so identical inputs always hash identically. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export interface NarrationIdentity {
  /** Hex SHA-256 over the canonical identity document. */
  hash: string
  /** Hex SHA-256 of the narration text alone. */
  textHash: string
  document: string
}

export async function narrationCacheIdentity(input: NarrationIdentityInput): Promise<NarrationIdentity> {
  const document = canonicalJson({
    v: NARRATION_CACHE_VERSION,
    provider: input.provider,
    model: input.model,
    voiceId: input.voiceId,
    text: input.text,
    settings: input.settings,
  })
  const [hash, textHash] = await Promise.all([sha256Hex(document), sha256Hex(input.text)])
  return { hash, textHash, document }
}

/** R2 object keys for a cached recording and its explicit edition mapping. */
export function narrationBlobKeys(hash: string): { audio: string; meta: string } {
  return {
    audio: `narration/${NARRATION_PROVIDER}/blob/${hash}.mp3`,
    meta: `narration/${NARRATION_PROVIDER}/blob/${hash}.json`,
  }
}

export function narrationMapKey(
  bookId: string,
  editionKey: string,
  chapter: number,
  voiceKey: string,
  paragraphIndex: number,
): string {
  return `narration/${NARRATION_PROVIDER}/map/${bookId}/${editionKey}/ch${chapter}/${voiceKey}/p${paragraphIndex}.json`
}

export function narrationMapPrefix(bookId: string, editionKey: string, chapter: number, voiceKey: string): string {
  return `narration/${NARRATION_PROVIDER}/map/${bookId}/${editionKey}/ch${chapter}/${voiceKey}/`
}

/** Public URL (same `/api/audio-file` route as Kokoro audio) for a cached blob. */
export function narrationAudioPath(hash: string): string {
  return narrationBlobKeys(hash).audio
}

// ===== Provider timing → reader token alignment =====

export interface TimingSegment {
  text: string
  start: number
  end: number
}

export interface AlignedWord {
  text: string
  start: number
  end: number
}

export interface TokenAlignmentStats {
  expectedWords: number
  heardWords: number
  matchedWords: number
  matchRatio: number
  /** Position (among spoken tokens) of the last token the provider timed; -1 when none. */
  lastMatchedWord?: number
}

export interface TokenAlignment {
  words: AlignedWord[]
  alignment: TokenAlignmentStats
}

/** Letters and digits only, case-folded: `can’t` and `cant` compare equal. */
export function alignmentKey(text: string): string {
  return text.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
}

const MAX_GLUE = 4
const RESYNC_WINDOW = 4

interface Slot {
  text: string
  key: string
  start?: number
  end?: number
  matched: boolean
}

function spreadAcross(slots: Slot[], indexes: number[], start: number, end: number): void {
  const lengths = indexes.map(index => Math.max(1, slots[index].key.length))
  const total = lengths.reduce((sum, length) => sum + length, 0)
  let cursor = start
  indexes.forEach((index, position) => {
    const share = (end - start) * (lengths[position] / total)
    slots[index].start = cursor
    slots[index].end = position === indexes.length - 1 ? end : cursor + share
    cursor += share
  })
}

/**
 * Map provider timing segments (absolute seconds) onto the narration tokens.
 *
 * Exact key matches win. A token glued from several segments (`wage-labour`
 * heard `wage` `labour`) takes the span of those segments; a segment covering
 * several tokens (`every one` heard `everyone`) shares its span between them in
 * proportion to their length. Punctuation-only tokens are silent: they take a
 * zero-length time at the next spoken word and are not counted. When the two
 * streams disagree, the aligner looks a few items ahead for the next exact
 * match; tokens skipped that way are interpolated between the surrounding
 * matched spans and counted as unmatched, which lowers `matchRatio`. Nothing
 * is timed outside the first and last span the provider reported.
 */
export function alignSegmentsToTokens(tokens: string[], segments: TimingSegment[], audioDuration?: number): TokenAlignment {
  const slots: Slot[] = tokens.map(text => ({ text, key: alignmentKey(text), matched: false }))
  const heard = segments
    .map(segment => ({ key: alignmentKey(segment.text), start: segment.start, end: Math.max(segment.start, segment.end) }))
    .filter(segment => segment.key.length > 0 && Number.isFinite(segment.start) && Number.isFinite(segment.end))
  const spoken = slots.map((slot, index) => (slot.key.length > 0 ? index : -1)).filter(index => index >= 0)

  let si = 0
  let j = 0
  let matched = 0
  const markMatched = (index: number) => { slots[index].matched = true; matched += 1 }
  while (si < spoken.length && j < heard.length) {
    const slot = slots[spoken[si]]
    if (slot.key === heard[j].key) {
      slot.start = heard[j].start
      slot.end = heard[j].end
      markMatched(spoken[si])
      si += 1
      j += 1
      continue
    }
    let advanced = false
    // One token glued from the next k heard segments.
    for (let k = 2; k <= MAX_GLUE && j + k <= heard.length; k += 1) {
      const glued = heard.slice(j, j + k).map(item => item.key).join('')
      if (glued.length > slot.key.length) break
      if (glued === slot.key) {
        slot.start = heard[j].start
        slot.end = heard[j + k - 1].end
        markMatched(spoken[si])
        si += 1
        j += k
        advanced = true
        break
      }
    }
    if (advanced) continue
    // One heard segment covering the next k tokens.
    for (let k = 2; k <= MAX_GLUE && si + k <= spoken.length; k += 1) {
      const indexes = spoken.slice(si, si + k)
      const glued = indexes.map(index => slots[index].key).join('')
      if (glued.length > heard[j].key.length) break
      if (glued === heard[j].key) {
        spreadAcross(slots, indexes, heard[j].start, heard[j].end)
        indexes.forEach(markMatched)
        si += k
        j += 1
        advanced = true
        break
      }
    }
    if (advanced) continue
    // Resync on the nearest exact match ahead in either stream.
    let best: { di: number; dj: number } | null = null
    for (let total = 1; total <= RESYNC_WINDOW * 2 && !best; total += 1) {
      for (let di = 0; di <= Math.min(total, RESYNC_WINDOW); di += 1) {
        const dj = total - di
        if (dj > RESYNC_WINDOW) continue
        if (si + di >= spoken.length || j + dj >= heard.length) continue
        if (slots[spoken[si + di]].key === heard[j + dj].key) { best = { di, dj }; break }
      }
    }
    if (best) {
      si += best.di
      j += best.dj
      continue
    }
    // No anchor nearby: leave this token unmatched and move on.
    si += 1
  }

  // Interpolate unmatched spoken tokens between the nearest timed neighbours.
  const firstStart = heard.length > 0 ? heard[0].start : 0
  const lastEnd = heard.length > 0 ? heard[heard.length - 1].end : (audioDuration ?? 0)
  let position = 0
  while (position < spoken.length) {
    if (slots[spoken[position]].matched) { position += 1; continue }
    let runEnd = position
    while (runEnd < spoken.length && !slots[spoken[runEnd]].matched) runEnd += 1
    const previous = position > 0 ? slots[spoken[position - 1]] : undefined
    const next = runEnd < spoken.length ? slots[spoken[runEnd]] : undefined
    const start = previous?.end ?? firstStart
    const end = Math.max(start, next?.start ?? lastEnd)
    spreadAcross(slots, spoken.slice(position, runEnd), start, end)
    position = runEnd
  }

  // Silent tokens sit at the next spoken word (or the previous word's end).
  for (let k = 0; k < slots.length; k += 1) {
    if (slots[k].key.length > 0) continue
    let anchor: number | undefined
    for (let ahead = k + 1; ahead < slots.length; ahead += 1) {
      if (slots[ahead].key.length > 0 && slots[ahead].start != null) { anchor = slots[ahead].start; break }
    }
    if (anchor == null) {
      for (let back = k - 1; back >= 0; back -= 1) {
        if (slots[back].end != null) { anchor = slots[back].end; break }
      }
    }
    slots[k].start = anchor ?? 0
    slots[k].end = anchor ?? 0
  }

  // Monotonic starts, ends never before starts.
  let floor = 0
  const words: AlignedWord[] = slots.map((slot) => {
    const start = Math.max(floor, round3(slot.start ?? floor))
    const end = Math.max(start, round3(slot.end ?? start))
    floor = start
    return { text: slot.text, start, end }
  })

  const expectedWords = spoken.length
  let lastMatchedWord = -1
  spoken.forEach((index, position) => { if (slots[index].matched) lastMatchedWord = position })
  return {
    words,
    alignment: {
      expectedWords,
      heardWords: heard.length,
      matchedWords: matched,
      matchRatio: expectedWords === 0 ? 0 : round3(matched / expectedWords),
      lastMatchedWord,
    },
  }
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000
}

// ===== Fish streaming responses =====

export interface FishAlignmentSnapshot {
  chunkSeq: number
  chunkAudioOffsetSec: number
  audioDuration: number
  segments: TimingSegment[]
}

export interface FishTimestampStream {
  audio: Uint8Array
  snapshots: FishAlignmentSnapshot[]
  events: number
}

interface FishTimestampEvent {
  audio_base64?: string
  chunk_seq?: number
  chunk_audio_offset_sec?: number
  alignment?: { segments?: Array<{ text?: string; start?: number; end?: number }>; audio_duration?: number } | null
}

function base64ToBytes(base64: string): Uint8Array {
  if (typeof atob === 'function') {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
    return bytes
  }
  return new Uint8Array(Buffer.from(base64, 'base64'))
}

export function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) { out.set(part, offset); offset += part.length }
  return out
}

/**
 * Parse the body of `POST /v1/tts/stream/with-timestamp` (Server-Sent Events).
 * Audio chunks are concatenated in arrival order. `alignment` is a cumulative
 * snapshot per `chunk_seq`, so a later snapshot for the same chunk replaces the
 * earlier one rather than appending to it.
 */
export function parseFishTimestampSse(body: string): FishTimestampStream {
  const parts: Uint8Array[] = []
  const snapshots = new Map<number, FishAlignmentSnapshot>()
  let events = 0
  const blocks = body.split(/\r?\n\r?\n/)
  for (const block of blocks) {
    const dataLines = block.split(/\r?\n/).filter(line => line.startsWith('data:'))
    if (dataLines.length === 0) continue
    const payload = dataLines.map(line => line.slice(5).replace(/^ /, '')).join('\n')
    if (!payload || payload === '[DONE]') continue
    let event: FishTimestampEvent
    try { event = JSON.parse(payload) as FishTimestampEvent } catch { continue }
    events += 1
    if (typeof event.audio_base64 === 'string' && event.audio_base64.length > 0) {
      parts.push(base64ToBytes(event.audio_base64))
    }
    if (event.alignment && Array.isArray(event.alignment.segments)) {
      const chunkSeq = typeof event.chunk_seq === 'number' ? event.chunk_seq : 0
      snapshots.set(chunkSeq, {
        chunkSeq,
        chunkAudioOffsetSec: typeof event.chunk_audio_offset_sec === 'number' ? event.chunk_audio_offset_sec : 0,
        audioDuration: typeof event.alignment.audio_duration === 'number' ? event.alignment.audio_duration : 0,
        segments: event.alignment.segments
          .filter(segment => typeof segment.text === 'string' && typeof segment.start === 'number' && typeof segment.end === 'number')
          .map(segment => ({ text: segment.text as string, start: segment.start as number, end: segment.end as number })),
      })
    }
  }
  return {
    audio: concatBytes(parts),
    snapshots: Array.from(snapshots.values()).sort((a, b) => a.chunkSeq - b.chunkSeq),
    events,
  }
}

/** Absolute-time segments across all chunks, plus the total duration they describe. */
export function absoluteSegments(snapshots: FishAlignmentSnapshot[]): { segments: TimingSegment[]; duration: number } {
  const segments: TimingSegment[] = []
  let duration = 0
  for (const snapshot of snapshots) {
    for (const segment of snapshot.segments) {
      segments.push({
        text: segment.text,
        start: round3(snapshot.chunkAudioOffsetSec + segment.start),
        end: round3(snapshot.chunkAudioOffsetSec + segment.end),
      })
    }
    duration = Math.max(duration, snapshot.chunkAudioOffsetSec + snapshot.audioDuration)
  }
  return { segments, duration: round3(duration) }
}

// ===== MP3 inspection =====

const MPEG_BITRATES: Record<string, number[]> = {
  // [version][layer] index tables in kbps; index 0 = free, 15 = bad.
  'v1l3': [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1],
  'v2l3': [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, -1],
}
const MPEG_SAMPLE_RATES: Record<string, number[]> = {
  v1: [44100, 48000, 32000, -1],
  v2: [22050, 24000, 16000, -1],
  v25: [11025, 12000, 8000, -1],
}

export function looksLikeMp3(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true // ID3
  return bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0
}

/**
 * Duration of an MPEG Layer III stream by walking its frames (CBR and VBR).
 * Returns null when no frame can be parsed. Used to cross-check the duration
 * the provider reports and to time recordings that arrive without timings.
 */
export function mp3DurationSeconds(bytes: Uint8Array): number | null {
  let offset = 0
  if (bytes.length >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f)
    offset = 10 + size
  }
  let seconds = 0
  let frames = 0
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff || (bytes[offset + 1] & 0xe0) !== 0xe0) { offset += 1; continue }
    const versionBits = (bytes[offset + 1] >> 3) & 0x3
    const layerBits = (bytes[offset + 1] >> 1) & 0x3
    if (versionBits === 1 || layerBits !== 1) { offset += 1; continue } // reserved version or not layer III
    const version = versionBits === 3 ? 'v1' : versionBits === 2 ? 'v2' : 'v25'
    const bitrateIndex = (bytes[offset + 2] >> 4) & 0xf
    const sampleIndex = (bytes[offset + 2] >> 2) & 0x3
    const padding = (bytes[offset + 2] >> 1) & 0x1
    const bitrate = MPEG_BITRATES[version === 'v1' ? 'v1l3' : 'v2l3'][bitrateIndex]
    const sampleRate = MPEG_SAMPLE_RATES[version][sampleIndex]
    if (bitrate <= 0 || sampleRate <= 0) { offset += 1; continue }
    const samplesPerFrame = version === 'v1' ? 1152 : 576
    const frameLength = Math.floor((samplesPerFrame / 8) * (bitrate * 1000) / sampleRate) + padding
    if (frameLength <= 4) { offset += 1; continue }
    seconds += samplesPerFrame / sampleRate
    frames += 1
    offset += frameLength
  }
  return frames > 0 ? round3(seconds) : null
}

// ===== Validation before publish =====

export interface NarrationAssetCandidate {
  text: string
  audio: Uint8Array
  reportedDuration: number
  segments: TimingSegment[]
}

export interface NarrationValidation {
  ok: boolean
  reasons: string[]
  duration: number
  measuredDuration: number | null
  words: AlignedWord[] | null
  alignment: TokenAlignmentStats
  timingsUsable: boolean
}

/** Plausible speaking pace: characters per second of audio. */
const MIN_CHARS_PER_SECOND = 4
const MAX_CHARS_PER_SECOND = 40
/**
 * Silence a narrator adds around a line (lead-in, a breath, the beat before
 * a stage direction) does not scale with the text: a seven-character
 * "[Exit.]" cannot be held to 1.75 s. The slow-pace bound therefore carries
 * this fixed allowance; for a full 300-character chunk it moves the ceiling
 * from 75 s to 79 s, well above any real reading.
 */
export const NARRATION_PAUSE_ALLOWANCE_SECONDS = 4
const MIN_AUDIO_BYTES = 800

/**
 * A recording is publishable only when the audio is a real MP3 of plausible
 * length for its text and the provider's timings, mapped onto our tokens, are
 * monotonic and inside the audio. Timings below the word threshold are still
 * recorded (for diagnostics and sentence-level follow) but `timingsUsable`
 * tells the caller that word-level follow must not use them.
 */
export function validateNarrationAsset(candidate: NarrationAssetCandidate): NarrationValidation {
  const reasons: string[] = []
  const tokens = candidate.text.length === 0 ? [] : candidate.text.split(' ')
  if (tokens.length === 0) reasons.push('empty_text')
  if (candidate.audio.length < MIN_AUDIO_BYTES) reasons.push('audio_too_small')
  else if (!looksLikeMp3(candidate.audio)) reasons.push('audio_not_mp3')

  const measuredDuration = candidate.audio.length >= MIN_AUDIO_BYTES ? mp3DurationSeconds(candidate.audio) : null
  let duration = candidate.reportedDuration > 0 ? candidate.reportedDuration : (measuredDuration ?? 0)
  if (measuredDuration != null && candidate.reportedDuration > 0) {
    // Trust the measured stream when the provider's number is far off it.
    const drift = Math.abs(measuredDuration - candidate.reportedDuration)
    if (drift > Math.max(1, measuredDuration * 0.1)) {
      reasons.push('duration_mismatch')
      duration = measuredDuration
    }
  }
  if (!(duration > 0)) reasons.push('no_duration')
  else {
    const longestPlausible = candidate.text.length / MIN_CHARS_PER_SECOND + NARRATION_PAUSE_ALLOWANCE_SECONDS
    if (duration > longestPlausible) reasons.push('audio_too_long_for_text')
    if (candidate.text.length / duration > MAX_CHARS_PER_SECOND) reasons.push('audio_too_short_for_text')
  }

  const aligned = alignSegmentsToTokens(tokens, candidate.segments, duration)
  // A stream cut off cleanly describes a consistent but partial recording:
  // audio and timings agree, only the tail is missing. When the provider
  // timed the paragraph at all, the last timed token must sit in its final
  // tenth, or the recording is treated as truncated and not published.
  if (candidate.segments.length > 0 && aligned.alignment.expectedWords > 0) {
    const lastMatched = aligned.alignment.lastMatchedWord ?? -1
    const tailStart = Math.max(0, Math.floor(aligned.alignment.expectedWords * 0.9) - 1)
    if (lastMatched < tailStart) reasons.push('audio_truncated')
  }
  let timingsUsable = candidate.segments.length > 0 && aligned.alignment.matchRatio >= NARRATION_WORD_MATCH_THRESHOLD
  if (timingsUsable && duration > 0) {
    const lastEnd = aligned.words.length > 0 ? aligned.words[aligned.words.length - 1].end : 0
    if (lastEnd > duration + 0.75) timingsUsable = false
    for (let index = 1; index < aligned.words.length; index += 1) {
      if (aligned.words[index].start < aligned.words[index - 1].start) { timingsUsable = false; break }
    }
  }

  return {
    ok: reasons.length === 0 || (reasons.length === 1 && reasons[0] === 'duration_mismatch' && duration > 0),
    reasons,
    duration: round3(duration),
    measuredDuration,
    words: timingsUsable ? aligned.words : null,
    alignment: aligned.alignment,
    timingsUsable,
  }
}

// ===== Sentence-group chunking =====

export interface NarrationChunk {
  index: number
  /** Token range `[wordFrom, wordTo)` of the paragraph's narration tokens (silent markers included). */
  wordFrom: number
  wordTo: number
  /** Spoken text of the range — silent markers dropped — as sent to the provider and hashed. */
  text: string
}

const ABBREVIATIONS = new Set(['mr', 'mrs', 'ms', 'dr', 'st', 'mt', 'no', 'vs', 'etc', 'ie', 'eg', 'jr', 'sr', 'prof', 'rev', 'gen', 'col', 'capt', 'lt', 'sgt', 'hon', 'messrs', 'esq', 'viz', 'cf', 'ch', 'vol', 'pp', 'op', 'bk'])

function endsSentence(token: string, next: string | undefined): boolean {
  if (isSilentNarrationToken(token)) return false
  if (next !== undefined && isSilentNarrationToken(next)) return /[.!?…][\u0022\u0027\u2019\u201d)\]]*$/.test(token)
  if (!/[.!?…][\u0022\u0027\u2019\u201d)\]]*$/.test(token)) return false
  const bare = token.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase()
  if (ABBREVIATIONS.has(bare)) return false
  if (/^[A-Z]$/.test(token.replace(/[^\p{L}]/gu, '')) && next && /^[A-Z]/.test(next.replace(/^[\u0022\u0027\u2018\u201c(\[]+/, ''))) return false // an initial: "J. Alfred"
  if (!next) return true
  return /^[\u0022\u0027\u2018\u201c(\[]*[A-Z0-9“‘]/.test(next)
}

function endsClause(token: string): boolean {
  return /[;:,—–][\u0022\u0027\u2019\u201d)\]]*$/.test(token)
}

function joinedLength(tokens: string[]): number {
  const spoken = tokens.filter(token => !isSilentNarrationToken(token))
  return spoken.reduce((sum, token) => sum + token.length, 0) + Math.max(0, spoken.length - 1)
}

/** Greedily pack runs of tokens (split on `boundary`) into groups of at most `max` characters. */
function packRuns(tokens: string[], boundary: (token: string, next: string | undefined) => boolean, max: number, split: (run: string[]) => string[][]): string[][] {
  const runs: string[][] = []
  let run: string[] = []
  tokens.forEach((token, index) => {
    run.push(token)
    if (boundary(token, tokens[index + 1])) { runs.push(run); run = [] }
  })
  if (run.length > 0) runs.push(run)
  const groups: string[][] = []
  let current: string[] = []
  for (const item of runs) {
    const itemLength = joinedLength(item)
    if (itemLength > max) {
      if (current.length > 0) { groups.push(current); current = [] }
      groups.push(...split(item))
      continue
    }
    if (current.length > 0 && joinedLength(current) + 1 + itemLength > max) { groups.push(current); current = [] }
    current = current.concat(item)
  }
  if (current.length > 0) groups.push(current)
  return groups
}

/** Hard split: whole tokens, greedy, never above `max` unless one token alone exceeds it. */
function packTokens(tokens: string[], max: number): string[][] {
  const groups: string[][] = []
  let current: string[] = []
  for (const token of tokens) {
    if (current.length > 0 && joinedLength(current) + 1 + token.length > max) { groups.push(current); current = [] }
    current.push(token)
  }
  if (current.length > 0) groups.push(current)
  return groups
}

/**
 * Cut a paragraph's narration tokens into sentence groups of at most
 * `max` characters: whole sentences packed greedily; a sentence longer than
 * the ceiling falls back to clause boundaries, then to whole tokens. A tiny
 * final group (under 40 characters) rejoins the previous one when that stays
 * within a fifth over the ceiling, so no chunk is a lone word or two. Every
 * token lands in exactly one chunk, in order, so chunk `[wordFrom, wordTo)`
 * ranges tile the paragraph.
 */
export function chunkNarrationTokens(tokens: string[], max = NARRATION_CHUNK_MAX_CHARS): NarrationChunk[] {
  if (tokens.length === 0 || tokens.every(isSilentNarrationToken)) return []
  let groups = packRuns(tokens, endsSentence, max, sentence => packRuns(sentence, endsClause, max, clause => packTokens(clause, max)))
  // A group of only silent markers has nothing to say: it joins the next group.
  const merged: string[][] = []
  for (const group of groups) {
    if (merged.length > 0 && merged[merged.length - 1].every(isSilentNarrationToken)) merged[merged.length - 1] = merged[merged.length - 1].concat(group)
    else merged.push(group)
  }
  if (merged.length > 1 && merged[merged.length - 1].every(isSilentNarrationToken)) {
    const tail = merged.pop() as string[]
    merged[merged.length - 1] = merged[merged.length - 1].concat(tail)
  }
  groups = merged
  if (groups.length > 1) {
    const last = groups[groups.length - 1]
    const previous = groups[groups.length - 2]
    if (joinedLength(last) < 40 && joinedLength(previous) + 1 + joinedLength(last) <= max * 1.2) {
      groups.splice(groups.length - 2, 2, previous.concat(last))
    }
  }
  const chunks: NarrationChunk[] = []
  let cursor = 0
  groups.forEach((group, index) => {
    chunks.push({ index, wordFrom: cursor, wordTo: cursor + group.length, text: spokenText(group) })
    cursor += group.length
  })
  return chunks
}

export function chunkNarrationText(paragraph: string, max = NARRATION_CHUNK_MAX_CHARS): NarrationChunk[] {
  return chunkNarrationTokens(narrationTokens(paragraph), max)
}

/** Absolute paragraph words from ready chunk words in order (chunk-local times shifted by earlier durations). */
export function paragraphWordsFromChunks(chunks: Array<{ words: AlignedWord[]; duration: number }>): { words: AlignedWord[]; duration: number } {
  const words: AlignedWord[] = []
  let offset = 0
  for (const chunk of chunks) {
    for (const word of chunk.words) words.push({ text: word.text, start: round3(word.start + offset), end: round3(word.end + offset) })
    offset = round3(offset + chunk.duration)
  }
  return { words, duration: offset }
}

// ===== Stored metadata shapes =====

/** `narration/fish/blob/{hash}.json` — one chunk recording's own description. */
export interface NarrationBlobMeta {
  version: number
  provider: typeof NARRATION_PROVIDER
  model: string
  voiceId: string
  voiceKey: string
  settings: NarrationSynthesisSettings
  hash: string
  /** Hash of the whole paragraph's narration text the chunk belongs to. */
  textHash: string
  /** The chunk's own narration text (what the provider was sent). */
  text: string
  bookId: string
  editionKey: string
  chapter: number
  paragraphIndex: number
  chunkIndex: number
  chunkCount: number
  wordFrom: number
  wordTo: number
  createdAt: string
  audioBytes: number
  textBytes: number
  duration: number
  measuredDuration: number | null
  words: AlignedWord[] | null
  alignment: TokenAlignmentStats
  timingsUsable: boolean
  providerSegments: TimingSegment[]
  generationMs: number
}

/**
 * `narration/fish/map/.../p{i}.json` — explicit edition → recordings mapping
 * for one paragraph. Rewritten after every chunk publish; `chunks` lists the
 * ready chunks in order, so a reader sees a growing prefix until `complete`.
 */
export interface NarrationMapEntry {
  version: number
  textHash: string
  chunker: number
  chunkCount: number
  voiceKey: string
  voiceId: string
  model: string
  bookId: string
  editionKey: string
  chapter: number
  paragraphIndex: number
  chunks: Array<{ index: number; hash: string; wordFrom: number; wordTo: number }>
  complete: boolean
  publishedAt: string
}
