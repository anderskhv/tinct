import { resolveAudioUrl } from '../utils/audioUrl'
import {
  wordIndexAtTime,
  wordsFromManifestParagraph,
  type FollowParagraph,
  type FollowTarget,
  type ManifestParagraph,
  type TimedWord,
} from './labFollow'

export const LAB_AUDIO_BOOK_ID = 'odyssey'
export const LAB_AUDIO_EDITION = 'original-en'
export const LAB_AUDIO_CHAPTER = 1

export function labChapterAudioPath(file: string): string {
  return `${LAB_AUDIO_BOOK_ID}/${LAB_AUDIO_EDITION}/ch${LAB_AUDIO_CHAPTER}/${file}`
}

export function labAudioManifestUrl(): string {
  return resolveAudioUrl(labChapterAudioPath('manifest.json'), 'manifest')
}

export function labAudioSidecarUrl(): string {
  return resolveAudioUrl(labChapterAudioPath('words.json'), 'manifest')
}

export function labParagraphAudioUrl(file: string): string {
  return resolveAudioUrl(labChapterAudioPath(file), 'file')
}

export function nextPlayableIndex(paragraphs: FollowParagraph[], from: number): number | null {
  for (let i = from; i < paragraphs.length; i++) {
    if (paragraphs[i]?.file) return i
  }
  return null
}

/**
 * Highlight from the paragraph that is actually playing.
 * Word-level only when that paragraph already has real timings.
 */
export function followAtPlayback(
  paragraphs: FollowParagraph[],
  playingIndex: number | null,
  currentTime: number,
): FollowTarget {
  if (playingIndex == null || paragraphs.length === 0) return { kind: 'none' }
  const paragraph = paragraphs.find(item => item.index === playingIndex) ?? paragraphs[playingIndex]
  if (!paragraph) return { kind: 'none' }
  if (paragraph.words && paragraph.words.length > 0) {
    return {
      kind: 'word',
      paragraphIndex: paragraph.index,
      wordIndex: wordIndexAtTime(paragraph.words, Math.max(0, currentTime)),
    }
  }
  return { kind: 'paragraph', paragraphIndex: paragraph.index }
}

export function wordsByParagraphFromSidecar(data: unknown): Map<number, TimedWord[]> {
  const map = new Map<number, TimedWord[]>()
  if (!data || typeof data !== 'object') return map
  const payload = data as { paragraphs?: ManifestParagraph[]; words?: Record<string, unknown> }

  if (Array.isArray(payload.paragraphs)) {
    for (const entry of payload.paragraphs) {
      const words = wordsFromManifestParagraph(entry)
      if (!words) continue
      const key = typeof entry.paragraph === 'number' ? entry.paragraph : map.size
      map.set(key, words)
    }
    return map
  }

  if (payload.words && typeof payload.words === 'object') {
    for (const [key, value] of Object.entries(payload.words)) {
      const words = wordsFromManifestParagraph({ words: value as TimedWord[] })
      if (!words) continue
      const index = Number(key)
      if (Number.isFinite(index)) map.set(index, words)
    }
  }

  return map
}

export function lookupByParagraphNumber<T>(
  byNumber: Map<number, T>,
  index: number,
): T | undefined {
  if (byNumber.has(0)) return byNumber.get(index)
  return byNumber.get(index + 1)
}

export function mergeFollowAudio(
  paragraphs: FollowParagraph[],
  manifest: ManifestParagraph[],
  sidecar?: Map<number, TimedWord[]>,
): FollowParagraph[] {
  const byIndex = new Map<number, ManifestParagraph>()
  for (const entry of manifest) {
    if (typeof entry.paragraph === 'number') byIndex.set(entry.paragraph, entry)
    else byIndex.set(byIndex.size, entry)
  }

  return paragraphs.map((paragraph, index) => {
    const entry = lookupByParagraphNumber(byIndex, index)
    const sidecarWords = sidecar ? lookupByParagraphNumber(sidecar, index) : undefined
    return {
      ...paragraph,
      file: paragraph.file || (typeof entry?.file === 'string' ? entry.file : undefined),
      duration: paragraph.duration ?? (typeof entry?.duration === 'number' ? entry.duration : undefined),
      words: paragraph.words || sidecarWords || wordsFromManifestParagraph(entry),
    }
  })
}
