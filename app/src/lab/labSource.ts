import { loadEdition } from '../data/editionLoader'
import type { ThreadCharacter } from '../types'
import { followParagraphFromManifest, type FollowParagraph, type ManifestParagraph } from './labFollow'
import { labAudioManifestUrl, labAudioSidecarUrl, mergeFollowAudio, wordsByParagraphFromSidecar } from './labListen'
import { LAB_COPY } from './labCopy'

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
}

export interface LabSource {
  bookTitle: string
  bookAuthor: string
  editionLabel: string
  chapterLabel: string
  chapterTitle: string
  paragraphs: string[]
  compareParagraphs: string[]
  followParagraphs: FollowParagraph[]
  chapters: LabChapter[]
  cast: LabCastMember[]
}

const FALLBACK_PARAGRAPHS = [
  'Tell me, O Muse, of that ingenious hero who travelled far and wide after he had sacked the famous town of Troy. Many cities did he visit, and many were the nations with whose manners and customs he was acquainted; moreover he suffered much by sea while trying to save his own life and bring his men safely home; but do what he might he could not save his men, for they perished through their own sheer folly in eating the cattle of the Sun-god Hyperion; so the god prevented them from ever reaching home. Tell me, too, about all these things, oh daughter of Jove, from whatsoever source you may know them.',
  'So now all who escaped death in battle or by shipwreck had got safely home except Ulysses, and he, though he was longing to return to his wife and country, was detained by the goddess Calypso, who had got him into a large cave and wanted to marry him.',
  'Now Neptune had gone off to the Ethiopians, who are at the world’s end, and lie in two halves, the one looking West and the other East.',
]

export function fallbackLabSource(): LabSource {
  return {
    bookTitle: LAB_COPY.bookTitle,
    bookAuthor: LAB_COPY.bookAuthor,
    editionLabel: LAB_COPY.editionLabel,
    chapterLabel: LAB_COPY.chapterLabel,
    chapterTitle: 'Book 1 — The gods in council',
    paragraphs: FALLBACK_PARAGRAPHS,
    compareParagraphs: [],
    followParagraphs: FALLBACK_PARAGRAPHS.map((text, index) => ({ index, text })),
    chapters: [{ number: 1, title: 'Book 1 — The gods in council' }],
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

function spoilerSafeCast(characters: ThreadCharacter[], chapterNumber: number): LabCastMember[] {
  return characters.flatMap((character) => {
    const chapter = character.chapters?.[String(chapterNumber)]
    const introduction = chapter?.['modern-en'] || chapter?.['original-en']
    if (!introduction) return []
    return [{
      id: character.id,
      name: character.name?.en || character.id,
      epithet: character.epithet?.en || '',
      introduction,
    }]
  })
}

async function loadAudioFollow(paragraphs: string[]): Promise<FollowParagraph[]> {
  const fallback = paragraphs.map((text, index) => ({ index, text }))
  try {
    const [response, sidecarRes] = await Promise.all([
      fetch(labAudioManifestUrl()),
      fetch(labAudioSidecarUrl()).catch(() => null),
    ])
    if (!response.ok) return fallback
    const manifest = await response.json() as { paragraphs?: ManifestParagraph[] }
    const sidecar = sidecarRes && 'ok' in sidecarRes && sidecarRes.ok
      ? wordsByParagraphFromSidecar(await sidecarRes.json())
      : undefined
    const byIndex = new Map<number, ManifestParagraph>()
    for (const entry of manifest.paragraphs || []) {
      if (typeof entry.paragraph === 'number') byIndex.set(entry.paragraph, entry)
      else byIndex.set(byIndex.size, entry)
    }
    const followed = paragraphs.map((text, index) => (
      followParagraphFromManifest(index, text, byIndex.get(index) || byIndex.get(index + 1))
    ))
    return mergeFollowAudio(followed, manifest.paragraphs || [], sidecar)
  } catch {
    return fallback
  }
}

export async function loadLabSource(): Promise<LabSource> {
  try {
    const [original, modern, threadsResp] = await Promise.all([
      loadEdition('odyssey', 'original-en'),
      loadEdition('odyssey', 'modern-en').catch(() => null),
      fetch(`/data/editions/odyssey-threads.json?v=${encodeURIComponent(__BUILD_VERSION__)}`).catch(() => null),
    ])
    const chapter = original.chapters.find(item => item.number === 1) || original.chapters[0]
    if (!chapter || chapter.paragraphs.length === 0) return fallbackLabSource()

    const compareChapter = modern?.chapters.find(item => item.number === chapter.number)
    const threadsJson = threadsResp && 'ok' in threadsResp && threadsResp.ok
      ? await threadsResp.json() as { characters?: ThreadCharacter[] }
      : { characters: [] }

    return {
      bookTitle: LAB_COPY.bookTitle,
      bookAuthor: LAB_COPY.bookAuthor,
      editionLabel: LAB_COPY.editionLabel,
      chapterLabel: LAB_COPY.chapterLabel,
      chapterTitle: chapter.title,
      paragraphs: chapter.paragraphs,
      compareParagraphs: compareChapter?.paragraphs || [],
      followParagraphs: await loadAudioFollow(chapter.paragraphs),
      chapters: original.chapters.map(item => ({ number: item.number, title: item.title })),
      cast: spoilerSafeCast(threadsJson.characters || [], 1),
    }
  } catch {
    return fallbackLabSource()
  }
}
