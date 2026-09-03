import { resolveAudioUrl } from '../utils/audioUrl'
import {
  followFromPlayback,
  followParagraphFromManifest,
  followTimeFromAudio,
  mergeSidecarWords,
  type FollowParagraph,
  type FollowTarget,
  type ManifestParagraph,
  type WordSidecar,
} from './labFollow'

export const LAB_AUDIO = {
  bookId: 'bible',
  editionKey: 'kjv-en',
  chapterNumber: 1,
} as const

export interface LabAudioTitleClip {
  kind: 'title'
  file: string
  duration?: number
}

export interface LabAudioParagraphClip {
  kind: 'paragraph'
  index: number
  file: string
  duration?: number
  words?: FollowParagraph['words']
}

export type LabAudioClip = LabAudioTitleClip | LabAudioParagraphClip

export function labAudioChapterBase(
  chapterNumber = LAB_AUDIO.chapterNumber,
  editionKey = LAB_AUDIO.editionKey,
  bookId = LAB_AUDIO.bookId,
): string {
  return `${bookId}/${editionKey}/ch${chapterNumber}`
}

export function labAudioManifestUrl(
  chapterNumber = LAB_AUDIO.chapterNumber,
  editionKey = LAB_AUDIO.editionKey,
  bookId = LAB_AUDIO.bookId,
): string {
  return resolveAudioUrl(`${labAudioChapterBase(chapterNumber, editionKey, bookId)}/manifest.json`, 'manifest')
}

export function labAudioSidecarUrl(
  chapterNumber = LAB_AUDIO.chapterNumber,
  editionKey = LAB_AUDIO.editionKey,
  bookId = LAB_AUDIO.bookId,
): string {
  return resolveAudioUrl(`${labAudioChapterBase(chapterNumber, editionKey, bookId)}/words.json`, 'file')
}

/** Bible has chapter audio on R2; word sidecars are optional. */
export const LAB_STATIC_WORD_SIDECAR_URL = null

export async function readLabWordSidecar(
  r2Res: Response | null | undefined,
): Promise<WordSidecar | null> {
  if (r2Res && 'ok' in r2Res && r2Res.ok) {
    return await r2Res.json() as WordSidecar
  }
  return null
}

export function labAudioFileUrl(
  file: string,
  chapterNumber = LAB_AUDIO.chapterNumber,
  editionKey = LAB_AUDIO.editionKey,
  bookId = LAB_AUDIO.bookId,
): string {
  return resolveAudioUrl(`${labAudioChapterBase(chapterNumber, editionKey, bookId)}/${file}`, 'file')
}

export function clipsFromFollowParagraphs(paragraphs: FollowParagraph[]): LabAudioClip[] {
  return paragraphs.flatMap((paragraph) => {
    if (!paragraph.file || paragraph.index < 0) return []
    return [{
      kind: 'paragraph' as const,
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
  let title: LabAudioTitleClip | null = null
  for (const entry of manifestParagraphs) {
    if (typeof entry.paragraph === 'number') {
      if (entry.paragraph < 0) {
        if (entry.file) title = { kind: 'title', file: entry.file, duration: entry.duration }
        continue
      }
      byIndex.set(entry.paragraph, entry)
    }
  }
  const body = paragraphs.map((text, index) => {
    const entry = byIndex.get(index) || byIndex.get(index + 1)
    const followed = followParagraphFromManifest(index, text, entry)
    if (!followed.file) return null
    return {
      kind: 'paragraph' as const,
      index,
      file: followed.file,
      duration: followed.duration,
      words: followed.words,
    }
  }).filter((clip): clip is LabAudioParagraphClip => clip != null)
  return title ? [title, ...body] : body
}

export async function loadLabAudioChapter(
  paragraphs: string[],
  chapterNumber = LAB_AUDIO.chapterNumber,
  editionKey = LAB_AUDIO.editionKey,
  bookId = LAB_AUDIO.bookId,
): Promise<FollowParagraph[]> {
  const [manifestRes, sidecarRes] = await Promise.all([
    fetch(labAudioManifestUrl(chapterNumber, editionKey, bookId)),
    fetch(labAudioSidecarUrl(chapterNumber, editionKey, bookId)).catch(() => null),
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

  return mergeSidecarWords(followed, await readLabWordSidecar(sidecarRes), chapterNumber)
}

export function followPlayingClip(
  paragraphs: FollowParagraph[],
  clip: LabAudioClip | undefined,
  currentTime: number,
): FollowTarget {
  if (!clip || clip.kind === 'title') return { kind: 'none' }
  return followFromPlayback({
    paragraphs,
    paragraphIndex: clip.index,
    currentTime: followTimeFromAudio(currentTime),
  })
}
