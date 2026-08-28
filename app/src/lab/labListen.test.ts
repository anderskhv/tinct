import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { followFromPlayback, followParagraphFromManifest, mergeSidecarWords } from './labFollow'
import {
  clipsFromFollowParagraphs,
  clipsFromManifest,
  LAB_STATIC_WORD_SIDECAR_URL,
  labAudioFileUrl,
  labAudioManifestUrl,
  labAudioSidecarUrl,
  labStaticWordSidecarUrl,
  labStaticWordSidecarUrls,
  loadLabAudioChapter,
  readLabWordSidecar,
} from './labListen'

afterEach(() => {
  vi.unstubAllGlobals()
})

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    headers: { get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null) },
    json: async () => body,
  } as Response
}

describe('lab bible audio paths', () => {
  it('uses the production Bible chapter manifest and paragraph files', () => {
    expect(labAudioManifestUrl()).toBe('/api/audio-manifest?path=bible%2Fkjv-en%2Fch1%2Fmanifest.json')
    expect(labAudioSidecarUrl()).toBe('/api/audio-file?path=bible%2Fkjv-en%2Fch1%2Fwords.json')
    expect(labAudioFileUrl('p0.mp3')).toBe('/api/audio-file?path=bible%2Fkjv-en%2Fch1%2Fp0.mp3')
    expect(labAudioFileUrl('p1.mp3')).toBe('/api/audio-file?path=bible%2Fkjv-en%2Fch1%2Fp1.mp3')
    expect(labAudioManifestUrl(2)).toBe('/api/audio-manifest?path=bible%2Fkjv-en%2Fch2%2Fmanifest.json')
    expect(labAudioFileUrl('p0.mp3', 2)).toBe('/api/audio-file?path=bible%2Fkjv-en%2Fch2%2Fp0.mp3')
  })

  it('skips title clips and keeps one MP3 per paragraph', () => {
    const clips = clipsFromManifest(
      ['Tell me', 'So now'],
      [
        { paragraph: -1, file: 'title.mp3', duration: 3 },
        { paragraph: 0, file: 'p0.mp3', duration: 4 },
        { paragraph: 1, file: 'p1.mp3', duration: 5 },
      ],
    )
    expect(clips.map(clip => clip.file)).toEqual(['p0.mp3', 'p1.mp3'])
    const fromFollow = clipsFromFollowParagraphs([
      {
        index: 0,
        text: 'Tell me',
        file: 'p0.mp3',
        duration: 4,
        words: [{ text: 'Tell', start: 0, end: 0.5 }, { text: 'me', start: 0.5, end: 1 }],
      },
      { index: 1, text: 'So now' },
    ])
    expect(fromFollow.map(clip => clip.file)).toEqual(['p0.mp3'])
    expect(fromFollow[0].words?.map(word => word.text)).toEqual(['Tell', 'me'])
  })

  it('follows playback from the audio element, not a Date.now clock', () => {
    const listen = readFileSync(resolve(__dirname, 'useLabListen.ts'), 'utf8')
    expect(listen).toContain("addEventListener('timeupdate'")
    expect(listen).toContain('labAudioFileUrl')
    expect(listen).toContain('readLabWordSidecar')
    expect(listen).toContain('labAudioSidecarUrl')
    expect(listen).toContain('measureFollowParagraphWords')
    expect(listen).toContain('chapterHasWordTimings')
    expect(listen).toContain('paragraphsRef.current = followParagraphs')
    expect(listen).not.toMatch(/paragraphsRef\.current = options\.followParagraphs/)
    expect(listen).not.toMatch(/Date\.now\(\)/)
    expect(listen).not.toMatch(/setInterval/)
    expect(listen).toContain('setSpeed')
    expect(listen).toContain('parseHearingSpeed')
    expect(listen).toContain('followPlayingClip')
    expect(listen).toContain('playbackRate')
    expect(listen).toMatch(/const pause = useCallback\(\(\) => \{[\s\S]*setFollow\(\{ kind: 'none' \}\)/)
  })

  it('builds a convention static sidecar path for any bible chapter', () => {
    expect(labStaticWordSidecarUrl(768)).toBe('/bible-kjv-en-ch768-words.json')
    expect(labStaticWordSidecarUrl(1)).toBe('/bible-kjv-en-ch1-words.json')
    expect(labStaticWordSidecarUrl(42)).toBe('/bible-kjv-en-ch42-words.json')
    expect(labStaticWordSidecarUrls('odyssey', 'original-en', 1)).toEqual([
      '/odyssey-original-en-ch1-words.json',
      '/odyssey-ch1-words.json',
    ])
    expect(LAB_STATIC_WORD_SIDECAR_URL).toBe('/odyssey-ch1-words.json')
  })

  it('falls back to static sidecar when api returns HTML (dev SPA shell)', async () => {
    const sidecar = { chapter: 768, paragraphs: [{ paragraph: 0, words: [{ text: 'Woe', start: 0, end: 0.5 }] }] }
    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/bible-kjv-en-ch768-words.json') {
        return { ok: true, headers: { get: () => 'application/json' }, json: async () => sidecar }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)

    const htmlRes = {
      ok: true,
      headers: { get: () => 'text/html' },
      json: async () => { throw new SyntaxError('Unexpected token') },
    } as Response

    const merged = await readLabWordSidecar(htmlRes, 768)
    expect(merged?.paragraphs?.[0].words?.[0].text).toBe('Woe')
    expect(fetchMock).toHaveBeenCalledWith('/bible-kjv-en-ch768-words.json')
  })

  it('does not download a word corpus when words.json is missing', async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, json: async () => ({}) }))
    vi.stubGlobal('fetch', fetchMock)

    const miss = await readLabWordSidecar({ ok: false } as Response, 768)
    expect(miss).toBeNull()
    expect(fetchMock).toHaveBeenCalledWith('/bible-kjv-en-ch768-words.json')

    vi.clearAllMocks()
    const hit = await readLabWordSidecar(jsonResponse({
      chapter: 768,
      paragraphs: [{ paragraph: 0, words: [{ text: 'R2', start: 0, end: 1 }] }],
    }), 768)
    expect(hit?.paragraphs?.[0].words?.[0].text).toBe('R2')
    expect(fetchMock).not.toHaveBeenCalled()

    const followed = mergeSidecarWords(
      [followParagraphFromManifest(0, 'In the beginning', { duration: 25, file: 'p0.mp3' })],
      null,
    )
    expect(followed[0].words).toBeUndefined()
    expect(followFromPlayback({ paragraphs: followed, paragraphIndex: 0, currentTime: 0.2 })).toEqual({
      kind: 'paragraph',
      paragraphIndex: 0,
    })
  })

  it('follows sidecar start times, not duration/n, when words.json exists', async () => {
    const sidecarWords = [
      { text: 'In', start: 0.05, end: 0.22 },
      { text: 'the', start: 0.22, end: 0.34 },
      { text: 'beginning', start: 0.34, end: 1.15 },
    ]
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('manifest.json')) {
        return jsonResponse({ paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 25 }] })
      }
      if (url.includes('words.json')) {
        return jsonResponse({ chapter: 1, paragraphs: [{ paragraph: 0, file: 'p0.mp3', words: sidecarWords }] })
      }
      return jsonResponse({}, false)
    }))

    const followed = await loadLabAudioChapter(['In the beginning'])
    expect(followed[0].words?.map(word => word.text)).toEqual(['In', 'the', 'beginning'])
    expect(followed[0].words?.[2].start).toBe(0.34)
    expect(followFromPlayback({ paragraphs: followed, paragraphIndex: 0, currentTime: 0.5 })).toEqual({
      kind: 'word',
      paragraphIndex: 0,
      wordIndex: 2,
    })
  })

  it('stays paragraph-level when words.json and MP3 measurement are unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('manifest.json')) {
        return jsonResponse({ paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 25 }] })
      }
      return jsonResponse({}, false)
    }))

    const followed = await loadLabAudioChapter(['In the beginning'])
    expect(followed[0].words).toBeUndefined()
    expect(followFromPlayback({ paragraphs: followed, paragraphIndex: 0, currentTime: 0.2 })).toEqual({
      kind: 'paragraph',
      paragraphIndex: 0,
    })
  })
})
