import { describe, expect, it } from 'vitest'
import { followParagraphFromManifest } from './labFollow'
import {
  hearingProgress,
  hearingStageLines,
  nextHearingSpeed,
  seekAcrossClips,
} from './labHearing'

describe('lab hearing stage', () => {
  it('marks spoken, current, and upcoming words from real timings', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse of that ingenious hero who travelled', {
      duration: 4,
      words: [
        { text: 'Tell', start: 0, end: 0.4 },
        { text: 'me,', start: 0.4, end: 0.7 },
        { text: 'O', start: 0.7, end: 0.9 },
        { text: 'Muse', start: 0.9, end: 1.3 },
        { text: 'of', start: 1.3, end: 1.5 },
        { text: 'that', start: 1.5, end: 1.8 },
        { text: 'ingenious', start: 1.8, end: 2.3 },
        { text: 'hero', start: 2.3, end: 2.6 },
        { text: 'who', start: 2.6, end: 2.8 },
        { text: 'travelled', start: 2.8, end: 3.4 },
      ],
    })

    const lines = hearingStageLines(paragraph, { kind: 'word', paragraphIndex: 0, wordIndex: 2 })
    expect(lines).toHaveLength(2)
    expect(lines[0].words.map(word => word.role)).toEqual([
      'spoken', 'spoken', 'current', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming',
    ])
    expect(lines[1].words[0]).toMatchObject({ text: 'who', role: 'upcoming' })
  })

  it('marks the current paragraph when words are missing', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse, of that ingenious hero. Many cities did he visit.', {
      duration: 8,
    })
    const lines = hearingStageLines(paragraph, { kind: 'paragraph', paragraphIndex: 0 })
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.length).toBeLessThanOrEqual(2)
    expect(lines.every(line => line.words.every(word => word.role === 'line'))).toBe(true)
    expect(lines[0].words[0].text).toContain('Tell me, O Muse')
  })

  it('does not invent word roles from a word count', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me O Muse of that ingenious hero', { duration: 8 })
    const lines = hearingStageLines(paragraph, { kind: 'paragraph', paragraphIndex: 0 })
    expect(lines.flatMap(line => line.words).some(word => word.role === 'current')).toBe(false)
  })
})

describe('lab hearing transport math', () => {
  const clips = [
    { duration: 10 },
    { duration: 8 },
    { duration: 6 },
  ]

  it('builds a thin chapter progress from manifest durations', () => {
    expect(hearingProgress(clips, 1, 2)).toEqual({ current: 12, total: 24 })
    expect(hearingProgress([{ duration: undefined }, { duration: 4 }], 0, 1)).toBeNull()
  })

  it('seeks back and forward across paragraph clips', () => {
    expect(seekAcrossClips({
      clips,
      clipIndex: 1,
      currentTime: 2,
      deltaSeconds: -15,
    })).toEqual({ clipIndex: 0, offsetSeconds: 0 })

    expect(seekAcrossClips({
      clips,
      clipIndex: 0,
      currentTime: 8,
      deltaSeconds: 15,
    })).toEqual({ clipIndex: 2, offsetSeconds: 5 })
  })

  it('cycles hearing speed without touching production audio-speed storage', () => {
    expect(nextHearingSpeed(1)).toBe(1.25)
    expect(nextHearingSpeed(2)).toBe(0.75)
  })
})
