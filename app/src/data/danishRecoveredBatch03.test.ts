import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { projectExactEditionRange, type CoordinateMigration } from './editionCoordinateMigration'
import { CONTENT_RELEASES, sourceContentRevision, writtenBeforeRelease } from './editionContentRevisions'
import { migrateLabBookPlace } from '../lab/labEditionMigration'
import { migrateLabHighlight, type MigratableHighlight } from '../lab/labHighlightMigration'
import { isAudioHeld } from './audioAvailability'

// Recovered Danish batch 03 (18 Nov 2026): the Oresteia, the Aeneid, the Republic, Walden and War and Peace,
// each with its paired English repairs. books/wip/danish-recovered-batch-03/INTEGRATION-2026-11-18.json records the details.
const read = (path: string) => JSON.parse(readFileSync(resolve(__dirname, '../../public/data', path), 'utf8'))
type Edition = { chapters: { number: number; title?: string; paragraphs: string[] }[] }
const BOOKS = ['oresteia', 'the-aeneid', 'the-republic', 'walden', 'war-and-peace']
const CHAINED = ['the-republic', 'walden', 'war-and-peace']
const RECORDED = ['oresteia', 'the-aeneid', 'walden']

describe('recovered Danish batch 03 keeps saved reading places and highlights', () => {
  for (const bookId of BOOKS) {
    const release = CONTENT_RELEASES[bookId]
    for (const editionKey of ['modern-en', 'modern-da']) {
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

  it('chains the earlier English releases of the Republic, Walden and War and Peace to the new text', () => {
    for (const bookId of CHAINED) {
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

  it('holds old English recordings in every chapter whose text changed, without hiding a book', () => {
    for (const bookId of RECORDED) {
      const before = read(`edition-migrations/${bookId}.positions.json`) as CoordinateMigration
      const chapters = new Set(Object.values(before.editions['modern-en'].entries).map(entry => entry.chapter))
      expect(isAudioHeld(bookId, 'modern-en')).toBe(false)
      expect(isAudioHeld(bookId, 'original-en')).toBe(false)
      for (const chapter of chapters) expect(isAudioHeld(bookId, 'modern-en', chapter), `${bookId} ${chapter}`).toBe(true)
    }
    // Already held as whole editions (no recording to revalidate).
    for (const bookId of ['the-republic', 'war-and-peace']) expect(isAudioHeld(bookId, 'modern-en')).toBe(true)
  })

  it.each(BOOKS)('%s: the published modern-en passes the similarity and truncation gate', bookId => {
    const output = execFileSync('python3', ['books/classify-modern-en.py', bookId, '--gate'], { cwd: resolve(__dirname, '../../..'), encoding: 'utf8' })
    expect(output).toContain('GATE PASS')
  }, 120000)
})

describe('recovered Danish batch 03 verse follows the house convention', () => {
  // The Oresteia and the Aeneid: the package's lineated Danish is running text wherever the English runs on
  // (lineation lives in the original-en sidecar); the English's own breaks (cast list, setting) are kept.
  it.each(['oresteia', 'the-aeneid'])('%s: each Danish paragraph has the English paragraph\'s line breaks', bookId => {
    const da = read(`editions/${bookId}-modern-da.json`) as Edition
    const en = read(`editions/${bookId}-modern-en.json`) as Edition
    da.chapters.forEach((chapter, c) => {
      chapter.paragraphs.forEach((text, i) => expect(text.split('\n').length, `${chapter.number}:${i}`).toBe(en.chapters[c].paragraphs[i].split('\n').length))
    })
  })

  it('the Oresteia: a Danish speech opens on its speaker where the English does, and stage directions sit in the same paragraphs', () => {
    const da = read('editions/oresteia-modern-da.json') as Edition
    const en = read('editions/oresteia-modern-en.json') as Edition
    const speaker = (text: string) => /^[A-ZÆØÅ][A-ZÆØÅ’'\- ,]*[A-ZÆØÅ]\./.test(text)
    const brackets = (text: string) => [(text.match(/\[/g) || []).length, (text.match(/\]/g) || []).length]
    da.chapters.forEach((chapter, c) => {
      chapter.paragraphs.forEach((text, i) => {
        const english = en.chapters[c].paragraphs[i]
        expect(speaker(text), `${chapter.number}:${i}`).toBe(speaker(english))
        expect(text.startsWith('['), `${chapter.number}:${i}`).toBe(english.startsWith('['))
        expect(brackets(text), `${chapter.number}:${i}`).toEqual(brackets(english))
      })
    })
  })

  it('War and Peace: the Danish sets every quotation in guillemets', () => {
    const da = read('editions/war-and-peace-modern-da.json') as Edition
    for (const chapter of da.chapters) for (const text of chapter.paragraphs) expect(text).not.toMatch(/["“”]/)
  })
})
