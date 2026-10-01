import { describe, expect, it, vi, afterEach } from 'vitest'
import fs from 'node:fs'
import { BOOKS, getBook } from '../data/bookRegistry'
import { getReaderBook } from '../data/readerBooks'
import { PRE_READER_CATALOGUE, createReaderHandoffIntent } from '../preReader/catalogue'
import { createOpenReaderIntent } from './readerHandoff'
import { readerHandoffFromUrlParams, pendingLabSourceForHandoff } from '../lab/labReaderHandoff'
import { loadLabBookSource } from '../lab/labSource'
import { loadEdition, loadEditionChapterList } from '../data/editionLoader'
import { bookFromResumePlace, remoteResumeSelection } from '../lab/useLabPositionSync'
import { DEFAULT_LAB_PREFS } from '../lab/labPrefs'
import { createHash } from 'node:crypto'

const raw = fs.readFileSync('public/data/editions/pd-35-original-en.json')
const edition = JSON.parse(raw.toString())
const provenance = JSON.parse(fs.readFileSync('public/data/imports/pd-35-provenance.json', 'utf8'))
afterEach(() => vi.unstubAllGlobals())

describe('unlisted reader pilot', () => {
  it('has a complete pinned edition, but no public library membership', () => {
    expect(getBook('pd-35')).toBeUndefined()
    expect(BOOKS.some(book => book.id === 'pd-35')).toBe(false)
    expect(PRE_READER_CATALOGUE.booksById.has('pd-35')).toBe(false)
    expect(createReaderHandoffIntent({ bookId: 'pd-35', primaryEditionKey: 'original-en' })).toBeNull()
    expect(getReaderBook('pd-35')?.title).toBe('The Time Machine')
    expect(getReaderBook('pd-36')).toBeUndefined()
    expect(createHash('sha256').update(raw).digest('hex')).toBe(provenance.editionSha256)
    expect(edition.chapters).toHaveLength(17)
    expect(edition.chapters.flatMap((chapter: { paragraphs: string[] }) => chapter.paragraphs)).toHaveLength(306)
  })

  it('retains cross-book, coordinate and unavailable-edition validation', () => {
    const selection = { bookId: 'pd-35', primaryEditionKey: 'original-en' }
    expect(createOpenReaderIntent(selection)).toMatchObject(selection)
    expect(createOpenReaderIntent({ ...selection, primaryEditionKey: 'modern-en' })).toBeNull()
    expect(createOpenReaderIntent({ ...selection, audioEditionKey: 'original-en' })).toBeNull()
    expect(createOpenReaderIntent({ ...selection, compareEditionKey: 'modern-en' })).toBeNull()
    expect(createOpenReaderIntent({ ...selection, savedPlace: { bookId: 'bible', chapterNumber: 1 } })).toBeNull()
    expect(createOpenReaderIntent({ ...selection, savedPlace: { bookId: 'pd-35', chapterNumber: -1 } })).toBeNull()
    const intent = readerHandoffFromUrlParams(new URLSearchParams('book=pd-35&chapter=2'))!
    expect(pendingLabSourceForHandoff(intent)).toMatchObject({ bookId: 'pd-35', chapterNumber: 2, bookTitle: 'The Time Machine', paragraphs: [] })
  })

  it('loads opening, later chapter and epilogue through the production loader without patches or cast calls', async () => {
    vi.stubGlobal('__BUILD_VERSION__', 'test')
    const fetcher = vi.fn(async (url: string) => {
      expect(url).toMatch(/^\/data\/editions\/pd-35-original-en\.json\?/)
      return new Response(raw, { headers: { 'Content-Type': 'application/json' } })
    })
    vi.stubGlobal('fetch', fetcher)
    for (const chapterNumber of [1, 2, 17]) {
      const source = await loadLabBookSource({ bookId: 'pd-35', primaryEditionKey: 'original-en', chapterNumber })
      expect(source.bookId).toBe('pd-35')
      expect(source.chapterNumber).toBe(chapterNumber)
      expect(source.paragraphs).toEqual(edition.chapters[chapterNumber - 1].paragraphs)
      expect(source.chapters).toHaveLength(17)
      expect(source.cast).toEqual([])
      expect(source.compareParagraphs).toEqual([])
    }
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(await loadEditionChapterList('pd-35', 'original-en')).toHaveLength(17)
    // Failures are not silently replaced with a different book.
    fetcher.mockRejectedValueOnce(new Error('offline'))
    await expect(loadEdition('pd-35', 'original-en', { bypassCache: true })).rejects.toThrow()
  })

  it('resumes the imported book and its own edition rather than falling back to the Bible', () => {
    const place = { bookId: 'pd-35', headerBook: 'The Time Machine', chapterNumber: 3, sequentialChapter: 3,
      paragraphIndex: 5, wordIndex: 2, updatedAt: 100, deviceId: 'test', rev: 1, primaryEditionKey: 'original-en' }
    expect(bookFromResumePlace(place)).toMatchObject({ bookId: 'pd-35', chapterNumber: 3, bookTitle: 'The Time Machine' })
    expect(remoteResumeSelection(place, { libraryBookId: 'bible', prefs: DEFAULT_LAB_PREFS }))
      .toMatchObject({ bookId: 'pd-35', primaryEditionKey: 'original-en' })
  })
})
