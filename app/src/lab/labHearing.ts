import type { FollowParagraph, FollowTarget } from './labFollow'

export type HearingWordRole = 'spoken' | 'current' | 'upcoming' | 'line'

export interface HearingWord {
  text: string
  role: HearingWordRole
}

export interface HearingLine {
  words: HearingWord[]
}

export interface HearingProgress {
  current: number
  total: number
}

export interface HearingSeekPoint {
  clipIndex: number
  offsetSeconds: number
}

function splitDisplaySentences(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : [text]
}

function sentenceWordRanges(words: Array<{ text: string }>): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  let start = 0
  for (let i = 0; i < words.length; i++) {
    if (/[.!?]$/.test(words[i].text.trim()) || i === words.length - 1) {
      ranges.push([start, i + 1])
      start = i + 1
    }
  }
  return ranges
}

function wordRole(index: number, current: number): HearingWordRole {
  if (index < current) return 'spoken'
  if (index === current) return 'current'
  return 'upcoming'
}

/**
 * Spotify-lyrics stage: one or two large lines.
 * Word roles only when real `words` exist. Display wrapping is not timing.
 */
export function hearingStageLines(
  paragraph: FollowParagraph | undefined,
  follow: FollowTarget,
): HearingLine[] {
  if (!paragraph) return []

  if (follow.kind === 'word' && paragraph.words && paragraph.words.length > 0) {
    const current = Math.max(0, Math.min(follow.wordIndex, paragraph.words.length - 1))
    const ranges = sentenceWordRanges(paragraph.words)
    const sentenceIndex = Math.max(0, ranges.findIndex(([from, to]) => current >= from && current < to))
    return ranges.slice(sentenceIndex, sentenceIndex + 2).map(([from, to]) => ({
      words: paragraph.words!.slice(from, to).map((word, offset) => ({
        text: word.text,
        role: wordRole(from + offset, current),
      })),
    }))
  }

  const sentences = splitDisplaySentences(paragraph.text)
  return sentences.slice(0, 2).map(text => ({
    words: [{ text, role: 'line' as const }],
  }))
}

export function hearingProgress(
  clips: Array<{ duration?: number }>,
  clipIndex: number,
  currentTime: number,
): HearingProgress | null {
  if (clips.length === 0) return null
  const durations = clips.map(clip => clip.duration)
  if (durations.some(duration => duration == null || duration <= 0)) return null
  const total = durations.reduce((sum, duration) => sum + (duration || 0), 0)
  const before = durations.slice(0, clipIndex).reduce((sum, duration) => sum + (duration || 0), 0)
  return {
    current: Math.max(0, Math.min(total, before + Math.max(0, currentTime))),
    total,
  }
}

export function seekAcrossClips(input: {
  clips: Array<{ duration?: number }>
  clipIndex: number
  currentTime: number
  deltaSeconds: number
  knownDuration?: number
}): HearingSeekPoint {
  const clips = input.clips
  if (clips.length === 0) return { clipIndex: 0, offsetSeconds: 0 }

  let index = Math.max(0, Math.min(input.clipIndex, clips.length - 1))
  let time = input.currentTime + input.deltaSeconds

  if (input.deltaSeconds < 0) {
    while (time < 0 && index > 0) {
      index -= 1
      const duration = clips[index].duration
      if (duration == null || duration <= 0) {
        return { clipIndex: index, offsetSeconds: 0 }
      }
      time += duration
    }
    return { clipIndex: index, offsetSeconds: Math.max(0, time) }
  }

  while (index < clips.length) {
    const duration = clips[index].duration
      ?? (index === input.clipIndex ? input.knownDuration : undefined)
    if (duration == null || duration <= 0) {
      return { clipIndex: index, offsetSeconds: Math.max(0, time) }
    }
    if (time < duration) {
      return { clipIndex: index, offsetSeconds: time }
    }
    if (index === clips.length - 1) {
      return { clipIndex: index, offsetSeconds: duration }
    }
    time -= duration
    index += 1
  }

  return { clipIndex: clips.length - 1, offsetSeconds: 0 }
}

export const LAB_HEARING_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const

export function nextHearingSpeed(current: number): number {
  const idx = LAB_HEARING_SPEEDS.indexOf(current as typeof LAB_HEARING_SPEEDS[number])
  return LAB_HEARING_SPEEDS[(idx + 1) % LAB_HEARING_SPEEDS.length]
}

export function nearestHearingSpeed(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return 1
  return LAB_HEARING_SPEEDS.reduce((best, candidate) => (
    Math.abs(candidate - rate) < Math.abs(best - rate) ? candidate : best
  ))
}
