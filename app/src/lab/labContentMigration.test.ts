// @vitest-environment jsdom
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CONTENT_RELEASES, __setLoadedCoordinateMigration } from '../data/editionContentRevisions'
import type { CoordinateMigration } from '../data/editionCoordinateMigration'
import { emptyLabPositionState, LAB_POSITION_STORAGE_KEY, type LabBookPlace } from './labPosition'
import { fetchLabPositionCloud, readLabPositionLocal, writeLabPositionLocal } from './labPositionStore'
import { placeFromLabBook } from './useLabPositionSync'
import { highlightOffCurrentText, migrateStoredLabHighlights } from './labHighlightContentMigration'
import { readLabHighlights, writeLabHighlights, type LabHighlight } from './labHighlights'
import type { MigratableHighlight } from './labHighlightMigration'
import { storedContentMigrations } from './labStoredContentMigrations'
import type { LabSource } from './labSource'

const publicPath = (path: string) => resolve(__dirname, '../../public', path)
const map = (book: string, kind: 'positions' | 'highlights') => JSON.parse(readFileSync(publicPath(`data/edition-migrations/${book}.${kind}.json`), 'utf8')) as CoordinateMigration
const edition = (book: string, key: string) => readFileSync(publicPath(`data/editions/${book}-${key}.json`))
const jane = CONTENT_RELEASES['jane-eyre']
const before = jane.releasedAt - 86_400_000

const place = (over: Partial<LabBookPlace> = {}): LabBookPlace => ({
  bookId: 'jane-eyre', headerBook: 'Jane Eyre', chapterNumber: 4, sequentialChapter: 4,
  paragraphIndex: 90, wordIndex: 5, pageIndex: 12, primaryEditionKey: 'original-en',
  updatedAt: before, deviceId: 'phone', rev: 3, ...over,
})
const store = (books: Record<string, LabBookPlace>) => localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({ ...emptyLabPositionState('phone'), books }))

beforeEach(() => {
  localStorage.clear()
  __setLoadedCoordinateMigration('positions', null)
  __setLoadedCoordinateMigration('highlights', null)
})
afterEach(() => { vi.unstubAllGlobals() })

describe('accepted structural releases (Jane Eyre, Pride and Prejudice 2026-09-25)', () => {
  it('pins the published texts and maps to the release manifest', () => {
    for (const [book, release] of Object.entries(CONTENT_RELEASES)) {
      for (const [key, revision] of Object.entries(release.editions)) {
        expect(createHash('sha256').update(edition(book, key)).digest('hex'), `${book}/${key}`).toBe(revision.after)
        for (const kind of ['positions', 'highlights'] as const) {
          const data = map(book, kind)
          expect(data.revision).toBe(release.revision)
          expect(data.editions[key]).toMatchObject({ beforeSha256: revision.before, afterSha256: revision.after })
        }
      }
    }
  })

  it('serves the released text from its chapter shards too', () => {
    for (const [book, release] of Object.entries(CONTENT_RELEASES)) {
      for (const key of Object.keys(release.editions)) {
        const dir = publicPath(`data/editions-chapters/${book}-${key}`)
        if (!existsSync(dir)) continue
        const whole = JSON.parse(edition(book, key).toString()) as { chapters: { number: number; paragraphs: string[] }[] }
        for (const chapter of whole.chapters) {
          const shard = JSON.parse(readFileSync(resolve(dir, `ch${String(chapter.number).padStart(4, '0')}.json`), 'utf8'))
          expect(shard.paragraphs, `${book}/${key} chapter ${chapter.number}`).toEqual(chapter.paragraphs)
        }
      }
    }
  })

  it('moves an old saved place once, keeping its clocks and the original tuple', () => {
    store({ 'jane-eyre': place() })
    // Without the map nothing is guessed.
    expect(readLabPositionLocal('phone').books['jane-eyre'].paragraphIndex).toBe(90)
    __setLoadedCoordinateMigration('positions', map('jane-eyre', 'positions'))
    const moved = readLabPositionLocal('phone').books['jane-eyre']
    expect(moved).toMatchObject({
      paragraphIndex: 89, wordIndex: 5, updatedAt: before, rev: 3,
      contentRevision: jane.editions['original-en'].after, contentMigrationStatus: 'exact',
      contentRecovery: { paragraphIndex: 90, wordIndex: 5, contentRevision: jane.editions['original-en'].before },
    })
    expect(moved.pageIndex).toBeUndefined()
    // Idempotent: storing and re-reading the moved record moves nothing again.
    writeLabPositionLocal(readLabPositionLocal('phone'))
    expect(readLabPositionLocal('phone').books['jane-eyre'].paragraphIndex).toBe(89)
  })

  it('leaves places written against the new text alone', () => {
    __setLoadedCoordinateMigration('positions', map('jane-eyre', 'positions'))
    const stamped = place({ paragraphIndex: 90, updatedAt: before, contentRevision: jane.editions['original-en'].after })
    const lateUnstamped = place({ paragraphIndex: 90, updatedAt: jane.releasedAt + 1 })
    const danish = place({ paragraphIndex: 90, primaryEditionKey: 'modern-da' })
    const noEdition = place({ paragraphIndex: 90, primaryEditionKey: undefined })
    for (const kept of [stamped, lateUnstamped, danish, noEdition]) {
      store({ 'jane-eyre': kept })
      expect(readLabPositionLocal('phone').books['jane-eyre'].paragraphIndex).toBe(90)
    }
  })

  it('stamps every new place in a restructured edition', () => {
    const book = { bookId: 'jane-eyre', bookTitle: 'Jane Eyre', chapterNumber: 4 } as LabSource
    const saved = placeFromLabBook(book, { paragraphIndex: 89, wordIndex: 0 }, 'phone', Date.now(), 1, { pageIndex: 0, primaryEditionKey: 'modern-en', readerMode: 'read' })
    expect(saved.contentRevision).toBe(jane.editions['modern-en'].after)
    const other = placeFromLabBook({ ...book, bookId: 'emma' }, { paragraphIndex: 1, wordIndex: 0 }, 'phone', Date.now(), 1, { pageIndex: 0, primaryEditionKey: 'modern-en', readerMode: 'read' })
    expect(other.contentRevision).toBeUndefined()
  })

  it('moves the cloud copy before the reader compares it', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/api/lab-position')) return new Response(JSON.stringify({ ...emptyLabPositionState('cloud'), books: { 'jane-eyre': place() } }))
      if (url.startsWith('/data/edition-migrations/jane-eyre.positions.json')) return new Response(JSON.stringify(map('jane-eyre', 'positions')))
      return new Response('', { status: 404 })
    }))
    const cloud = await fetchLabPositionCloud('token')
    expect(cloud?.books['jane-eyre']).toMatchObject({ paragraphIndex: 89, wordIndex: 5, updatedAt: before })
  })

  it('moves highlights whose whole quote survives, keeps the rest unresolved, drops none', async () => {
    const chapter4 = (JSON.parse(edition('jane-eyre', 'original-en').toString()) as { chapters: { number: number; paragraphs: string[] }[] }).chapters.find(c => c.number === 4)!.paragraphs
    const deceit = '“Deceit is not my fault!” I cried out in a savage, high voice.'
    expect(chapter4[89]).toBe(deceit)
    const oldMap = map('jane-eyre', 'highlights')
    const caption = oldMap.editions['original-en'].entries['4.83'].oldText as string
    const at = before
    const marks: LabHighlight[] = [
      { id: `hl-${at}-a`, bookId: 'jane-eyre', editionKey: 'original-en', chapterNumber: 4, paragraphIndex: 90, fromWord: 0, endParagraphIndex: 90, toWord: 4, color: 'gold', note: 'kept note', text: '“Deceit is not my' },
      { id: `hl-${at}-b`, bookId: 'jane-eyre', editionKey: 'original-en', chapterNumber: 4, paragraphIndex: 83, fromWord: 0, endParagraphIndex: 83, toWord: 2, color: 'sky', note: 'on a removed caption', text: caption.split(' ').slice(0, 2).join(' ') },
      { id: `hl-${at}-c`, bookId: 'emma', editionKey: 'original-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 3, color: 'gold' },
    ]
    writeLabHighlights(marks)
    vi.stubGlobal('fetch', vi.fn(async (url: string) => (url.startsWith('/data/edition-migrations/jane-eyre.highlights.json')
      ? new Response(JSON.stringify(oldMap))
      : new Response('', { status: 404 }))))
    expect(storedContentMigrations()).not.toBeNull()
    const loadChapter = vi.fn(async () => ({ paragraphs: chapter4 }))
    expect(await migrateStoredLabHighlights(loadChapter)).toBe(true)
    expect(loadChapter).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'jane-eyre', chapterNumber: 4, version: jane.editions['original-en'].after }))
    const [moved, orphan, other] = readLabHighlights() as MigratableHighlight[]
    expect(moved).toMatchObject({ paragraphIndex: 89, endParagraphIndex: 89, fromWord: 0, toWord: 4, note: 'kept note', contentMigrationStatus: 'exact', contentRevision: jane.editions['original-en'].after })
    expect(highlightOffCurrentText(moved)).toBe(false)
    expect(orphan).toMatchObject({ paragraphIndex: 83, note: 'on a removed caption', contentMigrationStatus: 'unresolved' })
    expect(highlightOffCurrentText(orphan)).toBe(true)
    expect(other).toEqual(marks[2])
    // Settled: the next start has nothing to do.
    expect(await migrateStoredLabHighlights(loadChapter)).toBe(false)
  })

  it('waits for the released chapter text rather than resolving against a stale copy', async () => {
    writeLabHighlights([{ id: `hl-${before}-a`, bookId: 'jane-eyre', editionKey: 'original-en', chapterNumber: 4, paragraphIndex: 90, fromWord: 0, endParagraphIndex: 90, toWord: 3, color: 'gold' }])
    __setLoadedCoordinateMigration('highlights', map('jane-eyre', 'highlights'))
    const stale = Array.from({ length: 124 }, () => 'old text')
    expect(await migrateStoredLabHighlights(async () => ({ paragraphs: stale }))).toBe(false)
    expect(highlightOffCurrentText(readLabHighlights()[0])).toBe(true)
  })

  it('has nothing to wait for on a device without such data', () => {
    store({ emma: { ...place(), bookId: 'emma' } })
    expect(storedContentMigrations()).toBeNull()
  })
})
