/**
 * The Bible in the desktop margin view (Anders, 22 Oct 2026: "is it possible for me to test the margin reader on the
 * bible on desktop?"). Other books load whole (marginPreviewLoad); the Bible is 1,189 chapters (1,328 in the WEB
 * Catholic edition), so it loads as the Bible reader does: its chapter manifest, then the chapter being read and its
 * neighbours, more as the reader moves (js/tinct-book.js asks), never the whole book.
 *
 * - The chapter list is the manifest's, every chapter `pending` until its text is in. A loaded chapter replaces its
 *   pending copy in the same list (the list itself is kept: the page's stores hold it).
 * - Each chapter's part is its biblical book ("Genesis" for "Genesis 1"): the contents group them, and Catch me up
 *   stays inside the book being read (`scope`).
 * - The text is the Bible reader's own (labSource loadLabBibleChapterParagraphs: the same shards and cache), so a
 *   place, highlight or card is the same paragraph and word in both readers. Chapters are numbered as the Bible's
 *   places count them (Genesis 1 = 1 … Revelation 22 = 1189); a place names its biblical book (labPosition.ts).
 *
 * Pure apart from the loader handed in.
 */
import { biblicalBookId, chapterExistsOnClient, parseBiblicalPlaceTitle, type LabBookPlace } from '../labPosition'
import { marginPreviewParagraph, type MarginPreviewChapter, type MarginPreviewLazy } from './marginPreviewModel'

export const MARGIN_BIBLE_ID = 'bible'
/** The chapters on each side of the one asked for that come with it (the Bible reader's window). */
export const MARGIN_BIBLE_NEIGHBOURS = 1
/** Chapters fetched at the same time. */
export const MARGIN_BIBLE_PARALLEL = 6

export interface BibleManifestEntry {
  number: number
  title: string
  path?: string
  paragraphCount?: number
}

/** A chapter of the manifest, its text still to load. */
export function pendingBibleChapter(entry: BibleManifestEntry): MarginPreviewChapter {
  const title = String(entry.title || `Chapter ${entry.number}`).replace(/\s+/g, ' ').trim()
  return {
    number: entry.number,
    title,
    section: parseBiblicalPlaceTitle(title).book,
    paragraphs: [],
    pending: true,
    ...(typeof entry.paragraphCount === 'number' ? { paragraphCount: entry.paragraphCount } : {}),
  }
}

/** A chapter with its text, as the margin view draws it. */
export function loadedBibleChapter(pending: MarginPreviewChapter, paragraphs: string[]): MarginPreviewChapter {
  const { pending: _p, paragraphCount: _c, ...rest } = pending
  return { ...rest, paragraphs: paragraphs.map(marginPreviewParagraph) }
}

/** The pages (1-based, inclusive) of the biblical book page `page` is in. */
export function bibleBookPages(chapters: MarginPreviewChapter[], page: number): { from: number; to: number } {
  const i = Math.max(0, Math.min(chapters.length - 1, Math.floor(page) - 1))
  const section = chapters[i]?.section
  let from = i, to = i
  while (from > 0 && chapters[from - 1].section === section) from--
  while (to < chapters.length - 1 && chapters[to + 1].section === section) to++
  return { from: from + 1, to: to + 1 }
}

/** The chapter numbers to load for a chapter: it and its neighbours in the list's order (not number + 1: the Catholic order). */
export function bibleWindow(chapters: MarginPreviewChapter[], chapterNumber: number, radius = MARGIN_BIBLE_NEIGHBOURS): number[] {
  const i = chapters.findIndex(c => c.number === chapterNumber)
  if (i < 0) return []
  return chapters.slice(Math.max(0, i - radius), i + radius + 1).map(c => c.number)
}

/**
 * A saved place the margin view can open in this edition's list: a biblical book's pin whose chapter is in that book
 * (as the Bible reader checks one, labPosition chapterExistsOnClient), found by its book and chapter in it when its
 * number through the Bible is not that chapter's. A pin of a book this edition lacks never opens here.
 */
export function bibleSavedPlace(place: LabBookPlace | null, chapters: MarginPreviewChapter[]): LabBookPlace | null {
  if (!place) return null
  const refs = chapters.map(c => ({ number: c.number, title: c.title }))
  if (!chapterExistsOnClient(place, refs, MARGIN_BIBLE_ID)) return null
  const inBook = (c: { title: string }) => biblicalBookId(parseBiblicalPlaceTitle(c.title).book) === place.bookId
  const chapterIn = (c: { title: string }) => Number(parseBiblicalPlaceTitle(c.title).chapter)
  const own = refs.find(c => c.number === place.sequentialChapter && inBook(c) && chapterIn(c) === place.chapterNumber)
    ?? refs.find(c => inBook(c) && chapterIn(c) === place.chapterNumber)
  if (!own) return null
  return own.number === place.sequentialChapter ? place : { ...place, sequentialChapter: own.number }
}

/** The place a margin link names (chapter= counts through the Bible), as the biblical book's place. */
export function bibleLinkPlace(chapters: MarginPreviewChapter[], at: { editionKey: string | null; chapterNumber: number; paragraphIndex: number; wordIndex: number }, now: number): LabBookPlace | null {
  const chapter = chapters.find(c => c.number === at.chapterNumber)
  if (!chapter) return null
  const parsed = parseBiblicalPlaceTitle(chapter.title)
  return {
    bookId: biblicalBookId(parsed.book), headerBook: parsed.book, chapterNumber: Number(parsed.chapter) || 1, sequentialChapter: chapter.number,
    paragraphIndex: at.paragraphIndex, wordIndex: at.wordIndex,
    ...(at.editionKey ? { primaryEditionKey: at.editionKey } : {}),
    updatedAt: now, deviceId: 'margin-preview', rev: 0,
  }
}

/**
 * The on-demand loader over `chapters` (mutated in place: a loaded chapter replaces its pending copy). `fetchText`
 * gets one chapter's paragraphs ([] or a throw: not loaded, asked again later).
 */
export function createBibleLazy(chapters: MarginPreviewChapter[], fetchText: (entry: { number: number; path?: string }) => Promise<string[]>, paths: Map<number, string | undefined> = new Map()): MarginPreviewLazy {
  const listeners = new Set<(numbers: number[]) => void>()
  const inFlight = new Map<number, Promise<boolean>>()
  const indexOf = new Map(chapters.map((c, i) => [c.number, i]))
  const loadOne = (number: number): Promise<boolean> => {
    const i = indexOf.get(number)
    if (i === undefined) return Promise.resolve(false)
    if (!chapters[i].pending) return Promise.resolve(true)
    const had = inFlight.get(number)
    if (had) return had
    const task = (async () => {
      try {
        const paragraphs = await fetchText({ number, path: paths.get(number) })
        if (!Array.isArray(paragraphs) || !paragraphs.length) return false
        if (chapters[i].pending) chapters[i] = loadedBibleChapter(chapters[i], paragraphs)
        return true
      } catch {
        return false
      } finally {
        inFlight.delete(number)
      }
    })()
    inFlight.set(number, task)
    return task
  }
  return {
    async load(numbers) {
      const wanted = [...new Set((numbers || []).filter(n => Number.isInteger(n) && indexOf.has(n)))]
      const fresh = wanted.filter(n => chapters[indexOf.get(n)!].pending)
      const done = new Set(wanted.filter(n => !chapters[indexOf.get(n)!].pending))
      const added: number[] = []
      for (let k = 0; k < fresh.length; k += MARGIN_BIBLE_PARALLEL) {
        const batch = fresh.slice(k, k + MARGIN_BIBLE_PARALLEL)
        const results = await Promise.all(batch.map(loadOne))
        batch.forEach((n, j) => { if (results[j]) { done.add(n); added.push(n) } })
      }
      if (added.length) for (const listener of [...listeners]) { try { listener(added) } catch { /* one listener's failure is its own */ } }
      return wanted.filter(n => done.has(n))
    },
    scope: page => bibleBookPages(chapters, page),
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
}
