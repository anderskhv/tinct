import { resolveAudioUrl } from '../utils/audioUrl'
import {
  ensureDerivedWordTimes,
  followFromPlayback,
  followParagraphFromManifest,
  followTimeFromAudio,
  mergeSidecarWords,
  wordsLookDerived,
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

export interface LabAudioClip {
  index: number
  file: string
  duration?: number
  words?: FollowParagraph['words']
}

export function labAudioChapterBase(chapterNumber = LAB_AUDIO.chapterNumber, editionKey = LAB_AUDIO.editionKey): string {
  return `${LAB_AUDIO.bookId}/${editionKey}/ch${chapterNumber}`
}

export function labAudioManifestUrl(chapterNumber = LAB_AUDIO.chapterNumber, editionKey = LAB_AUDIO.editionKey): string {
  return resolveAudioUrl(`${labAudioChapterBase(chapterNumber, editionKey)}/manifest.json`, 'manifest')
}

export function labAudioSidecarUrl(chapterNumber = LAB_AUDIO.chapterNumber, editionKey = LAB_AUDIO.editionKey): string {
  return resolveAudioUrl(`${labAudioChapterBase(chapterNumber, editionKey)}/words.json`, 'file')
}

/** Bible has chapter audio on R2, but no committed word sidecar. Do not download a corpus. */
export const LAB_STATIC_WORD_SIDECAR_URL = null

/** Use the R2 sidecar when it exists. Otherwise derive times from MP3 duration + text. */
export async function readLabWordSidecar(
  r2Res: Response | null | undefined,
): Promise<WordSidecar | null> {
  if (r2Res && 'ok' in r2Res && r2Res.ok) {
    return await r2Res.json() as WordSidecar
  }
  return null
}

export function labAudioFileUrl(file: string, chapterNumber = LAB_AUDIO.chapterNumber, editionKey = LAB_AUDIO.editionKey): string {
  return resolveAudioUrl(`${labAudioChapterBase(chapterNumber, editionKey)}/${file}`, 'file')
}

export function clipsFromFollowParagraphs(paragraphs: FollowParagraph[]): LabAudioClip[] {
  return paragraphs.flatMap((paragraph) => {
    if (!paragraph.file || paragraph.index < 0) return []
    const followed = ensureDerivedWordTimes(paragraph)
    return [{
      index: paragraph.index,
      file: paragraph.file,
      duration: followed.duration,
      words: followed.words,
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

export async function loadLabAudioChapter(
  paragraphs: string[],
  chapterNumber = LAB_AUDIO.chapterNumber,
  editionKey = LAB_AUDIO.editionKey,
): Promise<FollowParagraph[]> {
  const [manifestRes, sidecarRes] = await Promise.all([
    fetch(labAudioManifestUrl(chapterNumber, editionKey)),
    fetch(labAudioSidecarUrl(chapterNumber, editionKey)).catch(() => null),
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

  return mergeSidecarWords(followed, await readLabWordSidecar(sidecarRes)).map(ensureDerivedWordTimes)
}

export function followPlayingClip(
  paragraphs: FollowParagraph[],
  clip: LabAudioClip | undefined,
  currentTime: number,
  playbackRate = 1,
): FollowTarget {
  if (!clip) return { kind: 'none' }
  const paragraph = paragraphs.find(item => item.index === clip.index) ?? paragraphs[clip.index]
  const highlightTime = paragraph && wordsLookDerived(paragraph)
    ? followTimeFromAudio(currentTime, playbackRate, true)
    : currentTime
  return followFromPlayback({
    paragraphs,
    paragraphIndex: clip.index,
    currentTime: highlightTime,
  })
}
