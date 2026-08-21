import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { followFromPlayback, followParagraphFromManifest, mergeSidecarWords } from './labFollow'
import {
  clipsFromFollowParagraphs,
  clipsFromManifest,
  LAB_STATIC_WORD_SIDECAR_URL,
  labAudioFileUrl,
  labAudioManifestUrl,
  labAudioSidecarUrl,
  readLabWordSidecar,
} from './labListen'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('lab odyssey audio paths', () => {
  it('uses the production chapter manifest and paragraph files', () => {
    expect(labAudioManifestUrl()).toBe('/api/audio-manifest?path=odyssey%2Foriginal-en%2Fch1%2Fmanifest.json')
    expect(labAudioSidecarUrl()).toBe('/api/audio-file?path=odyssey%2Foriginal-en%2Fch1%2Fwords.json')
    expect(labAudioFileUrl('p0.mp3')).toBe('/api/audio-file?path=odyssey%2Foriginal-en%2Fch1%2Fp0.mp3')
    expect(labAudioFileUrl('p1.mp3')).toBe('/api/audio-file?path=odyssey%2Foriginal-en%2Fch1%2Fp1.mp3')
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
    expect(clipsFromFollowParagraphs([
      { index: 0, text: 'Tell me', file: 'p0.mp3' },
      { index: 1, text: 'So now' },
    ]).map(clip => clip.file)).toEqual(['p0.mp3'])
  })

  it('follows playback from the audio element, not a Date.now clock', () => {
    const listen = readFileSync(resolve(__dirname, 'useLabListen.ts'), 'utf8')
    expect(listen).toContain("addEventListener('timeupdate'")
    expect(listen).toContain('labAudioFileUrl')
    expect(listen).toContain('readLabWordSidecar')
    expect(listen).toContain('labAudioSidecarUrl')
    expect(listen).toContain('hasTimedWords(current)')
    expect(listen).toContain('paragraphsRef.current = followParagraphs')
    expect(listen).not.toMatch(/paragraphsRef\.current = options\.followParagraphs/)
    expect(listen).not.toMatch(/Date\.now\(\)/)
    expect(listen).not.toMatch(/setInterval/)
  })

  it('falls back to the committed Odyssey Book 1 sidecar when R2 is not ok', async () => {
    expect(LAB_STATIC_WORD_SIDECAR_URL).toBe('/odyssey-ch1-words.json')
    const sidecar = JSON.parse(readFileSync(resolve(__dirname, '../../public/odyssey-ch1-words.json'), 'utf8'))
    expect(sidecar.method).toBe('faster-whisper-word-timestamps')
    expect(sidecar.paragraphs).toHaveLength(32)
    expect(sidecar.paragraphs[0].words[0]).toEqual({ text: 'Tell', start: 0.05, end: 0.55 })

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url === LAB_STATIC_WORD_SIDECAR_URL) {
        return { ok: true, json: async () => sidecar }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)

    const r2Miss = await readLabWordSidecar({ ok: false } as Response)
    expect(r2Miss?.paragraphs).toHaveLength(32)
    expect(fetchMock).toHaveBeenCalledWith('/odyssey-ch1-words.json')

    const r2Hit = await readLabWordSidecar({
      ok: true,
      json: async () => ({ chapter: 1, paragraphs: [{ paragraph: 0, words: [{ text: 'R2', start: 0, end: 1 }] }] }),
    } as Response)
    expect(r2Hit?.paragraphs?.[0].words?.[0].text).toBe('R2')
    expect(fetchMock.mock.calls.filter(call => String(call[0]) === LAB_STATIC_WORD_SIDECAR_URL)).toHaveLength(1)

    const followed = mergeSidecarWords(
      [followParagraphFromManifest(0, 'Tell me, O Muse', { duration: 35, file: 'p0.mp3' })],
      r2Miss,
    )
    expect(followFromPlayback({ paragraphs: followed, paragraphIndex: 0, currentTime: 0.2 })).toEqual({
      kind: 'word',
      paragraphIndex: 0,
      wordIndex: 0,
    })
  })
})
