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
  loadLabAudioChapter,
  readLabWordSidecar,
} from './labListen'
import { LAB_FOLLOW_LEAD_SECONDS } from './useLabListen'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('lab bible audio paths', () => {
  it('uses the production Bible chapter manifest and paragraph files', () => {
    expect(labAudioManifestUrl()).toBe('/api/audio-manifest?path=bible%2Fkjv-en%2Fch1%2Fmanifest.json')
    expect(labAudioSidecarUrl()).toBe('/api/audio-file?path=bible%2Fkjv-en%2Fch1%2Fwords.json&timing=2')
    expect(labAudioFileUrl('p0.mp3')).toBe('/api/audio-file?path=bible%2Fkjv-en%2Fch1%2Fp0.mp3')
    expect(labAudioFileUrl('p1.mp3')).toBe('/api/audio-file?path=bible%2Fkjv-en%2Fch1%2Fp1.mp3')
    expect(labAudioManifestUrl(2)).toBe('/api/audio-manifest?path=bible%2Fkjv-en%2Fch2%2Fmanifest.json')
    expect(labAudioFileUrl('p0.mp3', 2)).toBe('/api/audio-file?path=bible%2Fkjv-en%2Fch2%2Fp0.mp3')
  })

  it('does not leave mutable word timings behind the immutable MP3 cache path', () => {
    const worker = readFileSync(resolve(__dirname, '../../public/sw.js'), 'utf8')
    const metadataBranch = worker.indexOf("const isAudioMetadata")
    const rangeBranch = worker.indexOf("event.request.headers.has('range')")

    expect(labAudioSidecarUrl()).toContain('&timing=')
    expect(metadataBranch).toBeGreaterThan(-1)
    expect(metadataBranch).toBeLessThan(rangeBranch)
    expect(worker).toMatch(/handleAudioMetadata[\s\S]*fetch\(request, \{ cache: 'no-store' \}\)/)
    expect(worker).toMatch(/handleAudioMetadata[\s\S]*cache\.match\(request\)/)
  })

  it('keeps the title as a distinct clip before one MP3 per paragraph', () => {
    const clips = clipsFromManifest(
      ['Tell me', 'So now'],
      [
        { paragraph: -1, file: 'title.mp3', duration: 3 },
        { paragraph: 0, file: 'p0.mp3', duration: 4 },
        { paragraph: 1, file: 'p1.mp3', duration: 5 },
      ],
    )
    expect(clips.map(clip => [clip.kind, clip.file])).toEqual([
      ['title', 'title.mp3'],
      ['paragraph', 'p0.mp3'],
      ['paragraph', 'p1.mp3'],
    ])
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
    expect(fromFollow[0].kind).toBe('paragraph')
    if (fromFollow[0].kind !== 'paragraph') throw new Error('expected paragraph clip')
    expect(fromFollow[0].words?.map(word => word.text)).toEqual(['Tell', 'me'])
  })

  it('follows playback from the audio element, not a Date.now clock', () => {
    const listen = readFileSync(resolve(__dirname, 'useLabListen.ts'), 'utf8')
    expect(listen).toContain("addEventListener('timeupdate'")
    expect(listen).toContain('labAudioFileUrl')
    expect(listen).toContain('readLabWordSidecar')
    expect(listen).toContain('labAudioSidecarUrl')
    expect(listen).not.toContain('measureFollowParagraphWords')
    expect(listen).not.toContain('measureWordTimesFromAudioUrl')
    expect(listen).toContain('chapterHasWordTimings')
    expect(listen).toContain('paragraphsRef.current = followParagraphs')
    expect(listen).not.toMatch(/paragraphsRef\.current = options\.followParagraphs/)
    expect(listen).not.toMatch(/Date\.now\(\)/)
    expect(listen).not.toMatch(/setInterval/)
    expect(listen).toContain('setSpeed')
    expect(listen).toContain('parseHearingSpeed')
    expect(listen).toContain('followPlayingClip')
    expect(LAB_FOLLOW_LEAD_SECONDS).toBe(0.08)
    expect(listen).toContain('positionRef.current.time + LAB_FOLLOW_LEAD_SECONDS')
    expect(listen).toContain('playbackRate')
    expect(listen).toMatch(/const pause = useCallback\(\(\) => \{[\s\S]*setFollow\(\{ kind: 'none' \}\)/)
  })

  it('does not download a word corpus when words.json is missing', async () => {
    expect(LAB_STATIC_WORD_SIDECAR_URL).toBeNull()
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    vi.stubGlobal('fetch', fetchMock)

    const miss = await readLabWordSidecar({ ok: false } as Response)
    expect(miss).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()

    const hit = await readLabWordSidecar({
      ok: true,
      json: async () => ({ chapter: 1, paragraphs: [{ paragraph: 0, words: [{ text: 'R2', start: 0, end: 1 }] }] }),
    } as Response)
    expect(hit?.paragraphs?.[0].words?.[0].text).toBe('R2')

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
        return { ok: true, json: async () => ({ paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 25 }] }) }
      }
      if (url.includes('words.json')) {
        return { ok: true, json: async () => ({ chapter: 1, paragraphs: [{ paragraph: 0, file: 'p0.mp3', words: sidecarWords }] }) }
      }
      return { ok: false, json: async () => ({}) }
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
        return { ok: true, json: async () => ({ paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 25 }] }) }
      }
      return { ok: false, json: async () => ({}) }
    }))

    const followed = await loadLabAudioChapter(['In the beginning'])
    expect(followed[0].words).toBeUndefined()
    expect(followFromPlayback({ paragraphs: followed, paragraphIndex: 0, currentTime: 0.2 })).toEqual({
      kind: 'paragraph',
      paragraphIndex: 0,
    })
  })
})
