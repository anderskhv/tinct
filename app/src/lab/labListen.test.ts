import { describe, expect, it } from 'vitest'
import { followParagraphFromManifest } from './labFollow'
import {
  followAtPlayback,
  labAudioManifestUrl,
  labParagraphAudioUrl,
  mergeFollowAudio,
  nextPlayableIndex,
  wordsByParagraphFromSidecar,
} from './labListen'

describe('lab listen audio', () => {
  it('uses the production chapter manifest and /api/audio-file path', () => {
    expect(labAudioManifestUrl()).toBe('/api/audio-manifest?path=odyssey%2Foriginal-en%2Fch1%2Fmanifest.json')
    expect(labParagraphAudioUrl('p001.mp3')).toBe('/api/audio-file?path=odyssey%2Foriginal-en%2Fch1%2Fp001.mp3')
  })

  it('highlights the paragraph that is playing when words are missing', () => {
    const paragraphs = [
      followParagraphFromManifest(0, 'First', { file: 'p001.mp3', duration: 4 }),
      followParagraphFromManifest(1, 'Second', { file: 'p002.mp3', duration: 4 }),
    ]
    expect(followAtPlayback(paragraphs, 1, 1.2)).toEqual({
      kind: 'paragraph',
      paragraphIndex: 1,
    })
    expect(followAtPlayback(paragraphs, null, 1.2)).toEqual({ kind: 'none' })
  })

  it('highlights a word only when that paragraph already has timings', () => {
    const paragraphs = [
      followParagraphFromManifest(0, 'Tell me, O Muse', {
        file: 'p001.mp3',
        duration: 2,
        words: [
          { text: 'Tell', start: 0, end: 0.4 },
          { text: 'me,', start: 0.4, end: 0.7 },
          { text: 'O', start: 0.7, end: 0.9 },
          { text: 'Muse', start: 0.9, end: 1.4 },
        ],
      }),
    ]
    expect(followAtPlayback(paragraphs, 0, 0.5)).toEqual({
      kind: 'word',
      paragraphIndex: 0,
      wordIndex: 1,
    })
  })

  it('does not invent word timings from a word count', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me O Muse of that ingenious hero', {
      file: 'p001.mp3',
      duration: 8,
    })
    expect(followAtPlayback([paragraph], 0, 2)).toEqual({
      kind: 'paragraph',
      paragraphIndex: 0,
    })
  })

  it('merges manifest files and sidecar words without inventing timings', () => {
    const merged = mergeFollowAudio(
      [{ index: 0, text: 'Tell me' }, { index: 1, text: 'So now' }],
      [
        { paragraph: 1, file: 'p001.mp3', duration: 3 },
        { paragraph: 2, file: 'p002.mp3', duration: 4 },
      ],
      wordsByParagraphFromSidecar({
        paragraphs: [{
          paragraph: 1,
          words: [
            { text: 'Tell', start: 0, end: 0.5 },
            { text: 'me', start: 0.5, end: 1 },
          ],
        }],
      }),
    )

    expect(merged[0].file).toBe('p001.mp3')
    expect(merged[1].file).toBe('p002.mp3')
    expect(merged[0].words).toHaveLength(2)
    expect(merged[1].words).toBeUndefined()
    expect(nextPlayableIndex(merged, 0)).toBe(0)
  })
})
