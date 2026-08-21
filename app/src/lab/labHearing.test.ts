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
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse, of that ingenious hero. Many cities did he visit.', {
      duration: 4,
      words: [
        { text: 'Tell', start: 0, end: 0.4 },
        { text: 'me,', start: 0.4, end: 0.7 },
        { text: 'O', start: 0.7, end: 0.9 },
        { text: 'Muse,', start: 0.9, end: 1.3 },
        { text: 'of', start: 1.3, end: 1.5 },
        { text: 'that', start: 1.5, end: 1.8 },
        { text: 'ingenious', start: 1.8, end: 2.3 },
        { text: 'hero.', start: 2.3, end: 2.6 },
        { text: 'Many', start: 2.6, end: 2.9 },
        { text: 'cities', start: 2.9, end: 3.2 },
        { text: 'did', start: 3.2, end: 3.4 },
        { text: 'he', start: 3.4, end: 3.5 },
        { text: 'visit.', start: 3.5, end: 4 },
      ],
    })

    const lines = hearingStageLines(paragraph, { kind: 'word', paragraphIndex: 0, wordIndex: 2 })
    expect(lines).toHaveLength(2)
    expect(lines[0].words.map(word => word.text)).toEqual([
      'Tell', 'me,', 'O', 'Muse,', 'of', 'that', 'ingenious', 'hero.',
    ])
    expect(lines[0].words.map(word => word.role)).toEqual([
      'spoken', 'spoken', 'current', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming',
    ])
    expect(lines[1].words.map(word => word.text)).toEqual([
      'Many', 'cities', 'did', 'he', 'visit.',
    ])
    expect(lines[1].words.every(word => word.role === 'upcoming')).toBe(true)
  })

  it('does not chunk a long sentence into eight-word lines', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse of that ingenious hero who travelled far', {
      duration: 4,
      words: [
        { text: 'Tell', start: 0, end: 0.3 },
        { text: 'me,', start: 0.3, end: 0.5 },
        { text: 'O', start: 0.5, end: 0.7 },
        { text: 'Muse', start: 0.7, end: 0.9 },
        { text: 'of', start: 0.9, end: 1.1 },
        { text: 'that', start: 1.1, end: 1.3 },
        { text: 'ingenious', start: 1.3, end: 1.7 },
        { text: 'hero', start: 1.7, end: 2 },
        { text: 'who', start: 2, end: 2.2 },
        { text: 'travelled', start: 2.2, end: 2.7 },
        { text: 'far', start: 2.7, end: 3 },
      ],
    })
    const lines = hearingStageLines(paragraph, { kind: 'word', paragraphIndex: 0, wordIndex: 10 })
    expect(lines).toHaveLength(1)
    expect(lines[0].words).toHaveLength(11)
    expect(lines[0].words[0].text).toBe('Tell')
    expect(lines[0].words[10]).toMatchObject({ text: 'far', role: 'current' })
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
