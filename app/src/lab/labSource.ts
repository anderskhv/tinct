import type { Section, ThreadCharacter } from '../types'
import { loadLabAudioChapter } from './labListen'
import { type FollowParagraph } from './labFollow'
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
}

export interface LabSource {
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
  chapters: LabChapter[]
  sections?: Section[]
  cast: LabCastMember[]
}): LabSource {
  const parsed = parseBibleChapterTitle(input.chapterTitle)
  return {
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

async function loadAudioFollow(paragraphs: string[], chapterNumber: number, editionKey = LAB_EDITION_KEY): Promise<FollowParagraph[]> {
  try {
    return await loadLabAudioChapter(paragraphs, chapterNumber, editionKey)
  } catch {
    return paragraphs.map((text, index) => ({ index, text }))
  }
}

interface BibleManifest {
  chapters: Array<{ number: number; title: string; path: string }>
  sections?: Section[]
}

const bibleManifestCache = new Map<string, BibleManifest>()

export function resetLabBibleManifestCache(): void {
  bibleManifestCache.clear()
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
  const url = `/data/editions-chapters/${LAB_BOOK_ID}-${editionKey}/${chapterPath(entry)}?v=${encodeURIComponent(labBuildVersion())}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json() as { paragraphs?: string[] }
  return Array.isArray(data.paragraphs) ? data.paragraphs : []
}

export async function loadLabSource(
  chapterNumber = 1,
  editions?: { primary?: string; compare?: string; audio?: string },
): Promise<LabSource> {
  const primary = editions?.primary || LAB_EDITION_KEY
  const compare = editions?.compare || LAB_COMPARE_EDITION_KEY
  const audio = editions?.audio || LAB_EDITION_KEY
  try {
    const [manifest, threadsResp] = await Promise.all([
      loadBibleManifest(primary),
      fetch(`/data/editions/${LAB_BOOK_ID}-threads.json?v=${encodeURIComponent(labBuildVersion())}`).catch(() => null),
    ])
    const entry = manifest.chapters.find(item => item.number === chapterNumber) || manifest.chapters[0]
    if (!entry) return bibleFallbackSource()

    const compareEntry = { ...entry, path: chapterPath(entry) }
    const [paragraphs, compareParagraphs] = await Promise.all([
      loadBibleChapterText(primary, entry),
      loadBibleChapterText(compare, compareEntry).catch(() => []),
    ])
    if (paragraphs.length === 0) return bibleFallbackSource()

    const threadsJson = threadsResp && 'ok' in threadsResp && threadsResp.ok
      ? await threadsResp.json() as { characters?: ThreadCharacter[] }
      : { characters: [] }

    const chapters = manifest.chapters.map(item => ({
      number: item.number,
      title: item.title,
      path: item.path,
    }))

    return sourceFromChapter({
      chapterNumber: entry.number,
      chapterTitle: entry.title,
      paragraphs,
      compareParagraphs,
      followParagraphs: await loadAudioFollow(paragraphs, entry.number, audio),
      chapters,
      sections: manifest.sections,
      cast: spoilerSafeCast(threadsJson.characters || [], entry.number),
    })
  } catch {
    return bibleFallbackSource()
  }
}
