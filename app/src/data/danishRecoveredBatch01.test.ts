import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { projectExactEditionRange, type CoordinateMigration } from './editionCoordinateMigration'
import { CONTENT_RELEASES, sourceContentRevision, writtenBeforeRelease } from './editionContentRevisions'
import { migrateLabBookPlace } from '../lab/labEditionMigration'
import { migrateLabHighlight, type MigratableHighlight } from '../lab/labHighlightMigration'
import { isAudioHeld } from './audioAvailability'

// Recovered Danish batch 01 (18 Nov 2026): nine Danish editions, eight with their paired English
// repairs. books/wip/danish-recovered-batch-01/INTEGRATION-2026-11-18.json records the details.
const read = (path: string) => JSON.parse(readFileSync(resolve(__dirname, '../../public/data', path), 'utf8'))
type Edition = { chapters: { number: number; paragraphs: string[] }[] }
const ENGLISH = ['antigone', 'candide', 'frankenstein', 'frederick-douglass', 'genealogy-of-morals', 'heart-of-darkness', 'oedipus-at-colonus', 'oedipus-rex']
const BOOKS = [...ENGLISH, 'notes-from-underground']

describe('recovered Danish batch 01 keeps saved reading places and highlights', () => {
  for (const bookId of BOOKS) {
    const release = CONTENT_RELEASES[bookId]
    const editions = ENGLISH.includes(bookId) ? ['modern-en', 'modern-da'] : ['modern-da']
    for (const editionKey of editions) {
      const edition = release.editions[editionKey]
      const text = read(`editions/${bookId}-${editionKey}.json`) as Edition
      const before = read(`edition-migrations/${bookId}.highlights.json`) as CoordinateMigration
      const entries = before.editions[editionKey].entries
      const writtenAt = edition.releasedAt! - 1

      it(`${bookId}/${editionKey}: moves an old place once, keeping its clocks`, () => {
        const map = read(`edition-migrations/${bookId}.positions.json`) as CoordinateMigration
        expect(writtenBeforeRelease(bookId, editionKey, undefined, writtenAt)).toBe(true)
        expect(writtenBeforeRelease(bookId, editionKey, undefined, edition.releasedAt!)).toBe(false)
        const key = Object.keys(entries)[0]
        const [chapter, paragraph] = key.split('.').map(Number)
        const place = { bookId, headerBook: bookId, primaryEditionKey: editionKey, chapterNumber: chapter, sequentialChapter: chapter, paragraphIndex: paragraph, wordIndex: 1, updatedAt: writtenAt, deviceId: 'reader', rev: 4, pageIndex: 3 }
        const moved = migrateLabBookPlace(place, map)
        expect(moved.contentRevision).toBe(edition.after)
        expect(moved.contentRecovery?.contentRevision).toBe(sourceContentRevision(bookId, editionKey, undefined, writtenAt) ?? edition.before)
        expect(moved.chapterNumber).toBe(chapter)
        expect(moved.paragraphIndex).toBe(paragraph)
        expect(moved.updatedAt).toBe(writtenAt)
        expect(moved.rev).toBe(4)
        expect(migrateLabBookPlace(moved, map)).toBe(moved)
      })

      it(`${bookId}/${editionKey}: carries a highlight on unchanged words exactly, with its note`, () => {
        const map = read(`edition-migrations/${bookId}.highlights.json`) as CoordinateMigration
        // The first changed paragraph whose opening two words survive unchanged.
        const found = Object.entries(entries).find(([, entry]) => entry.words?.[0]?.[0] === 'equal' && entry.words[0][2] >= 2)
        expect(found, 'an unchanged opening').toBeTruthy()
        const [key, entry] = found!
        const [chapter, paragraph] = key.split('.').map(Number)
        const oldWords = entry.oldText!.split(/\s+/).filter(Boolean)
        const quote = oldWords.slice(0, 2).join(' ')
        const paragraphs = text.chapters.find(c => c.number === chapter)!.paragraphs
        const point = { chapterNumber: chapter, paragraphIndex: paragraph, offset: 0, contentRevision: edition.before }
        expect(projectExactEditionRange(map, editionKey, point, { ...point, offset: 2 }, 'words')).not.toBeNull()
        const highlight: MigratableHighlight = { id: `hl-${writtenAt}-a`, bookId, editionKey, chapterNumber: chapter, paragraphIndex: paragraph, endParagraphIndex: paragraph, fromWord: 0, toWord: 2, color: 'gold', note: 'Keep this note', text: quote }
        const moved = migrateLabHighlight(highlight, map, paragraphs)
        expect(moved.contentMigrationStatus).toBe('exact')
        expect(moved.contentRevision).toBe(edition.after)
        expect(moved.note).toBe('Keep this note')
        expect(migrateLabHighlight(moved, map, paragraphs)).toBe(moved)
      })
    }
  }

  it('chains the earlier English releases of Genealogy and Heart of Darkness to the new text', () => {
    for (const bookId of ['genealogy-of-morals', 'heart-of-darkness']) {
      const english = CONTENT_RELEASES[bookId].editions['modern-en']
      const older = english.previous![0]
      for (const kind of ['positions', 'highlights']) {
        const map = read(`edition-migrations/${bookId}.${kind}.json`) as CoordinateMigration
        expect(map.editions['modern-en'].previous?.[older.before]).toMatchObject({ beforeSha256: older.before, afterSha256: english.after })
      }
      expect(sourceContentRevision(bookId, 'modern-en', undefined, older.releasedAt - 1)).toBe(older.before)
      expect(sourceContentRevision(bookId, 'modern-en', undefined, older.releasedAt)).toBe(english.before)
      expect(sourceContentRevision(bookId, 'modern-en', undefined, english.releasedAt!)).toBe(english.after)
    }
  })

  it('keeps the unchanged English of Notes from Underground on its October release', () => {
    const english = CONTENT_RELEASES['notes-from-underground'].editions['modern-en']
    expect(english.releasedAt).toBeUndefined()
    expect(writtenBeforeRelease('notes-from-underground', 'modern-en', undefined, Date.parse('2026-11-01T00:00:00Z'))).toBe(false)
  })

  it('holds old English recordings in every chapter whose text changed, without hiding a book', () => {
    for (const bookId of ['antigone', 'frederick-douglass', 'genealogy-of-morals', 'oedipus-at-colonus', 'oedipus-rex']) {
      const before = read(`edition-migrations/${bookId}.positions.json`) as CoordinateMigration
      const chapters = new Set(Object.values(before.editions['modern-en'].entries).map(entry => entry.chapter))
      expect(isAudioHeld(bookId, 'modern-en')).toBe(false)
      for (const chapter of chapters) expect(isAudioHeld(bookId, 'modern-en', chapter), `${bookId} ${chapter}`).toBe(true)
    }
  })

  it.each(ENGLISH)('%s: the published modern-en passes the similarity and truncation gate', bookId => {
    const output = execFileSync('python3', ['books/classify-modern-en.py', bookId, '--gate'], { cwd: resolve(__dirname, '../../..'), encoding: 'utf8' })
    expect(output).toContain('GATE PASS')
  }, 60000)
})
