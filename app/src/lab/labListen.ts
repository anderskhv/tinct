import { resolveAudioUrl } from '../utils/audioUrl'
import {
  followFromPlayback,
  followParagraphFromManifest,
  mergeSidecarWords,
  type FollowParagraph,
  type FollowTarget,
  type ManifestParagraph,
  type WordSidecar,
} from './labFollow'

export const LAB_AUDIO = {
  bookId: 'odyssey',
  editionKey: 'original-en',
  chapterNumber: 1,
} as const

export interface LabAudioClip {
  index: number
  file: string
  duration?: number
  words?: FollowParagraph['words']
}

export function labAudioChapterBase(): string {
  return `${LAB_AUDIO.bookId}/${LAB_AUDIO.editionKey}/ch${LAB_AUDIO.chapterNumber}`
}

export function labAudioManifestUrl(): string {
  return resolveAudioUrl(`${labAudioChapterBase()}/manifest.json`, 'manifest')
}

export function labAudioSidecarUrl(): string {
  return resolveAudioUrl(`${labAudioChapterBase()}/words.json`, 'file')
}

/** Live Whisper timings for Odyssey Book 1. Used when the R2 sidecar 404s. */
export const LAB_STATIC_WORD_SIDECAR_URL = '/odyssey-ch1-words.json'

/** Prefer the R2 sidecar; fall back to the committed static JSON. Never invent timings. */
export async function readLabWordSidecar(
  r2Res: Response | null | undefined,
): Promise<WordSidecar | null> {
  if (r2Res && 'ok' in r2Res && r2Res.ok) {
    return await r2Res.json() as WordSidecar
  }
  const fallback = await fetch(LAB_STATIC_WORD_SIDECAR_URL).catch(() => null)
  if (fallback && 'ok' in fallback && fallback.ok) {
    return await fallback.json() as WordSidecar
  }
  return null
}

export function labAudioFileUrl(file: string): string {
  return resolveAudioUrl(`${labAudioChapterBase()}/${file}`, 'file')
}

export function clipsFromFollowParagraphs(paragraphs: FollowParagraph[]): LabAudioClip[] {
  return paragraphs.flatMap((paragraph) => {
    if (!paragraph.file || paragraph.index < 0) return []
    return [{
      index: paragraph.index,
      file: paragraph.file,
      duration: paragraph.duration,
      words: paragraph.words,
    }]
  })
}

export function clipsFromManifest(
  paragraphs: string[],
  manifestParagraphs: ManifestParagraph[],
): LabAudioClip[] {
  const byIndex = new Map<number, ManifestParagraph>()
  for (const entry of manifestParagraphs) {
    if (typeof entry.paragraph === 'number') {
      if (entry.paragraph < 0) continue
      byIndex.set(entry.paragraph, entry)
    }
  }
  return paragraphs.map((text, index) => {
    const entry = byIndex.get(index) || byIndex.get(index + 1)
    const followed = followParagraphFromManifest(index, text, entry)
    if (!followed.file) return null
    return {
      index,
      file: followed.file,
      duration: followed.duration,
      words: followed.words,
    }
  }).filter((clip): clip is LabAudioClip => clip != null)
}

export async function loadLabAudioChapter(paragraphs: string[]): Promise<FollowParagraph[]> {
  const [manifestRes, sidecarRes] = await Promise.all([
    fetch(labAudioManifestUrl()),
    fetch(labAudioSidecarUrl()).catch(() => null),
  ])
  if (!manifestRes.ok) {
    return paragraphs.map((text, index) => ({ index, text }))
  }
  const manifest = await manifestRes.json() as { paragraphs?: ManifestParagraph[] }
  const byIndex = new Map<number, ManifestParagraph>()
  for (const entry of manifest.paragraphs || []) {
    if (typeof entry.paragraph === 'number') byIndex.set(entry.paragraph, entry)
  }
  const followed = paragraphs.map((text, index) => (
    followParagraphFromManifest(index, text, byIndex.get(index) || byIndex.get(index + 1))
  ))

  return mergeSidecarWords(followed, await readLabWordSidecar(sidecarRes))
}

export function followPlayingClip(
  paragraphs: FollowParagraph[],
  clip: LabAudioClip | undefined,
  currentTime: number,
): FollowTarget {
  if (!clip) return { kind: 'none' }
  return followFromPlayback({
    paragraphs,
    paragraphIndex: clip.index,
    currentTime,
  })
}
