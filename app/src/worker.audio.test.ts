import { describe, expect, it } from 'vitest'
import {
  changedSegmentForTest,
  parseByteRangeForTest,
  tryCommentReplacementForTest,
  validateCorrectedParagraphForTest,
} from './worker'
import { handleAudioFile } from './worker/routes/audio'

describe('audio byte ranges', () => {
  it('parses normal, open-ended, and suffix ranges', () => {
    expect(parseByteRangeForTest('bytes=0-1023', 10_000)).toEqual({ start: 0, end: 1023 })
    expect(parseByteRangeForTest('bytes=1024-', 10_000)).toEqual({ start: 1024, end: 9999 })
    expect(parseByteRangeForTest('bytes=-500', 10_000)).toEqual({ start: 9500, end: 9999 })
  })

  it('rejects invalid ranges', () => {
    expect(parseByteRangeForTest('items=0-10', 10_000)).toBeNull()
    expect(parseByteRangeForTest('bytes=900-100', 10_000)).toBeNull()
    expect(parseByteRangeForTest('bytes=10000-10001', 10_000)).toBeNull()
  })
})

describe('translation fix helpers', () => {
  it('turns a user comment into a full-paragraph replacement when AI omits one', () => {
    const paragraph = 'Han kunne svækes af kulden, men fortsatte.'
    expect(tryCommentReplacementForTest(paragraph, 'svækes', 'Svækkes')).toBe('Han kunne svækkes af kulden, men fortsatte.')
    expect(tryCommentReplacementForTest(paragraph, ' svækes ', 'svækkes?')).toBe('Han kunne svækkes af kulden, men fortsatte.')
  })

  it('extracts the changed segment from a full paragraph correction', () => {
    expect(changedSegmentForTest(
      'De sad i galleriets skygge.',
      'De sad i terrassens skygge.',
    )).toEqual({ oldText: 'galleriet', newText: 'terrassen' })
  })

  it('blocks fragment corrections and implausibly long rewrites', () => {
    expect(validateCorrectedParagraphForTest('a'.repeat(100), 'a'.repeat(49))).toContain('too short')
    expect(validateCorrectedParagraphForTest('a'.repeat(100), 'a'.repeat(151))).toContain('too long')
    expect(validateCorrectedParagraphForTest('a'.repeat(100), 'a'.repeat(100))).toBeNull()
  })
})


describe('audio-file words.json', () => {
  it('serves an asset sidecar when R2 has no words.json', async () => {
    const sidecar = { chapter: 1, paragraphs: [{ paragraph: 0, words: [{ text: 'In', start: 0.05, end: 0.22 }] }] }
    const env = {
      AUDIO_BUCKET: {
        get: async () => null,
        head: async () => null,
      },
      ASSETS: {
        fetch: async (request: Request) => {
          const url = new URL(request.url)
          if (url.pathname === '/audio/bible/kjv-en/ch1/words.json') {
            return new Response(JSON.stringify(sidecar), { status: 200 })
          }
          return new Response('Not found', { status: 404 })
        },
      },
    }
    const res = await handleAudioFile(
      new Request('https://tinct.app/api/audio-file?path=bible/kjv-en/ch1/words.json'),
      env as never,
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('application/json')
    expect(await res.json()).toEqual(sidecar)
  })

  it('keeps 404 when words.json is missing from R2 and assets', async () => {
    const env = {
      AUDIO_BUCKET: { get: async () => null, head: async () => null },
      ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) },
    }
    const res = await handleAudioFile(
      new Request('https://tinct.app/api/audio-file?path=bible/kjv-en/ch1/words.json'),
      env as never,
    )
    expect(res.status).toBe(404)
  })
})
