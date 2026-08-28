import { resolveAudioUrl } from '../utils/audioUrl'
import { measureWordTimesFromAudioUrl } from './labAudioMeasure'
import {
  followFromPlayback,
  followParagraphFromManifest,
  followTimeFromAudio,
  mergeSidecarWords,
  paragraphHasWordTimings,
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

/** Odyssey Book 1 — committed Whisper sidecar when R2 words.json 404s. */
export const LAB_STATIC_WORD_SIDECAR_URL = '/odyssey-ch1-words.json'

/**
 * Committed static sidecar URLs for any book/chapter (same schema as odyssey-ch1-words.json).
 * Fetch each until one returns JSON; 404 on uncommitted chapters is expected.
 */
export function labStaticWordSidecarUrls(
  bookId = LAB_AUDIO.bookId,
  editionKey = LAB_AUDIO.editionKey,
  chapterNumber = LAB_AUDIO.chapterNumber,
): string[] {
  const urls = [`/${bookId}-${editionKey}-ch${chapterNumber}-words.json`]
  if (bookId === 'odyssey') {
    urls.push(`/${bookId}-ch${chapterNumber}-words.json`)
  }
  return urls
}

export function labStaticWordSidecarUrl(
  chapterNumber = LAB_AUDIO.chapterNumber,
  editionKey = LAB_AUDIO.editionKey,
  bookId = LAB_AUDIO.bookId,
): string | null {
  return labStaticWordSidecarUrls(bookId, editionKey, chapterNumber)[0] ?? null
}

async function parseWordSidecarResponse(res: Response): Promise<WordSidecar | null> {
  const contentType = res.headers?.get?.('content-type') || ''
  if (!contentType.includes('json')) return null
  try {
    return await res.json() as WordSidecar
  } catch {
    return null
  }
}

/** Prefer R2/asset sidecar; fall back to committed static JSON. Never invent timings. */
export async function readLabWordSidecar(
  r2Res: Response | null | undefined,
  chapterNumber = LAB_AUDIO.chapterNumber,
  editionKey = LAB_AUDIO.editionKey,
  bookId = LAB_AUDIO.bookId,
): Promise<WordSidecar | null> {
  if (r2Res && 'ok' in r2Res && r2Res.ok) {
    const fromApi = await parseWordSidecarResponse(r2Res)
    if (fromApi) return fromApi
  }
  for (const staticUrl of labStaticWordSidecarUrls(bookId, editionKey, chapterNumber)) {
    const fallback = await fetch(staticUrl).catch(() => null)
    if (fallback && 'ok' in fallback && fallback.ok) {
      const sidecar = await parseWordSidecarResponse(fallback)
      if (sidecar) return sidecar
    }
  }
  return null
}

export function labAudioFileUrl(file: string, chapterNumber = LAB_AUDIO.chapterNumber, editionKey = LAB_AUDIO.editionKey): string {
  return resolveAudioUrl(`${labAudioChapterBase(chapterNumber, editionKey)}/${file}`, 'file')
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

/** Decode each paragraph MP3 and measure speech bounds → word timings. */
export async function measureFollowParagraphWords(
  paragraphs: FollowParagraph[],
  chapterNumber = LAB_AUDIO.chapterNumber,
  editionKey = LAB_AUDIO.editionKey,
): Promise<FollowParagraph[]> {
  return Promise.all(paragraphs.map(async (paragraph) => {
    if (!paragraph.file || paragraphHasWordTimings(paragraph)) return paragraph
    const url = labAudioFileUrl(paragraph.file, chapterNumber, editionKey)
    const words = await measureWordTimesFromAudioUrl(
      paragraph.text,
      url,
      typeof paragraph.duration === 'number' ? paragraph.duration : undefined,
    )
    return words ? { ...paragraph, words, wordsMeasured: true } : paragraph
  }))
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

  const merged = mergeSidecarWords(followed, await readLabWordSidecar(sidecarRes, chapterNumber, editionKey))
  return measureFollowParagraphWords(merged, chapterNumber, editionKey)
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
    currentTime: followTimeFromAudio(currentTime),
  })
}
