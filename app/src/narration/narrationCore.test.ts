import { describe, expect, it } from 'vitest'
import {
  absoluteSegments,
  alignSegmentsToTokens,
  alignmentKey,
  canonicalJson,
  isPilotScope,
  looksLikeMp3,
  mp3DurationSeconds,
  narrationBlobKeys,
  narrationCacheIdentity,
  narrationMapKey,
  narrationTextForParagraph,
  narrationTokens,
  parseFishTimestampSse,
  utf8ByteLength,
  validateNarrationAsset,
  DEFAULT_NARRATION_SETTINGS,
  NARRATION_CACHE_VERSION,
} from './narrationCore'

import { syntheticMp3 } from './narrationTestFixtures'

describe('narration text and tokens', () => {
  it('drops emphasis underscores and collapses whitespace without changing token order', () => {
    const paragraph = 'Tell me, O Muse, of that _ingenious_ hero who travelled far and wide\nafter he had sacked the famous town of Troy.'
    expect(narrationTextForParagraph(paragraph)).toBe(
      'Tell me, O Muse, of that ingenious hero who travelled far and wide after he had sacked the famous town of Troy.',
    )
    expect(narrationTokens(paragraph)).toEqual(paragraph.replace(/_/g, '').split(/\s+/))
  })

  it('keeps punctuation, curly quotes and names untouched', () => {
    const text = '“But there! It rests with heaven—Ulysses’ house,” said Minerva.'
    expect(narrationTextForParagraph(text)).toBe(text)
    expect(narrationTokens('').length).toBe(0)
  })

  it('counts UTF-8 bytes the way Fish bills them', () => {
    expect(utf8ByteLength('abc')).toBe(3)
    expect(utf8ByteLength('Ulysses’')).toBe(10)
  })
})

describe('cache identity', () => {
  const base = {
    provider: 'fish' as const,
    model: 's2.1-pro',
    voiceId: 'voice-a',
    text: 'Tell me, O Muse, of that ingenious hero.',
    settings: DEFAULT_NARRATION_SETTINGS,
  }

  it('is stable for identical input and canonical regardless of key order', async () => {
    const a = await narrationCacheIdentity(base)
    const b = await narrationCacheIdentity({ ...base, settings: { ...base.settings } })
    expect(a.hash).toBe(b.hash)
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/)
    expect(canonicalJson({ b: 1, a: [{ d: 1, c: 2 }] })).toBe('{"a":[{"c":2,"d":1}],"b":1}')
    expect(a.document).toContain(`"v":${NARRATION_CACHE_VERSION}`)
  })

  it('changes when the text, voice, model or any setting changes', async () => {
    const origin = await narrationCacheIdentity(base)
    const variants = await Promise.all([
      narrationCacheIdentity({ ...base, text: base.text + ' ' }),
      narrationCacheIdentity({ ...base, voiceId: 'voice-b' }),
      narrationCacheIdentity({ ...base, model: 's1' }),
      narrationCacheIdentity({ ...base, settings: { ...base.settings, speed: 0.9 } }),
      narrationCacheIdentity({ ...base, settings: { ...base.settings, mp3Bitrate: 192 } }),
    ])
    for (const variant of variants) expect(variant.hash).not.toBe(origin.hash)
    // The text hash only follows the text.
    expect(variants[1].textHash).toBe(origin.textHash)
    expect(variants[0].textHash).not.toBe(origin.textHash)
  })

  it('derives R2 keys that fit the public audio route validator', () => {
    const keys = narrationBlobKeys('ab'.repeat(32))
    expect(keys.audio).toBe(`narration/fish/blob/${'ab'.repeat(32)}.mp3`)
    expect(keys.audio.split('/').length).toBe(4)
    expect(narrationMapKey('odyssey', 'original-en', 1, 'a', 18)).toBe('narration/fish/map/odyssey/original-en/ch1/a/p18.json')
  })

  it('limits the pilot to Odyssey Book 1 English editions', () => {
    expect(isPilotScope('odyssey', 'original-en', 1)).toBe(true)
    expect(isPilotScope('odyssey', 'modern-en', 1)).toBe(true)
    expect(isPilotScope('odyssey', 'modern-da', 1)).toBe(false)
    expect(isPilotScope('odyssey', 'original-en', 2)).toBe(false)
    expect(isPilotScope('iliad', 'original-en', 1)).toBe(false)
  })
})

describe('alignSegmentsToTokens', () => {
  const seg = (text: string, start: number, end: number) => ({ text, start, end })

  it('matches one segment per token, ignoring case, apostrophes and punctuation', () => {
    const tokens = ['“I', 'can’t', 'believe', 'it’s', 'been', 'this', 'long.”']
    const segments = [seg('I', 0, 0.16), seg("can't", 0.16, 0.48), seg('believe', 0.48, 0.8), seg('its', 0.8, 1.12), seg('been', 1.2, 1.44), seg('this', 1.44, 1.76), seg('long', 1.76, 2.48)]
    const result = alignSegmentsToTokens(tokens, segments, 2.5)
    expect(result.alignment).toEqual({ expectedWords: 7, heardWords: 7, matchedWords: 7, matchRatio: 1 })
    expect(result.words.map(word => word.text)).toEqual(tokens)
    expect(result.words[1]).toEqual({ text: 'can’t', start: 0.16, end: 0.48 })
    expect(result.words[6]).toEqual({ text: 'long.”', start: 1.76, end: 2.48 })
  })

  it('glues several heard segments into one hyphenated token', () => {
    const result = alignSegmentsToTokens(['the', 'wage-labour', 'ends'], [seg('the', 0, 0.1), seg('wage', 0.1, 0.4), seg('labour', 0.4, 0.9), seg('ends', 0.9, 1.2)])
    expect(result.alignment.matchRatio).toBe(1)
    expect(result.words[1]).toEqual({ text: 'wage-labour', start: 0.1, end: 0.9 })
  })

  it('shares one heard segment across the tokens it spells', () => {
    const result = alignSegmentsToTokens(['every', 'one', 'left'], [seg('everyone', 0, 1), seg('left', 1, 1.5)])
    expect(result.alignment.matchRatio).toBe(1)
    expect(result.words[0].start).toBe(0)
    expect(result.words[0].end).toBeCloseTo(0.625, 3)
    expect(result.words[1].start).toBeCloseTo(0.625, 3)
    expect(result.words[1].end).toBe(1)
  })

  it('places punctuation-only tokens at the next spoken word without counting them', () => {
    const result = alignSegmentsToTokens(['Troy', '—', 'many', 'cities'], [seg('Troy', 0, 0.5), seg('many', 0.8, 1.1), seg('cities', 1.1, 1.6)])
    expect(result.alignment).toEqual({ expectedWords: 3, heardWords: 3, matchedWords: 3, matchRatio: 1 })
    expect(result.words[1]).toEqual({ text: '—', start: 0.8, end: 0.8 })
  })

  it('resyncs after a misheard word and interpolates it inside the reported span', () => {
    const tokens = ['Now', 'Neptune', 'had', 'gone', 'off', 'to', 'the', 'Ethiopians']
    const segments = [seg('Now', 0, 0.2), seg('Neptune', 0.2, 0.7), seg('had', 0.7, 0.85), seg('gone', 0.85, 1.1), seg('of', 1.1, 1.2), seg('to', 1.2, 1.3), seg('the', 1.3, 1.4), seg('Ethiopians', 1.4, 2.2)]
    const result = alignSegmentsToTokens(tokens, segments, 2.3)
    expect(result.alignment.matchedWords).toBe(7)
    expect(result.alignment.matchRatio).toBe(0.875)
    // "off" is interpolated between gone.end and to.start — never outside them.
    expect(result.words[4].start).toBe(1.1)
    expect(result.words[4].end).toBe(1.2)
    expect(result.words[7]).toEqual({ text: 'Ethiopians', start: 1.4, end: 2.2 })
  })

  it('resyncs when the provider emits an extra segment', () => {
    const result = alignSegmentsToTokens(['a', 'b', 'c'], [seg('a', 0, 1), seg('uh', 1, 1.5), seg('b', 1.5, 2), seg('c', 2, 3)])
    expect(result.alignment.matchRatio).toBe(1)
    expect(result.words[1]).toEqual({ text: 'b', start: 1.5, end: 2 })
  })

  it('keeps starts monotonic and never returns fewer words than tokens', () => {
    const tokens = 'one two three four five six'.split(' ')
    const segments = [seg('one', 0, 0.3), seg('six', 2.5, 3)]
    const result = alignSegmentsToTokens(tokens, segments, 3)
    expect(result.words.length).toBe(6)
    for (let i = 1; i < result.words.length; i += 1) {
      expect(result.words[i].start).toBeGreaterThanOrEqual(result.words[i - 1].start)
      expect(result.words[i].end).toBeGreaterThanOrEqual(result.words[i].start)
    }
    expect(result.words[1].start).toBe(0.3)
    expect(result.words[4].end).toBe(2.5)
    expect(result.alignment.matchRatio).toBeCloseTo(0.333, 3)
  })

  it('normalises keys with NFKC and case folding', () => {
    expect(alignmentKey('Ulysses’')).toBe('ulysses')
    expect(alignmentKey('ﬁne')).toBe('fine')
    expect(alignmentKey('—')).toBe('')
  })
})

describe('Fish SSE parsing', () => {
  const b64 = (bytes: number[]) => Buffer.from(bytes).toString('base64')

  it('concatenates audio in arrival order and keeps the latest snapshot per chunk', () => {
    const body = [
      `data: ${JSON.stringify({ audio_base64: b64([1, 2]), chunk_seq: 0, chunk_audio_offset_sec: 0, alignment: null })}`,
      '',
      `data: ${JSON.stringify({ audio_base64: b64([3]), chunk_seq: 0, chunk_audio_offset_sec: 0, alignment: { audio_duration: 1.0, segments: [{ text: 'Tell', start: 0, end: 0.4 }] } })}`,
      '',
      `data: ${JSON.stringify({ audio_base64: b64([4, 5]), chunk_seq: 0, chunk_audio_offset_sec: 0, alignment: { audio_duration: 1.2, segments: [{ text: 'Tell', start: 0, end: 0.4 }, { text: 'me', start: 0.4, end: 0.7 }] } })}`,
      '',
      `data: ${JSON.stringify({ audio_base64: '', chunk_seq: 1, chunk_audio_offset_sec: 1.2, alignment: { audio_duration: 0.8, segments: [{ text: 'Muse', start: 0.1, end: 0.6 }] } })}`,
      '',
      'data: [DONE]',
      '',
    ].join('\n')
    const stream = parseFishTimestampSse(body)
    expect(Array.from(stream.audio)).toEqual([1, 2, 3, 4, 5])
    expect(stream.events).toBe(4)
    expect(stream.snapshots.map(snapshot => snapshot.chunkSeq)).toEqual([0, 1])
    expect(stream.snapshots[0].segments.length).toBe(2)
    const absolute = absoluteSegments(stream.snapshots)
    expect(absolute.duration).toBe(2)
    expect(absolute.segments).toEqual([
      { text: 'Tell', start: 0, end: 0.4 },
      { text: 'me', start: 0.4, end: 0.7 },
      { text: 'Muse', start: 1.3, end: 1.8 },
    ])
  })

  it('ignores malformed events and CRLF framing', () => {
    const stream = parseFishTimestampSse('data: not json\r\n\r\ndata: {"audio_base64":"AQ=="}\r\n\r\n')
    expect(Array.from(stream.audio)).toEqual([1])
    expect(stream.snapshots).toEqual([])
  })
})

describe('MP3 inspection and validation', () => {
  it('measures a synthetic CBR stream and recognises MP3 signatures', () => {
    const audio = syntheticMp3(100)
    expect(looksLikeMp3(audio)).toBe(true)
    expect(mp3DurationSeconds(audio)).toBeCloseTo(100 * 1152 / 44100, 2)
    expect(looksLikeMp3(new Uint8Array([0, 1, 2, 3]))).toBe(false)
    expect(mp3DurationSeconds(new Uint8Array(50))).toBeNull()
  })

  it('publishes audio with usable words when everything agrees', () => {
    const text = 'Tell me, O Muse, of that ingenious hero.'
    const frames = 120 // ~3.13 s
    const duration = 120 * 1152 / 44100
    const words = text.split(' ')
    const segments = words.map((word, index) => ({ text: word, start: (index / words.length) * duration, end: ((index + 1) / words.length) * duration }))
    const result = validateNarrationAsset({ text, audio: syntheticMp3(frames), reportedDuration: duration, segments })
    expect(result.ok).toBe(true)
    expect(result.reasons).toEqual([])
    expect(result.timingsUsable).toBe(true)
    expect(result.words?.length).toBe(words.length)
    expect(result.duration).toBeCloseTo(duration, 2)
  })

  it('refuses audio that is not an MP3, is too small, or is implausibly short for its text', () => {
    const text = 'A paragraph of roughly one hundred and twenty characters that no narrator can speak inside a single second of audio.'
    const tooSmall = validateNarrationAsset({ text, audio: new Uint8Array(10), reportedDuration: 5, segments: [] })
    expect(tooSmall.ok).toBe(false)
    expect(tooSmall.reasons).toContain('audio_too_small')
    const junk = validateNarrationAsset({ text, audio: new Uint8Array(2000), reportedDuration: 5, segments: [] })
    expect(junk.reasons).toContain('audio_not_mp3')
    const short = validateNarrationAsset({ text, audio: syntheticMp3(20), reportedDuration: 0.5, segments: [] })
    expect(short.ok).toBe(false)
    expect(short.reasons).toContain('audio_too_short_for_text')
  })

  it('keeps the audio but marks timings unusable below the word threshold', () => {
    const text = 'one two three four five six seven eight nine ten'
    const duration = 120 * 1152 / 44100
    const segments = [{ text: 'one', start: 0, end: 0.3 }, { text: 'ten', start: 2.5, end: 3.0 }]
    const result = validateNarrationAsset({ text, audio: syntheticMp3(120), reportedDuration: duration, segments })
    expect(result.ok).toBe(true)
    expect(result.timingsUsable).toBe(false)
    expect(result.words).toBeNull()
    expect(result.alignment.matchRatio).toBe(0.2)
  })

  it('prefers the measured duration when the provider figure drifts', () => {
    const text = 'Tell me, O Muse, of that ingenious hero who travelled far and wide.'
    const measured = 200 * 1152 / 44100
    const result = validateNarrationAsset({ text, audio: syntheticMp3(200), reportedDuration: 12, segments: [] })
    expect(result.reasons).toEqual(['duration_mismatch'])
    expect(result.ok).toBe(true)
    expect(result.duration).toBeCloseTo(measured, 2)
  })
})
