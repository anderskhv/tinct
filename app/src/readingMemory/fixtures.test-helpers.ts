import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildTextRange, wordCount } from './textRange'
import type { ReadingAnchor, ReadingSession, ReadingSessionState } from './types'

/**
 * Chapter fixtures parameterised by bookId / edition / chapter. The Bible
 * one is the real shipped KJV Genesis 1 shard; the others are synthetic
 * chapters shaped like real edition data so nothing is hard-coded to one
 * book.
 */
export interface ChapterFixture {
  bookId: string
  editionKey: string
  chapterNumber: number
  chapterLabel: string
  paragraphs: string[]
}

export function genesisOneFixture(): ChapterFixture {
  const path = resolve(__dirname, '../../public/data/editions-chapters/bible-kjv-en/ch0001.json')
  const data = JSON.parse(readFileSync(path, 'utf8')) as { title: string; paragraphs: string[] }
  return { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1, chapterLabel: data.title, paragraphs: data.paragraphs }
}

export function bibleChapterFixture(): ChapterFixture {
  return {
    bookId: 'bible',
    editionKey: 'kjv-en',
    chapterNumber: 1147,
    chapterLabel: 'James 1',
    paragraphs: [
      '¹ James, a servant of God and of the Lord Jesus Christ, to the twelve tribes which are scattered abroad, greeting. ² My brethren, count it all joy when ye fall into divers temptations; ³ Knowing this, that the trying of your faith worketh patience.',
      '⁴ But let patience have her perfect work, that ye may be perfect and entire, wanting nothing. ⁵ If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.',
      '⁶ But let him ask in faith, nothing wavering. For he that wavereth is like a wave of the sea driven with the wind and tossed. ⁷ For let not that man think that he shall receive any thing of the Lord.',
    ],
  }
}

export function platoDialogueFixture(): ChapterFixture {
  return {
    bookId: 'plato-republic',
    editionKey: 'original-en',
    chapterNumber: 1,
    chapterLabel: 'Book I',
    paragraphs: [
      'I went down yesterday to the Piraeus with Glaucon the son of Ariston, that I might offer up my prayers to the goddess; and also because I wanted to see in what manner they would celebrate the festival, which was a new thing.',
      'I was delighted with the procession of the inhabitants; but that of the Thracians was equally, if not more, beautiful. When we had finished our prayers and viewed the spectacle, we turned in the direction of the city.',
      'Polemarchus the son of Cephalus chanced to catch sight of us from a distance as we were starting on our way home, and told his servant to run and bid us wait for him.',
      'The servant took hold of me by the cloak behind, and said: Polemarchus desires you to wait. I turned round, and asked him where his master was.',
    ],
  }
}

export function chapterFixtures(): ChapterFixture[] {
  return [genesisOneFixture(), bibleChapterFixture(), platoDialogueFixture()]
}

/** Pages of `wordsPerPage` words laid over the fixture, like the paginator would. */
export function pagesFor(fixture: ChapterFixture, wordsPerPage: number): Array<{ start: { paragraphIndex: number; wordIndex: number }; end: { paragraphIndex: number; wordIndex: number } }> {
  const places: Array<{ paragraphIndex: number; wordIndex: number }> = []
  fixture.paragraphs.forEach((text, paragraphIndex) => {
    for (let wordIndex = 0; wordIndex < wordCount(text); wordIndex++) places.push({ paragraphIndex, wordIndex })
  })
  const pages: ReturnType<typeof pagesFor> = []
  for (let i = 0; i < places.length; i += wordsPerPage) {
    const start = places[i]
    const lastWord = places[Math.min(i + wordsPerPage, places.length) - 1]
    pages.push({ start, end: { paragraphIndex: lastWord.paragraphIndex, wordIndex: lastWord.wordIndex + 1 } })
  }
  return pages
}

export function anchorFor(fixture: ChapterFixture, opts: { page: number; totalPages: number; wordsPerPage?: number; throughPage?: number }): ReadingAnchor {
  const pages = pagesFor(fixture, opts.wordsPerPage ?? 40)
  const last = pages[Math.min(opts.throughPage ?? opts.page, pages.length) - 1]
  const range = buildTextRange(fixture.paragraphs, pages[0].start, last.end)
  if (!range) throw new Error('fixture range did not resolve')
  return {
    bookId: fixture.bookId,
    editionKey: fixture.editionKey,
    chapterNumber: fixture.chapterNumber,
    chapterLabel: fixture.chapterLabel,
    page: opts.page,
    totalPages: opts.totalPages,
    paragraphIndex: last.end.paragraphIndex,
    wordIndex: last.end.wordIndex,
    range,
  }
}

export function sessionFor(fixture: ChapterFixture, opts: {
  id?: string
  seq?: number
  state: ReadingSessionState
  startedAt: number
  lastActiveAt?: number
  endedAt?: number | null
  completedAt?: number | null
  page?: number
  totalPages?: number
  wordsPerPage?: number
}): ReadingSession {
  const totalPages = opts.totalPages ?? pagesFor(fixture, opts.wordsPerPage ?? 40).length
  const page = opts.page ?? (opts.state === 'completed' ? totalPages : Math.max(1, Math.ceil(totalPages / 2)))
  return {
    id: opts.id ?? `session-${fixture.bookId}-${fixture.chapterNumber}`,
    seq: opts.seq ?? 1,
    deviceId: 'device-a',
    state: opts.state,
    anchor: anchorFor(fixture, { page, totalPages, wordsPerPage: opts.wordsPerPage }),
    startedAt: opts.startedAt,
    lastActiveAt: opts.lastActiveAt ?? opts.startedAt,
    endedAt: opts.endedAt ?? null,
    completedAt: opts.state === 'completed' ? (opts.completedAt ?? opts.lastActiveAt ?? opts.startedAt) : null,
  }
}
