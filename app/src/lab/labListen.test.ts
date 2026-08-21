import { describe, expect, it } from 'vitest'
import {
  clipsFromFollowParagraphs,
  clipsFromManifest,
  labAudioFileUrl,
  labAudioManifestUrl,
  labAudioSidecarUrl,
} from './labListen'

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
})
