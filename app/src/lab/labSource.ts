import type { Edition, Section, ThreadCharacter } from '../types'
import { getBook } from '../data/bookRegistry'
import { loadEditionWindow } from '../data/editionLoader'
import { followParagraphFromManifest, type FollowParagraph, type ManifestParagraph } from './labFollow'
import { labAudioManifestUrl, type LabAudioTitleClip } from './labListen'
import { LAB_COPY } from './labCopy'

export const LAB_BOOK_ID = 'bible'
export const LAB_EDITION_KEY = 'kjv-en'
export const LAB_COMPARE_EDITION_KEY = 'modern-en'

export interface LabCastMember {
  id: string
  name: string
  epithet: string
  introduction: string
}

export interface LabMark {
  id: string
  paragraphIndex: number
  text: string
}

export interface LabChapter {
  number: number
  title: string
  path?: string
  wordCount?: number
}

export interface LabSource {
  /** Registry book id. Older test fixtures omit it and therefore remain Bible-scoped. */
  bookId?: string
  editions?: Edition[]
  bookTitle: string
  bookAuthor: string
  editionLabel: string
  chapterLabel: string
  chapterTitle: string
  chapterNumber: number
  headerBook: string
  headerChapter: string
  paragraphs: string[]
  compareParagraphs: string[]
  followParagraphs: FollowParagraph[]
  audioTitle?: LabAudioTitleClip
  chapters: LabChapter[]
  sections?: Section[]
  cast: LabCastMember[]
}

const ODYSSEY_PARAGRAPHS = [
  'Tell me, O Muse, of that ingenious hero who travelled far and wide after he had sacked the famous town of Troy. Many cities did he visit, and many were the nations with whose manners and customs he was acquainted; moreover he suffered much by sea while trying to save his own life and bring his men safely home; but do what he might he could not save his men, for they perished through their own sheer folly in eating the cattle of the Sun-god Hyperion; so the god prevented them from ever reaching home. Tell me, too, about all these things, oh daughter of Jove, from whatsoever source you may know them.',
  'So now all who escaped death in battle or by shipwreck had got safely home except Ulysses, and he, though he was longing to return to his wife and country, was detained by the goddess Calypso, who had got him into a large cave and wanted to marry him.',
  'Now Neptune had gone off to the Ethiopians, who are at the world’s end, and lie in two halves, the one looking West and the other East.',
]

const BIBLE_FALLBACK_PARAGRAPHS = [
  '¹ In the beginning God created the heaven and the earth. ² And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters. ³ And God said, Let there be light: and there was light.',
  '⁴ And God saw the light, that it was good: and God divided the light from the darkness. ⁵ And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.',
]

export function parseBibleChapterTitle(title: string): { book: string; chapter: string } {
  const trimmed = title.trim()
  const match = trimmed.match(/^(.*\S)\s+(\d+)$/)
  if (match) return { book: match[1], chapter: match[2] }
  return { book: trimmed || 'Genesis', chapter: '1' }
}

/** A Bible book gets one decorative opening page, immediately before chapter 1. */
export function bibleBookOpeningTitle(chapters: LabChapter[], chapterNumber: number): string | null {
  const chapter = chapters.find(item => item.number === chapterNumber)
  if (!chapter) return null
  const parsed = parseBibleChapterTitle(chapter.title)
  return parsed.chapter === '1' ? parsed.book : null
}

export function labHeaderLine(book: string, chapter: string): string {
  return `${book} · ${chapter}`
}

export function nextLabChapter(chapters: LabChapter[], current: number): number | null {
  const next = chapters
    .map(item => item.number)
    .filter(number => number > current)
    .sort((a, b) => a - b)[0]
  return next ?? null
}

export function prevLabChapter(chapters: LabChapter[], current: number): number | null {
  const prev = chapters
    .map(item => item.number)
    .filter(number => number < current)
    .sort((a, b) => b - a)[0]
  return prev ?? null
}

function sourceFromChapter(input: {
  chapterNumber: number
  chapterTitle: string
  paragraphs: string[]
  compareParagraphs: string[]
  followParagraphs: FollowParagraph[]
  audioTitle?: LabAudioTitleClip
  chapters: LabChapter[]
  sections?: Section[]
  cast: LabCastMember[]
}): LabSource {
  const parsed = parseBibleChapterTitle(input.chapterTitle)
  return {
    bookId: LAB_BOOK_ID,
    editions: getBook(LAB_BOOK_ID)?.editions,
    bookTitle: LAB_COPY.bookTitle,
    bookAuthor: LAB_COPY.bookAuthor,
    editionLabel: LAB_COPY.editionLabel,
    chapterLabel: input.chapterTitle,
    chapterTitle: input.chapterTitle,
    chapterNumber: input.chapterNumber,
    headerBook: parsed.book,
    headerChapter: parsed.chapter,
    paragraphs: input.paragraphs,
    compareParagraphs: input.compareParagraphs,
    followParagraphs: input.followParagraphs,
    audioTitle: input.audioTitle,
    chapters: input.chapters,
    sections: input.sections,
    cast: input.cast,
  }
}

/** Chrome-test fixture. Live /lab loads the production Bible. */
export function fallbackLabSource(): LabSource {
  return {
    bookTitle: 'The Odyssey',
    bookAuthor: 'Homer',
    editionLabel: 'Butler prose, 1900',
    chapterLabel: 'Book 1',
    chapterTitle: 'Book 1 — The gods in council—Minerva’s visit to Ithaca—the challenge from Telemachus to the suitors',
    chapterNumber: 1,
    headerBook: 'Homer',
    headerChapter: 'The Odyssey',
    paragraphs: ODYSSEY_PARAGRAPHS,
    compareParagraphs: [],
    followParagraphs: ODYSSEY_PARAGRAPHS.map((text, index) => ({ index, text })),
    chapters: [{ number: 1, title: 'Book 1 — The gods in council—Minerva’s visit to Ithaca—the challenge from Telemachus to the suitors' }],
    cast: [
      {
        id: 'odysseus',
        name: 'Odysseus',
        epithet: 'King of Ithaca',
        introduction: 'The gods discuss Odysseus, stranded on Calypso’s island for seven years, longing for home.',
      },
    ],
  }
}

export function bibleFallbackSource(): LabSource {
  return sourceFromChapter({
    chapterNumber: 1,
    chapterTitle: 'Genesis 1',
    paragraphs: BIBLE_FALLBACK_PARAGRAPHS,
    compareParagraphs: [],
    followParagraphs: BIBLE_FALLBACK_PARAGRAPHS.map((text, index) => ({ index, text })),
    chapters: [
      { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
      { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
    ],
    sections: [
      {
        title: 'Old Testament',
        sections: [
          {
            title: 'The Pentateuch',
            sections: [
              { title: 'Genesis', chapters: [1, 2] },
            ],
          },
        ],
      },
    ],
    cast: [],
  })
}

function spoilerSafeCast(characters: ThreadCharacter[], chapterNumber: number): LabCastMember[] {
  return characters.flatMap((character) => {
    const chapter = character.chapters?.[String(chapterNumber)]
    const introduction = chapter?.['modern-en'] || chapter?.['original-en'] || chapter?.['kjv-en']
    if (!introduction) return []
    return [{
      id: character.id,
      name: character.name?.en || character.id,
      epithet: character.epithet?.en || '',
      introduction,
    }]
  })
}

async function loadThreadsJson(): Promise<{ characters?: ThreadCharacter[] }> {
  if (threadsJsonCache) return threadsJsonCache
  const threadsResp = await fetch(`/data/editions/${LAB_BOOK_ID}-threads.json?v=${encodeURIComponent(labBuildVersion())}`).catch(() => null)
  const threadsJson = threadsResp && 'ok' in threadsResp && threadsResp.ok
    ? await threadsResp.json() as { characters?: ThreadCharacter[] }
    : { characters: [] }
  threadsJsonCache = threadsJson
  return threadsJson
}

const bookThreadsJsonCache = new Map<string, { characters?: ThreadCharacter[] }>()

async function loadBookThreadsJson(bookId: string): Promise<{ characters?: ThreadCharacter[] }> {
  if (bookId === LAB_BOOK_ID) return loadThreadsJson()
  const cached = bookThreadsJsonCache.get(bookId)
  if (cached) return cached
  const response = await fetch(`/data/editions/${bookId}-threads.json?v=${encodeURIComponent(labBuildVersion())}`).catch(() => null)
  let data: { characters?: ThreadCharacter[] } = { characters: [] }
  if (response?.ok) {
    try {
      const parsed = await response.json() as { characters?: ThreadCharacter[] }
      if (Array.isArray(parsed.characters)) data = parsed
    } catch {
      // Threads are optional. Dev/static hosts may answer a missing JSON asset
      // with the SPA shell; that must never make readable chapter text fail.
    }
  }
  bookThreadsJsonCache.set(bookId, data)
  return data
}

async function loadAudioFollowMetadata(
  paragraphs: string[],
  chapterNumber: number,
  editionKey = LAB_EDITION_KEY,
  bookId = LAB_BOOK_ID,
): Promise<{ followParagraphs: FollowParagraph[]; audioTitle?: LabAudioTitleClip }> {
  try {
    const manifestRes = await fetch(labAudioManifestUrl(chapterNumber, editionKey, bookId))
    if (!manifestRes.ok) {
      return { followParagraphs: paragraphs.map((text, index) => ({ index, text })) }
    }
    const manifest = await manifestRes.json() as { paragraphs?: ManifestParagraph[] }
    const byIndex = new Map<number, ManifestParagraph>()
    for (const entry of manifest.paragraphs || []) {
      if (typeof entry.paragraph === 'number') byIndex.set(entry.paragraph, entry)
    }
    const titleEntry = (manifest.paragraphs || []).find(entry => entry.paragraph === -1 && entry.file)
    return {
      followParagraphs: paragraphs.map((text, index) => (
        followParagraphFromManifest(index, text, byIndex.get(index) || byIndex.get(index + 1))
      )),
      audioTitle: titleEntry?.file
        ? { kind: 'title', file: titleEntry.file, duration: titleEntry.duration }
        : undefined,
    }
  } catch {
    return { followParagraphs: paragraphs.map((text, index) => ({ index, text })) }
  }
}

interface BibleManifest {
  chapters: Array<{ number: number; title: string; path: string; wordCount?: number }>
  sections?: Section[]
}

const bibleManifestCache = new Map<string, BibleManifest>()
const chapterTextCache = new Map<string, string[]>()
let threadsJsonCache: { characters?: ThreadCharacter[] } | null = null

function chapterTextCacheKey(editionKey: string, chapterNumber: number): string {
  return `${editionKey}:${chapterNumber}`
}

export function resetLabBibleManifestCache(): void {
  bibleManifestCache.clear()
}

export function resetLabChapterTextCache(): void {
  chapterTextCache.clear()
}

export function resetLabThreadsCache(): void {
  threadsJsonCache = null
}

function labBuildVersion(): string {
  return typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : 'dev'
}

async function loadBibleManifest(editionKey = LAB_EDITION_KEY): Promise<BibleManifest> {
  const cached = bibleManifestCache.get(editionKey)
  if (cached) return cached
  const url = `/data/editions-chapters/${LAB_BOOK_ID}-${editionKey}/manifest.json?v=${encodeURIComponent(labBuildVersion())}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`bible manifest HTTP ${res.status}`)
  const data = await res.json() as { chapters?: BibleManifest['chapters']; sections?: Section[] }
  if (!Array.isArray(data.chapters) || data.chapters.length === 0) {
    throw new Error('bible manifest empty')
  }
  const manifest = { chapters: data.chapters, sections: data.sections }
  bibleManifestCache.set(editionKey, manifest)
  return manifest
}

function chapterPath(entry: { number: number; path?: string }): string {
  return entry.path || `ch${String(entry.number).padStart(4, '0')}.json`
}

async function loadBibleChapterText(editionKey: string, entry: { number: number; path?: string }): Promise<string[]> {
  const cacheKey = chapterTextCacheKey(editionKey, entry.number)
  const cached = chapterTextCache.get(cacheKey)
  if (cached) return cached
  const url = `/data/editions-chapters/${LAB_BOOK_ID}-${editionKey}/${chapterPath(entry)}?v=${encodeURIComponent(labBuildVersion())}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json() as { paragraphs?: string[] }
  const paragraphs = Array.isArray(data.paragraphs) ? data.paragraphs : []
  if (paragraphs.length > 0) chapterTextCache.set(cacheKey, paragraphs)
  return paragraphs
}

/** Warm chapter JSON for adjacent navigation (fire-and-forget). */
export function prefetchLabChapterTexts(
  chapterNumber: number,
  editions?: { primary?: string; compare?: string },
  radius = 2,
): void {
  void (async () => {
    try {
      const primary = editions?.primary || LAB_EDITION_KEY
      const compare = editions?.compare || LAB_COMPARE_EDITION_KEY
      const manifest = await loadBibleManifest(primary)
      const targets = new Set<number>()
      for (let offset = 1; offset <= radius; offset++) {
        targets.add(chapterNumber + offset)
        targets.add(chapterNumber - offset)
      }
      await Promise.all([...targets].map(async (num) => {
        const entry = manifest.chapters.find(item => item.number === num)
        if (!entry) return
        await Promise.all([
          loadBibleChapterText(primary, entry),
          loadBibleChapterText(compare, entry).catch(() => []),
        ])
      }))
    } catch {
      /* ignore prefetch errors */
    }
  })()
}

export async function loadLabSource(
  chapterNumber = 1,
  editions?: { primary?: string; compare?: string; audio?: string },
): Promise<LabSource> {
  const primary = editions?.primary || LAB_EDITION_KEY
  const compare = editions?.compare || LAB_COMPARE_EDITION_KEY
  const audio = editions?.audio || LAB_EDITION_KEY
  try {
    const [manifest, threadsJson] = await Promise.all([
      loadBibleManifest(primary),
      loadThreadsJson(),
    ])
    const entry = manifest.chapters.find(item => item.number === chapterNumber) || manifest.chapters[0]
    if (!entry) return bibleFallbackSource()

    const compareEntry = { ...entry, path: chapterPath(entry) }
    const [paragraphs, compareParagraphs] = await Promise.all([
      loadBibleChapterText(primary, entry),
      loadBibleChapterText(compare, compareEntry).catch(() => []),
    ])
    if (paragraphs.length === 0) return bibleFallbackSource()

    const chapters = manifest.chapters.map(item => ({
      number: item.number,
      title: item.title,
      path: item.path,
      wordCount: item.wordCount,
    }))

    const audioMetadata = await loadAudioFollowMetadata(paragraphs, entry.number, audio)
    return sourceFromChapter({
      chapterNumber: entry.number,
      chapterTitle: entry.title,
      paragraphs,
      compareParagraphs,
      followParagraphs: audioMetadata.followParagraphs,
      audioTitle: audioMetadata.audioTitle,
      chapters,
      sections: manifest.sections,
      cast: spoilerSafeCast(threadsJson.characters || [], entry.number),
    })
  } catch {
    return bibleFallbackSource()
  }
}

export interface LabBookSourceSelection {
  bookId: string
  primaryEditionKey: string
  compareEditionKey?: string
  audioEditionKey?: string
  chapterNumber?: number
}

/**
 * Adapt any published registry edition into the existing Lab reader contract.
 * This deliberately returns the same LabSource shape as the Bible loader so
 * pagination, Compare, highlighting and navigation keep one state path.
 */
export async function loadLabBookSource(selection: LabBookSourceSelection): Promise<LabSource> {
  if (selection.bookId === LAB_BOOK_ID) {
    return loadLabSource(selection.chapterNumber ?? 1, {
      primary: selection.primaryEditionKey,
      compare: selection.compareEditionKey,
      audio: selection.audioEditionKey,
    })
  }

  const registryBook = getBook(selection.bookId)
  if (!registryBook) throw new Error(`Unknown published book: ${selection.bookId}`)
  const primaryEdition = registryBook.editions.find(edition => edition.key === selection.primaryEditionKey)
  if (!primaryEdition) throw new Error(`Unknown edition ${selection.primaryEditionKey} for ${selection.bookId}`)
  const compareEdition = selection.compareEditionKey
    ? registryBook.editions.find(edition => edition.key === selection.compareEditionKey)
    : undefined
  if (selection.compareEditionKey && (!compareEdition || compareEdition.key === primaryEdition.key)) {
    throw new Error(`Invalid compare edition ${selection.compareEditionKey} for ${selection.bookId}`)
  }
  const audioEdition = selection.audioEditionKey
    ? registryBook.editions.find(edition => edition.key === selection.audioEditionKey && edition.hasAudio)
    : (primaryEdition.hasAudio ? primaryEdition : registryBook.editions.find(edition => edition.hasAudio))
  if (selection.audioEditionKey && !audioEdition) {
    throw new Error(`Invalid audio edition ${selection.audioEditionKey} for ${selection.bookId}`)
  }

  const requestedChapter = selection.chapterNumber ?? 1
  const [primaryData, compareData, threads] = await Promise.all([
    loadEditionWindow(registryBook.id, primaryEdition.key, requestedChapter),
    compareEdition
      ? loadEditionWindow(registryBook.id, compareEdition.key, requestedChapter).catch(() => null)
      : Promise.resolve(null),
    loadBookThreadsJson(registryBook.id),
  ])
  const entry = primaryData.chapters.find(chapter => chapter.number === requestedChapter)
    ?? primaryData.chapters.find(chapter => chapter.paragraphs.length > 0)
  if (!entry?.paragraphs.length) {
    throw new Error(`Edition ${registryBook.id}-${primaryEdition.key} has no readable chapter ${requestedChapter}`)
  }
  const compareParagraphs = compareData?.chapters.find(chapter => chapter.number === entry.number)?.paragraphs ?? []
  const audioMetadata = audioEdition
    ? await loadAudioFollowMetadata(entry.paragraphs, entry.number, audioEdition.key, registryBook.id)
    : { followParagraphs: entry.paragraphs.map((text, index) => ({ index, text })) }

  return {
    bookId: registryBook.id,
    editions: registryBook.editions,
    bookTitle: registryBook.title,
    bookAuthor: registryBook.author,
    editionLabel: primaryEdition.label,
    chapterLabel: entry.title,
    chapterTitle: entry.title,
    chapterNumber: entry.number,
    headerBook: registryBook.title,
    headerChapter: entry.title,
    paragraphs: entry.paragraphs,
    compareParagraphs,
    followParagraphs: audioMetadata.followParagraphs,
    audioTitle: audioMetadata.audioTitle,
    chapters: primaryData.chapters.map(chapter => ({
      number: chapter.number,
      title: chapter.title,
      wordCount: chapter.paragraphs.length
        ? chapter.paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length
        : undefined,
    })),
    sections: primaryData.sections,
    cast: spoilerSafeCast(threads.characters || [], entry.number),
  }
}
